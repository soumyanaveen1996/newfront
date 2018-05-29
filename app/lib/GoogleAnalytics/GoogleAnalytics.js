import { Analytics, Hits as GAHits } from 'react-native-google-analytics';
import DeviceInfo from 'react-native-device-info';
import EventEmitter from '../events';
import { SatelliteConnectionEvents } from '../events';
import constants from './constants';

class GoogleAnalytics {

    init = async () => {
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
                let clientId = DeviceInfo.getUniqueID();
                let ga = new Analytics(constants.GOOGLE_ANALYTICS_TRACKINGID, clientId, 1, DeviceInfo.getUserAgent());
                let gaEvent = new GAHits.Event(
                    category,
                    action,
                    label,
                    value,
                    experiment
                );
                ga.send(gaEvent);
            }
        } catch(err){
            console.log('Error while logging google analytics data ', err);
        }
    }
}

export default new GoogleAnalytics();