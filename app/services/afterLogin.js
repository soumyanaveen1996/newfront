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
            Conversation.getIMConversation(notification.conversationId)
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
                            Actions.replace(ROUTER_SCENE_KEYS.peopleChat, {
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                        Actions.peopleChat({
                            bot: imBot,
                            conversation: conversation
                            // onBack: this.props.onBack
                        });
                    } else {
                        if (
                            Actions.currentScene ===
                            ROUTER_SCENE_KEYS.channelChat
                        ) {
                            Actions.replace(ROUTER_SCENE_KEYS.channelChat, {
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                        Actions.channelChat({
                            bot: imBot,
                            conversation: conversation
                            // onBack: this.props.onBack
                        });
                    }
                });
        }
        NetworkHandler.readLambda();
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };
}
