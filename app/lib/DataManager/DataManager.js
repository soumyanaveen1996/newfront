
import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';

class DataManager {
    init = async () => {
        this.contactsFetched = false;
        this.channelsFetched = false;
        await this.listenToEvents();
    }

    listenToEvents = async () => {
        EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
    }

    checkDataFetched = () => {
        console.log('Data fetched : ', this.channelsFetched, this.contactsFetched);
        if (this.channelsFetched && this.contactsFetched) {
            EventEmitter.emit(AuthEvents.userDataFetched);
        }
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
        Contact.refreshContacts()
            .then(() => {
                this.contactsFetched = true;
                this.checkDataFetched();
            })
            .catch(() => {
                this.contactsFetched = true;
                this.checkDataFetched();
            })
    }

    deleteContacts = () => {
        Contact.clearContacts();
    }

    refreshChannels = () => {
        Channel.refreshChannels()
            .then(() => {
                this.channelsFetched = true;
                this.checkDataFetched();
            })
            .catch(() => {
                this.channelsFetched = true;
                this.checkDataFetched();
            })
    }

    deleteChannels = () => {
        Channel.clearChannels();
    }
}

export default new DataManager();
