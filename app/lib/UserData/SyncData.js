import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import Conversation from '../../lib/conversation/Conversation';
import { InteractionManager } from 'react-native';

debounce = () => new Promise(resolve => setTimeout(resolve, 2000));
export const synchronizeUserData = async () => {
    // try {
    //     await Contact.refreshContacts();
    //     await debounce();
    // } catch (error) {
    //     console.log('Cannot Load Contacts Data', error);
    // }
    // Conversation.downloadRemoteConversations();
    // await debounce();
    // Channel.refreshChannels();
    // await debounce();
    // RemoteBotInstall.syncronizeBots();
    // await debounce();
    // Channel.refreshUnsubscribedChannels();

    InteractionManager.runAfterInteractions(async () => {
        try {
            await Contact.refreshContacts();
        } catch (error) {
            console.log('Cannot Load Contacts');
        }
        setTimeout(() => Conversation.downloadRemoteConversations(), 500);
        setTimeout(() => RemoteBotInstall.syncronizeBots(), 1000);
        setTimeout(() => Channel.refreshChannels(), 1500);
        setTimeout(() => Channel.refreshUnsubscribedChannels(), 2000);
    });
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
