import PushNotification from 'react-native-push-notification';
import DeviceStorage from './DeviceStorage';
import EventEmitter, { NotificationEvents } from '../../lib/events';


const NotificationKeys = {
    notification: 'notification',
}

export default class Notification {
    static register = () => new Promise((resolve, reject) => {
        DeviceStorage.get(NotificationKeys.notification)
            .then((value) => {
                if (value) {
                    value.isRegistered = true;
                    DeviceStorage.save(NotificationKeys.notification, value)
                        .then(() => {
                            EventEmitter.emit(NotificationEvents.registeredNotifications);
                            resolve(value);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    PushNotification.configure({
                        onRegister: function (response) {
                            console.log('onRegister', response);
                            if (response) {
                                var notificationDeviceInfo = {
                                    deviceType: response.os === 'ios' ? 'iphone' : 'android',
                                    deviceId: response.token,
                                    isRegistered: true,
                                }
                                DeviceStorage.save(NotificationKeys.notification, notificationDeviceInfo)
                                    .then(() => {
                                        EventEmitter.emit(NotificationEvents.registeredNotifications);
                                        resolve(notificationDeviceInfo);
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    });
                            } else {
                                reject(new Error('User cancelled'));
                            }
                        },
                        onError: (error) => {
                            console.log('onError', error);
                            reject(error);
                        }
                    });
                }
            })
            .catch((error) => {
                reject(error);
            });
    });

    static deregister = () => new Promise((resolve, reject) => {
        DeviceStorage.get(NotificationKeys.notification)
            .then((value) => {
                if (value) {
                    value.isRegistered = false;
                    return DeviceStorage.save(NotificationKeys.notification, value);
                } else {
                    reject(new Error('Device not registered'));
                }
            })
            .then((value) => {
                resolve(value);
            })
            .catch((error) => {
                reject(error);
            })
    });

    static deviceInfo = () => new Promise((resolve, reject) => {
        DeviceStorage.get(NotificationKeys.notification)
            .then((info) => {
                resolve(info);
            })
            .catch((error) => {
                reject(error);
            })
    });

    static configure = (notificationHandler = undefined) => {
        console.log('Configuring notifications');
        if (notificationHandler) {
            PushNotification.configure({
                onRegister: () => { },
                onNotification: notificationHandler,
            });
        }
    }

    static sendLocalNotification(message, details = {}) {
        PushNotification.localNotification({
            message: message,
            userInfo: details
        });
    }
}
