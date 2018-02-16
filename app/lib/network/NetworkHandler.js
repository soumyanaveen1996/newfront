/**
 * Should run as a 'timer' or something and call the handle method in some frequency
 */
import Queue from './Queue';
import { Network, Utils, Auth } from '../capability';
import config from '../../config/config';
import IMBotMessageHandler from './IMBotMessageHandler';

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

const readRemoteLambdaQueue = (user) => {
    console.log('NetworkHandler::readRemoteLambdaQueue::called at ', new Date());
    readQueue(user)
        .then((res) => {
            const _ = Utils.Lodash;

            let resData = res ? res.data : [];

            if (_.head(resData).count > 0) {
                let messages = _.head(resData).data || [];

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
                    if (bot === 'im-bot') {
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
        })
        .catch((error) => {
            console.log('Error in Reading Lambda queue', error);
        })
}

const prosessNetworkQueue = () => {
    console.log('NetworkHandler::prosessNetworkQueue::called at ', new Date());
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
            return Queue.handleNetworkRequestFailure(requestId, key);
        });

}

const readQueue = (user) => {
    const host = config.network.queueHost;
    let options = {
        'method': 'get',
        'url': getUrl() + '?userUuid=' + user.userUUID,
        'headers': getHeaders(user)
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

    return Network(options);
};

export default {
    poll: poll,
    readLambda: readLambda
};
