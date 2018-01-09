import PushNotification from 'react-native-push-notification';
import { Platform, PushNotificationIOS } from 'react-native';

export default class Notification {
    static configure() {
        PushNotification.configure({
            onNotification: function(notification) {
                console.log('Notification:', notification);
                /*
                Notification object contains the following info:
                {
                    alert: "My Notification Message",
                    badge: 0,
                    data: {},
                    finish: finish(res)
                    foreground: false
                    message: "My Notification Message"
                    sound: "default"
                    userInteraction: true
                }
                */


                // process the notification

                // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
                if (Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            }
        });
    }

    static sendLocalNotification(message, details = {}) {
        PushNotification.localNotification({
            message: message,
            userInfo: details
        });
    }
}
