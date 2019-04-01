import Promise from './Promise';
import Auth from './Auth';

const R = require('ramda');

import { NativeModules } from 'react-native';
const AgentGuardServiceClient = NativeModules.AgentGuardServiceClient;

export class AgentGuardError extends Error {
    constructor(code, message) {
        super(code, message);
        this.code = code;
        this.message = message;
    }

    get code() {
        return this.code;
    }

    get message() {
        return this.message;
    }
}

/**
 * A simple AgentGuard wrapper
 */
export default class AgentGuard {
    static execute = params => {
        console.log('GRPC::::Agent Guard params : ', params);
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                if (user) {
                    AgentGuardServiceClient.execute(
                        user.creds.sessionId,
                        params,
                        (err, result) => {
                            if (err) {
                                reject(new Error('Unknown error'));
                            } else {
                                console.log(
                                    'GRPC::::Agent guard response : ',
                                    result
                                );
                                const response = convertResponse(result);
                                resolve(response);
                            }
                        }
                    );
                } else {
                    reject(new Error('No Logged in user'));
                }
            });
        });
    };
}

const convertResponse = response => {
    const content = R.pathOr([], ['data', 'content'], response);
    const objContent = content.map(str => JSON.parse(str));

    return {
        error: response.error,
        data: {
            error: response.error,
            content: objContent
        }
    };
};
