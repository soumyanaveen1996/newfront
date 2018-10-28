/**
 * Should run as a 'timer' or something and call the handle method in some frequency
 */
import Queue from './Queue';
import { Network, Utils, Auth } from '../capability';
import config from '../../config/config';
import EventEmitter from '../events';
import { SatelliteConnectionEvents } from '../events';
import _ from 'lodash';
import Message from '../capability/Message';
import { MessageHandler, MessageQueue } from '../../lib/message';
import Store from '../../lib/Store';
import PushNotification from 'react-native-push-notification';

// TODO(amal): This is a hack to see only one call of the function is processing the enqueued future requests
let processingFutureRequest = false;
/**
 * Polls the local queue for pending network request and makes them.
 * TODO: Should there be retry here? How to validate there is data? etc - logic needs to be incoporated
 *  - Right now it is kinda dumb
 */
const poll = () => {
    Auth.getUser().then(authUser => {
        processNetworkQueue();
        readRemoteLambdaQueue(authUser);
    });
};

const readLambda = () => {
    Auth.getUser().then(authUser => {
        processNetworkQueue();
        readRemoteLambdaQueue(authUser);
    });
};

const handleLambdaResponse = (res, user) => {
    let resData = res.data.queueMsgs || [];

    if (resData.length > 0) {
        let messages = resData;
        messages = messages.reverse();
        _.forEach(messages, function(message) {
            MessageQueue.push(message);
        });
    }
};

const readRemoteLambdaQueue = user => {
    readQueue(user)
        .then(res => {
            PushNotification.setApplicationIconBadgeNumber(0);
            return handleLambdaResponse(res, user);
        })
        .catch(error => {
            console.log('Error in Reading Lambda queue', error);
        });
};

const processNetworkQueueRequest = () => {
    if (processingFutureRequest) {
        return;
    }
    processingFutureRequest = true;
    dequeueAndProcessQueueRequest();
};

const dequeueAndProcessQueueRequest = async () => {
    let requestId = null;
    let key = null;
    try {
        let res = await Queue.dequeueNetworkRequest();
        if (!res) {
            processingFutureRequest = false;
            return;
        }
        requestId = res.id;
        key = res.key;
        let request = res.request;
        const response = await Network(request.getNetworkRequestOptions());
        if (__DEV__) {
        }
        if (response && response.data) {
            let results = response.data;
            await Queue.completeNetworkRequest(requestId, key, results);
        }
        dequeueAndProcessQueueRequest();
    } catch (err) {
        console.log('Error making the api ai call ', err);
        // TODO(amal): Do we have to reject request if it fails ?
        if (requestId) {
            try {
                await Queue.handleNetworkRequestFailure(requestId, key);
            } catch (exception) {}

            dequeueAndProcessQueueRequest();
        } else {
            processingFutureRequest = false;
        }
    }
};

const processNetworkQueue = () => {
    Network.isConnected().then(connected => {
        if (connected) {
            processNetworkQueueRequest();
        }
    });
};

const readQueue = user =>
    new Promise((resolve, reject) => {
        const host = config.network.queueHost;

        let options = {
            method: 'post',
            url: getUrl(),
            headers: getHeaders(user)
        };

        function getUrl() {
            if (config.proxy.enabled) {
                return (
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.queuePath
                );
            } else {
                return (
                    config.network.queueProtocol +
                    host +
                    config.network.queuePath
                );
            }
        }

        function getHeaders() {
            if (config.proxy.enabled) {
                return {
                    sessionId: user.creds.sessionId
                };
            } else {
                return Utils.createAuthHeader(
                    host,
                    'get',
                    config.network.queuePath,
                    config.network.queueServiceApi,
                    null,
                    user
                );
            }
        }
        return Network(options)
            .then(res => {
                handleOnSatelliteResponse(res);
                resolve(res);
            })
            .catch(reject);
    });

const handleOnSatelliteResponse = res => {
    if (res.data.onSatellite) {
        EventEmitter.emit(SatelliteConnectionEvents.connectedToSatellite);
        Store.updateStore({ satelliteConnection: true });
    } else {
        EventEmitter.emit(SatelliteConnectionEvents.notConnectedToSatellite);
        Store.updateStore({ satelliteConnection: false });
    }
};

const requestMessagesBeforeDateFromLambda = (
    user,
    conversationId,
    botId,
    date
) =>
    new Promise((resolve, reject) => {
        let options = {
            method: 'post',
            url:
                config.proxy.protocol +
                config.proxy.host +
                config.proxy.queuePath,
            headers: {
                sessionId: user.creds.sessionId
            },
            data: {
                conversation: conversationId,
                botId: botId,
                timestamp: date
            }
        };
        console.log('Options : ', options);

        return resolve(Network(options));
    });

const handlePreviousMessages = (res, conversationId, botId, date, user) => {
    const prevMessagesData = res.data.previousMsgs;
    let messages = [];
    _.each(prevMessagesData, mData => {
        let message = Message.from(mData, user, conversationId);
        MessageHandler.persistOnDevice(conversationId, message);
        messages.push(message.toBotDisplay());
    });
    return messages.reverse();
};

const fetchMessagesBeforeDateFromLambda = (user, conversationId, botId, date) =>
    new Promise((resolve, reject) => {
        requestMessagesBeforeDateFromLambda(user, conversationId, botId, date)
            .then(res => {
                console.log('Messages before date : ', res, date);
                handleOnSatelliteResponse(res);
                handleLambdaResponse(res, user);
                let messages = handlePreviousMessages(
                    res,
                    conversationId,
                    botId,
                    date,
                    user
                );
                resolve(messages);
            })
            .catch(error => {
                console.log(
                    'Error in fetching old messages from lambda before date',
                    error
                );
            });
    });

const fetchOldMessagesBeforeDate = (conversationId, botId, date) =>
    new Promise((resolve, reject) => {
        Auth.getUser().then(authUser => {
            resolve(
                fetchMessagesBeforeDateFromLambda(
                    authUser,
                    conversationId,
                    botId,
                    date
                )
            );
        });
    });

const ping = user => {
    let options = {
        method: 'get',
        url: config.proxy.protocol + config.proxy.host + config.proxy.pingPath
    };
    return Network(options);
};

const keepAlive = () => {
    Auth.getUser().then(authUser => {
        ping();
    });
};

export default {
    poll: poll,
    readLambda: readLambda,
    readQueue: readQueue,
    keepAlive: keepAlive,
    fetchOldMessagesBeforeDate: fetchOldMessagesBeforeDate
};
