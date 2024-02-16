import EventEmitter, { CallsEvents } from '../events';
import { Contact, Channel, Network } from '../capability';
import RemoteBotInstall from '../RemoteBotInstall';
import Conversation from '../conversation/Conversation';
import Store from '../../redux/store/configureStore';
import Bot from '../bot/index';
import {
    completeContactsLoad,
    completeBotInstall,
    completeChannelInstall,
    completeConversationsLoad
} from '../../redux/actions/UserActions';
import Calls from '../calls';
import configToUse from '../../config/config';
import UserDomainsManager from '../UserDomainsManager/UserDomainsManager';

debounce = () => new Promise((resolve) => setTimeout(resolve, 2000));

export const synchronizePhoneBook = async () => {
    Contact.syncPhoneContacts();
};
export const synchronizeUserData = async () => {
    const connection = await Network.isConnected();
    if (!connection) {
        syncNoNetwork();
        return;
    }

    downloadChannels();
    return;
};

const downloadChannels = () => {
    console.log('Synchronizing.... refreshChannels');
    Channel.refreshChannels()
        .then(() => {
            console.log('Synchronizing.... refreshChannels done');
            console.log('Synchronizing.... refreshUnsubscribedChannels');
            Channel.refreshUnsubscribedChannels()
                .then(() => {
                    console.log(
                        'Synchronizing.... refreshUnsubscribedChannels dne'
                    );
                    Store.dispatch(completeChannelInstall(true));
                    downloadConversationsAndBots();
                })
                .catch(() => {
                    console.log(
                        'Synchronizing.... refreshUnsubscribedChannels error'
                    );
                    Store.dispatch(completeChannelInstall(true));
                    downloadConversationsAndBots();
                });
        })
        .catch(() => {
            console.log('Synchronizing.... refreshChannels error');
            Store.dispatch(completeChannelInstall(true));
            downloadConversationsAndBots();
        });
};

const downloadConversationsAndBots = () => {
    console.log('Synchronizing.... downloadRemoteConversations');
    Conversation.downloadRemoteConversations();
    console.log('--------------- adding new provider---------------');
    console.log(`-------- ${configToUse.defaultProvider}----------`);
    Bot.addNewProvider(configToUse.defaultProvider)
        .then(() => {
            console.log('Synchronizing.... syncronizeBots');
            RemoteBotInstall.syncronizeBots(true);
            UserDomainsManager.refresh();
        })
        .catch((error) => {
            console.log('Synchronizing.... syncronizeBots');
            RemoteBotInstall.syncronizeBots(true);
            UserDomainsManager.refresh();
            console.log('error.... Errror adding provider', error);
        });
};
export const syncNoNetwork = () => {
    Store.dispatch(completeContactsLoad(true));
    Store.dispatch(completeBotInstall(true));
    Store.dispatch(completeChannelInstall(true));
    Store.dispatch(completeConversationsLoad(true));
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};
