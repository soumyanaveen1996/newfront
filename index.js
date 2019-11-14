import './shim';
import { AppRegistry } from 'react-native';
import App from './App';
import { NativeModules, Platform } from 'react-native';
import Bugsnag from './app/config/ErrorMonitoring';
import BackgroundGeolocation from 'react-native-background-geolocation';
import LocationTracker from './app/lib/capability/LocationTracker';
import RemoteLogger from './app/lib/utils/remoteDebugger';

if (__DEV__ && Platform.OS === 'iOS') {
    NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

const HeadlessTask = async event => {
    let params = event.params;
    console.log('[BackgroundGeolocation HeadlessTasks] -', event.name, params);
    let taskId;
    switch (event.name) {
    case 'heartbeat':
        await LocationTracker.handleHeartBeat(event.name);
        break;
    case 'location':
        LocationTracker.onLocation(event.params);
        break;
    default:
        break;
    }
};

if (Platform.OS === 'android') {
    BackgroundGeolocation.registerHeadlessTask(HeadlessTask);
}

AppRegistry.registerComponent('frontm_mobile', () => App);
