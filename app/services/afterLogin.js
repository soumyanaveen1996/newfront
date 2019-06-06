import { ContactsCache } from '../lib/ContactsCache';
import { MessageCounter } from '../lib/MessageCounter';
import { Auth, Notification } from '../lib/capability';

import { NetworkPoller } from '../lib/network';
import { TwilioVoIP } from '../lib/twilio';
import { Platform } from 'react-native';
import Mapbox from '@mapbox/react-native-mapbox-gl';
import Store from '../redux/store/configureStore';
import { setFirstLogin } from '../redux/actions/UserActions';

export default class AfterLogin {
    static executeAfterLogin = async () => {
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (isUserLoggedIn) {
            // Store.dispatch(setFirstLogin(true));
            Mapbox.setAccessToken(
                'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
            );
            ContactsCache.init();
            MessageCounter.init();
            NetworkPoller.start();
            this.configureNotifications();
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
        let conversation;
        if (!notification.foreground && notification.userInteraction) {
            Conversation.getConversation(notification.conversationId)
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
                            Actions.refresh({
                                key: Math.random(),
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
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
                            Actions.refresh({
                                key: Math.random(),
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
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
        // NetworkHandler.readLambda();
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };
}
