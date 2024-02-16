import { Platform } from 'react-native';
import { Auth, Message, Notification } from '../capability';
const HANDLED_MEDIA_SESSIONS = {};
import _ from 'lodash';
import BackgroundMessageSender from '../BackgroundTask/BackgroundMessageSender';
import UserServices from '../../apiV2/UserServices';
import NavigationAction from '../../navigation/NavigationAction';
import Bot from '../bot';

export default class VideoCallsAndroid {
    static handleInitialCalls = async (params = null) => {
        if (params === null || undefined) return;
        const {
            videoSessionId,
            video,
            callerName,
            botId,
            videoControlId,
            callerUserId,
            mediasoupHost,
            codec,
            roomName,
            iAmHost,
            startWithVideoMuted,
            preConnectCallCheck,
            userId,
            uid,
            ur,
            brand,
            actionType
        } = params;
        const user = Auth.getUserData();
        if (actionType === 'reject') {
            if (botId) {
                const msg = {
                    controlId: 'conferenceCall',
                    action: 'callReject',
                    videoSessionId: videoSessionId
                };
                const message = new Message();
                message.messageByBot(false);
                message.videoResponseMessage(msg);
                message.setCreatedBy(user.userId);
                const messageSender = new BackgroundMessageSender(botId);
                messageSender.sendMessage(message);
                return;
            } else {
                UserServices.sendVoipPushNotification({
                    userId: callerUserId,
                    videoSessionId: videoSessionId,
                    callerUserId: user.info.userId,
                    callAction: 'CallEnd',
                    video: !!video
                })
                    .then(() => {
                        console.log('Call end sent from callkeep');
                    })
                    .catch((error) => {
                        console.log('Call end error from callkeep');
                    });
            }
        } else if (actionType === 'accept') {
            if (!_.isEmpty(videoSessionId)) {
                if (!HANDLED_MEDIA_SESSIONS[videoSessionId]) {
                    HANDLED_MEDIA_SESSIONS[videoSessionId] = true;
                    if (botId) {
                        if (videoControlId === 'conferenceCall') {
                            if (
                                NavigationAction.currentScreen() ===
                                    NavigationAction.SCREENS.jitsi &&
                                NavigationAction.getCurrentParams().roomId !==
                                    videoSessionId
                            ) {
                                NavigationAction.pop();
                            }
                            NavigationAction.push(
                                NavigationAction.SCREENS.jitsi,
                                {
                                    hostname: mediasoupHost,
                                    codec,
                                    peerId: user.userId,
                                    roomId: videoSessionId,
                                    roomName: roomName,
                                    startWithVideoMuted: startWithVideoMuted,
                                    iAmHost: iAmHost,
                                    displayName: user.info.userName,
                                    botId: botId,
                                    preConnectCallCheck: preConnectCallCheck,
                                    userId: userId,
                                    uid,
                                    ur,
                                    brand
                                }
                            );
                        } else {
                            const bots = await Bot.getInstalledBots();
                            const targetBot = bots.find(
                                (bot) => bot.botId === botId
                            );
                            if (targetBot) {
                                NavigationAction.push(
                                    NavigationAction.SCREENS.bot,
                                    {
                                        bot: targetBot,
                                        videoCallData: {
                                            userId: callerUserId,
                                            videoControlId: videoControlId,
                                            videoSessionId: videoSessionId
                                        }
                                    }
                                );
                            }
                        }
                    } else if (
                        NavigationAction.currentScreen() !==
                        NavigationAction.SCREENS.meetingRoom
                    ) {
                        NavigationAction.push(
                            NavigationAction.SCREENS.meetingRoom,
                            {
                                data: {
                                    otherUserId: callerUserId,
                                    otherUserName: callerName,
                                    videoSessionId: videoSessionId
                                },
                                incomingVoipCall: true,
                                title: callerName,
                                isVideoCall: video,
                                userId: user.info.userId
                            }
                        );
                    }
                } else {
                    console.log('already handled');
                }
            }
        } else {
            Notification.handleNotification({ payload: params });
        }
    };
}
