import PushNotification from 'react-native-push-notification';
import DeviceStorage from './DeviceStorage';
import EventEmitter, { NotificationEvents } from '../../lib/events';
import config from '../../config/config';

const NotificationKeys = {
    notification: 'notification'
};

export default class Notification {
    static register = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(NotificationKeys.notification)
                .then(value => {
                    if (__DEV__) {
                        console.tron('In Device', value);
                    }

                    if (value) {
                        value.isRegistered = true;
                        DeviceStorage.save(NotificationKeys.notification, value)
                            .then(() => {
                                if (__DEV__) {
                                    console.tron('Saved Notificaiton');
                                }

                                EventEmitter.emit(
                                    NotificationEvents.registeredNotifications
                                );
                                if (__DEV__) {
                                    console.tron('Call Resolve');
                                }

                                resolve(value);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else {
                        PushNotification.configure({
                            onRegister: function(response) {
                                console.log('onRegister', response);
                                if (response) {
                                    var notificationDeviceInfo = {
                                        deviceType:
                                            response.os === 'ios'
                                                ? 'iphone'
                                                : 'android',
                                        deviceId: response.token,
                                        isRegistered: true
                                    };
                                    console.log(
                                        'Notification device info : ',
                                        notificationDeviceInfo
                                    );
                                    if (__DEV__) {
                                        console.tron(
                                            'Notificaiotn Device Info'
                                        );
                                    }

                                    DeviceStorage.save(
                                        NotificationKeys.notification,
                                        notificationDeviceInfo
                                    )
                                        .then(() => {
                                            EventEmitter.emit(
                                                NotificationEvents.registeredNotifications
                                            );
                                            resolve(notificationDeviceInfo);
                                        })
                                        .catch(error => {
                                            reject(error);
                                        });
                                } else {
                                    reject(new Error('User cancelled'));
                                }
                            },
                            senderID: config.gcm.senderID,
                            onError: error => {
                                console.log('onError', error);
                                reject(error);
                            }
                        });
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });

    static deregister = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(NotificationKeys.notification)
                .then(value => {
                    if (value) {
                        value.isRegistered = false;
                        return DeviceStorage.save(
                            NotificationKeys.notification,
                            value
                        );
                    } else {
                        reject(new Error('Device not registered'));
                    }
                })
                .then(value => {
                    resolve(value);
                })
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

    static configure = (notificationHandler = undefined) => {
        console.log('Configuring notifications');
        if (notificationHandler) {
            PushNotification.configure({
                onRegister: () => {},
                onNotification: notificationHandler
            });
        }
    };

    static sendLocalNotification(message, details = {}) {
        PushNotification.localNotification({
            message: message,
            userInfo: details
        });
    }
}
