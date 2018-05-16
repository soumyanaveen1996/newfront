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
import { MessageHandler } from '../../lib/message';
import PushNotification from 'react-native-push-notification';

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
            prosessNetworkQueue();
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
            prosessNetworkQueue();
            readRemoteLambdaQueue(refreshedUser);
        });
}

const handleLambdaResponse = (res, user) => {
    const _ = Utils.Lodash;

    let resData = res.data.queueMsgs || []

    if (resData.length > 0) {
        let messages = resData;

        // Note: This is done to account for the agentGuardQueue which is not FIFO but LIFO
        messages = messages.reverse();

        //    Sample message
        //     { 'createdBy': 'test2',
        //         'bot': 'IMBot',
        //         'requestUuid': '',
        //         'details': [
        //         {
        //             'options': [
        //                 'op1',
        //                 'op2'
        //             ]
        //         }
        //     ],
        //         'contentType': 2,
        //         'createdOn': 1502381820277,
        //         'conversation': 'uuid123'
        // //}

        //need to sequence messages for IM Bot - add it to a queue and flush it in series
        let imbotMessages = [];
        _.forEach(messages, function (message) {
            // TODO: Should we handle IMBot differently here?
            let bot = message.bot;
            // Name of the bot is the key, unless its IMBot (one to many relationship)
            if (bot === 'im-bot'|| bot === 'channels-bot') {
                // return IMBotMessageHandler.handle(message, user);
                imbotMessages.push(message);
            } else {
                return Queue.completeAsyncQueueResponse(bot, message);
            }
        });
        if (imbotMessages.length > 0) {
            return IMBotMessageHandler.handleMessageQueue(imbotMessages, user);
        }
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

const prosessNetworkQueueRequest = () => {
    let requestId = 0;
    let key = '';
    Queue.dequeueNetworkRequest()
        .then(function (res) {
            if (res === null) {
                // Nothing to do - no more pending requests in the queue
                return;
            }
            requestId = res.id;
            key = res.key;
            let request = res.request;
            return Network(request.getNetworkRequestOptions())
        })
        .then((res) => {
            if (!res) {
                return;
            }
            // Axios wraps the results in data
            let results = res.data;
            return Queue.completeNetworkRequest(requestId, key, results);
        })
        .catch((err) => {
            console.log('Error making the api ai call ', err);
            // TODO(amal): Do we have to reject request if it fails ?
            return Queue.handleNetworkRequestFailure(requestId, key);
        });
}

const prosessNetworkQueue = () => {
    console.log('NetworkHandler::prosessNetworkQueue::called at ', new Date());
    Network.isConnected()
        .then((connected) => {
            if (connected) {
                prosessNetworkQueueRequest();
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
            userId: user.userId,
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
            userId: user.userId,
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
