import Promise from './Promise';
import Auth from './Auth';

const R = require('ramda');

import { Network } from '../capability';

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
    static execute = async params => {
        try {
            console.log('Sourav Logging::::Agent Guard params : ', params);
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
