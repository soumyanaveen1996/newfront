import PushNotification from 'react-native-push-notification';
import DeviceStorage from './DeviceStorage';
import EventEmitter, { NotificationEvents } from '../../lib/events';
import config from '../../config/config';
import RL from '../../lib/utils/remoteDebugger';
import { NativeModules, Platform, PushNotificationIOS } from 'react-native';
import { Auth } from '.';
import { NetworkHandler } from '../network';
import Bot from '../bot';
import { Conversation } from '../conversation';
import SystemBot from '../bot/SystemBot';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import ReduxStore from '../../redux/store/configureStore';
import { Actions } from 'react-native-router-flux';

const UserServiceClient = NativeModules.UserServiceClient;

const NotificationKeys = {
    notification: 'notification'
};

export default class Notification {
    static requestPermission = () => {
        Notification.configure();
        // PushNotification.requestPermissions([1, 1, 1]);
    };

    static configure = () => {
        PushNotification.configure({
            onRegister: Notification.handleRegister,
            onNotification: Notification.handleNotification,
            senderID: config.gcm.senderID,
            requestPermissions: true,
            onError: error => {
                console.log('onError', error);
                reject(error);
            }
        });
        if (Platform.OS === 'ios') {
            PushNotificationIOS.addEventListener(
                'notification',
                notification => {
                    // NetworkHandler.readLambda();
                    // notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            );
            PushNotificationIOS.addEventListener(
                'localNotification',
                notification => {
                    // NetworkHandler.readLambda(true);
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            );
        }
    };

    static grpcRegisterDevice(deviceToken) {
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    UserServiceClient.registerDevice(
                        user.creds.sessionId,
                        {
                            deviceToken: deviceToken
                        },
                        (error, result) => {
                            console.log(
                                'GRPC:::register device for notifications : ',
                                error,
                                result
                            );
                            if (error) {
                                console.log(
                                    'error on registering device ',
                                    error
                                );
                                reject(error);
                            } else {
                                if (result.data.error === 0) {
                                    resolve();
                                } else {
                                    reject(result.data.error);
                                }
                            }
                        }
                    );
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    static grpcDeregisterDevice(deviceToken) {
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    UserServiceClient.deregisterDevice(
                        user.creds.sessionId,
                        {
                            deviceToken: deviceToken
                        },
                        (error, result) => {
                            console.log(
                                'GRPC:::deregister device for notifications : ',
                                error,
                                result
                            );
                            if (error) {
                                console.log(
                                    'error on deregistering device ',
                                    error
                                );
                                reject(error);
                            } else {
                                if (result.data.error === 0) {
                                    resolve();
                                } else {
                                    reject(result.data.error);
                                }
                            }
                        }
                    );
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    static handleRegister = token =>
        new Promise((resolve, reject) => {
            if (token) {
                var notificationDeviceInfo = {
                    deviceType: token.os === 'ios' ? 'iphone' : 'android',
                    deviceId: token.token,
                    isRegistered: true
                };
                Notification.grpcRegisterDevice(token.token)
                    .then(() => {
                        return DeviceStorage.save(
                            NotificationKeys.notification,
                            notificationDeviceInfo
                        );
                    })
                    .then(obj => {
                        resolve();
                    })
                    .catch(e => {
                        reject(new Error('Could not register'));
                    });
            } else {
                reject(new Error('User cancelled'));
            }
        });

    static handleNotification = notification => {
        NetworkHandler.poll();
        Bot.grpcheartbeatCatalog();
        // AgentGuard.heartBeat();
        let conversation;
        if (!notification.foreground && notification.userInteraction) {
            const conversationId =
                Platform.OS === 'android'
                    ? notification.conversationId
                    : notification.data.conversationId;
            PushNotification.setApplicationIconBadgeNumber(0);
            Conversation.getConversation(conversationId)
                .then(conv => {
                    conversation = conv;
                    return SystemBot.get(SystemBot.imBotManifestName);
                })
                .then(imBot => {
                    if (conversation.type === IM_CHAT) {
                        if (
                            Actions.currentScene ===
                            ROUTER_SCENE_KEYS.peopleChat
                        ) {
                            if (
                                ReduxStore.getState().user
                                    .currentConversationId !==
                                conversation.conversationId
                            ) {
                                Actions.refresh({
                                    key: Math.random(),
                                    bot: imBot,
                                    conversation: conversation
                                    // onBack: this.props.onBack
                                });
                            }
                        } else {
                            Actions.peopleChat({
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                    } else {
                        if (
                            Actions.currentScene ===
                            ROUTER_SCENE_KEYS.channelChat
                        ) {
                            if (
                                ReduxStore.getState().user
                                    .currentConversationId !==
                                conversation.conversationId
                            ) {
                                Actions.refresh({
                                    key: Math.random(),
                                    bot: imBot,
                                    conversation: conversation
                                    // onBack: this.props.onBack
                                });
                            }
                        } else {
                            Actions.channelChat({
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                    }
                });
        }
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };

    static deregister = () =>
        new Promise((resolve, reject) => {
            let device;
            PushNotification.abandonPermissions();
            DeviceStorage.get(NotificationKeys.notification)
                .then(value => {
                    if (value) {
                        device = value;
                        return Notification.grpcDeregisterDevice(
                            value.deviceId
                        );
                    } else {
                        reject(new Error('Device not registered'));
                    }
                })
                .then(() => {
                    device.isRegistered = false;
                    return DeviceStorage.save(
                        NotificationKeys.notification,
                        device
                    );
                })
                .then(resolve)
                .catch(error => {
                    reject(error);
                });
        });

    static deviceInfo = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(NotificationKeys.notification)
                .then(info => {
                    resolve(info);
                })
                .catch(error => {
                    reject(error);
                });
        });

    static checkPermissions = callback => {
        PushNotification.checkPermissions(permissions => {
            DeviceStorage.get(NotificationKeys.notification).then(res => {
                callback({
                    permissions: permissions,
                    registered: res
                });
            });
        });
    };

    static sendLocalNotification(message, details = {}) {
        PushNotification.localNotification({
            message: message,
            userInfo: details
        });
    }
}
