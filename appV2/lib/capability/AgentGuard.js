import Promise from './Promise';
import Auth from './Auth';

const R = require('ramda');

import { Network } from '../capability';

import { NativeModules, Platform } from 'react-native';
import RemoteLogger from '../utils/remoteDebugger';
import AgentGuardService from '../../apiV2/AgentGuardService';
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
            const user = Auth.getUserData();
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

                Network(options, false).then((response) => {
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

    static execute = async (params) => {
        try {
            const user = Auth.getUserData();
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
            }
        } catch (error) {
            throw Error('Error Calling Agent Guard', error.message);
        }
    };
}
