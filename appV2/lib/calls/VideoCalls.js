import RNCallKeep from 'react-native-callkeep';
import Bugsnag from '@bugsnag/react-native';
import Bot from '../bot';
import I18n from '../../config/i18n/i18n';
import EventEmitter, { MediaSoupEvents, MessageEvents } from '../events';
import UserServices from '../../apiV2/UserServices';
import { Auth } from '../capability';
import BackgroundMessageSender from '../BackgroundTask/BackgroundMessageSender';
import Message from '../capability/Message';
import moment from 'moment';
import BackgroundTimer from 'react-native-background-timer';
import { Utils } from '../capability';
const HANDLED_MEDIA_SESSIONS = {};
import { NativeModules, Platform } from 'react-native';
import NavigationAction from '../../navigation/NavigationAction';

export default class VideoCalls {
    init = () => {
        const options = {
            ios: {
                appName: I18n.t('AppName'),
                maximumCallGroups: 1,
                imageName: 'call-logo'
            }
            // android: {
            //     alertTitle: 'Permissions required',
            //     alertDescription:
            //         'This application needs to access your phone accounts',
            //     cancelButton: 'Cancel',
            //     okButton: 'ok',
            //     imageName: 'phone_account_icon'
            // }
        };
        this.payloads = {};
        this.answeredCalls = {};
        if (Platform.OS === 'ios') {
            RNCallKeep.setup(options)
                .then((accepted) => {
                    console.log('#########Callkeep set up done: ', accepted);
                })
                .catch((error) => {
                    Utils.addLogEntry({
                        type: 'SYSTEM',
                        entry: {
                            level: 'LOG',
                            message: 'voip: callkeep error'
                        },
                        data: {
                            e: JSON.stringify(error)
                        }
                    });
                    Bugsnag.notify(error, (report) => {
                        report.context = 'Callkeep setup error';
                    });
                });
        }

        RNCallKeep.setAvailable(true);
        RNCallKeep.addEventListener(
            'didReceiveStartCallAction',
            ({ handle, callUUID, name }) => {
                // Alert.alert('start call cation');
                console.log('#########Callkeep didReceiveStartCallAction: ');
            }
        );

        RNCallKeep.addEventListener('answerCall', this.handleAnswerCall);

        RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
            // Do your normal `Hang Up` actions here
            console.log(`voipCall: Callkeep endCall: ${callUUID}`);
            if (this.eventSubscription) {
                this.eventSubscription.remove();
                this.eventSubscription = null;
            }
            // Alert.alert('Callkeep call end');
            if (
                NavigationAction.currentScreen() ===
                NavigationAction.SCREENS.meetingRoom
            ) {
                NavigationAction.pop();
            }

            const payload = this.payloads[callUUID];
            if (payload) {
                if (payload.botId) {
                    const user = Auth.getUserData();
                    if (user) {
                        console.log('voipCall: call rejected, send end call');
                        const msg = {
                            controlId: 'conferenceCall',
                            callAction: 'callReject',
                            videoSessionId: payload.videoSessionId
                        };
                        const message = new Message();
                        message.messageByBot(false);
                        message.videoResponseMessage(msg);
                        message.setCreatedBy(user.userId);
                        const messageSender = new BackgroundMessageSender(
                            payload.botId
                        );
                        messageSender.sendMessage(message);
                    }
                } else if (payload.callerUserId) {
                    const user = Auth.getUserData();
                    UserServices.sendVoipPushNotification({
                        userId: payload.callerUserId,
                        videoSessionId: payload.videoSessionId,
                        callerUserId: user.userId,
                        callAction: 'CallEnd',
                        video: !!payload.video
                    })
                        .then(() => {
                            // Alert.alert('Call end sent from callkeep');
                        })
                        .catch((error) => {
                            // Alert.alert('Call end error from callkeep');
                        });
                } else {
                }
            }
            if (this.payloads[callUUID]) {
                delete this.payloads[callUUID];
            }
            if (this.answeredCalls[callUUID]) {
                delete this.answeredCalls[callUUID];
            }
        });

        RNCallKeep.addEventListener(
            'didDisplayIncomingCall',
            this.handleDisplayedIncomingCall
        );

        RNCallKeep.addEventListener(
            'didPerformSetMutedCallAction',
            ({ muted, callUUID }) => {
                const payload = this.payloads[callUUID];
                console.log('voipCall: rncallkeep mute action');
                if (payload) {
                    EventEmitter.emit(MessageEvents.callMessage, {
                        callAction: 'callKeepEvent',
                        muted,
                        callUUID,
                        videoSessionId: payload && payload.videoSessionId
                    });
                }
            }
        );
    };

    clearListener = () => {
        RNCallKeep.removeEventListener('didReceiveStartCallAction');
        RNCallKeep.removeEventListener('answerCall');
        RNCallKeep.removeEventListener('endCall');
        RNCallKeep.removeEventListener('didDisplayIncomingCall');
    };

    showIncomingCall = (uuid, handle, name, data = null) => {
        this.payloads[uuid] = data;
        RNCallKeep.displayIncomingCall(uuid, handle, name, 'generic');
    };

    endCall = (uuid) => {
        RNCallKeep.endCall(uuid);
        // RNCallKeep.endAllCalls();
    };

    rejectCall = (uuid) => {
        RNCallKeep.rejectCall(uuid);
    };

    checkBusy = () => {
        RNCallKeep.checkIfBusy();
    };

    handleDisplayedIncomingCalOnAppLaunch = ({
        error,
        callUUID,
        handle,
        localizedCallerName,
        hasVideo,
        fromPushKit,
        payload
    }) => {
        if (this.payloads[callUUID]) return;
        console.log(
            'voipCall: Callkeep didDisplayIncomingCall saving payload and uuid'
        );
        this.payloads[callUUID] = payload;
        this.answeredCalls[callUUID] = true;
    };

    handleDisplayedIncomingCall = ({
        error,
        callUUID,
        handle,
        localizedCallerName,
        hasVideo,
        fromPushKit,
        payload
    }) => {
        // you might want to do following things when receiving this event:
        // - Start playing ringback if it is an outgoing call
        console.log(`voipCall: Callkeep didDisplayIncomingCall${callUUID}`);
        if (this.payloads[callUUID]) return;
        console.log(
            'voipCall: Callkeep didDisplayIncomingCall saving payload and uuid'
        );
        this.payloads[callUUID] = payload;
        this.answeredCalls[callUUID] = true;
        // Alert.alert('didDisplayIncomingCall');
        this.timeOutCall = BackgroundTimer.setTimeout(() => {
            if (RNCallKeep.isCallActive(callUUID)) {
                RNCallKeep.reportEndCallWithUUID(callUUID, 2);
                // Alert.alert('reject call');
                // Alert.alert('auto reject call');
            }
        }, 30000);
        this.eventSubscription = EventEmitter.addListener(
            MessageEvents.callEnd,
            (message) => {}
        );
    };

    handleCallEndEvent = (message) => {
        const payloadKeys = Object.keys(this.payloads);
        const callPayloadUUID = payloadKeys.find(
            (payloadUUID) =>
                this.payloads[payloadUUID].videoSessionId ===
                message.videoSessionId
        );
        if (
            callPayloadUUID &&
            message.videoSessionId ===
                this.payloads[callPayloadUUID].videoSessionId
        ) {
            RNCallKeep.reportEndCallWithUUID(callPayloadUUID, 4);
            RNCallKeep.setAvailable(true);
            return;
        }
    };

    handleAnswerCall = async (
        data,
        isFromKilledState = false,
        callDisplayData
    ) => {
        // Utils.addLogEntry({
        //     type: 'SYSTEM',

        //     entry: {
        //         level: 'LOG',
        //         message: 'Handle answer call'
        //     },
        //     data: {
        //         data,
        //         isFromKilledState,
        //         callDisplayData
        //     }
        // });
        if (isFromKilledState && callDisplayData)
            this.handleDisplayedIncomingCalOnAppLaunch(callDisplayData);
        const { callUUID } = data;
        if (Platform.OS === 'android') {
            const { CallkeepHelperModule } = NativeModules;
            CallkeepHelperModule.startActivity();
            RNCallKeep.endCall(callUUID);
        }
        RNCallKeep.setCurrentCallActive(callUUID);
        // Do your normal `Answering` actions here.
        if (this.eventSubscription) {
            this.eventSubscription.remove();
            this.eventSubscription = null;
        }
        let payload = this.payloads[callUUID];
        if (payload == undefined) {
            const events = await RNCallKeep.getInitialEvents();
            const display = events.find(
                (event) => event.name === 'RNCallKeepDidDisplayIncomingCall'
            );
            if (display && display?.data?.callUUID === callUUID) {
                payload = display.data.payload;
                this.payloads[callUUID] = payload;
                this.answeredCalls[callUUID] = true;
            } else {
                RNCallKeep.endCall(callUUID);
                return;
            }
        }
        const {
            botId,
            videoSessionId,
            video,
            roomName,
            videoControlId,
            callerUserId,
            mediasoupHost,
            codec,
            iAmHost,
            startWithVideoMuted,
            preConnectCallCheck,
            startWithAudioMuted,
            userId,
            uid,
            ur
        } = payload;
        console.log('voipCall: Callkeep answerCall', data, payload);
        if (this.timeOutCall) BackgroundTimer.clearTimeout(this.timeOutCall);
        // Utils.addLogEntry({
        //     type: 'SYSTEM',

        //     entry: {
        //         level: 'LOG',
        //         message: 'Handle answer call payload'
        //     },
        //     data: {
        //         payload
        //     }
        // });
        if (botId) {
            const bots = await Bot.getInstalledBots();
            const user = Auth.getUserData();
            const targetBot = bots.find((bot) => bot.botId === botId);
            console.log('voipCall: target : ', targetBot);
            console.log('voipCall: target : ', videoControlId);
            if (videoControlId === 'conferenceCall') {
                console.log(
                    'voipCall: target : ',
                    videoSessionId,
                    callUUID,
                    HANDLED_MEDIA_SESSIONS
                );
                if (
                    !HANDLED_MEDIA_SESSIONS[videoSessionId] ||
                    moment() - HANDLED_MEDIA_SESSIONS[videoSessionId] > 60000
                ) {
                    if (
                        NavigationAction.currentScreen() ===
                            NavigationAction.SCREENS.jitsi &&
                        NavigationAction.getCurrentParams()?.roomId !==
                            videoSessionId
                    ) {
                        NavigationAction.pop();
                    }

                    NavigationAction.push(NavigationAction.SCREENS.jitsi, {
                        hostname: mediasoupHost,
                        codec,
                        peerId: user.userId,
                        roomId: videoSessionId,
                        roomName: roomName,
                        iAmHost: iAmHost,
                        startWithVideoMuted,
                        startWithAudioMuted,
                        displayName: user.info.userName,
                        callUUID,
                        botId: botId,
                        preConnectCallCheck,
                        userId,
                        uid,
                        ur
                    });

                    HANDLED_MEDIA_SESSIONS[videoSessionId] = moment();
                }
            } else if (targetBot) {
                RNCallKeep.setAvailable(false);
                Actions.bot({
                    bot: targetBot,
                    videoCallData: {
                        userId: callerUserId,
                        videoControlId,
                        videoSessionId
                    }
                });
            } else {
                // Alert.alert('no bot found');
                // RNCallKeep.endAllCalls();
            }
        } else {
            // (TODO): This is a hack. Sometimes the entire app refreshes after opening the Call screen and so the call
            // screen vanishes. So added a timeout. We have to revisit once we change the app refreshes and how to maintain
            // the call window even if app refreshes.
            setTimeout(() => {
                const user = Auth.getUserData();
                NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                    data: {
                        otherUserId: payload.callerUserId,
                        otherUserName: payload?.callerName,
                        videoSessionId: payload.videoSessionId
                    },
                    callUUID,
                    isVideoCall: video,
                    incomingVoipCall: true,
                    title: payload?.callerName,
                    userId: user.userId
                });
            }, 1000);
        }
    };
}
