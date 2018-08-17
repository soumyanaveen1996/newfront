import TwilioVoice from 'react-native-twilio-programmable-voice';
import { Platform } from 'react-native';
import { Auth } from '../capability';
import Twilio from './twilio';
import Permissions from 'react-native-permissions';
import EventEmitter, { TwilioEvents } from '../../lib/events';
import { Actions } from 'react-native-router-flux';
import { PhoneState } from '../../components/Phone'

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
        await this.initTelephony();
        this.listenToEvents();
    }

    requestAudioPermissions() {
        return new Promise((resolve, reject) => {
            Permissions.request('microphone')
                .then((response) => {
                    if (response === 'authorized') {
                        resolve();
                    } else {
                        reject();
                    }
                })
        })
    }

    initTelephony = async () => {
        if (Platform.OS === 'ioss') {
            TwilioVoice.initWithTokenUrl(Twilio.getAccessTokenURL())
            try {
                TwilioVoice.configureCallKit({
                    appName:       'FrontM',                  // Required param
                    // imageName:     'my_image_name_in_bundle',             // OPTIONAL
                    // ringtoneSound: 'my_ringtone_sound_filename_in_bundle' // OPTIONAL
                })
                return true;
            } catch (err) {
                console.err(err)
                throw err;
            }
        } else {
            try {
                const user = await Auth.getUser();
                const accessToken = await Twilio.getAccessToken(user)
                if (!(__DEV__ && Platform.os === 'ios')) {
                    await this.requestAudioPermissions();
                }

                await TwilioVoice.initWithToken(accessToken)
                if (Platform.OS === 'ios') {
                    TwilioVoice.configureCallKit({
                        appName:       'FrontM',                  // Required param
                    })
                }
                return true;
            } catch (err) {
                console.log(err)
                throw err;
            }
        }
    }

    listenToEvents = async () => {
        console.log('Twilio Events : ', TwilioEvents, PhoneState);
        TwilioVoice.addEventListener(TwilioEvents.deviceReady, this.deviceReadyHandler);
        TwilioVoice.addEventListener(TwilioEvents.deviceNotReady, this.deviceNotReadyHandler);
        TwilioVoice.addEventListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler);


        if (Platform.OS === 'ios') {
            TwilioVoice.addEventListener(TwilioEvents.callRejected, this.callRejectedHandler);
        } else if (Platform.OS === 'android') {
            TwilioVoice.addEventListener(TwilioEvents.deviceDidReceiveIncoming, this.deviceDidReceiveIncomingHandler);
            //TwilioVoice.addEventListener(TwilioEvents.proximity, this.proximityHandler);
            //TwilioVoice.addEventListener(TwilioEvents.wiredHeadset, this.wiredHeadsetHandler);
        }

        TwilioVoice.getActiveCall().then(incomingCall => {
            console.log('FrontM VoIP : getActiveCall : ', incomingCall);
            if (incomingCall){
                this.handleIncomingCall(incomingCall);
            }
        })
    }

    handleIncomingCall = (data) => {
        console.log('FrontM VoIP : in handle incoming call');
        Actions.phone({state: PhoneState.incomingcall, data: data})
    }

    deviceReadyHandler = async (data) => {
        console.log('FrontM VoIP : deviceReadyHandler : ', data);
        const user = await Auth.getUser();
        Twilio.enableVoIP(user)
    }

    deviceNotReadyHandler = (data) => {
        console.log('FrontM VoIP : deviceNotReadyHandler : ', data);
    }

    connectionDidDisconnectHandler = (data) => {
        console.log('FrontM VoIP : connectionDidDisconnectHandler : ', data);
        EventEmitter.emit(TwilioEvents.connectionDidDisconnect, data);
    }

    callRejectedHandler = (data) => {
        console.log('FrontM VoIP : callRejectedHandler : ', data);
        EventEmitter.emit(TwilioEvents.callRejected, data);
    }

    deviceDidReceiveIncomingHandler = (data) => {
        console.log('FrontM VoIP : deviceDidReceiveIncomingHandler : ', data);
        this.handleIncomingCall(data);
        EventEmitter.emit(TwilioEvents.deviceDidReceiveIncoming, data);
    }

    proximityHandler = (data) => {
        console.log('FrontM VoIP : proximityHandler : ', data);
    }

    wiredHeadsetHandler = (data) => {
        console.log('FrontM VoIP : wiredHeadsetHandler : ', data);
    }

}
