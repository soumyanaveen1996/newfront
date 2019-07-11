import { Analytics, Hits as GAHits } from 'react-native-google-analytics';
import DeviceInfo from 'react-native-device-info';
import EventEmitter, { PollingStrategyEvents } from '../events';
import { SatelliteConnectionEvents } from '../events';
import config from '../../config/config';
import Settings, { PollingStrategyTypes } from '../capability/Settings';
import { Platform } from 'react-native';
import Store from '../../redux/store/configureStore';
import { NETWORK_STATE } from '../network';

export const GoogleAnalyticsCategories = {
    APP_LAUNCHED: 'App Launched',
    BOT_OPENED: 'Bot Opened'
};

export const GoogleAnalyticsEvents = {
    APP_OPENED: 'App Opened',
    VOIP_CALL: 'Voip Call',
    PSTN_CALL: 'PSTN Call',
    SATELLITE_CALL: 'Satellite Call',
    ADDED_CONTACT: 'Added a Contact',
    INVITE_CONTACT: 'Invited a Contact',
    OPENED_MARKETPLACE: 'Opened Marketplace',
    VISITED_BOT: 'Visited Bot Details Page',
    INSTALLED_BOT: 'Installed BOT',
    SEND_MESSAGE: 'Sent a Message'
};

export class GoogleAnalytics {
    init = async () => {
        let clientId = DeviceInfo.getUniqueID();
        this.ga = new Analytics(
            config.googleAnalytics.trackingId,
            clientId,
            1,
            DeviceInfo.getUserAgent()
        );
        this.disableGA = false;
        await this.listenToEvents();
    };

    listenToEvents = async () => {
        EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.pollingStrategyChanged
        );
    };

    satelliteConnectionHandler = () => {
        this.disableGA = true;
    };

    satelliteDisconnectHandler = () => {
        this.disableGA = false;
    };

    pollingStrategyChanged = async () => {
        const pollingStrategy = await Settings.getPollingStrategy();
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.disableGA = true;
        }
    };

    logEvents = (category, action, label, value, experiment) => {
        try {
            if (!this.disableGA) {
                let gaEvent = new GAHits.Event(
                    category,
                    action,
                    label,
                    value,
                    experiment
                );
                if (
                    !Platform.OS === 'android' ||
                    !Store.getState().user.network === NETWORK_STATE.none
                ) {
                    this.ga.send(gaEvent);
                }
            }
        } catch (err) {
            console.log('Error while logging google analytics data ', err);
        }
    };
}
