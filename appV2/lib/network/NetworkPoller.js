import { AppState, Platform } from 'react-native';
import { Notifications } from 'react-native-notifications';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import Auth from '../capability/Auth';
import { DeviceStorage } from '../capability';
import { NETWORK_STATE, NetworkHandler } from './index';
import config from '../../config/config';
import EventEmitter, { AuthEvents, PollingStrategyEvents } from '../events';
import Settings, { PollingStrategyTypes } from '../capability/Settings';
import { MessageQueue } from '../message';
import { BackgroundBotChat } from '../BackgroundTask';
import SystemBot from '../bot/SystemBot';
import Store from '../../redux/store/configureStore';
import { Connection } from '../events/Connection';
import WebsocketQueueClient from './WebsocketQueueClient';
import UserServices from '../../apiV2/UserServices';
import { setNetwork } from '../../redux/actions/UserActions';
import reduxStore from '../../redux/store/configureStore';
const POLL_KEY = 'poll_key';
const CLEAR_KEY = 'clear_key';
const KEEPALIVE_KEY = 'keepalive_key';
const MSG_ANDROID_GSM = 'msg_android_gsm';
const MSG_ANDROID_SAT = 'msg_android_sat';
const R = require('ramda');

let messageCheckTimer;

class NetworkPoller {
    cleanupInterval = null;

    isUploadProcessing = false;

    isInternetBack = 0;

    start = async () => {
        console.log('-----------App Start ---------------');
        console.log('++++Network Poller: Starting Polling On start');
        this.connectedToSatellite = false;
        this.keepAliveCount = 0;
        this.alreadySubscribed = false;
        this.appState = 'active';
        await this.listenToEvents();
        this.startPolling();
        await this.subscribeToServerEvents();
    };

    userLoggedInHandler = async () => {
        await this.createBackgroundTasks();
        this.startPolling();
        await this.subscribeToServerEvents();
        // this.configureGeoLocation();
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

        if (this.appStateListener) {
            this.appStateListener.remove();
        }
        this.appStateListener = AppState.addEventListener(
            'change',
            this.handleAppStateChange.bind(this)
        );
    };

    updateNetworkState = (event) => {
        if (event.isConnected && event.isInternetReachable) {
            reduxStore.dispatch(setNetwork(NETWORK_STATE.full));
        } else {
            reduxStore.dispatch(setNetwork(NETWORK_STATE.none));
        }
    };

    subscribeToServerEvents = async () => {
        WebsocketQueueClient.setMessageHandler(this.handleQueueMessages);
        WebsocketQueueClient.setupQueueMessageStream();
        EventEmitter.addListener(
            Connection.netWorkStatusChange,
            async (event) => {
                if (event.isConnected) {
                    this.restartPolling();
                }
                if (!this.isUploadProcessing) {
                    if (
                        event.type === 'none' ||
                        (event.type === 'unknown' &&
                            event.isConnected === false)
                    ) {
                        // TODO(amal): do we need to do this ?
                        WebsocketQueueClient.close();
                        // AsyncStorage.setItem("AbortedCall", JSON.stringify(null));
                    } else {
                        if (event.isInternetReachable) {
                            const AbortedCall = JSON.parse(
                                await AsyncStorage.getItem('AbortedCall')
                            );
                            if (AbortedCall && this.isInternetBack === 0) {
                                this.isInternetBack = this.isInternetBack + 1;
                                setTimeout(async () => {
                                    await Auth.getUser().then((user) => {
                                        const callData = {
                                            callerUserId: user.userId,
                                            userId: AbortedCall.userId,
                                            video: false,
                                            action: 'CallSummary',
                                            callType: AbortedCall.callType,
                                            calledNumber:
                                                AbortedCall.calledNumber,
                                            dialledSatPhoneNumber:
                                                AbortedCall.dialledSatPhoneNumber,
                                            callDuration:
                                                AbortedCall.callDuration,
                                            callStartTime:
                                                AbortedCall.callStartTime
                                        };
                                        UserServices.sendCallSummary(callData)
                                            .then(() => {
                                                this.isInternetBack = 0;
                                                AsyncStorage.setItem(
                                                    'AbortedCall',
                                                    JSON.stringify(null)
                                                );
                                            })
                                            .catch((err) => {
                                                console.log(
                                                    '>>>>> report failed'
                                                );
                                            });
                                    });
                                }, 10000);
                            }
                            if (this.isUploadProcessing !== event.isConnected) {
                                WebsocketQueueClient.reconnect();
                            }
                        }
                    }
                }
            }
        );
        this.alreadySubscribed = true;
    };

