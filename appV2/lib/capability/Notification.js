import { Notifications } from 'react-native-notifications';
import { Platform } from 'react-native';
import _ from 'lodash';
import DeviceStorage from './DeviceStorage';
import { Auth, ConversationContext } from '.';
import { NetworkHandler } from '../network';
import Bot from '../bot';
import { Conversation } from '../conversation';
import SystemBot from '../bot/SystemBot';
import { IM_CHAT, CHANNEL_CHAT } from '../conversation/Conversation';
import UserServices from '../../apiV2/UserServices';
import configToUse from '../../config/config';
import VoipPushNotification from 'react-native-voip-push-notification';
import NavigationAction from '../../navigation/NavigationAction';
import Store from '../../redux/store/configureStore';
import DomainNotificationsManager from '../DomainNotificationsManager/DomainNotificationsManager';
import ChannelDAO from '../persistence/ChannelDAO';
import TimelineBuilder from '../TimelineBuilder/TimelineBuilder';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import Permissions, { RESULTS } from 'react-native-permissions';
import PermissionList from '../utils/PermissionList';

const NotificationKeys = {
    notification: 'notification',
    voip: 'voipnotification'
};

export default class Notification {
    static requestPermission = () => {
        console.log('##### PN Notification reqest permisison  ');
        Notifications.events().registerRemoteNotificationsRegistered(
            (event) => {
                console.log(
                    '##### PN Notification token ; ',
                    event.deviceToken
                );
                Notification.handleRegister({
                    os: Platform.OS,
                    token: event.deviceToken
                });
            }
        );
        if (Platform.OS === 'ios') {
            Notifications.registerRemoteNotifications();
        } else {
            Permissions.requestNotifications().then((res) => {
                console.log(res);
                //generate token regardless of the permission
                Notifications.registerRemoteNotifications();
            });
        }
    };

    static configure = (askForPermission) => {
        Notifications.events().registerNotificationOpened(
            (notification, completion, action) => {
                console.log(
                    'Notification opened by device user',
                    notification.payload
                );
                console.log(
                    `Notification opened with an action identifier: ${action} and response text: ${action} ${JSON.stringify(
                        notification,
                        null,
                        2
                    )}`
                );
                Notification.handleNotification(notification);
                completion();
            }
        );

        Notifications.events().registerNotificationReceivedBackground(
            (notification, completion) => {
                console.log(
                    'Notification Received - Background',
                    notification.payload
                );

                // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
                completion({ alert: true, sound: true, badge: false });
            }
        );
    };

    static IS_REGISTERING = false;

