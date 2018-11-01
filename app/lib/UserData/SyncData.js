import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';
import RemoteBotInstall from '../../lib/RemoteBotInstall';

debounce = () => new Promise(resolve => setTimeout(resolve, 3000));
export const synchronizeUserData = async () => {
    if (__DEV__) {
        const user = await Auth.getUser();
        console.tron('Current User is', user.info.emailAddress);
    }

    Contact.refreshContacts();
    await debounce();
    Channel.refreshChannels();
    await debounce();
    RemoteBotInstall.syncronizeBots();
};

export const clearDataOnLogout = () => {
    Contact.clearContacts();
    Channel.clearChannels();
};