import { DeviceStorage } from '../capability';
import _ from 'lodash';

const COUNTER_STORAGE_KEY = 'MessageCounter';
const MESSAGE_QUOTA_KEY = 'message_quota';

class MessageCounter {

    init = async () => {
        this.messageCounts = { };
        this.quotas = { };
        this.readCountsFromStorage();
        this.readQuotaFromStorage();
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

    readQuotaFromStorage = async () => {
        this.quotas = await DeviceStorage.get(MESSAGE_QUOTA_KEY);
    }

    saveCountsToStorage = () => {
        DeviceStorage.update(COUNTER_STORAGE_KEY, this.getCounts());
    }

    setMessageQuota = (quotas, counts) => {
        this.quotas = quotas;
        this.subtractCounts(counts);
    }

    getUsedMessageQuota = () => {
        return this.getCounts();
    }

    getAvailableBotMessageQuota = (botId) => {
        return this.quotas[botId] - this.counts[botId];
    }
}

export default new MessageCounter();
