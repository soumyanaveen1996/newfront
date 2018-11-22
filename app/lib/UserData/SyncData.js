import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import Conversation from '../../lib/conversation/Conversation';

debounce = () => new Promise(resolve => setTimeout(resolve, 3000));
export const synchronizeUserData = async () => {
    Contact.refreshContacts();
    await debounce();
    Channel.refreshChannels();
    await debounce();
    Channel.refreshUnsubscribedChannels();
    await debounce();
    RemoteBotInstall.syncronizeBots();
    await debounce();
    Conversation.downloadRemoteConversations();
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
