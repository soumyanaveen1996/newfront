// A wrapper around network operations - Http 2 or 1, in the future could be QUIC etc
// Support simple operations like GET, POST, PUT and DELETE for now

import axios from 'axios';
import { Queue } from '../network';
import { NetInfo } from 'react-native';
import { Promise } from './index';
import SHA1 from 'crypto-js/sha1';
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
export class NetworkRequest {
    constructor(options) {
        if (!options) {
            throw new Error('Developer error - NetworkRequest requires a valid options object')
        }
        this.options = options;
    }

    getNetworkRequestOptions = () => {
        return this.options;
    }
}

function Network(options, queue = false) {
    return new Promise((resolve, reject) => {
        Network.isConnected()
            .then((connected) => {
                //connected = false;
                if (connected) {
                    //EventEmitter.emit(NetworkEvents.networkSatellite);
                    return resolve(axios(options));
                } else {
                    if (queue) {
                        let key = SHA1(JSON.stringify(options.data)).toString();
                        return resolve(futureRequest(key, new NetworkRequest(options)));
                    } else {
                        //EventEmitter.emit(NetworkEvents.networkOffline);
                        reject(new Error('No network connectivity'));
                    }
                }
            })
    });
}

Network.getNetworkInfo = () => NetInfo.getConnectionInfo()

Network.isWiFi = () => new Promise((resolve, reject) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
        resolve(connectionInfo.type === 'wifi');
    });
});

Network.isCellular = () => new Promise((resolve, reject) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
        resolve(connectionInfo.type === 'cellular');
    });
});

Network.addConnectionChangeEventListener = (handleConnectionChange) => {
    NetInfo.isConnected.addEventListener('connectionChange', handleConnectionChange);
}

Network.removeConnectionChangeEventListener = (handleConnectionChange) => {
    NetInfo.isConnected.removeEventListener('connectionChange', handleConnectionChange);
}

Network.isConnected = () => {
    return NetInfo.getConnectionInfo().then(reachability => {
        if (reachability.type === 'unknown') {
            return new Promise(resolve => {
                const handleFirstConnectivityChangeIOS = isConnected => {
                    NetInfo.isConnected.removeEventListener('connectionChange', handleFirstConnectivityChangeIOS);
                    resolve(isConnected);
                };
                NetInfo.isConnected.addEventListener('connectionChange', handleFirstConnectivityChangeIOS);
            });
        }
        return (reachability.type !== 'none' && reachability.type !== 'unknown')
    });
}

export default Network;

/**
 * Make a request in the future; The request will be queued for later.
 * @param  {key} string This is a simple key to store with the network request. A bot can use bot's name for example.
 * @param  {NetworkRequest} networkRequest The request to be made later
 * @return {Promise} that resolves to a request_id (that can potentially be stashed for future if needed)
 */
export function futureRequest(key, networkRequest) {
    if (!key || !networkRequest) {
        throw new Error('Developer error - A valid key and NetworkRequest object is required to for making future requests')
    }
    return Queue.queueNetworkRequest(key, networkRequest);
}
