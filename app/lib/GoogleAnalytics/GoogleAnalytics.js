import { Analytics, Hits as GAHits } from 'react-native-google-analytics';
import DeviceInfo from 'react-native-device-info';
import EventEmitter from '../events';
import { SatelliteConnectionEvents } from '../events';
import config from '../../config/config';

export const GoogleAnalyticsCategories = {
    APP_LAUNCHED: 'App Launched',
    BOT_OPENED: 'Bot Opened'
};

export const GoogleAnalyticsEvents = {
    APP_OPENED:'App Opened'
};

export class GoogleAnalytics {

    init = async () => {
        let clientId = DeviceInfo.getUniqueID();
        this.ga = new Analytics(config.googleAnalytics.trackingId, clientId, 1, DeviceInfo.getUserAgent());
        this.connectedToSatellite = false;
        await this.listenToEvents();
    }

    listenToEvents = async () => {
        EventEmitter.addListener(SatelliteConnectionEvents.connectedToSatellite, this.satelliteConnectionHandler);
    }

    satelliteConnectionHandler = () => {
        this.connectedToSatellite = true;
    }

    logEvents = (category, action, label, value, experiment) => {
        try{
            if(!this.connectedToSatellite) {
                let gaEvent = new GAHits.Event(
                    category,
                    action,
                    label,
                    value,
                    experiment
                );
                this.ga.send(gaEvent);
            }
        } catch(err){
            console.log('Error while logging google analytics data ', err);
        }
    }
}