// A wrapper around network operations - Http 2 or 1, in the future could be QUIC etc
// Support simple operations like GET, POST, PUT and DELETE for now

import axios from 'axios';
import { Queue } from '../network';
import { NetInfo, Platform } from 'react-native';
import { Promise } from './index';
import SHA1 from 'crypto-js/sha1';
import moment from 'moment';
import _ from 'lodash';
import Auth from './Auth';
import RStore from '../../redux/store/configureStore';
import { setNetwork } from '../../redux/actions/UserActions';
import Bugsnag from '../../config/ErrorMonitoring';
import { NetworkHandler } from '../network';

import { NativeModules } from 'react-native';
import RemoteLogger from '../utils/remoteDebugger';
const { AgentGuardServiceClient } = NativeModules;

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

// function converOptionsToFetchRequest(options) {
//     const isGetRequest = _.lowerCase(options.method) === 'get';
//     return {
//         method: options.method || 'GET',
//         body: isGetRequest
//             ? undefined
//             : typeof options.data === 'string'
//                 ? options.data
//                 : JSON.stringify(options.data),
//         headers: _.merge(
//             { 'Content-Type': 'application/json' },
//             options.headers
//         ),
//         redirect: 'follow'
//     };
// }

/*
function Network(options, queue = false) {
    return new Promise((resolve, reject) => {
        Network.isConnected()
            .then((connected) => {
                if (connected) {
                    const requestOptions = converOptionsToFetchRequest(options);
                    fetch(options.url, requestOptions)
                        .then((response) => {
                            if (response.status === 200) {
                                response.json()
                                    .then((json) => {
                                        resolve({
                                            data: json,
                                            status: response.status,
                                            statusText: response.statusText,
                                        });
                                    })
                            } else {
                                reject(new NetworkError(response.status, response.statusText));
                            }
                        });
                    //return resolve(axios(options));
                } else {
                    if (queue) {
                        let key = SHA1(JSON.stringify(options.data)).toString();
                        return resolve(futureRequest(key, new NetworkRequest(options)));
                    } else {
                        reject(new NetworkError(99, 'No network connectivity'));
                    }
                }
            })
    });
} */

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

const getGrpcService = name => {
    switch (name) {
    case 'AgentGuardServiceClient':
        return AgentGuardServiceClient;

    default:
        return null;
    }
};

const convertResponse = response => {
    if (!response) {
        return {
            error: 0,
            data: {
                error: 0,
                content: []
            }
        };
    }
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

const queueMessage = ({ options, resolve, reject }) => {
    console.log(
        'Sourav Logging In Queue Message:::: Errro Sending the message, should we Quque it????'
    );
    NetworkHandler.readLambda(true);
    const { params, key = null } = options;
    const deferredKey = key ? key : SHA1(JSON.stringify(params)).toString();
    return resolve(futureRequest(deferredKey, new NetworkRequest(options)));
};

function Network(options, queue = false) {
    // console.log('option in network ', options);

    return new Promise((resolve, reject) => {
        Network.isConnected().then(connected => {
            // connected = false;

            const {
                serviceName,
                action,
                sessionId,
                params,
                key = null
            } = options;
            if (connected) {
                RStore.dispatch(setNetwork('full'));
                const grpcService = getGrpcService(serviceName);
                const timerId = setTimeout(
                    () =>
                        queueMessage({
                            options,
                            resolve,
                            reject
                        }),
                    20000
                );
                console.log('Sourav Logging:::: Sending a message');
                grpcService[action](sessionId, params, (error, result) => {
                    clearTimeout(timerId);
                    if (error) {
                        console.log(
                            'Sourav Logging:::: Errro Sending the message, should we Quque it????'
                        );
                        const deferredKey = key
                            ? key
                            : SHA1(JSON.stringify(params)).toString();

                        return resolve(
                            futureRequest(
                                deferredKey,
                                new NetworkRequest(options)
                            )
                        );

                        // reject(error);
                    }
                    console.log(
                        'Sourav Logging::::Agent guard response : ',
                        result
                    );
                    const response = convertResponse(result);
                    resolve(response);
                });
            } else {
                if (queue) {
                    const deferredKey = key
                        ? key
                        : SHA1(JSON.stringify(params)).toString();

                    return resolve(
                        futureRequest(deferredKey, new NetworkRequest(options))
                    );
                } else {
                    RStore.dispatch(setNetwork('none'));
                    reject(new Error('No network connectivity'));
                }
            }
        });
    });
}

Network.getNetworkInfo = () => NetInfo.getConnectionInfo();

Network.isWiFi = () =>
    new Promise((resolve, reject) => {
        NetInfo.getConnectionInfo().then(connectionInfo => {
            resolve(connectionInfo.type === 'wifi');
        });
    });

Network.isCellular = () =>
    new Promise((resolve, reject) => {
        NetInfo.getConnectionInfo().then(connectionInfo => {
            resolve(connectionInfo.type === 'cellular');
        });
    });

Network.addConnectionChangeEventListener = handleConnectionChange => {
    NetInfo.addEventListener('connectionChange', handleConnectionChange);
};

Network.removeConnectionChangeEventListener = handleConnectionChange => {
    NetInfo.removeEventListener('connectionChange', handleConnectionChange);
};

Network.isConnected = () => {
    return NetInfo.getConnectionInfo().then(reachability => {
        if (reachability.type === 'unknown' && Platform.OS === 'ios') {
            return new Promise(resolve => {
                const handleFirstConnectivityChangeIOS = isConnected => {
                    NetInfo.isConnected.removeEventListener(
                        'connectionChange',
                        handleFirstConnectivityChangeIOS
                    );
                    resolve(isConnected);
                };
                NetInfo.isConnected.addEventListener(
                    'connectionChange',
                    handleFirstConnectivityChangeIOS
                );
            });
        } else {
            return reachability.type !== 'none';
        }
    });
};

Network.forcePoll = () => {
    NetworkHandler.poll();
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
