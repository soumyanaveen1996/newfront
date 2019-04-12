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
        await Contact.refreshContacts();
        setTimeout(() => {
            RemoteBotInstall.syncronizeBots();
        }, 500);
        setTimeout(() => {
            Conversation.downloadRemoteConversations();
        }, 1000);
        setTimeout(() => Channel.refreshChannels(), 1000);
        setTimeout(() => Channel.refreshUnsubscribedChannels(), 1200);
    } catch (error) {
        console.error('CRITICAL:::::Unable to refresh Contacts from Server');
        setTimeout(() => {
            RemoteBotInstall.syncronizeBots();
        }, 500);
        setTimeout(() => {
            Conversation.downloadRemoteConversations();
        }, 1000);
        setTimeout(() => Channel.refreshChannels(), 1000);
        setTimeout(() => Channel.refreshUnsubscribedChannels(), 1200);
    }
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
