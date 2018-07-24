/**
 * Should run as a 'timer' or something and call the handle method in some frequency
 */
import Queue from './Queue';
import { Network, Utils, Auth } from '../capability';
import config from '../../config/config';
import IMBotMessageHandler from './IMBotMessageHandler';
import { MessageCounter } from '../MessageCounter';
import EventEmitter from '../events';
import { SatelliteConnectionEvents } from '../events';
import _ from 'lodash';
import Message from '../capability/Message';
import { MessageHandler, MessageQueue } from '../../lib/message';
import PushNotification from 'react-native-push-notification';

// TODO(amal): This is a hack to see only one call of the function is processing the enqueued future requests
let processingFutureRequest = false;
/**
 * Polls the local queue for pending network request and makes them.
 * TODO: Should there be retry here? How to validate there is data? etc - logic needs to be incoporated
 *  - Right now it is kinda dumb
 */
const poll = () => {
    console.log('NetworkHandler::poll::called at ', new Date());
    Auth.getUser()
        .then((authUser) => {
            return Auth.refresh(authUser);
        })
        .then((refreshedUser) => {
            processNetworkQueue();
            readRemoteLambdaQueue(refreshedUser);
        });
};

const readLambda = () => {
    console.log('NetworkHandler::readLambda::called at ', new Date());
    Auth.getUser()
        .then((authUser) => {
            return Auth.refresh(authUser);
        })
        .then((refreshedUser) => {
            processNetworkQueue();
            readRemoteLambdaQueue(refreshedUser);
        });
}

const handleLambdaResponse = (res, user) => {

    let resData = res.data.queueMsgs || []

    if (resData.length > 0) {
        let messages = resData;
        messages = messages.reverse();
        _.forEach(messages, function (message) {
            MessageQueue.push(message);
        });
    }
}

const readRemoteLambdaQueue = (user) => {
    console.log('NetworkHandler::readRemoteLambdaQueue::called at ', new Date());
    readQueue(user)
        .then((res) => {
            PushNotification.setApplicationIconBadgeNumber(0);
            return handleLambdaResponse(res, user);
        })
        .catch((error) => {
            console.log('Error in Reading Lambda queue', error);
        })
}

const processNetworkQueueRequest = () => {
    if (processingFutureRequest) {
        return;
    }
    processingFutureRequest = true;
    dequeueAndProcessQueueRequest();
}

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
            } catch (exception) { }

            dequeueAndProcessQueueRequest();
        } else {
            processingFutureRequest = false;
        }
    }
}

const processNetworkQueue = () => {
    console.log('NetworkHandler::processNetworkQueue::called at ', new Date());
    Network.isConnected()
        .then((connected) => {
            if (connected) {
                processNetworkQueueRequest();
            }
        })
}

const readQueue = (user) => new Promise((resolve, reject) => {
    const host = config.network.queueHost;
    let stats = MessageCounter.getCounts();

    let options = {
        'method': 'post',
        'url': getUrl(),
        'headers': getHeaders(user),
        'data': {
            stats: stats,
        }
    };

    function getUrl() {
        if (config.proxy.enabled) {
            return config.proxy.protocol + config.proxy.host + config.proxy.queuePath;
        } else {
            return config.network.queueProtocol + host + config.network.queuePath;
        }
    }

    function getHeaders() {
        if (config.proxy.enabled) {
            return {
                accessKeyId: user.aws.accessKeyId,
                secretAccessKey: user.aws.secretAccessKey,
                sessionToken: user.aws.sessionToken
            };
        } else {
            return Utils.createAuthHeader(host, 'get', config.network.queuePath, config.network.queueServiceApi, null, user);
        }
    }

    return Network(options)
        .then((res) => {
            MessageCounter.subtractCounts(stats);
            handleOnSatelliteResponse(res);
            resolve(res);
        })
        .catch(reject)
});

const handleOnSatelliteResponse = (res) => {
    if (res.data.onSatellite) {
        EventEmitter.emit(SatelliteConnectionEvents.connectedToSatellite);
    } else {
        EventEmitter.emit(SatelliteConnectionEvents.notConnectedToSatellite);
    }
}

const requestMessagesBeforeDateFromLambda = (user, conversationId, botId, date) => new Promise((resolve, reject) => {
    let options = {
        'method': 'post',
        'url': config.proxy.protocol + config.proxy.host + config.proxy.queuePath,
        'headers': {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken
        },
        'data': {
            conversation: conversationId,
            botId: botId,
            timestamp: date,
        }
    };
    console.log('Options : ', options);

    return resolve(Network(options));
});

const handlePreviousMessages = (res, conversationId, botId, date, user) => {
    const prevMessagesData = res.data.previousMsgs;
    let messages = [];
    _.each(prevMessagesData, (mData) => {
        let message = Message.from(mData, user);
        MessageHandler.persistOnDevice(conversationId, message);
        messages.push(message.toBotDisplay());
    })
    return messages.reverse();
};

const fetchMessagesBeforeDateFromLambda = (user, conversationId, botId, date) => new Promise((resolve, reject) => {
    console.log('NetworkHandler::readRemoteLambdaQueue::called at ', new Date());
    requestMessagesBeforeDateFromLambda(user, conversationId, botId, date)
        .then((res) => {
            console.log('Messages before date : ', res, date);
            handleOnSatelliteResponse(res);
            handleLambdaResponse(res, user)
            let messages = handlePreviousMessages(res, conversationId, botId, date, user);
            resolve(messages);
        })
        .catch((error) => {
            console.log('Error in fetching old messages from lambda before date', error);
        })
});

const fetchOldMessagesBeforeDate = (conversationId, botId, date) => new Promise((resolve, reject) => {
    console.log('NetworkHandler::readOldQueueMessages::called at ', new Date());
    Auth.getUser()
        .then((authUser) => {
            return Auth.refresh(authUser);
        })
        .then((refreshedUser) => {
            resolve(fetchMessagesBeforeDateFromLambda(refreshedUser, conversationId, botId, date));
        });
});

const ping = (user) => {
    console.log('NetworkHandler::ping::called at ', new Date());
    let options = {
        'method': 'get',
        'url': config.proxy.protocol + config.proxy.host + config.proxy.pingPath,
    };
    return Network(options);
};

const keepAlive = () => {
    Auth.getUser()
        .then((authUser) => {
            ping();
        });
};

export default {
    poll: poll,
    readLambda: readLambda,
    keepAlive: keepAlive,
    fetchOldMessagesBeforeDate: fetchOldMessagesBeforeDate
};
