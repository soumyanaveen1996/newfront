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
        console.log('Message counts : ', this.messageCounts);
    }

    readQuotaFromStorage = async () => {
        this.quotas = await DeviceStorage.get(MESSAGE_QUOTA_KEY);
        console.log('Message quota : ', this.messageCounts);
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
        if (!this.quotas[botId]) {
            return Number.MAX_SAFE_INTEGER || 100000000;
        } else {
            return this.quotas[botId] - (this.counts[botId] || 0);
        }
    }
}

export default new MessageCounter();
