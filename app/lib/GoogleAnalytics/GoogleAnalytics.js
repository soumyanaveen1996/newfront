import { Analytics, Hits as GAHits } from 'react-native-google-analytics';
import DeviceInfo from 'react-native-device-info';
import EventEmitter, { PollingStrategyEvents } from '../events';
import { SatelliteConnectionEvents } from '../events';
import config from '../../config/config';
import Settings, { PollingStrategyTypes } from '../capability/Settings';
import { Platform } from 'react-native';
import Store from '../../redux/store/configureStore';
import { NETWORK_STATE } from '../network';

export const GoogleAnalyticsEventsCategories = {
    APP: 'App',
    CALL: 'Call',
    CHAT: 'Chat',
    CONTACTS: 'Contacts',
    STORE: 'Store'
};
export const GoogleAnalyticsEventsActions = {
    ADDED_CONTACTS: 'Added a Contacts',
    APP_LAUNCHED: 'App Launched',
    BOT_OPENED: 'Bot Chat Opened',
    PEOPLE_CHAT_OPENED: 'People Chat Opened',
    CHANNEL_CHAT_OPENED: 'Channel Chat Opened',
    INSTALLED_BOT: 'Installed BOT',
    UNINSTALLED_BOT: 'Uninstalled BOT',
    INVITE_CONTACT: 'Invited a Contact',
    OPENED_MARKETPLACE: 'Opened Marketplace',
    PSTN_CALL: 'PSTN Call',
    SATELLITE_CALL: 'Satellite Call',
    SEND_MESSAGE: 'Sent a Message',
    VISITED_BOT: 'Visited Bot Details Page',
    VOIP_CALL: 'Voip Call'
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
                if (Store.getState().user.network === NETWORK_STATE.full) {
                    this.ga.send(gaEvent);
                }
            }
        } catch (err) {
            console.log('Error while logging google analytics data ', err);
        }
    };
}
