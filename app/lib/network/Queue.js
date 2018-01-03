/**
 * This will be a library that will allow adding items to the device queue.
 * The queue backs up messages to the device storage, so a few things to keep in mind:
 *  (1) The items stored in the Queue should be simple objects  / string - essentially all of them should work with JSON.stringify()
 *  (2) The queue is dumb (at the moment) - not priority based etc. Can change over time but the consumer of Queue should not change
 *  (3) The items to be stored are intended to be consumed by someone else - its not meant for permanent persistent storage (Use DeviceStorage for that)
 *  (4) This is not a generic Queue (to avoid bad practice) - explicit methods will be declared (Ex: queue network ops, etc)
 */

import { NetworkRequest, Promise } from '../capability';
import { NetworkDAO, STATUS_CONSTANTS } from '../persistence'
import AsyncResultEventEmitter from './AsyncResultEventEmitter';
import { NETWORK_EVENTS_CONSTANTS } from './index';

/**
 * Queue the network request, to be made at a later time by the network handler
 * @param  {key} string This is a simple key to store with the network request. A bot can use bot's name for example.
 * @param  {NetworkRequest} networkRequest The request to be made later
 * @return {Promise} empty promises is all this method makes - find a better partner :)
 */
const queueNetworkRequest = (key, networkRequest) => new Promise((resolve, reject) => {
    if (!key || !networkRequest) {
        throw new Error('A valid key and networkRequest are required to queue');
    }
    // We will only cache the options - getNetworkRequest()
    // First add it to the sql store to get an id
    // Use the botkey:id to store as key in async storage (better for json)
    return NetworkDAO.insertNetworkRequest(key, networkRequest.getNetworkRequestOptions())
        .then((id) => {
            resolve(networkRequest);
        })
        .catch(function(e) {
            reject(e);
        });
});

/**
 * Returns the next network request from the queue. Its a queue - so FIFO :).
 * The CATCH: getting an item out of the array of requests is an asyn operation and we have no "locks"
 * So IT IS POSSIBLE that when we are dequeuing there is a request made for queue and we might lose some ops.
 * If no requests are pending - returns null
 * @param  {key} string This is a simple key to store with the network request. A bot can use bot's name for example.
 * @return {Promise} that resolves to a NetworkRequest object and id of the request in the db
 */
const dequeueNetworkRequest = () => new Promise((resolve, reject) => {
    return NetworkDAO.selectFirstPendingNetworkRequest()
        .then((res) => {
            if (!res || !res.request) {
                return resolve(null);
            }
            const result = {
                id: res.id,
                key: res.key,
                request: new NetworkRequest(res.request)
            };
            return resolve(result);
        })
        .catch(function(e) {
            reject(e);
        });

});

const completeNetworkRequest = (id, key, result) => new Promise((resolve, reject) => {
    return NetworkDAO.updateNetworkRequestStatus(id, STATUS_CONSTANTS.complete, result)
        .then(() => {
            let obj = {
                id: id,
                key: key,
                result: result
            };
            // Notify any event listeners if subscribed
            AsyncResultEventEmitter.emit(NETWORK_EVENTS_CONSTANTS.result, obj);
            resolve(obj);
        })
        .catch(function(e) {
            reject(e);
        });

});

const completeAsyncQueueResponse = (key, result) => new Promise((resolve, reject) => {
    return NetworkDAO.insertNetworkRequest(key, 'queueResult', STATUS_CONSTANTS.complete, result)
        .then((id) => {
            let obj = {
                id: id,
                key: key,
                result: result
            };
            // Notify any event listeners if subscribed
            AsyncResultEventEmitter.emit(NETWORK_EVENTS_CONSTANTS.result, obj);
            resolve(obj);
        })
        .catch(function(e) {
            reject(e);
        });

});

const handleNetworkRequestFailure = (id, key) => new Promise((resolve, reject) => {
    // TODO: should we retry?
    return NetworkDAO.updateNetworkRequestStatus(id, STATUS_CONSTANTS.failure, '')
        .then(() => {
            // Notify any event listeners if subscribed?
            resolve({
                id: id,
                key: key
            });
        })
        .catch(function(e) {
            reject(e);
        });
});

const deleteNetworkRequest = (id) => new Promise((resolve, reject) => {
    return resolve(NetworkDAO.deleteNetworkRequest(id))
        .catch(function(e) {
            reject(e);
        });

});

const selectCompletedNetworkRequests = (key) => new Promise((resolve, reject) => {
    return resolve(NetworkDAO.selectCompletedNetworkRequests(key))
        .catch(function(e) {
            reject(e);
        });

});


export default {
    queueNetworkRequest: queueNetworkRequest,
    dequeueNetworkRequest: dequeueNetworkRequest,
    completeNetworkRequest: completeNetworkRequest,
    handleNetworkRequestFailure: handleNetworkRequestFailure,
    deleteNetworkRequest: deleteNetworkRequest,
    selectCompletedNetworkRequests: selectCompletedNetworkRequests,
    completeAsyncQueueResponse: completeAsyncQueueResponse
};
