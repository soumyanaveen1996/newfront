import Auth from '../capability/Auth';
import DeviceStorage from '../capability/DeviceStorage';
import { NetworkHandler } from './index';
import config from '../../config/config';
import BackgroundTimer from 'react-native-background-timer';
import EventEmitter, { AuthEvents, PollingStrategyEvents } from '../events';
import { AppState } from 'react-native';
import Settings, { PollingStrategyTypes } from '../capability/Settings';


const POLL_KEY = 'poll_key';
const KEEPALIVE_KEY = 'keepalive_key';

class NetworkPoller {
    start = async () => {
        await this.listenToEvents();
        this.startPolling();
    }

    listenToEvents = async () => {
        EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
        EventEmitter.addListener(PollingStrategyEvents.changed, this.pollingStrategyChanged);
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange = async (nextAppState) => {
        if (nextAppState === 'active') {
            let user = await Auth.getUser();
            if (user.userUUID !== 'default_user_uuid') {
                console.log('Reading Lambda');
                NetworkHandler.readLambda();
            }
        }
    }

    userLoggedInHandler = async () => {
        console.log('Network Poller: User Logged in');
        this.startPolling()
    }

    userLoggedOutHandler = async () => {
        console.log('Network Poller: User Loggedout');
        this.stopPolling();
    }

    pollingStrategyChanged = async () => {
        this.startPolling();
    }

    startPolling = async () => {
        await this.stopPolling();
        const isUserLoggedIn = await Auth.isUserLoggedIn()
        if (isUserLoggedIn) {
            this.currentPollingStrategy = await Settings.getPollingStrategy();
            if (this.currentPollingStrategy === PollingStrategyTypes.gsm) {
                this.startGSMPolling();
            } else if (this.currentPollingStrategy === PollingStrategyTypes.satellite) {
                this.startSatellitePolling();
            }
        }
    }

    stopPolling = async () => {
        if (this.currentPollingStrategy === PollingStrategyTypes.gsm) {
            this.stopGSMPolling();
        } else if (this.currentPollingStrategy === PollingStrategyTypes.satellite) {
            this.stopSatellitePolling();
        }
    }

    stopGSMPolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            await DeviceStorage.delete(POLL_KEY);
        }
    }

    startGSMPolling = async () => {
        console.log('Network Poller: Starting GSM Polling');
        NetworkHandler.poll();
        const newIntervalId = BackgroundTimer.setInterval(() => {
            NetworkHandler.poll();
        }, config.network.gsm.pollingInterval)

        await DeviceStorage.save(POLL_KEY, newIntervalId);
    }

    stopSatellitePolling = async () => {
        const intervalId = await DeviceStorage.get(POLL_KEY);
        const keepAliveId = await DeviceStorage.get(KEEPALIVE_KEY);
        if (intervalId) {
            BackgroundTimer.clearInterval(intervalId);
            BackgroundTimer.clearInterval(keepAliveId);
            await DeviceStorage.delete(POLL_KEY);
            await DeviceStorage.delete(KEEPALIVE_KEY);
        }
    }

    startSatellitePolling = async () => {
        console.log('Network Poller: Starting Satellite Polling');
        NetworkHandler.poll();
        const newIntervalId = BackgroundTimer.setInterval(() => {
            NetworkHandler.poll();
        }, config.network.satellite.pollingInterval)

        const keepAliveId = BackgroundTimer.setInterval(() => {
            NetworkHandler.keepAlive();
        }, config.network.satellite.keepAliveInterval)
        await DeviceStorage.save(POLL_KEY, newIntervalId);
        await DeviceStorage.save(KEEPALIVE_KEY, keepAliveId);
    }
}

export default new NetworkPoller();
