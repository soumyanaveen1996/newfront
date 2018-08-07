import TwilioVoice from 'react-native-twilio-programmable-voice';
import { PermissionsAndroid, Platform } from "react-native";
import config from "../../config/config";
import { Auth, Network } from "../capability";
import SystemBot from "../bot/SystemBot";

const TwilioEvents = {
    deviceReady: 'deviceReady',
    deviceNotReady: 'deviceNotReady',
    connectionDidDisconnect: 'connectionDidDisconnect',
    callRejected: 'callRejected',
    deviceDidReceiveIncoming: 'deviceDidReceiveIncoming',
    proximity: 'proximity',
    wiredHeadset: 'wiredHeadset'
};


export class TwilioVoIP {

    init = async () => {
        await this.initTwilio();
        //await this.listenToEvents();
    }

    listenToEvents = async () => {
        TwilioVoice.addEventListener(TwilioEvents.deviceReady, this.deviceReadyHandler);
        TwilioVoice.addEventListener(TwilioEvents.deviceNotReady, this.deviceNotReadyHandler);
        TwilioVoice.addEventListener(TwilioEvents.connectionDidDisconnect, this.connectionDidDisconnectHandler);
        TwilioVoice.addEventListener(TwilioEvents.callRejected, this.callRejectedHandler);
        TwilioVoice.addEventListener(TwilioEvents.deviceDidReceiveIncoming, this.deviceDidReceiveIncomingHandler);
        TwilioVoice.addEventListener(TwilioEvents.proximity, this.proximityHandler);
        TwilioVoice.addEventListener(TwilioEvents.wiredHeadset, this.wiredHeadsetHandler);

        TwilioVoice.getActiveCall().then(incomingCall => {
            if(incomingCall){
                _deviceDidReceiveIncoming(incomingCall);
            }
        })
    }

    initTwilio = async () => {
        let permissionGranted = false;
        permissionGranted = Platform.OS === 'android' ? this.checkMicrophonePermission(): true;
        if(permissionGranted){
            try {
                const accessToken = this.getAccessTokenFromServer();
                //const success = await TwilioVoice.initWithToken(accessToken);
            } catch (err) {
                console.log('Error while initialising the twilio voice sdk '+ err);
            }
        } else {
            //TODO : handle the case when user denies microphone permission
        }
    }

    checkMicrophonePermission(){
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then((result)=>{
            if(!result){
                try {
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                        {
                            'title': 'Microphone Permission',
                            'message': 'App needs access to you microphone ' +
                            'to initialize VoIP calls.'
                        }
                    ).then((granted) => {
                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                } catch (err) {
                    console.warn(err);
                }
            }
        });
    }

    getAccessTokenFromServer = () => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let options = {
                        'method': 'get',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.contactsPath}?botId=${SystemBot.contactsBot.botId}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        }
                    };
                    return Network(options);
                }
            }).then((response) => {
                console.log('Twilio access token ', response.data);
                if (response.data) {
                    let accessToken = response.data;
                    return accessToken;
                }
            })
            .catch(reject);
    }

    //TwilioVoice.connect({To: '+61234567890'}); => call this when user clicks the call button

    //TwilioVoice.disconnect();

    //TwilioVoice.accept();

    //TwilioVoice.reject();

    //TwilioVoice.ignore();

    //TwilioVoice.setMuted(mutedValue);

    //TwilioVoice.sendDigits(digits);

    // should be called after the app is initialized
    // to catch incoming call when the app was in the background
}