    handleQueueMessages = (message) => {
        if (message.details && message.details.length === 0) {
            return;
        }
        MessageQueue.push(message);
    };

    unsubscribeFromServerEvents = (loggedOut) => {
        WebsocketQueueClient.close();
        this.alreadySubscribed = false;
    };

    satelliteConnectionHandler = async () => {
        if (!this.connectedToSatellite) {
            this.connectedToSatellite = true;
            const pollingStrategy = await Settings.getPollingStrategy();
            if (pollingStrategy === PollingStrategyTypes.automatic) {
                if (this.currentPollingStrategy === PollingStrategyTypes.gsm) {
                    this.stopGSMPolling();
                    this.startSatellitePolling();
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
                    PollingStrategyTypes.satellite
                ) {
                    this.stopSatellitePolling();
                    this.startGSMPolling();
                }
            }
        }
    };

    pollingStrategyChanged = async () => {
        this.restartPolling();
    };

    appleBruteConnection = () => {
        if (Platform.OS === 'ios') {
        }
    };

    handleAppStateChange = async (nextAppState) => {
        const user = Auth.getUserData();
        if (user.userId !== 'default_user_uuid') {
            if (nextAppState === 'active') {
                await this.stopPolling();
                this.unsubscribeFromServerEvents();
                clearInterval(this.cleanupInterval);
                this.appState = nextAppState;
                this.startPolling();

                await this.subscribeToServerEvents();
                if (Platform.OS === 'ios') {
                    Notifications.ios.setBadgeCount(0);
                }
            } else {
                await this.stopPolling();
                this.unsubscribeFromServerEvents();
                clearInterval(this.cleanupInterval);
                this.appState = nextAppState;
            }
        } else {
            console.log('NetworkPoller handleAppStateChange skipped');
        }
    };

