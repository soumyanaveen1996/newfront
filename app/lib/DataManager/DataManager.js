
import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';

class DataManager {
    init = async () => {
        await this.listenToEvents();
    }

    listenToEvents = async () => {
        EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
    }

    userLoggedInHandler = async () => {
        console.log('DataManager : User Logged in');
        this.refreshChannels();
        this.refreshContacts();
    }

    userLoggedOutHandler = async () => {
        console.log('DataManager : User Loggedout');
        this.deleteContacts();
        this.deleteChannels();
    }

    refreshContacts = () => {
        Contact.refreshContacts();
    }

    deleteContacts = () => {
        Contact.clearContacts();
    }

    refreshChannels = () => {
        Channel.refreshChannels();
    }

    deleteChannels = () => {
        Channel.clearChannels();
    }
}

export default new DataManager();
