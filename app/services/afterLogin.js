import { ContactsCache } from '../lib/ContactsCache';
import { MessageCounter } from '../lib/MessageCounter';
import { Auth, Notification } from '../lib/capability';

import { NetworkPoller } from '../lib/network';
import { TwilioVoIP } from '../lib/twilio';

export default class AfterLogin {
    static executeAfterLogin = async () => {
        const isUserLoggedIn = await Auth.isUserLoggedIn();

        if (isUserLoggedIn) {
            ContactsCache.init();
            MessageCounter.init();
            NetworkPoller.start();
            // this.configureNotifications();
            TwilioVoIP.init();
        }
    };

    configureNotifications = () => {
        Notification.deviceInfo()
            .then(info => {
                if (info) {
                    Notification.configure(this.handleNotification.bind(this));
                }
            })
            .catch(err => {
                console.log('error from after login ', err);
            });
    };

    handleNotification = notification => {
        if (!notification.foreground && notification.userInteraction) {
            Actions.replace(ROUTER_SCENE_KEYS.timeline);
        }
        NetworkHandler.readLambda();
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };
}
