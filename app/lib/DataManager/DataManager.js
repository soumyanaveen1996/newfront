import EventEmitter, { AuthEvents } from '../events';
import { Contact, Channel } from '../capability';
import { AppState } from 'react-native';
import Auth from '../capability/Auth';

class DataManager {
    init = async () => {
        this.contactsFetched = false;
        this.channelsFetched = false;
        this.userDataFetchedEventEmitted = false;
        await this.listenToEvents();
        this.listenToAppEvents();
    };

    listenToAppEvents = async () => {
        AppState.addEventListener('change', this.handleAppStateChange);
    };

    listenToEvents = async () => {
        EventEmitter.addListener(
            AuthEvents.userLoggedIn,
            this.userLoggedInHandler
        );
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
    };

    handleAppStateChange = async nextAppState => {
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (isUserLoggedIn) {
            if (nextAppState === 'active') {
                this.userLoggedInHandler();
            }
        }
    };

    checkDataFetched = () => {
        if (
            this.channelsFetched &&
            this.contactsFetched &&
            !this.userDataFetchedEventEmitted
        ) {
            EventEmitter.emit(AuthEvents.userDataFetched);
            this.userDataFetchedEventEmitted = true;
        }
    };

    userLoggedInHandler = async () => {
        console.log('DataManager : User Logged in');
        await this.refreshChannels();
        await this.refreshContacts();
    };

    userLoggedOutHandler = async () => {
        console.log('DataManager : User Loggedout');
        this.deleteContacts();
        this.deleteChannels();
        this.contactsFetched = false;
        this.channelsFetched = false;
    };

    refreshContacts = () => {
        Contact.refreshContacts()
            .then(() => {
                this.contactsFetched = true;
                this.checkDataFetched();
            })
            .catch(() => {
                this.contactsFetched = true;
                this.checkDataFetched();
            });
    };

    deleteContacts = () => {
        Contact.clearContacts();
    };

    refreshChannels = () => {
        Channel.refreshChannels()
            .then(() => {
                this.channelsFetched = true;
                this.checkDataFetched();
            })
            .catch(() => {
                this.channelsFetched = true;
                this.checkDataFetched();
            });
    };

    deleteChannels = () => {
        Channel.clearChannels();
    };
}

export default new DataManager();
