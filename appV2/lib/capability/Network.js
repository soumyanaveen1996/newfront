// A wrapper around network operations - Http 2 or 1, in the future could be QUIC etc
// Support simple operations like GET, POST, PUT and DELETE for now

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import SHA1 from 'crypto-js/sha1';
import _ from 'lodash';
import { Promise } from './index';
import { Queue, NETWORK_STATE, NetworkHandler } from '../network';
import AgentGuardService from '../../apiV2/AgentGuardService';
import UserServices from '../../apiV2/UserServices';
import Store from '../../redux/store/configureStore';

const R = require('ramda');
/**
 * Lets you generate an options object like axios's option object: https://github.com/mzabriskie/axios#request-config
 * This will be persisted in the queue for later calls.
 * Network request can be persisted in the device store (json)
 * TODO: write a better request generator with that schema instead of expecting bots to build it
 * @example usage:
 * let options = {
 *   "method": "post",
 *   "url": "https://api.api.ai/v1/query?v=20150910",
 *   "headers": {
 *     "authorization": "Bearer xxxxxyyyyy",
 *     "content-type": "application/json"
 *   },
 *   "data": {
 *     "query": 'msg',
 *     "sessionId": "instanceId",
 *     "lang": 'en'
 *   }
 * };
 * let nr = new NetworkRequest(options);
 * nr.getNetworkRequest(); // returns options object
 */

export class NetworkError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    get code() {
        return this.code;
    }

    get message() {
        return this.message;
    }

    get description() {
        return `${this.code} : ${this.message}`;
    }
}

export class NetworkRequest {
    constructor(options) {
        this.options = options;
    }

    getNetworkRequestOptions() {
        return this.options;
    }

    isNetworkRequest() {
        return true;
    }
}

const getService = (name) => {
    switch (name) {
        case 'AgentGuardServiceClient':
            return AgentGuardService;
        case 'UserServiceClient':
            return UserServices;

        default:
            return null;
    }
};

const convertResponse = (response) => {
    if (!response) {
        return {
            error: 0,
            data: {
                error: 0,
                content: []
            }
        };
    }
    // parsedGroupRemovedError added due to user removed from group error coming in content refer CORE-1989
    let parsedGroupRemovedError = false;
    if (response.content?.length) {
        const groupRemoveError = response.content[0];
        let errorIs = JSON.parse(groupRemoveError);
        if (errorIs?.error && errorIs.error === 'User not part of channel') {
            parsedGroupRemovedError = errorIs?.error;
        }
    }
    const content = R.pathOr([], ['data', 'content'], response);
    const objContent = content.map((str) => JSON.parse(str));

    return {
        error: response.error,
        data: {
            error: response.error,
            content: objContent
        },
        parsedGroupRemovedError: parsedGroupRemovedError
    };
};

// const queueMessage = ({ options, resolve, reject }) => {
//     NetworkHandler.readLambda(true); //TODO: why is this here?
//     const { params, key = null } = options;
//     const deferredKey = key || SHA1(JSON.stringify(params)).toString();
//     return resolve(futureRequest(deferredKey, new NetworkRequest(options)));
// };

function Network(options, queue = false) {
    return new Promise((resolve, reject) => {
        // connected = false;
        console.log(Store.getState().user);
        const { serviceName, action, params, key = null } = options;
        if (Store.getState().user.network === 'full') {
            try {
                const grpcService = getService(serviceName);
                return grpcService[action](params)
                    .then((result) => {
                        console.log('SOCKET agentguardf excute', result);
                        return resolve(convertResponse(result));
                    })
                    .catch((error) => {
                        if (error) {
                            if (queue) {
                                const deferredKey =
                                    key ||
                                    SHA1(JSON.stringify(params)).toString();
                                return resolve(
                                    futureRequest(
                                        deferredKey,
                                        new NetworkRequest(options)
                                    )
                                );
                            } else {
                                reject(error);
                            }
                        }
                    });
            } catch (error) {
                reject(new Error('No network connectivity'));
            }
        } else {
            if (queue) {
                const deferredKey =
                    key || SHA1(JSON.stringify(params)).toString();
                return resolve(
                    futureRequest(deferredKey, new NetworkRequest(options))
                );
            } else {
                reject(new Error('No network connectivity'));
            }
        }
    });
}

Network.getNetworkInfo = () => NetInfo.fetch();

Network.isWiFi = () =>
    new Promise((resolve, reject) => {
        NetInfo.fetch().then((connectionInfo) => {
            resolve(connectionInfo.type === 'wifi');
        });
    });

Network.isCellular = () =>
    new Promise((resolve, reject) => {
        NetInfo.fetch().then((connectionInfo) => {
            resolve(connectionInfo.type === 'cellular');
        });
    });

// Network.addConnectionChangeEventListener = (handleConnectionChange) =>
//     NetInfo.addEventListener(handleConnectionChange);

Network.isConnected = () =>
    NetInfo.fetch().then((reachability) => {
        if (reachability.type === 'unknown' && Platform.OS === 'ios') {
            return new Promise((resolve) => {
                const handleFirstConnectivityChangeIOS = (isConnected) => {
                    NetInfo.isConnected.removeEventListener(
                        handleFirstConnectivityChangeIOS
                    );
                    resolve(isConnected);
                };
                NetInfo.isConnected.addEventListener(
                    handleFirstConnectivityChangeIOS
                );
            });
        }
        return reachability.isConnected;
    });

Network.isOnline = () => {
    return Store.getState().user.network === 'full';
};

Network.forcePoll = () => {
    // NetworkHandler.poll();
};

export default Network;

/**
 * Make a request in the future; The request will be queued for later.
 * @param  {key} string This is a simple key to store with the network request. A bot can use bot's name for example.
 * @param  {NetworkRequest} networkRequest The request to be made later
 * @return {Promise} that resolves to a request_id (that can potentially be stashed for future if needed)
 */
export function futureRequest(key, networkRequest) {
    return Queue.queueNetworkRequest(key, networkRequest);
}