    static grpcRegisterDevice(deviceToken) {
        if (Notification.IS_REGISTERING) {
            return;
        }
        Notification.IS_REGISTERING = true;
        return new Promise((resolve, reject) => {
            console.log('##### PN token from PushNotification', {
                deviceToken,
                deviceType: Platform.OS === 'ios' ? 'iphone' : 'android',
                platform: configToUse.app.appType
            });
            UserServices.registerDevice({
                deviceToken,
                deviceType: Platform.OS === 'ios' ? 'iphone' : 'android',
                platform: configToUse.app.appType
            })
                .then((result) => {
                    console.log('##### PN  token regiustarion doenn', result);
                    if (result.error === 0) {
                        if (Platform.OS === 'ios') {
                            VoipPushNotification.addEventListener(
                                'register',
                                (token) => {
                                    console.log(
                                        '##### PN Voip token from VoipPushNotification',
                                        token
                                    );
                                    VoipPushNotification.removeEventListener(
                                        'register'
                                    );
                                    UserServices.registerDeviceForVoip({
                                        deviceToken: token,
                                        deviceType: 'iphone',
                                        platform: configToUse.app.appType
                                    })
                                        .then((result) => {
                                            if (result.error === 0) {
                                                console.log(
                                                    '##### PN Voip token regiustarion doenn',
                                                    result
                                                );
                                                DeviceStorage.save(
                                                    NotificationKeys.voip,
                                                    token
                                                );
                                                Notification.IS_REGISTERING = false;
                                                resolve();
                                            } else {
                                                Notification.IS_REGISTERING = false;
                                                reject();
                                            }
                                        })
                                        .catch((error) => {
                                            console.log(
                                                '##### PN Voip token regiustarion errpr',
                                                error
                                            );
                                            Notification.IS_REGISTERING = false;
                                            reject(error);
                                        });
                                }
                            );
                            VoipPushNotification.registerVoipToken();
                        } else {
                            UserServices.registerDeviceForVoip({
                                deviceToken,
                                deviceType:
                                    Platform.OS === 'ios'
                                        ? 'iphone'
                                        : 'android',
                                platform: configToUse.app.appType
                            })
                                .then((result) => {
                                    if (result.error === 0) {
                                        DeviceStorage.save(
                                            NotificationKeys.voip,
                                            deviceToken
                                        );
                                        console.log(
                                            '##### PN Voip token regiustarion doenn',
                                            result
                                        );
                                        Notification.IS_REGISTERING = false;
                                        resolve();
                                    } else {
                                        Notification.IS_REGISTERING = false;
                                        Toast.show({
                                            text1:
                                                "Couldn't register for Notifications, Try again from settings screen.",
                                            type: 'error'
                                        });
                                        reject();
                                    }
                                })
                                .catch((error) => {
                                    console.log(
                                        '##### PN Voip token regiustarion errpr',
                                        error
                                    );
                                    Notification.IS_REGISTERING = false;
                                    Toast.show({
                                        text1:
                                            "Couldn't register for Notifications, Try again from settings screen.",
                                        type: 'error'
                                    });
                                    reject(error);
                                });
                        }
                    } else {
                        Notification.IS_REGISTERING = false;
                        Toast.show({
                            text1: "Couldn't register for Notifications.",
                            type: 'error'
                        });
                        reject();
                    }
                })
                .catch((error) => {
                    console.log(
                        '##### PN Voip token regiustarion errpr',
                        error
                    );
                    Toast.show({
                        text1:
                            "Couldn't register for Notifications, Try again from settings screen.",
                        type: 'error'
                    });
                    Notification.IS_REGISTERING = false;
                    reject(error);
                });
        }).catch((error) => {
            console.log('##### PN Voip token regiustarion errpr', error);
            Toast.show({
                text1:
                    "Couldn't register for Notifications, Try again from settings screen.",
                type: 'error'
            });
            Notification.IS_REGISTERING = false;
            reject(error);
        });
    }

