import Auth from '../capability/Auth';
import { DeviceStorage } from '../capability';
import { NetworkHandler } from './index';
import config from '../../config/config';
import BackgroundTimer from 'react-native-background-timer';
import EventEmitter, {
    AuthEvents,
    PollingStrategyEvents,
    SatelliteConnectionEvents
} from '../events';
import { AppState, Platform } from 'react-native';
import Settings, { PollingStrategyTypes } from '../capability/Settings';
import BackgroundTask from 'react-native-background-task';
import RNEventSource from 'react-native-event-source';
import { MessageQueue } from '../message';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import { BackgroundBotChat } from '../BackgroundTask';
import SystemBot from '../bot/SystemBot';
import RemoteBotInstall from '../RemoteBotInstall';

const POLL_KEY = 'poll_key';
const KEEPALIVE_KEY = 'keepalive_key';

const NetworkPollerStates = {
    gsm: 'gsm',
    satellite: 'satelite',
    none: 'none'
};

BackgroundTask.define(async () => {
    await NetworkHandler.poll();
    await BackgroundTaskProcessor.process();
    BackgroundTask.finish();
});

class NetworkPoller {
    start = async () => {
        console.log('Network Poller: Starting Polling On start');
        this.connectedToSatellite = false;
        this.keepAliveCount = 0;
        this.appState = 'active';
        await this.listenToEvents();
        this.startPolling();
        this.subscribeToServerEvents();
    };

    userLoggedInHandler = async () => {
        await this.createBackgroundTasks();
        console.log('Network Poller: User Logged in');
        console.log('Network Poller: Starting Polling on User Login');
        this.startPolling();
        this.subscribeToServerEvents();
    };

