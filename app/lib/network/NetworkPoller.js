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
import { AppState, Platform, InteractionManager } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Settings, { PollingStrategyTypes } from '../capability/Settings';
import BackgroundTask from 'react-native-background-task';
import RNEventSource from 'react-native-event-source';
import { MessageQueue } from '../message';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import { BackgroundBotChat } from '../BackgroundTask';
import SystemBot from '../bot/SystemBot';
import RemoteBotInstall from '../RemoteBotInstall';
import { NetworkDAO } from '../../lib/persistence';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { synchronizePhoneBook } from '../../lib/UserData/SyncData';
import Bot from '../bot';
import AgentGuard from '../capability/AgentGuard';
import { Contact } from '../../lib/capability';
import RemoteLogger from '../utils/remoteDebugger';
// import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import Device from 'react-native-device-info';
import BackgroundGeolocation from 'react-native-background-geolocation';

const POLL_KEY = 'poll_key';
const CLEAR_KEY = 'clear_key';
const KEEPALIVE_KEY = 'keepalive_key';
const R = require('ramda');

const NetworkPollerStates = {
    gsm: 'gsm',
    satellite: 'satelite',
    none: 'none'
};

// BackgroundTask.define(async () => {
//     // await NetworkHandler.poll();
//     RemoteLogger('Firing a Background Task now');
//     await BackgroundTaskProcessor.process();
//     BackgroundTask.finish();
// });

class NetworkPoller {
    grpcSubscription = [];
    grpcEndSubscription = [];
    cleanupInterval = null;
    start = async () => {
        console.log('-----------App Start ---------------');

        console.log('Network Poller: Starting Polling On start');
        this.connectedToSatellite = false;
        this.keepAliveCount = 0;
        this.appState = 'active';
        await this.listenToEvents();
        this.startPolling();
        this.subscribeToServerEvents();
        this.cleanupSubscriptions();
        this.alreadySubscribed = false;
    };

    cleanupSubscriptions = () => {
        console.log('App Active ----> Start Cleanup Service');

        this.cleanupInterval = setInterval(() => {
            InteractionManager.runAfterInteractions(() => {
                if (
                    this.grpcSubscription.length == 0 ||
                    this.grpcEndSubscription == 0
                ) {
                    this.subscribeToServerEvents();
                }

                if (this.grpcSubscription.length > 1) {
                    R.takeLast(
                        this.grpcSubscription.length - 1,
                        this.grpcSubscription
                    ).forEach(sub => {
                        sub.remove();
                    });
                    this.grpcSubscription = R.take(1, this.grpcSubscription);
                }
                if (this.grpcEndSubscription.length > 1) {
                    R.takeLast(
                        this.grpcEndSubscription.length - 1,
                        this.grpcEndSubscription
                    ).forEach(sub => {
                        sub.remove();
                    });

                    this.grpcEndSubscription = R.take(
                        1,
                        this.grpcEndSubscription
                    );
                }
            });
        }, 60000);
    };
    userLoggedInHandler = async () => {
        await this.createBackgroundTasks();
        console.log('Network Poller: User Logged in');
        console.log('Network Poller: Starting Polling on User Login');
        this.startPolling();
        this.subscribeToServerEvents();
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
        // if (this.alreadySubscribed) {
        //     return;
        // }
        console.log('Sourav Logging:::: Subscribing to Server Events');
        let user = await Auth.getUser();
        const QueueServiceClient = NativeModules.QueueServiceClient;
        eventEmitter = new NativeEventEmitter(QueueServiceClient);
        console.log('JS::::::: Subscribing to EVENTS');

        this.grpcSubscription.push(
            eventEmitter.addListener('sse_message', message => {
                console.log(
                    'Sourav Logging:::: Received SSE Response',
                    message
                );

                console.log(
                    'Sourav Logging:::: Processing Message : in GRPC Push'
                );
                setTimeout(() => {
                    MessageQueue.push(message);
                }, (Math.floor(Math.random() * 2) + 1) * 1000);
                BackgroundTimer.setTimeout(() => {
                    Contact.refreshContacts();
                }, 2000);
            })
        );
        this.grpcEndSubscription.push(
            eventEmitter.addListener('sse_end', message => {
                // this.unsubscribeFromServerEvents();
                console.log('Sourav Logging:::: GRPC DONE');
            })
        );

        QueueServiceClient.startChatSSE(user.creds.sessionId);
        this.alreadySubscribed = true;
    };