    createBackgroundTasks = async () => {
        const bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });
        await bgBotScreen.initialize();
        bgBotScreen.init();
    };

    userLoggedOutHandler = async () => {
        this.stopPolling();
        this.unsubscribeFromServerEvents(true);
        clearInterval(this.cleanupInterval);
        BackgroundTimer.stopBackgroundTimer();
    };

    restartPolling = async () => {
        await this.stopPolling();
        await this.startPolling();
    };

    startPolling = async () => {
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
        AsyncStorage.removeItem('QUEUE_LAST_CHECKED');
        NetworkHandler.clearTime();
        if (this.currentPollingStrategy === PollingStrategyTypes.gsm) {
            this.stopGSMPolling();
        } else if (
            this.currentPollingStrategy === PollingStrategyTypes.satellite
        ) {
            this.stopSatellitePolling();
        }
    };

    stopAppleGSMPolling = async () => {
        if (this.appState === 'active') {
            console.log('App is active. Stopping polling');
            if (this.appleIntervalId) {
                BackgroundTimer.clearInterval(this.appleIntervalId);
                BackgroundTimer.clearInterval(this.msgCheck);
                this.appleIntervalId = null;
                this.msgCheck = null;
            }
        } else if (this.appState === 'background') {
            console.log('+++++++App is in background. Stopping polling');
        }
    };

    startAppleGSMPolling = async () => {
        this.process();
        if (this.appState === 'active' || this.appState === 'background') {
            console.log('+++++App is active. So starting polling in GSM mode');
            BackgroundTimer.start();
            if (this.appleIntervalId) {
                BackgroundTimer.clearInterval(this.appleIntervalId);
                this.appleIntervalId = null;
            }
            this.appleIntervalId = BackgroundTimer.setInterval(() => {
                this.process();
            }, config.network.gsm.pollingInterval);
        } else if (this.appState === 'background') {
            console.log('+++++App is in background. So no polling-----------');
        }
    };

    stopAppleSatellitePolling = async () => {
        if (this.appleIntervalId) {
            BackgroundTimer.clearInterval(this.appleIntervalId);
            this.appleIntervalId = null;
        }
        if (this.msgCheckSatellite) {
            BackgroundTimer.clearInterval(this.msgCheckSatellite);
            this.msgCheckSatellite = null;
        }
        this.keepAliveCount = 0;
    };

    startAppleSatellitePolling = async () => {
        this.process();
        if (this.appState === 'active' || this.appState === 'background') {
            if (this.appleIntervalId) {
                BackgroundTimer.clearInterval(this.appleIntervalId);
                this.appleIntervalId = null;
            }
            this.appleIntervalId = BackgroundTimer.setInterval(() => {
                this.process();
                // if (this.keepAliveCount + 1 === 5) {
                //     this.process();
                //     this.keepAliveCount = 0;
                // } else {
                //     NetworkHandler.keepAlive();
                //     this.keepAliveCount++;
                // }
            }, config.network.satellite.pollingInterval);
        } else if (this.appState === 'background') {
            console.log(
                '+++++++App is in background. So starting background task every 1 hour'
            );
        }
    };

    startAndroidGSMPolling = async () => {
        if (this.appState === 'active' || this.appState === 'background') {
            const { pollingInterval } = config.network.gsm;
            const { clearQueue } = config.network.gsm;

            if (this.newIntervalId) {
                BackgroundTimer.clearInterval(this.newIntervalId);
                this.newIntervalId = null;
            }

            this.process();
            const newIntervalId = BackgroundTimer.setInterval(() => {
                this.process();
            }, pollingInterval);

            const clearQueueIntervalId = BackgroundTimer.setInterval(() => {
                this.clearQueue();
            }, clearQueue);

            await DeviceStorage.save(POLL_KEY, newIntervalId);
            await DeviceStorage.save(CLEAR_KEY, clearQueueIntervalId);
        } else if (this.appState === 'background') {
            console.log('+++++App is in background. no polling');
        }
    };

    stopAndroidGSMPolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            await DeviceStorage.delete(POLL_KEY);
        }
        const msgAndroid = await DeviceStorage.get(MSG_ANDROID_GSM);
        if (msgAndroid) {
            BackgroundTimer.clearInterval(msgAndroid);
            await DeviceStorage.delete(MSG_ANDROID_GSM);
        }
    };

    startAndroidSatellitePolling = async () => {
        this.process();

        if (this.newIntervalId) {
            BackgroundTimer.clearInterval(this.newIntervalId);
            this.newIntervalId = null;
        }
        const newIntervalId = BackgroundTimer.setInterval(() => {
            this.process();
        }, config.network.satellite.pollingInterval);

        const keepAliveId = BackgroundTimer.setInterval(() => {
            NetworkHandler.keepAlive();
        }, config.network.satellite.keepAliveInterval);

        await DeviceStorage.save(POLL_KEY, newIntervalId);
        await DeviceStorage.save(KEEPALIVE_KEY, keepAliveId);
    };

    stopAndroidSatellitePolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        const keepAliveId = await DeviceStorage.get(KEEPALIVE_KEY);
        const clearQueueId = await DeviceStorage.get(CLEAR_KEY);
        const msgAndroid = await DeviceStorage.get(MSG_ANDROID_SAT);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            BackgroundTimer.clearInterval(keepAliveId);
            BackgroundTimer.clearInterval(clearQueueId);
            BackgroundTimer.clearInterval(msgAndroid);
            await DeviceStorage.delete(POLL_KEY);
            await DeviceStorage.delete(KEEPALIVE_KEY);
            await DeviceStorage.delete(CLEAR_KEY);
            await DeviceStorage.delete(MSG_ANDROID_GSM);
        }
    };

    stopGSMPolling = () => {
        this.currentPollingStrategy = PollingStrategyTypes.none;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.stopAppleGSMPolling
                : this.stopAndroidGSMPolling;
        pollingFunction();
    };

    startGSMPolling = () => {
        this.currentPollingStrategy = PollingStrategyTypes.gsm;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.startAppleGSMPolling
                : this.startAndroidGSMPolling;
        pollingFunction();
    };

    stopSatellitePolling = () => {
        this.currentPollingStrategy = PollingStrategyTypes.none;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.stopAppleSatellitePolling
                : this.stopAndroidSatellitePolling;
        pollingFunction();
    };

    startSatellitePolling = () => {
        this.currentPollingStrategy = PollingStrategyTypes.satellite;
        const pollingFunction =
            Platform.OS === 'ios'
                ? this.startAppleSatellitePolling
                : this.startAndroidSatellitePolling;
        pollingFunction();
    };

    process = () => {
        if (Store.getState().user.network !== 'none') {
            NetworkHandler.poll();
            return;
        }
    };

    clearQueue = () => {};
}

export default new NetworkPoller();
