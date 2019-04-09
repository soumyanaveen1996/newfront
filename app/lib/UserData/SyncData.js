import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import Conversation from '../../lib/conversation/Conversation';
import { InteractionManager } from 'react-native';

debounce = () => new Promise(resolve => setTimeout(resolve, 2000));
export const synchronizeUserData = async () => {
    try {
        setTimeout(() => {
            RemoteBotInstall.syncronizeBots();
        }, 200);
        setTimeout(() => {
            Conversation.downloadRemoteConversations();
        }, 500);
        setTimeout(() => Channel.refreshChannels(), 1000);
        setTimeout(() => Channel.refreshUnsubscribedChannels(), 1500);
        setTimeout(() => Contact.refreshContacts(), 800);
    } catch (error) {}
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
