import Promise from './Promise';
import Auth from './Auth';

const R = require('ramda');

import { Network } from '../capability';

import { NativeModules, Platform } from 'react-native';
import RemoteLogger from '../utils/remoteDebugger';
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
    static heartBeat = async () => {
        try {
            const user = await Auth.getUser();
            if (user) {
                const options = {
                    serviceName: 'AgentGuardServiceClient',
                    action: 'execute',
                    sessionId: user.creds.sessionId,
                    params: {
                        parameters: JSON.stringify({
                            test: 'test'
                        }),
                        capability: 'PingAgentGuardCapability',
                        sync: true
                    }
                };

                Network(options, false).then(response => {
                    console.log(
                        'Sourav Logging:::: Connected to AgentGuard',
                        response
                    );
                });
            }
        } catch (error) {
            console.log('Sourav Logging:::: Error Calling AG Heartbeat', error);
        }
    };

    static execute = async params => {
        try {
            const user = await Auth.getUser();

            const key = R.pathOr(null, ['conversation', 'bot'], params);

            if (user) {
                const options = {
                    serviceName: 'AgentGuardServiceClient',
                    action: 'execute',
                    sessionId: user.creds.sessionId,
                    params,
                    key
                };

                const response = await Network(options, true);
                RemoteLogger('Air PostCard:::: Response from Agent Guard');

                return response;
                // return convertResponse(response);
            }

            throw Error('No Logged in User');
        } catch (error) {
            throw Error('Error Calling Agent Guard', error.message);
        }

        // return new Promise((resolve, reject) => {
        //     Auth.getUser().then(user => {
        //         if (user) {
        //             AgentGuardServiceClient.execute(
        //                 user.creds.sessionId,
        //                 params,
        //                 (err, result) => {
        //                     if (err) {
        //                         reject(new Error('Unknown error'));
        //                     } else {
        //                         console.log(
        //                             'GRPC::::Agent guard response : ',
        //                             result
        //                         );
        //                         const response = convertResponse(result);
        //                         resolve(response);
        //                     }
        //                 }
        //             );
        //         } else {
        //             reject(new Error('No Logged in user'));
        //         }
        //     });
        // });
    };
}
