import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import Conversation from '../../lib/conversation/Conversation';

debounce = () => new Promise(resolve => setTimeout(resolve, 2000));
export const synchronizeUserData = async () => {
    try {
        await Contact.refreshContacts();
        await debounce();
    } catch (error) {
        console.log('Cannot Load Contacts Data', error);
    }
    Conversation.downloadRemoteConversations();
    await debounce();
    RemoteBotInstall.syncronizeBots();
    await debounce();
    Channel.refreshChannels();
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
