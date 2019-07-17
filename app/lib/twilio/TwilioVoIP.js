import TwilioVoice from 'react-native-twilio-programmable-voice';
import { Platform, Alert, AppState } from 'react-native';
import { Auth } from '../capability';
import Twilio from './twilio';
import Permissions from 'react-native-permissions';
import EventEmitter, { TwilioEvents, CallsEvents } from '../../lib/events';
import { Actions } from 'react-native-router-flux';
import { PhoneState } from '../../components/Phone';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Store from '../../lib/Store';
import Calls from '../calls';
import { ContactsCache } from '../../lib/ContactsCache';
import BackgroundTimer from 'react-native-background-timer';

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

const debounce = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), 3000);
    });
};

const fetchContactsDetails = async user => {
    let userName = user;
    try {
        const clientId = user.substr(7);
        const clientDetailsCache = await ContactsCache.getUserDetails(clientId);
        if (clientDetailsCache) {
            userName = clientDetailsCache.userName;
        } else {
            clientDetails = await ContactsCache.fetchContactDetailsForUser(
                clientId
            );
            userName = clientDetails.userName;
        }
    } catch (error) {}

    if (userName.startsWith('client:')) {
        await debounce();

        try {
            const clientId = user.substr(7);
            const clientDetailsCache = await ContactsCache.getUserDetails(
                clientId
            );
            if (clientDetailsCache) {
                userName = clientDetailsCache.userName;
            } else {
                clientDetails = await ContactsCache.fetchContactDetailsForUser(
                    clientId
                );
                userName = clientDetails.userName;
            }
        } catch (error) {}
    }
    return userName;
};

export default class TwilioVoIP {
    init = async () => {
        try {
            await this.initTelephony();
            //this.showAlertMessage('VoIP initialized');
        } catch (err) {
            //this.showAlertMessage('VoIP initialization failed');
        }
        this.listenToEvents();
        console.log('Sourav Logging:::: 6');
        return this;
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

                console.log('Sourav Logging:::: 1');
                const accessToken = await Twilio.getAccessToken(user);
                console.log('Sourav Logging:::: 2');
                if (!(__DEV__ && Platform.os === 'ios')) {
                    console.log('INit VoiP....');

                    const isAudioEnabled = await this.requestAudioPermissions();
                    console.log('Sourav Logging:::: 3');
                    if (!isAudioEnabled) {
                        this.showAlertMessage(
                            'Audio Permissions required for VoIP calls. Please enable them in settings'
                        );
                    }
                }
                await TwilioVoice.initWithToken(accessToken);
                console.log('Sourav Logging:::: 4');

                await Twilio.enableVoIP(user);
                console.log('Sourav Logging:::: 5');
                // console.log('Access Token for TWILIO>>>>>>>>>>>', accessToken);
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

        if (Platform.OS === 'ios') {
            AppState.addEventListener('change', this.handleAppStateChange);
        }

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
            Calls.fetchCallHistory();
            Actions.pop();
        }
    };

    handleIncomingCall = async data => {
        console.log('FrontM VoIP : in handle incoming call', data);
        const call_from = data.call_from;
        if (call_from.startsWith('client:')) {
            const name = await fetchContactsDetails(call_from);
            console.log('Sourav Logging:::: user name is', name);
            data = { ...data, call_from: name };
            Actions.phone({ state: PhoneState.incomingcall, data: data });
        } else {
            Actions.phone({ state: PhoneState.incomingcall, data: data });
        }
    };

    deviceReadyHandler = async data => {
        console.log('FrontM VoIP : deviceReadyHandler : ', data);
        //this.showAlertMessage('Device is ready for VoIP Notifications');
        const user = await Auth.getUser();
        console.log('Sourav Logging:::: Device is Ready for VOIP');
        Twilio.enableVoIP(user);
    };

    deviceNotReadyHandler = data => {
        console.log('Sourav Logging:::: Device is NOT Ready for VOIP');
        console.log('FrontM VoIP : deviceNotReadyHandler : ', data);
    };

    connectionDidConnectHandler = data => {
        Store.updateStore(data);
        EventEmitter.emit(TwilioEvents.connectionDidConnect, data);
        // Actions.phone({state: PhoneState.incall, data: data})
    };

    connectionDidDisconnectHandler = data => {
        console.log('FrontM VoIP : connectionDidDisconnectHandler : ', data);
        Store.updateStore(data);
        EventEmitter.emit(TwilioEvents.connectionDidDisconnect, data);
        //this.closePhoneScreen();
    };

    callRejectedHandler = data => {
        console.log('FrontM VoIP : callRejectedHandler : ', data);
        Store.updateStore(data);
        EventEmitter.emit(TwilioEvents.callRejected, data);
        Calls.fetchCallHistory();
    };

    deviceDidReceiveIncomingHandler = async data => {
        console.log(
            'Sourav Logging:::: In Device Received Incomeing HNADLER>>>>>>>>>>>>'
        );
        Store.updateStore(data);
        // EventEmitter.emit(TwilioEvents.deviceDidReceiveIncoming, data);

        console.log('FrontM VoIP : in handle incoming call', data);
        const call_from = data.call_from;
        if (call_from.startsWith('client:')) {
            const name = await fetchContactsDetails(call_from);
            console.log('Sourav Logging:::: user name is', name);
            data = { ...data, call_from: name };
            Actions.phone({ state: PhoneState.incomingcall, data: data });
        } else {
            Actions.phone({ state: PhoneState.incomingcall, data: data });
        }
    };

    proximityHandler = data => {
        console.log('FrontM VoIP : proximityHandler : ', data);
    };

    wiredHeadsetHandler = data => {
        console.log('FrontM VoIP : wiredHeadsetHandler : ', data);
    };
}
