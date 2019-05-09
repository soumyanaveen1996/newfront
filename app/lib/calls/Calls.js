import React from 'react';
import { NativeModules } from 'react-native';
import { Auth } from '../capability';

const UserServiceClient = NativeModules.UserServiceClient;

export default class Calls {
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
                            console.log(
                                '>>>>>>>>>resolved',
                                result.data.content
                            ); //TODO: return content directly
                            resolve(result.data.content);
                        }
                    }
                );
            });
        });
    }
}
