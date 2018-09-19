import DeviceStorage from './DeviceStorage';
import { EventEmitter, PollingStrategyEvents } from '../events';

export const PollingStrategyTypes = {
    manual: 'manual',
    satellite: 'satellite',
    gsm: 'gsm',
    automatic: 'automatic'
};

const POLLING_STRATEGY_SETTING_KEY = 'polling_strategy';

export default class Settings {
    static setPollingStrategy = type =>
        new Promise((resolve, reject) => {
            DeviceStorage.save(POLLING_STRATEGY_SETTING_KEY, type)
                .then(() => {
                    EventEmitter.emit(PollingStrategyEvents.changed);
                    resolve();
                })
                .catch(reject);
        });

    static getPollingStrategy = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(POLLING_STRATEGY_SETTING_KEY)
                .then(val => {
                    resolve(val || PollingStrategyTypes.automatic);
                })
                .catch(reject);
        });
}