    listenToEvents = async () => {
        EventEmitter.addListener(
            AuthEvents.userDataFetched,
            this.userLoggedInHandler
        );
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.pollingStrategyChanged
        );
        //Network.addConnectionChangeEventListener(this.handleConnectionChange);
        EventEmitter.removeListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.removeListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );
        AppState.addEventListener('change', this.handleAppStateChange);
    };

    subscribeToServerEvents = async () => {
        // if (Platform.OS === 'android') {
        //     return;
        // }
        this.unsubscribeFromServerEvents();
        let user = await Auth.getUser();
        if (user.userId === 'default_user_uuid') {
            return;
        }

        let url = `${config.proxy.protocol}${config.proxy.host}${
            config.proxy.ssePath
        }?user=${user.userId}`;
        // console.log('Event source url : ', url);

        this.eventSource = new RNEventSource(url);
        this.eventSource.addEventListener(user.userId, event => {
            // console.log('Event : ', event);
            const data = JSON.parse(event.data);
            if (data) {
                MessageQueue.push(data);
            }
        });
    };
    unsubscribeFromServerEvents = () => {
        if (this.eventSource) {
            this.eventSource.removeAllListeners();
        }
        this.eventSource = null;
    };

    satelliteConnectionHandler = async () => {
        if (!this.connectedToSatellite) {
            this.connectedToSatellite = true;
            const pollingStrategy = await Settings.getPollingStrategy();
            if (pollingStrategy === PollingStrategyTypes.automatic) {
                if (this.currentPollingStrategy === NetworkPollerStates.gsm) {
                    await this.stopGSMPolling();
                    await this.startSatellitePolling();
                }
            }
        }
    };

    satelliteDisconnectHandler = async () => {
        if (this.connectedToSatellite) {
            this.connectedToSatellite = false;
            const pollingStrategy = await Settings.getPollingStrategy();
            if (pollingStrategy === PollingStrategyTypes.automatic) {
                if (
                    this.currentPollingStrategy ===
                    NetworkPollerStates.satellite
                ) {
                    await this.stopSatellitePolling();
                    await this.startGSMPolling();
                }
            }
        }
    };

    pollingStrategyChanged = async () => {
        console.log('Network Poller: Starting Polling on Strategy changed');
        this.restartPolling();
    };

    handleAppStateChange = async nextAppState => {
        let user = await Auth.getUser();
        if (user.userId !== 'default_user_uuid') {
            if (nextAppState === 'active') {
                RemoteBotInstall.syncronizeBots();
                NetworkHandler.readLambda();
                this.subscribeToServerEvents();
            }
            console.log('Moving to app state : ', nextAppState);
            if (nextAppState !== 'inactive') {
                await this.stopPolling();
                this.unsubscribeFromServerEvents();
                this.appState = nextAppState;
                console.log(
                    'Network Poller: Starting Polling on App State change'
                );
                this.startPolling();
            }
        }
    };

    createBackgroundTasks = async () => {
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });
        await bgBotScreen.initialize();
        bgBotScreen.init();
    };

    userLoggedOutHandler = async () => {
        console.log('Network Poller: User Loggedout');
        this.stopPolling();
        this.unsubscribeFromServerEvents();
    };

    restartPolling = async () => {
        await this.stopPolling();
        await this.startPolling();
    };

    startPolling = async () => {
        console.log('Start polling');
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (isUserLoggedIn) {
            const pollinStrategy = await Settings.getPollingStrategy();
            if (pollinStrategy === PollingStrategyTypes.gsm) {
                this.startGSMPolling();
            } else if (pollinStrategy === PollingStrategyTypes.satellite) {
                this.startSatellitePolling();
            } else if (pollinStrategy === PollingStrategyTypes.automatic) {
                if (this.connectedToSatellite) {
                    this.startSatellitePolling();
                } else {
                    this.startGSMPolling();
                }
            }
        }
    };

    stopPolling = async () => {
        console.log('Stop polling');
        if (this.currentPollingStrategy === NetworkPollerStates.gsm) {
            this.stopGSMPolling();
        } else if (
            this.currentPollingStrategy === NetworkPollerStates.satellite
        ) {
            this.stopSatellitePolling();
        }
    };

    stopAppleGSMPolling = async () => {
        if (this.appState === 'active') {
            console.log('App is active. Stopping polling');
            if (this.appleIntervalId) {
                BackgroundTimer.clearInterval(this.appleIntervalId);
                this.appleIntervalId = null;
            }
            //BackgroundTask.cancel();
        } else if (this.appState === 'background') {
            console.log('App is in background. Stopping polling');
            BackgroundTask.cancel();
        }
        //BackgroundTimer.stopBackgroundTimer();
        //BackgroundTimer.stop();
    };

    startAppleGSMPolling = async () => {
        this.process();
        if (this.appState === 'active') {
            console.log('App is active. So starting polling in GSM mode');
            BackgroundTimer.start();
            this.appleIntervalId = BackgroundTimer.setInterval(() => {
                this.process();
            }, config.network.gsm.pollingInterval);
        } else if (this.appState === 'background') {
            console.log(
                'App is in background. So starting background task every 15 minutes'
            );
            BackgroundTask.schedule({
                period: 900
            });
        }
    };

    stopAppleSatellitePolling = async () => {
        //BackgroundTimer.stopBackgroundTimer();
        if (this.appleIntervalId) {
            BackgroundTimer.clearInterval(this.appleIntervalId);
            this.appleIntervalId = null;
        }
        this.keepAliveCount = 0;
    };

    startAppleSatellitePolling = async () => {
        console.log('Network Poller: Starting Satellite Polling');
        this.process();
        if (this.appState === 'active') {
            console.log('App is active. So starting polling in satellite mode');
            this.appleIntervalId = BackgroundTimer.setInterval(() => {
                if (this.keepAliveCount + 1 === 5) {
                    console.log('Network Poller: Satellite polling');
                    this.process();
                    this.keepAliveCount = 0;
                } else {
                    console.log('Network Poller: Satellite keepAlive');
                    NetworkHandler.keepAlive();
                    this.keepAliveCount++;
                }
            }, config.network.satellite.keepAliveInterval);
        } else if (this.appState === 'background') {
            console.log(
                'App is in background. So starting background task every 1 hour'
            );
            BackgroundTask.schedule({
                period: 3600
            });
        }
    };

    stopAndroidGSMPolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            await DeviceStorage.delete(POLL_KEY);
        }
    };

    startAndroidGSMPolling = async () => {
        const pollingInterval =
            this.appState === 'active'
                ? config.network.gsm.pollingInterval
                : config.network.gsm.backgroundPollingInterval;
        console.log(
            'Network Poller: Starting GSM Polling with polling at ' +
                pollingInterval +
                ' millisecs'
        );

        this.process();
        const newIntervalId = BackgroundTimer.setInterval(() => {
            this.process();
        }, pollingInterval);

        await DeviceStorage.save(POLL_KEY, newIntervalId);
    };

    stopAndroidSatellitePolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        const keepAliveId = await DeviceStorage.get(KEEPALIVE_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            BackgroundTimer.clearInterval(keepAliveId);
            await DeviceStorage.delete(POLL_KEY);
            await DeviceStorage.delete(KEEPALIVE_KEY);
        }
    };

    startAndroidSatellitePolling = async () => {
        console.log('Network Poller: Starting Satellite Polling');
        this.process();
        const newIntervalId = BackgroundTimer.setInterval(() => {
            this.process();
        }, config.network.satellite.pollingInterval);

        const keepAliveId = BackgroundTimer.setInterval(() => {
            NetworkHandler.keepAlive();
        }, config.network.satellite.keepAliveInterval);
        await DeviceStorage.save(POLL_KEY, newIntervalId);
        await DeviceStorage.save(KEEPALIVE_KEY, keepAliveId);
    };

    stopGSMPolling = () => {
        this.currentPollingStrategy = NetworkPollerStates.none;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.stopAppleGSMPolling
                : this.stopAndroidGSMPolling;
        pollingFunction();
    };

    startGSMPolling = () => {
        this.currentPollingStrategy = NetworkPollerStates.gsm;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.startAppleGSMPolling
                : this.startAndroidGSMPolling;
        pollingFunction();
    };

    stopSatellitePolling = () => {
        this.currentPollingStrategy = NetworkPollerStates.none;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.stopAppleSatellitePolling
                : this.stopAndroidSatellitePolling;
        pollingFunction();
    };

    startSatellitePolling = () => {
        this.currentPollingStrategy = NetworkPollerStates.satellite;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.startAppleSatellitePolling
                : this.startAndroidSatellitePolling;
        pollingFunction();
    };

    process = () => {
        NetworkHandler.poll();
        BackgroundTaskProcessor.process();
    };
}

export default new NetworkPoller();