    unsubscribeFromServerEvents = loggedOut => {
        // if (this.grpcSubscription) {
        //     this.grpcSubscription.remove();
        //     this.grpcSubscription = null;
        // }
        // if (this.grpcEndSubscription) {
        //     this.grpcEndSubscription.remove();
        //     this.grpcEndSubscription = null;
        // }
        this.grpcSubscription.forEach(subscription => subscription.remove());
        this.grpcEndSubscription.forEach(subscription => subscription.remove());
        this.grpcSubscription = [];
        this.grpcEndSubscription = [];
        if (loggedOut) {
            QueueServiceClient.logout();
        }
        this.alreadySubscribed = false;
    };
    /*
    subscribeToServerEvents = async () => {
        if (Platform.OS === 'android') {
            return;
        }
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
    }; */

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

    appleBruteConnection = () => {
        if (Platform.OS === 'ios') {
        }
    };

    handleAppStateChange = async nextAppState => {
        console.log(
            'Sourav Logging:::: >>>>>>>>>>>APPP SATTE<<<<<<<<',
            nextAppState
        );
        AgentGuard.heartBeat();
        let user = await Auth.getUser();
        if (user.userId !== 'default_user_uuid') {
            if (nextAppState === 'active') {
                this.appleBruteConnection();
                console.log('Sourav Logging:::: App is in Active State Again');
                InteractionManager.runAfterInteractions(() => {
                    RemoteBotInstall.syncronizeBots();
                    setTimeout(() => NetworkHandler.readLambda(true), 1000);
                    setTimeout(() => Bot.grpcheartbeatCatalog(), 500);
                    setTimeout(() => this.subscribeToServerEvents(), 2000);
                    setTimeout(() => this.cleanupSubscriptions(), 5000);
                    setTimeout(() => synchronizePhoneBook(), 3000);
                    PushNotification.setApplicationIconBadgeNumber(0);
                });
            }
            console.log('Moving to app state : ', nextAppState);
            if (nextAppState !== 'inactive') {
                await this.stopPolling();
                this.unsubscribeFromServerEvents();
                console.log('App Inactive ---------> Stop Cleanup Service');
                clearInterval(this.cleanupInterval);
                this.appState = nextAppState;

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
        this.unsubscribeFromServerEvents(true);
        clearInterval(this.cleanupInterval);
        BackgroundTimer.stopBackgroundTimer();
        BackgroundGeolocation.removeAllListeners();
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
            // BackgroundTask.cancel();
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
                '---------App is in background. So starting background task every 15 minutes-----------'
            );
            // BackgroundTask.schedule({
            //     period: 900
            // });
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
            // BackgroundTask.schedule({
            //     period: 900
            // });
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
        console.log('Sourav Logging:::: In start GSM', this.appState);
        const pollingInterval =
            this.appState === 'active'
                ? config.network.gsm.pollingInterval
                : config.network.gsm.backgroundPollingInterval;
        const clearQueue = config.network.gsm.clearQueue;
        console.log(
            'Network Poller: Starting GSM Polling with polling at ' +
                pollingInterval +
                ' millisecs'
        );

        this.process();
        const newIntervalId = BackgroundTimer.setInterval(() => {
            this.process();
        }, pollingInterval);

        const clearQueueIntervalId = BackgroundTimer.setInterval(() => {
            this.clearQueue();
        }, clearQueue);

        await DeviceStorage.save(POLL_KEY, newIntervalId);
        await DeviceStorage.save(CLEAR_KEY, clearQueueIntervalId);
    };

    stopAndroidSatellitePolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        const keepAliveId = await DeviceStorage.get(KEEPALIVE_KEY);
        const clearQueueId = await DeviceStorage.get(CLEAR_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            BackgroundTimer.clearInterval(keepAliveId);
            BackgroundTimer.clearInterval(clearQueueId);
            await DeviceStorage.delete(POLL_KEY);
            await DeviceStorage.delete(KEEPALIVE_KEY);
            await DeviceStorage.delete(CLEAR_KEY);
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
        console.log('Sourav Logging:::: In Process');
        InteractionManager.runAfterInteractions(() => {
            NetworkHandler.poll();
            // BackgroundTaskProcessor.process();
        });
        // setTimeout(() => BackgroundTaskProcessor.process(), 5000);
    };
    clearQueue = () => {
        // InteractionManager.runAfterInteractions(() => {
        //     setTimeout(() => NetworkDAO.deleteAllRows(), 500);
        // });
    };

    // configureGeoLocation = () => {
    //     ////
    //     // 1.  Wire up event-listeners
    //     //

    //     // This handler fires whenever bgGeo receives a location update.
    //     BackgroundGeolocation.onLocation(this.onLocation, this.onError);

    //     // This handler fires when movement states changes (stationary->moving; moving->stationary)
    //     BackgroundGeolocation.onMotionChange(this.onMotionChange);

    //     // This event fires when a change in motion activity is detected
    //     BackgroundGeolocation.onActivityChange(this.onActivityChange);

    //     // This event fires when the user toggles location-services authorization
    //     BackgroundGeolocation.onProviderChange(this.onProviderChange);

    //     BackgroundGeolocation.onHeartbeat(event => {
    //         console.log('Sourav Logging:::: Hearbeat event', event);
    //         RemoteLogger(
    //             `Heartbeat--------${moment().format('DD-MM hh:mm:ss')}`
    //         );
    //     });

    //     ////
    //     // 2.  Execute #ready method (required)
    //     //
    //     BackgroundGeolocation.ready(
    //         {
    //             reset: true,
    //             // Geolocation Config
    //             desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,

    //             distanceFilter: 10,
    //             heartbeatInterval: 120,
    //             preventSuspend: true,
    //             // Activity Recognition
    //             stopTimeout: 1,
    //             // Application config
    //             debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
    //             logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    //             stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
    //             startOnBoot: true, // <-- Auto start tracking when device is powered-up.
    //             disableLocationAuthorizationAlert: false,
    //             // HTTP / SQLite config
    //             url: 'http://tracker.transistorsoft.com/locations/frontm',
    //             params: BackgroundGeolocation.transistorTrackerParams(Device),
    //             batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
    //             autoSync: true, // <-- [Default: true]Set true to sync each location to server as it arrives.,,

    //             headers: {
    //                 // <-- Optional HTTP headers
    //                 // 'X-FOO': 'bar'
    //             }
    //             // params: {
    //             //     // <-- Optional HTTP params
    //             //     // auth_token: 'maybe_your_server_authenticates_via_token_YES?'
    //             // }
    //         },
    //         async state => {
    //             console.log(
    //                 '- BackgroundGeolocation is configured and ready: ',
    //                 state.enabled
    //             );

    //             if (!state.enabled) {
    //                 ////
    //                 // 3. Start tracking!
    //                 //
    //                 BackgroundGeolocation.start(function() {
    //                     console.log('- Start success');
    //                 });
    //             }
    //         }
    //     );
    // };

    // onLocation(location) {
    //     RemoteLogger(`Location Event ${moment().format('DD-MM hh:mm:ss')}`);
    //     // RemoteLogger(`Triggered On Location: ${JSON.stringify(location)}`);
    // }
    // onError(error) {
    //     // RemoteLogger(JSON.stringify(error));
    // }
    // onActivityChange(event) {
    //     console.log('Sourav Logging:::: Activity Changed', event);
    //     BackgroundGeolocation.startBackgroundTask()
    //         .then(async taskId => {
    //             await RemoteLogger(
    //                 `${event.activity}----${
    //                     event.confidence
    //                 }--------${moment().format('DD-MM hh:mm:ss')}`
    //             );
    //             BackgroundGeolocation.stopBackgroundTask(taskId);
    //         })
    //         .catch(error => {
    //             console.log(error);
    //             BackgroundGeolocation.stopBackgroundTask();
    //         });
    // }

    // onProviderChange(event) {
    //     console.log('Sourav Logging:::: Provider Changed', event);

    //     switch (event.status) {
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
    //         // Android & iOS
    //         // BackgroundGeolocation.stop();
    //         console.log('- Location authorization denied');
    //         break;
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
    //         // Android & iOS
    //         console.log('- Location always granted');
    //         break;
    //     case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
    //         // iOS only
    //         console.log('- Location WhenInUse granted');
    //         // BackgroundGeolocation.stop();
    //         break;
    //     }
    // }
    // onMotionChange(event) {
    //     RemoteLogger('Motion Change Event');
    // }
}

export default new NetworkPoller();
