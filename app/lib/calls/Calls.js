import React from 'react';
import { NativeModules } from 'react-native';
import { Auth } from '../capability';

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

    static getCallHistory() {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
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
                                resolve(result.data.content);
                            } else {
                                resolve([]);
                            }
                        }
                    }
                );
            });
        });
    }
}
