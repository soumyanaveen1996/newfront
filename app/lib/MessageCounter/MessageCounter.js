import { DeviceStorage } from '../capability';
import _ from 'lodash';

const COUNTER_STORAGE_KEY = 'MessageCounter';

class MessageCounter {

    init = async () => {
        this.messageCounts = { };
        this.readCountsFromStorage();
    }

    getCounts = () => {
        return this.messageCounts;
    }

    addCount = (botKey, count) => {
        this.messageCounts[botKey] = (this.messageCounts[botKey] || 0) + count;
        console.log('Message Counts : ', this.messageCounts);
        this.saveCountsToStorage();
    }

    subtractCounts = (obj) => {
        _.forEach(_.keys(obj), (key) => {
            if (this.messageCounts[key] && this.messageCounts[key] >= obj[key]) {
                this.messageCounts[key] = this.messageCounts[key] - obj[key];
            }
        });
        this.saveCountsToStorage();
    }

    readCountsFromStorage = async () => {
        let counts = await DeviceStorage.get(COUNTER_STORAGE_KEY);
        _.forEach(_.keys(counts), (key) => {
            this.addCount(key, counts[key]);
        });
    }

    saveCountsToStorage = () => {
        DeviceStorage.update(COUNTER_STORAGE_KEY, this.getCounts());
    }
}

export default new MessageCounter();
