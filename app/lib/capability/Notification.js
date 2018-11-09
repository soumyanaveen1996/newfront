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
            let timer = setTimeout(function() {
                if (__DEV__) {
                    console.tron('Timed Out');
                }

                reject('No Notifications');
            }, 10000);

            DeviceStorage.get(NotificationKeys.notification)
                .then(value => {
                    if (value) {
                        value.isRegistered = true;
                        DeviceStorage.save(NotificationKeys.notification, value)
                            .then(() => {
                                EventEmitter.emit(
                                    NotificationEvents.registeredNotifications
                                );

                                clearTimeout(timer);
                                resolve(value);
                            })
                            .catch(error => {
                                clearTimeout(timer);
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

                                    DeviceStorage.save(
                                        NotificationKeys.notification,
                                        notificationDeviceInfo
                                    )
                                        .then(() => {
                                            EventEmitter.emit(
                                                NotificationEvents.registeredNotifications
                                            );
                                            clearTimeout(timer);
                                            resolve(notificationDeviceInfo);
                                        })
                                        .catch(error => {
                                            clearTimeout(timer);
                                            reject(error);
                                        });
                                } else {
                                    clearTimeout(timer);
                                    reject(new Error('User cancelled'));
                                }
                            },
                            senderID: config.gcm.senderID,
                            requestPermissions: true,
                            onError: error => {
                                console.log('onError', error);
                                clearTimeout(timer);
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
