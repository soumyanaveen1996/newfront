import React from 'react';
import { NativeModules } from 'react-native';
import { Auth, DeviceStorage } from '../capability';
import eventEmitter from '../events/EventEmitter';
import { CallsEvents } from '../events';

const UserServiceClient = NativeModules.UserServiceClient;

export default class Calls {
    static callDirection = {
        OUTGOING: 'outgoing',
        INCOMING: 'incoming'
    };

    static callType = {
        PSTN: 'PSTN',
        VOIP: 'VOIP'
    };
    static CALLS_STORAGE_KEY_CAPABILITY = 'CALLS_STORAGE_KEY_CAPABILITY';

    static getCallHistory() {
        return new Promise((resolve, reject) => {
            DeviceStorage.get(Calls.CALLS_STORAGE_KEY_CAPABILITY)
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
            DeviceStorage.save(Calls.CALLS_STORAGE_KEY_CAPABILITY, callHistory)
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
