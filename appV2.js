import './shim';
import 'react-native-url-polyfill/auto';
import React from 'react';

import { Provider } from 'react-redux';
import { registerGlobals } from 'react-native-webrtc';
import Store from './appV2/redux/store/configureStore.js';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './appV2/navigation/navigator';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import NetInfo from '@react-native-community/netinfo';
import Toast, { BaseToast } from 'react-native-toast-message';
import CustomisableAlert from 'react-native-customisable-alert';
import NavigationAction, {
    navigationRef
} from './appV2/navigation/NavigationAction';
import { Auth, Message, Notification, Utils } from './appV2/lib/capability';
import { DeviceEventEmitter, Platform, NativeModules } from 'react-native';
import Bot from './appV2/lib/bot';
import BackgroundMessageSender from './appV2/lib/BackgroundTask/BackgroundMessageSender';
import UserServices from './appV2/apiV2/UserServices';
import EventEmitter from './appV2/lib/events';
import { NetworkHandler, NetworkPoller } from './appV2/lib/network';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Connection from './appV2/lib/events/Connection';
import _ from 'lodash';
import ToastConfig from './appV2/config/ToastConfig';
import VideoCallsAndroid from './appV2/lib/calls/VideoCallsAndroid';
import { setCustomText, setCustomTextInput } from './applyCustomFonts';

const { FrontMUtils } = NativeModules;
registerGlobals();
const HANDLED_MEDIA_SESSIONS = {};

// Calling the functions and passing the custom props into their respective params
const customTextInputProps = {
    style: {}
};

const customTextProps = {
    style: {}
};

class App extends React.Component {
    constructor(props) {
        super(props);
        Notification.configure(false);
        setCustomTextInput(customTextInputProps); // appling fonts initially
        setCustomText(customTextProps);
    }

    componentDidMount() {
        console.log(
            `Amal : App.js from main activity: ${JSON.stringify(
                this.props,
                null,
                2
            )}`
        );

        console.log(
            `Amal : App.js from main activity: ${JSON.stringify(
                this.initalProps,
                null,
                2
            )}`
        );

        if (Platform.OS === 'android') {
            const channelConfig = {
                id: 'VOIPForegroundService',
                name: 'VOIP Foreground Service',
                description: 'Foreground Service for VOIP calls',
                enableVibration: false
            };
            VIForegroundService.getInstance().createNotificationChannel(
                channelConfig
            );
        }

        console.disableYellowBox = true;

        if (Platform.OS === 'android') {
            DeviceEventEmitter.addListener('accept', (params) => {
                console.log(
                    `Amal : App.js from main activity event accept: ${JSON.stringify(
                        params,
                        null,
                        2
                    )}`
                );
                params.actionType = 'accept';
                VideoCallsAndroid.handleInitialCalls(params);
            });
            DeviceEventEmitter.addListener('reject', (params) => {
                console.log(
                    `Amal : App.js from main activity event reject: ${JSON.stringify(
                        params
                    )}`
                );
                params.actionType = 'reject';
                VideoCallsAndroid.handleInitialCalls(params);
            });
        } else {
            DeviceEventEmitter.addListener('accept', (params) => {
                params.actionType = 'accept';
                VideoCallsAndroid.handleInitialCalls(params);
            });
            DeviceEventEmitter.addListener('reject', (params) => {
                params.actionType = 'reject';
                VideoCallsAndroid.handleInitialCalls(params);
            });
        }

        this.networkListner = NetInfo.addEventListener((info) => {
            console.log('handleConnectionChange app : NetInfo event: ', info);
            EventEmitter.emit(Connection.netWorkStatusChange, info);
            NetworkPoller.updateNetworkState(info);
        });

        EventEmitter.addListener('sessionExpired', () => {
            NetworkHandler.clearTime();
            if (
                NavigationAction.currentScreen() !==
                NavigationAction.SCREENS.sessionExpiry
            ) {
                NavigationAction.push(NavigationAction.SCREENS.sessionExpiry);
            }
        });
    }

    componentWillUnmount() {
        console.log('handleConnectionChange componentWillUnmount ');
        this.networkListner?.();
    }

    render() {
        console.log(
            `Amal : App.js from main activity event props: ${JSON.stringify(
                this.props
            )}`
        );
        return (
            <Provider store={Store}>
                <SafeAreaProvider>
                    <NavigationContainer ref={navigationRef}>
                        <Navigator initialProps={this.props} />
                    </NavigationContainer>
                    <Toast
                        position="top"
                        config={ToastConfig}
                        type="error"
                        onPress={Toast.hide}
                    />
                    <CustomisableAlert
                        defaultType="custom"
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                    />
                </SafeAreaProvider>
            </Provider>
        );
    }
}

export default App;
