import React from 'react';
import { NativeModules } from 'react-native';
import { Auth, DeviceStorage } from '../capability';
import eventEmitter from '../events/EventEmitter';
import { CallsEvents } from '../events';

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
    static getCallHistory() {
        return new Promise((resolve, reject) => {
            DeviceStorage.get(CALLS_STORAGE_KEY)
                .then(calls => {
                    callHistory = calls || [];
                    resolve(callHistory);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    //Fetch Call History from backend
    static fetchCallHistory() {
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
                                    return Calls.saveCallHistory(
                                        result.data.content
                                    );
                                } else {
                                    return Calls.saveCallHistory([]);
                                }
                            }
                        }
                    );
                })
                .then(resolve)
                .catch(reject);
        });
    }

    static saveCallHistory(callHistory) {
        return new Promise((resolve, reject) => {
            DeviceStorage.save(CALLS_STORAGE_KEY, callHistory)
                .then(() => {
                    eventEmitter.emit(CallsEvents.callHistoryUpdated);
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
