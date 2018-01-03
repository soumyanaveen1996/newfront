import Auth from '../capability/Auth';
import DeviceStorage from '../capability/DeviceStorage';
import { NetworkHandler } from './index';
import config from '../../config/config';
import BackgroundTimer from 'react-native-background-timer';
import EventEmitter, { AuthEvents } from '../events';

const POLL_KEY = 'poll_key';

class NetworkPoller {
    start = async () => {
        await this.listenToEvents();
        this.startPolling();
    }

    listenToEvents = async () => {
        EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
    }

    userLoggedInHandler = async () => {
        console.log('Network Poller: User Logged in');
        this.startPolling()
    }

    userLoggedOutHandler = async () => {
        console.log('Network Poller: User Loggedout');
        this.stopPolling();
    }

    stopPolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            await DeviceStorage.delete(POLL_KEY);
        }
    }

    startPolling = async () => {
        const isUserLoggedIn = await Auth.isUserLoggedIn()
        if (isUserLoggedIn) {
            console.log('Network Poller: Starting Polling');
            await this.stopPolling();
            NetworkHandler.poll();
            const newIntervalId = BackgroundTimer.setInterval(() => {
                NetworkHandler.poll();
            }, config.network.pollingInterval)
            await DeviceStorage.save(POLL_KEY, newIntervalId);
        }
    }
}

export default new NetworkPoller();
