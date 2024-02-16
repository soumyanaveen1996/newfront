import './wdyr';
import './shim';
import {
    AppRegistry,
    NativeModules,
    Platform,
    View,
    Text,
    TextInput
} from 'react-native';
import Bugsnag from '@bugsnag/react-native';
import App from './appV2';
import { VideoCalls } from './appV2/lib/calls';
import I18n from './appV2/config/i18n/i18n';
import 'react-native-gesture-handler';
import { setCustomText, setCustomTextInput } from './applyCustomFonts';
// This is required to initialize the I18n before VideoCalls.init
console.log('App Name : ', I18n.t('AppName'));

Bugsnag.start();

if (__DEV__ && Platform.OS === 'iOS') {
    NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

VideoCalls.init();

AppRegistry.registerComponent('frontm_mobile', () => App);
