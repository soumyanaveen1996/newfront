import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel, NetworkRequest } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import Conversation from '../../lib/conversation/Conversation';
import { InteractionManager } from 'react-native';
import { Network } from '../capability';
import Store from '../../redux/store/configureStore';
import {
    completeContactsLoad,
    completeBotInstall,
    completeChannelInstall,
    completeConversationsLoad
} from '../../redux/actions/UserActions';
import Calls from '../calls';

debounce = () => new Promise(resolve => setTimeout(resolve, 2000));
export const synchronizeUserData = async () => {
    try {
        let connection = await Network.isConnected();
        // connection = false;
        if (!connection) {
            console.log('Sourav Logging ::::::: NO CONNECTION');
            syncNoNetwork();
            return;
        }

        await Contact.refreshContacts();
        setTimeout(() => {
            RemoteBotInstall.syncronizeBots();
        }, 100);
        setTimeout(() => {
            Conversation.downloadRemoteConversations();
        }, 200);
        setTimeout(() => Channel.refreshChannels(), 300);
        setTimeout(() => Channel.refreshUnsubscribedChannels(), 400);
        setTimeout(() => Calls.fetchCallHistory(), 500);
        setTimeout(() => Contact.syncPhoneContacts());
    } catch (error) {
        console.error('CRITICAL:::::Errror Synching Contacts', error);
        syncNoNetwork();
        // setTimeout(() => {
        //     RemoteBotInstall.syncronizeBots();
        // }, 500);
        // setTimeout(() => {
        //     Conversation.downloadRemoteConversations();
        // }, 1000);
        // setTimeout(() => Channel.refreshChannels(), 1000);
        // setTimeout(() => Channel.refreshUnsubscribedChannels(), 1200);
    }
};

const syncNoNetwork = () => {
    Store.dispatch(completeContactsLoad(true));
    Store.dispatch(completeBotInstall(true));
    Store.dispatch(completeChannelInstall(true));
    Store.dispatch(completeConversationsLoad(true));
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
