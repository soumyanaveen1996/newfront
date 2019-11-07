import RemoteLogger from '../utils/remoteDebugger';
import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import Device from 'react-native-device-info';
import DeviceStorage from './DeviceStorage';
import { Auth, Message, ConversationContext } from '../capability';
import Store from '../../redux/store/configureStore';
import backgroundTaskSql from '../persistence/backgroundTaskSql';
import EventEmitter, { MessageEvents } from '../events';
import {
    getBotManifest,
    sendBackgroundMessageSafe
} from '../BackgroundTask/BackgroundTaskProcessor';
import { Platform } from 'react-native';

export default class LocationTracker {
    static start_tracking = async (
        data,
        precision = 100,
        heartbeatInterval = 180
    ) => {
        ////
        // 1.  Wire up event-listeners
        //

        await DeviceStorage.save('location_bot', data);
        // This handler fires whenever bgGeo receives a location update.
        BackgroundGeolocation.onLocation(
            LocationTracker.onLocation,
            LocationTracker.onError
        );

        BackgroundGeolocation.onHeartbeat(LocationTracker.handleHeartBeat);

        // This event fires when the user toggles location-services authorization
        BackgroundGeolocation.onProviderChange(() => {
            RemoteLogger(
                `Provider Has Changed ${moment().format('DD-MM hh:mm:ss')}`
            );
        });

        let heartbeat_local = heartbeatInterval;

        if (Platform.OS === 'android' && heartbeatInterval < 60) {
            heartbeat_local = 60;
        }

        ////
        // 2.  Execute #ready method (required)
        //
        BackgroundGeolocation.ready(
            {
                reset: true,
                // Geolocation Config
                desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                distanceFilter: 50,
                // heartbeatInterval: 300,
                preventSuspend: true,
                // Activity Recognition
                stopTimeout: 1,
                // Application config
                debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
                logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
                stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
                startOnBoot: true, // <-- Auto start tracking when device is powered-up.
                disableLocationAuthorizationAlert: false,
                minimumActivityRecognitionConfidence: 30,
                // HTTP / SQLite config
                url: 'http://tracker.transistorsoft.com/locations/frontm',
                params: BackgroundGeolocation.transistorTrackerParams(Device),
                batchSync: true, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
                // autoSync: true, // <-- [Default: true]Set true to sync each location to server as it arrives.,,
                headers: {
                    // <-- Optional HTTP headers
                    // 'X-FOO': 'bar'
                }
                // params: {
                //     // <-- Optional HTTP params
                //     // auth_token: 'maybe_your_server_authenticates_via_token_YES?'
                // }
            },
            async state => {
                console.log(
                    '- BackgroundGeolocation is configured and ready: ',
                    state.enabled
                );

                if (!state.enabled) {
                    ////
                    // 3. Start tracking!
                    //
                    BackgroundGeolocation.start(function() {
                        console.log('- Start success');
                    });
                }
            }
        );
    };

    static report_location = async location => {
        console.log(
            'Sourav Logging:::: Got a Location, Proceed with Reporting'
        );
        const user = await Auth.getUser();
        if (!user) {
            return;
        }

        const data = await DeviceStorage.get('location_bot');
        const currentLocation = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
        };

        let message = new Message();
        message.setCreatedBy({
            addedByBot: true,
            messageDate: moment().valueOf()
        });
        message.backgroundEventMessage(currentLocation, {});

        await sendBackgroundMessageSafe(
            message,
            data.botId,
            data.conversationId
        );
    };

    static onLocation = async location => {
        try {
            console.log('Sourav Logging:::: ON Location');
            // const taskId = await BackgroundGeolocation.startBackgroundTask();
            // const data = await DeviceStorage.get('location_bot');
            const taskId = await BackgroundGeolocation.startBackgroundTask();

            RemoteLogger('Got Location Data');
            await LocationTracker.report_location(location.coords);
            BackgroundGeolocation.stopBackgroundTask(taskId);
        } catch (error) {
            BackgroundGeolocation.stopBackgroundTask(taskId);
        }
    };

    static handleHeartBeat = async event => {
        const taskId = await BackgroundGeolocation.startBackgroundTask();
        // const data = await DeviceStorage.get('location_bot');
        console.log('Sourav Logging:::: In heartbeat');

        await RemoteLogger(`Received Heartbeat ${JSON.stringify(event)}`);
        const location = await BackgroundGeolocation.getCurrentPosition({
            samples: 1,
            persist: true
        });
        console.log('Sourav Logging:::: Will Report Location to Bot');
        await LocationTracker.report_location(location.coords);
        console.log('Sourav Logging:::: Heartbeat Event', location);
        BackgroundGeolocation.stopBackgroundTask(taskId);
    };

    static stop_tracking = () => {
        return BackgroundGeolocation.stop();
    };

    static removeAllListeners = () => {
        BackgroundGeolocation.removeAllListeners();
    };
    static onError = async error => {
        try {
            const taskId = await BackgroundGeolocation.startBackgroundTask();
            await RemoteLogger(`Error: ${JSON.stringify(error)}`);
            BackgroundGeolocation.stopBackgroundTask(taskId);
        } catch (error) {
            BackgroundGeolocation.stopBackgroundTask();
        }
    };
}
