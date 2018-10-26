import TwilioVoice from 'react-native-twilio-programmable-voice';
import { Platform, Alert, AppState } from 'react-native';
import { Auth } from '../capability';
import Twilio from './twilio';
import Permissions from 'react-native-permissions';
import EventEmitter, { TwilioEvents } from '../../lib/events';
import { Actions } from 'react-native-router-flux';
import { PhoneState } from '../../components/Phone';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Store from '../../lib/Store';

/*
const _eventHandlers = {
    deviceReady: new Map(),
    deviceNotReady: new Map(),
    deviceDidReceiveIncoming: new Map(),
    connectionDidConnect: new Map(),
    connectionDidDisconnect: new Map(),
    //iOS specific
    callRejected: new Map(),
}*/

export default class TwilioVoIP {
    init = async () => {
        try {
            await this.initTelephony();
            //this.showAlertMessage('VoIP initialized');
        } catch (err) {
            //this.showAlertMessage('VoIP initialization failed');
        }
        this.listenToEvents();
    };

    showAlertMessage(message) {
        Alert.alert(null, message, [{ text: 'OK' }], { cancelable: true });
        return;
    }

    requestAudioPermissions() {
        return new Promise((resolve, reject) => {
            Permissions.request('microphone').then(response => {
                if (response === 'authorized') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    initTelephony = async () => {
        if (Platform.OS === 'ioss') {
            // Not Required
            // TwilioVoice.initWithTokenUrl(Twilio.getAccessTokenURL());
            // try {
            //     TwilioVoice.configureCallKit({
            //         appName: 'FrontM' // Required param
            //         // imageName:     'my_image_name_in_bundle',             // OPTIONAL
            //         // ringtoneSound: 'my_ringtone_sound_filename_in_bundle' // OPTIONAL
            //     });
            //     return true;
            // } catch (err) {
            //     console.err(err);
            //     throw err;
            // }
        } else {
            try {
                console.log('Getting Auth User');

                const user = await Auth.getUser();
                console.log(user);
                await Twilio.enableVoIP(user);

                const accessToken = await Twilio.getAccessToken(user);
                if (!(__DEV__ && Platform.os === 'ios')) {
                    console.log('INit VoiP....');

                    const isAudioEnabled = await this.requestAudioPermissions();
                    if (!isAudioEnabled) {
                        this.showAlertMessage(
                            'Audio Permissions required for VoIP calls. Please enable them in settings'
                        );
                    }
                }

                await TwilioVoice.initWithToken(accessToken);
                console.log('Access Token for TWILIO>>>>>>>>>>>', accessToken);
                if (Platform.OS === 'ios') {
                    TwilioVoice.configureCallKit({
                        appName: 'FrontM' // Required param
                    });
                }
                return true;
            } catch (err) {
                console.log('initTelephony error : ', err);
                throw err;
            }
        }
    };

    listenToEvents = async () => {
        console.log('Twilio Events : ', TwilioEvents, PhoneState);
        TwilioVoice.addEventListener(
            TwilioEvents.deviceReady,
            this.deviceReadyHandler
        );
        TwilioVoice.addEventListener(
            TwilioEvents.deviceNotReady,
            this.deviceNotReadyHandler
        );
        TwilioVoice.addEventListener(
            TwilioEvents.connectionDidConnect,
            this.connectionDidConnectHandler
        );
        TwilioVoice.addEventListener(
            TwilioEvents.connectionDidDisconnect,
            this.connectionDidDisconnectHandler
        );
        // AppState.addEventListener('change', this.handleAppStateChange);

        if (Platform.OS === 'ios') {
            TwilioVoice.addEventListener(
                TwilioEvents.callRejected,
                this.callRejectedHandler
            );
        } else if (Platform.OS === 'android') {
            TwilioVoice.addEventListener(
                TwilioEvents.deviceDidReceiveIncoming,
                this.deviceDidReceiveIncomingHandler
            );
            //TwilioVoice.addEventListener(TwilioEvents.proximity, this.proximityHandler);
            //TwilioVoice.addEventListener(TwilioEvents.wiredHeadset, this.wiredHeadsetHandler);
        }
    };

    handleAppStateChange = async nextAppState => {
        let userLoggedIn = await Auth.isUserLoggedIn();
        if (userLoggedIn) {
            if (nextAppState === 'active') {
                TwilioVoice.getActiveCall()
                    .then(incomingCall => {
                        console.log(
                            'FrontM VoIP : getActiveCall : ',
                            incomingCall
                        );
                        if (incomingCall.call_state === 'CANCELLED') {
                            this.closePhoneScreen();
                        } else {
                            this.handleIncomingCall(incomingCall);
                        }
                    })
                    .catch(error => {
                        //this.closePhoneScreen();
                    });
            } else {
                this.closePhoneScreen();
            }
        }
    };

    closePhoneScreen = () => {
        console.log('FrontM VoIP : ', Actions.currentScene);
        if (Actions.currentScene === ROUTER_SCENE_KEYS.phone) {
            Actions.pop();
        }
    };

    handleIncomingCall = data => {
        console.log('FrontM VoIP : in handle incoming call');
        Actions.phone({ state: PhoneState.incomingcall, data: data });
    };

    deviceReadyHandler = async data => {
        console.log('FrontM VoIP : deviceReadyHandler : ', data);
        //this.showAlertMessage('Device is ready for VoIP Notifications');
        const user = await Auth.getUser();
        Twilio.enableVoIP(user);
    };

    deviceNotReadyHandler = data => {
        console.log('FrontM VoIP : deviceNotReadyHandler : ', data);
    };

    connectionDidConnectHandler = data => {
        console.log('>>>>>>>>>>>CALLL STATE<<<<<<<<<<<<<<<<<', data.call_state);

        if (Platform.OS === 'android') {
            Store.updateStore(data);
        }
        console.log('FrontM VoIP : connectionDidConnectHandler : ', data);
        EventEmitter.emit(TwilioEvents.connectionDidConnect, data);
    };

    connectionDidDisconnectHandler = data => {
        console.log('FrontM VoIP : connectionDidDisconnectHandler : ', data);
        if (Platform.OS === 'android') {
            Store.updateStore(data);
        }
        EventEmitter.emit(TwilioEvents.connectionDidDisconnect, data);
        //this.closePhoneScreen();
    };

    callRejectedHandler = data => {
        console.log('FrontM VoIP : callRejectedHandler : ', data);
        if (Platform.OS === 'android') {
            Store.updateStore(data);
        }
        EventEmitter.emit(TwilioEvents.callRejected, data);
    };

    deviceDidReceiveIncomingHandler = data => {
        console.log('FrontM VoIP : deviceDidReceiveIncomingHandler : ', data);
        if (Platform.OS === 'android') {
            Store.updateStore(data);
        }
        this.handleIncomingCall(data);
        EventEmitter.emit(TwilioEvents.deviceDidReceiveIncoming, data);
    };

    proximityHandler = data => {
        console.log('FrontM VoIP : proximityHandler : ', data);
    };

    wiredHeadsetHandler = data => {
        console.log('FrontM VoIP : wiredHeadsetHandler : ', data);
    };
}
