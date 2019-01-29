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

function converOptionsToFetchRequest(options) {
    const isGetRequest = _.lowerCase(options.method) === 'get';
    return {
        method: options.method || 'GET',
        body: isGetRequest
            ? undefined
            : typeof options.data === 'string'
                ? options.data
                : JSON.stringify(options.data),
        headers: _.merge(
            { 'Content-Type': 'application/json' },
            options.headers
        ),
        redirect: 'follow'
    };
}

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
        if (!options) {
            throw new Error(
                'Developer error - NetworkRequest requires a valid options object'
            );
        }
        this.options = options;
    }

    getNetworkRequestOptions() {
        return this.options;
    }

    isNetworkRequest() {
        return true;
    }
}

function Network(options, queue = false) {
    // console.log('option in network ', options);

    return new Promise((resolve, reject) => {
        Network.isConnected().then(connected => {
            if (connected) {
                RStore.dispatch(setNetwork('full'));
                const requestOptions = converOptionsToFetchRequest(options);
                fetch(options.url, requestOptions)
                    .then(response => {
                        // console.log('Response raw : ', response);
                        if (response.status === 200) {
                            response.json().then(json => {
                                // console.log('get network json', json);
                                resolve({
                                    data: json,
                                    status: response.status,
                                    statusText: response.statusText
                                });
                            });
                        } else {
                            console.log(
                                '>>>>>>NETWORK ERROR CODE NE 200',
                                response
                            );
                            Auth.getUser().then(user => {
                                Bugsnag.setUser(user.info.userName);
                                Bugsnag.notify(
                                    new Error(JSON.stringify(response))
                                );
                            });
                            if (
                                response.status === 401 ||
                                response.status === 400
                            ) {
                                console.log('need to logout');
                                Auth.logout();
                                return resolve();
                            }
                            const loadError = response.statusText
                                ? new NetworkError(
                                    response.status,
                                    response.statusText
                                )
                                : new NetworkError(
                                    response.status,
                                    'Error Loading Data'
                                );
                            reject(loadError);
                        }
                    })
                    .catch(err => {
                        console.log('>>>>>>>>>>>>>Network in Catch', err);
                        Bugsnag.notify(err);
                        reject();
                    });
                /*
                    axios(options)
                        .then((data) => {
                            const now = moment().valueOf();
                            resolve(data);
                        })
                        .catch(reject); */
            } else {
                if (queue) {
                    let key = SHA1(JSON.stringify(options.data)).toString();
                    return resolve(
                        futureRequest(key, new NetworkRequest(options))
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

export default Network;

/**
 * Make a request in the future; The request will be queued for later.
 * @param  {key} string This is a simple key to store with the network request. A bot can use bot's name for example.
 * @param  {NetworkRequest} networkRequest The request to be made later
 * @return {Promise} that resolves to a request_id (that can potentially be stashed for future if needed)
 */
export function futureRequest(key, networkRequest) {
    if (!key || !networkRequest) {
        throw new Error(
            'Developer error - A valid key and NetworkRequest object is required to for making future requests'
        );
    }
    return Queue.queueNetworkRequest(key, networkRequest);
}
