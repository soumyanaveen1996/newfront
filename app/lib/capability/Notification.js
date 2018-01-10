import PushNotification from 'react-native-push-notification';
import DeviceStorage from './DeviceStorage';
import Notifications from '../notifications';
import { Platform } from 'react-native';


const NotificationKeys = {
    notification: 'notification',
}

export default class Notification {
    static register = () => new Promise((resolve, reject) => {
        DeviceStorage.get(NotificationKeys.notification)
            .then((value) => {
                if (value) {
                    resolve(value);
                } else {
                    PushNotification.configure({
                        onNotification: Notifications.NotificationHandler.handleNotification,
                        onRegister: function (token) {
                            console.log('onRegister', token);
                            if (token) {
                                var notificationDeviceInfo = {
                                    deviceType: Platform.OS === 'ios' ? 'iphone' : 'android',
                                    deviceId: token,
                                }
                                DeviceStorage.save(NotificationKeys.notification, notificationDeviceInfo)
                                    .then(() => {
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

    static deviceInfo = () => new Promise((resolve, reject) => {
        DeviceStorage.get(NotificationKeys.notification)
            .then((info) => {
                resolve(info);
            })
            .catch((error) => {
                reject(error);
            })
    });

    static configure = () => {
        console.log('Configuring notifications');
        PushNotification.configure({
            onNotification: Notifications.NotificationHandler.handleNotification,
        });
    }

    static sendLocalNotification(message, details = {}) {
        PushNotification.localNotification({
            message: message,
            userInfo: details
        });
    }
}
