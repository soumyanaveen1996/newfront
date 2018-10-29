import './shim';
import { AppRegistry } from 'react-native';
import App from './App';
import { NativeModules, Platform } from 'react-native';

if (__DEV__ && Platform.OS === 'iOS') {
    NativeModules.DevSettings.setIsDebuggingRemotely(true);
}
AppRegistry.registerComponent('frontm_mobile', () => App);