    static grpcDeregisterDevice(deviceToken) {
        return new Promise((resolve, reject) => {
            UserServices.deregisterDevice({
                deviceToken,
                deviceType: Platform.OS === 'ios' ? 'iphone' : 'android',
                platform: configToUse.app.appType
            })
                .then((result) => {
                    console.log('Device register axios result', result);
                    if (result.error === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        }).catch((error) => {
            Notification.IS_REGISTERING = false;
            reject(error);
        });
    }

    static grpcDeregisterDeviceForVoip(deviceToken) {
        return new Promise((resolve, reject) => {
            UserServices.deregisterDeviceForVoip({
                deviceToken,
                deviceType: Platform.OS === 'ios' ? 'iphone' : 'android',
                platform: configToUse.app.appType
            })
                .then((result) => {
                    if (reject.error === 0) {
                        console.log('voip: Device de register done', result);
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        }).catch((error) => {
            reject(error);
        });
    }

    static handleRegister = (token) =>
        new Promise((resolve, reject) => {
            if (token) {
                const notificationDeviceInfo = {
                    deviceType: token.os === 'ios' ? 'iphone' : 'android',
                    deviceId: token.token,
                    isRegistered: true
                };
                Notification.grpcRegisterDevice(token.token)
                    .then(() =>
                        DeviceStorage.save(
                            NotificationKeys.notification,
                            notificationDeviceInfo
                        )
                    )
                    .then((obj) => {
                        resolve();
                    })
                    .catch((e) => {
                        reject(new Error(' PN Could not register', e));
                    });
            } else {
                reject(new Error('User cancelled'));
            }
        });

    static showMeetingRoom = async (notification) => {
        const user = Auth.getUserData();
        const { callerUserId } = notification;
        const { callerName } = notification;
        const { videoSessionId } = notification;
        const isVideoCall = notification.video === 'true';

        NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
            data: {
                otherUserId: callerUserId,
                otherUserName: callerName,
                videoSessionId
            },
            incomingVoipCall: true,
            title: callerName,
            isVideoCall,
            userId: user.info.userId
        });
    };

    static handleNotification = async (notification) => {
        let {
            data,
            callAction,
            botId,
            videoSessionId,
            videoControlId,
            conversationId,
            userDomain
        } = notification.payload;
        console.log('Notification : ', JSON.stringify(notification, null, 2));
        console.log(
            'Notification from react native notifications: ',
            JSON.stringify(notification, null, 2),
            conversationId
        );
        // if (data && data.data) data = data.data
        if (_.isEmpty(data)) {
            data = { botId, videoSessionId, videoControlId };
        } else {
            videoSessionId = data.videoSessionId;
            videoControlId = data.videoControlId;
            botId = data.botId;
            conversationId = data.conversationId;
        }

        // TODO(amal): Hacky solution to just load bot after the timeline is loaded.
        if (!global.timelineLoaded) {
            setTimeout(() => {
                Notification.handleNotification(notification);
            }, 2000);
            return;
        }

        console.log('Notification: new notification: ', notification);
        if (callAction == 'startCall' || callAction == 'CallStart') {
            Notification.showMeetingRoom(notification);
        }
        let conversation;
        if (Platform.OS === 'ios') {
            Notifications.ios.setBadgeCount(0);
        }

        if (botId) {
            if (Store.getState().user.currentDomain === userDomain) {
                Bot.getInstalledBots().then((bots) => {
                    const targetBot = bots.find((bot) => bot.botId === botId);
                    if (targetBot && !targetBot.systemBot) {
                        console.log('the data is ', targetBot);
                        if (
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.peopleChat ||
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.channelChat ||
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.bot
                        ) {
                            if (
                                Store.getState().user.currentConversationId !==
                                conversationId
                            ) {
                                console.log('i M KERT 65');

                                NavigationAction.replace(
                                    NavigationAction.SCREENS.bot,
                                    {
                                        bot: targetBot,
                                        botName: targetBot.botName,
                                        otherUserId: false,
                                        botLogoUrl: targetBot.logoUrl,
                                        comingFromNotif: {
                                            notificationFor: 'bot',
                                            isFavorite: targetBot.favorite
                                                ? 1
                                                : 0,
                                            conversationId: targetBot.botId,
                                            botId: targetBot.botId,
                                            userDomain: targetBot.userDomain,
                                            onRefresh: () =>
                                                TimelineBuilder.buildTiimeline()
                                        }
                                    }
                                );
                            }
                        } else {
                            console.log('i M KERT 66');

                            NavigationAction.goToBotChat({
                                bot: targetBot,
                                botName: targetBot.botName,
                                otherUserId: false,
                                botLogoUrl: targetBot.logoUrl,
                                comingFromNotif: {
                                    notificationFor: 'bot',
                                    isFavorite: targetBot.favorite ? 1 : 0,
                                    conversationId: targetBot.botId,
                                    botId: targetBot.botId,
                                    userDomain: targetBot.userDomain,
                                    onRefresh: () =>
                                        TimelineBuilder.buildTiimeline()
                                }
                            });
                        }
                        return;
                    }
                });
            } else {
                DomainNotificationsManager.addNotification(userDomain);
            }
        } else {
            Conversation.getConversation(conversationId)
                .then((conv) => {
                    console.log(
                        ' Notification Notification: conversation',
                        conv
                    );
                    if (conv) {
                        conversation = conv;
                        return SystemBot.get(SystemBot.imBotManifestName);
                    } else {
                        DomainNotificationsManager.addNotification(userDomain);
                        return undefined;
                    }
                })
                .then(async (imBot) => {
                    if (!imBot) {
                        return;
                    }

                    if (conversation === null) {
                        return;
                    }
                    if (conversation.type === IM_CHAT) {
                        ConversationContext.getBotConversationContextForId(
                            conversation.conversationId
                        ).then((conversationContext) => {
                            const user = Auth.getUserData();
                            let context = conversationContext;
                            if (context === null) {
                                return Promise.resolve([]);
                            }

                            let otherUserName = ConversationContext.getChatName(
                                context,
                                user
                            );
                            if (
                                NavigationAction.currentScreen() ===
                                    NavigationAction.SCREENS.peopleChat ||
                                NavigationAction.currentScreen() ===
                                    NavigationAction.SCREENS.channelChat ||
                                NavigationAction.currentScreen() ===
                                    NavigationAction.SCREENS.bot
                            ) {
                                if (
                                    Store.getState().user
                                        .currentConversationId !==
                                    conversation.conversationId
                                ) {
                                    NavigationAction.replace(
                                        NavigationAction.SCREENS.peopleChat,
                                        {
                                            key: Math.random(),
                                            bot: imBot,
                                            conversation,
                                            otherUserName: otherUserName,
                                            comingFromNotif: {
                                                notificationFor: 'peopleChat',
                                                isFavorite: conversation.favorite
                                                    ? 1
                                                    : 0,
                                                conversationId,
                                                userDomain,
                                                onRefresh: () =>
                                                    TimelineBuilder.buildTiimeline()
                                            }
                                        }
                                    );
                                }
                            } else {
                                NavigationAction.goToUsersChat({
                                    bot: imBot,
                                    conversation,
                                    otherUserName: otherUserName,
                                    comingFromNotif: {
                                        notificationFor: 'peopleChat',
                                        isFavorite: conversation.favorite
                                            ? 1
                                            : 0,
                                        conversationId,
                                        userDomain,
                                        onRefresh: () =>
                                            TimelineBuilder.buildTiimeline()
                                    }
                                });
                            }
                        });
                    } else if (conversation.type === CHANNEL_CHAT) {
                        console.log('i M KERT 31');
                        let channel = await ChannelDAO.selectChannelByConversationId(
                            conversationId
                        );
                        if (
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.peopleChat ||
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.channelChat ||
                            NavigationAction.currentScreen() ===
                                NavigationAction.SCREENS.bot
                        ) {
                            if (
                                Store.getState().user.currentConversationId !==
                                conversation.conversationId
                            ) {
                                console.log('i M KERT 21', channel);

                                console.log('Notification: channelchat');
                                NavigationAction.push(
                                    NavigationAction.SCREENS.channelChat,
                                    {
                                        bot: imBot,
                                        conversation,
                                        channel: channel,
                                        channelId: channel.channelId,
                                        comingFromNotif: {
                                            notificationFor: 'channelchat',
                                            isFavorite: conversation.favorite
                                                ? 1
                                                : 0,
                                            conversationId,
                                            userDomain,
                                            channel: channel,
                                            onRefresh: () =>
                                                TimelineBuilder.buildTiimeline()
                                        }
                                        // otherUserId:,
                                    }
                                );
                            }
                        } else {
                            console.log('i M KERT 1', channel);
                            NavigationAction.goToChannelChat({
                                bot: imBot,
                                conversation,
                                channel: channel,
                                channelId: channel.channelId,
                                comingFromNotif: {
                                    notificationFor: 'channelchat',
                                    isFavorite: conversation.favorite ? 1 : 0,
                                    conversationId,
                                    userDomain,
                                    channel: channel,
                                    onRefresh: () =>
                                        TimelineBuilder.buildTiimeline()
                                }
                            });
                        }
                    }
                });
        }
    };

    static deregister = (logout = false) =>
        new Promise((resolve, reject) => {
            let device;
            DeviceStorage.get(NotificationKeys.notification)
                .then(async (value) => {
                    if (value) {
                        device = value;
                        try {
                            await Notification.grpcDeregisterDevice(
                                value.deviceId
                            );
                        } catch (e) {
                            reject(e);
                        }
                        if (device) {
                            device.isRegistered = false;
                            DeviceStorage.save(
                                NotificationKeys.notification,
                                device
                            );
                        }
                    }
                    try {
                        if (logout) {
                            console.log(
                                'Notification: grpcDeregisterDeviceForVoip on logout'
                            );
                            const voipId = await DeviceStorage.get(
                                NotificationKeys.voip
                            );
                            if (voipId) {
                                await Notification.grpcDeregisterDeviceForVoip(
                                    voipId
                                );
                            } else {
                                console.log(
                                    'Notification: grpcDeregisterDeviceForVoip on logout:tokn not found'
                                );
                            }
                        }
                    } catch (e) {
                        reject(e);
                    }
                    resolve();
                })
                .catch((error) => {
                    reject();
                });
        });

    static deviceInfo = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(NotificationKeys.notification)
                .then((info) => {
                    resolve(info);
                })
                .catch((error) => {
                    reject(error);
                });
        });

    static checkPermissions = (callback) => {
        if (Platform.OS === 'ios') {
            Notifications.ios.checkPermissions().then((permissions) => {
                DeviceStorage.get(NotificationKeys.notification).then((res) => {
                    callback({
                        permissions,
                        registered: res
                    });
                });
            });
        } else {
            DeviceStorage.get(NotificationKeys.notification).then((res) => {
                callback({
                    registered: res
                });
            });
        }
    };

    static sendLocalNotification(message, details = {}) {
        Notifications.postLocalNotification({
            ...message,
            userInfo: details
        });
    }
}
