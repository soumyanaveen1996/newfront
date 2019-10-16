import { NativeModules } from 'react-native';
import { Auth, DeviceStorage } from '../capability';

const UserServiceClient = NativeModules.UserServiceClient;

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
                const index = existingCalls.findIndex(call => {
                    return call.callTimestamp < startTime;
                });
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
            if (!existingCalls || existingCalls.length === 0) {
                const page = await this.getPaginatedCallHistory(Date.now());
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
            index = newCallHistory.findIndex(call => {
                return call.callTimestamp <= lastTime;
            });
            if (index >= 0) {
                return newCallHistory.slice(0, index);
            } else {
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
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    UserServiceClient.getCallHistory(
                        user.creds.sessionId,
                        (error, result) => {
                            if (error) {
                                return reject({
                                    type: 'error',
                                    error: error.code
                                });
                            } else {
                                if (result.data && result.data.content) {
                                    return result.data.content;
                                } else {
                                    return [];
                                }
                            }
                        }
                    );
                })
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Fetch Paginated Call History from backend (25 elements)
     * @param {number} startTime in EPOCH format
     * @return {Promise} {error, records, moreRecordsExist}
     */
    static getPaginatedCallHistory(startTime) {
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    UserServiceClient.getPaginatedCallHistory(
                        user.creds.sessionId,
                        { startTime: startTime },
                        (error, result) => {
                            if (error) {
                                return reject({
                                    type: 'error',
                                    error: error.code
                                });
                            } else {
                                if (result.data.error === 0) {
                                    resolve(result.data);
                                } else {
                                    reject(result.data.error);
                                }
                            }
                        }
                    );
                })
                .catch(reject);
        });
    }

    static getLocalCallHistory() {
        return new Promise((resolve, reject) => {
            DeviceStorage.get(CALLS_STORAGE_KEY)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    static saveCallHistory(callHistory) {
        return new Promise((resolve, reject) => {
            DeviceStorage.save(CALLS_STORAGE_KEY, callHistory)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
