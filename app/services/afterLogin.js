import { ContactsCache } from '../lib/ContactsCache';
import { MessageCounter } from '../lib/MessageCounter';
import { Auth, Notification } from '../lib/capability';

import { NetworkPoller } from '../lib/network';
import { TwilioVoIP } from '../lib/twilio';
import EventEmitter, { AuthEvents, NotificationEvents } from '../lib/events';

export default class AfterLogin {
    static executeAfterLogin = async () => {
        const isUserLoggedIn = await Auth.isUserLoggedIn();

        if (isUserLoggedIn) {
            ContactsCache.init();
            await MessageCounter.init();
            await NetworkPoller.start();
            this.configureNotifications();
            await TwilioVoIP.init();
        }
    };

    configureNotifications = async () => {
        Notification.deviceInfo().then(info => {
            if (info) {
                Notification.configure(this.handleNotification.bind(this));
            }
        });
    };

    handleNotification = notification => {
        if (!notification.foreground && notification.userInteraction) {
            if (Actions.currentScene !== ROUTER_SCENE_KEYS.timeline) {
                Actions.popTo(ROUTER_SCENE_KEYS.timeline);
            }
        }
        NetworkHandler.readLambda();
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };
}
