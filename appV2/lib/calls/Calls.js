import { Auth, DeviceStorage } from '../capability';
import config from '../../config/config';
import UserServices from '../../apiV2/UserServices';
import _ from 'lodash';
import Store from '../../redux/store/configureStore';

export const CallDirection = {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming'
};

export const CallType = {
    PSTN: 'PSTN',
    VOIP: 'VOIP',
    SAT: 'SAT'
};

export const CALLS_STORAGE_KEY = 'CALLS_STORAGE_KEY_CAPABILITY';

export default class Calls {
    static async fetchCallHistory(startTime) {
        try {
            const existingCalls = await this.getLocalCallHistory(
                CALLS_STORAGE_KEY
            );
            if (
                existingCalls &&
                existingCalls.length > 0 &&
                startTime >
                    existingCalls[existingCalls.length - 1].callTimestamp
            ) {
                const index = existingCalls.findIndex((call) => {
                    return call.callTimestamp < startTime;
                });
                console.log(
                    '>>>>> existingCalls-slice',
                    existingCalls,
                    index,
                    startTime
                );
                return existingCalls.slice(index);
            } else {
                const page = await this.getPaginatedCallHistory(startTime);
                const olderCalls = page.records;
                if (!page.moreRecordsExist) {
                    olderCalls.push({ lastCall: true, callTimestamp: 0 });
                }
                await this.saveCallHistory(existingCalls.concat(olderCalls));
                return olderCalls;
            }
        } catch (error) {}
    }

    static async updateCallHistory() {
        try {
            const existingCalls = await this.getLocalCallHistory(
                CALLS_STORAGE_KEY
            );
            console.log('>>>> existingCalls', existingCalls);
            if (!existingCalls || existingCalls.length === 0) {
                const page = await this.getPaginatedCallHistory(
                    Date.now(),
                    Store.getState().user.currentDomain
                );
                const callHistory = page.records;
                if (!page.moreRecordsExist && callHistory.length !== 0) {
                    callHistory.push({
                        lastCall: true,
                        callTimestamp: 0
                    });
                }
                const save = await this.saveCallHistory(callHistory);
                return callHistory;
            } else {
                newCalls = await this.fillCallHistoryHead(
                    Date.now(),
                    existingCalls[0].callTimestamp
                );
                await this.saveCallHistory(newCalls.concat(existingCalls));
                return newCalls;
            }
        } catch (error) {
            throw error;
        }
    }

    static async fillCallHistoryHead(startTime, lastTime) {
        try {
            let newCallHistory = [];
            let newCalls = [];
            do {
                const page = await this.getPaginatedCallHistory(startTime);
                newCalls = page.records;
                newCallHistory = newCallHistory.concat(newCalls);
                if (page.moreRecordsExist) {
                    startTime = newCalls[newCalls.length - 1].callTimestamp;
                }
            } while (
                newCalls.moreRecordsExist &&
                newCalls[newCalls.length - 1].callTimestamp > lastTime
            );
            index = newCallHistory.findIndex((call) => {
                return call.callTimestamp <= lastTime;
            });
            if (index >= 0) {
                console.log(
                    '>>>>> newCallHistory-slice',
                    newCallHistory,
                    index,
                    lastTime
                );
                return newCallHistory.slice(0, index);
            } else {
                console.log('>>>>> newCallHistory', newCallHistory, lastTime);
                return newCallHistory;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fetch limited Call History from backend
     */
    static getCallHistory() {
        const user = Auth.getUserData();
        if (user) {
            return UserSeices.getCallHistory()
                .then((result) => {
                    if (result && result.content) {
                        return result.content;
                    } else {
                        return [];
                    }
                })
                .catch((error) => {
                    if (error.code) {
                        throw {
                            type: 'error',
                            error: error.code
                        };
                    } else {
                        throw error;
                    }
                });
        } else {
            return undefined;
        }
    }

    /**
     * Fetch Paginated Call History from backend (25 elements)
     * @param {number} startTime in EPOCH format
     * @param userDomain
     * @return {Promise} {error, records, moreRecordsExist}
     */
    static getPaginatedCallHistory(startTime, userDomain) {
        console.log('>>>> getPaginatedCallHistory', startTime, userDomain);
        const user = Auth.getUserData();
        if (user) {
            return UserServices.getPaginatedCallHistory({
                startTime: startTime,
                userDomain: userDomain
            })
                .then((result) => {
                    if (result && result.error === 0) {
                        result.records = _.map(result.records, (record) =>
                            _.merge(record, {
                                callTimestamp: Number(record.callTimestamp)
                            })
                        );
                        return result;
                    } else {
                        throw result.error;
                    }
                })
                .catch((error) => {
                    if (error.code) {
                        throw {
                            type: 'error',
                            error: error.code
                        };
                    } else {
                        throw error;
                    }
                });
        } else {
            return { records: [], moreRecordsExist: false, error: 0 };
        }
    }

    static getLocalCallHistory() {
        return new Promise((resolve, reject) => {
            DeviceStorage.get(CALLS_STORAGE_KEY)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static saveCallHistory(callHistory) {
        return new Promise((resolve, reject) => {
            DeviceStorage.save(CALLS_STORAGE_KEY, callHistory)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
