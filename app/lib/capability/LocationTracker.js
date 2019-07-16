import RemoteLogger from '../utils/remoteDebugger';
import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import Device from 'react-native-device-info';

export const start_tracking = () => {
    ////
    // 1.  Wire up event-listeners
    //

    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(onLocation, onError);
    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(() => {
        RemoteLogger(
            `Provider Has Changed ${moment().format('DD-MM hh:mm:ss')}`
        );
    });

    ////
    // 2.  Execute #ready method (required)
    //
    BackgroundGeolocation.ready(
        {
            reset: true,
            // Geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 500,
            heartbeatInterval: 900,
            preventSuspend: true,
            // Activity Recognition
            stopTimeout: 1,
            // Application config
            debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true, // <-- Auto start tracking when device is powered-up.
            disableLocationAuthorizationAlert: false,
            // HTTP / SQLite config
            url: 'http://tracker.transistorsoft.com/locations/frontm',
            params: BackgroundGeolocation.transistorTrackerParams(Device),
            batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: true, // <-- [Default: true]Set true to sync each location to server as it arrives.,,
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

export const stop_tracking = () => {
    return BackgroundGeolocation.stop();
};

export const remove_location_listeners = () => {
    BackgroundGeolocation.removeAllListeners();
};

const onLocation = async location => {
    try {
        const taskId = await BackgroundGeolocation.startBackgroundTask();
        await RemoteLogger(
            `Location ${JSON.stringify(location)} --- ${moment().format(
                'DD-MM hh:mm:ss'
            )}`
        );
        BackgroundGeolocation.stopBackgroundTask(taskId);
    } catch (error) {
        BackgroundGeolocation.stopBackgroundTask();
    }
};

const onError = async error => {
    try {
        const taskId = await BackgroundGeolocation.startBackgroundTask();
        await RemoteLogger(`Error: ${JSON.stringify(error)}`);
        BackgroundGeolocation.stopBackgroundTask(taskId);
    } catch (error) {
        BackgroundGeolocation.stopBackgroundTask();
    }
};
