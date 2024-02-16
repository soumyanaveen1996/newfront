/**
 * Should run as a 'timer' or something and call the handle method in some frequency
 */
import _ from 'lodash';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import Queue from './Queue';
import { Network, Auth, Utils, Resource } from '../capability';
import config from '../../config/config';
import EventEmitter, {
    SatelliteConnectionEvents,
    MessageEvents
} from '../events';

import Message from '../capability/Message';
import { MessageHandler, MessageQueue } from '../message';
import { MessageDAO } from '../persistence';
import QueueService from '../../apiV2/QueueService';
import Store from '../../redux/store/configureStore';
// TODO(amal): This is a hack to see only one call of the function is processing the enqueued future requests
let processingFutureRequest = false;
let lastChekedDate = null;
let inProgress = false;
/**
 * Polls the local queue for pending network request and makes them.
 * TODO: Should there be retry here? How to validate there is data? etc - logic needs to be incoporated
 *  - Right now it is kinda dumb
 */
const poll = () => {
    const authUser = Auth.getUserData();
    processNetworkQueue();
    readRemoteLambdaQueue(authUser);
};

const readLambda = (force = false) => {
    const authUser = Auth.getUserData();
    processNetworkQueue();
    readRemoteLambdaQueue(authUser, force);
};

const handleLambdaResponse = (res, user) => {
    const resData = res.data.queueMsgs || [];
    if (resData.length > 0) {
        const messages = resData;
        messages.forEach((message, index) => {
            MessageQueue.push(message);
        });
    }
};

const readRemoteLambdaQueue = (user, force = false) => {
    if (user && user.creds) {
        if (inProgress) {
            return;
        }
        if (lastChekedDate) {
            fetchMessagesTillTheEnd(user.creds.sessionId, lastChekedDate - 10);
        } else {
            MessageDAO.lastMessageDate().then((result) => {
                if (result && result.length === 1) {
                    const time = result[0].message_date - 10;
                    fetchMessagesTillTheEnd(user.creds.sessionId, time);
                } else {
                    const current = new Date().getTime();
                    fetchMessagesTillTheEnd(user.creds.sessionId, current - 10);
                }
            });
        }
    }
};

/**
 * Clears the last checked date.
 */
const clearTime = () => {
    lastChekedDate = null;
};

const setCheckTime = (time) => {
    lastChekedDate = time;
};
const fetchMessagesTillTheEnd = (sessionId, startTime = null) => {
    inProgress = true;
    QueueService.getPaginatedQueueMessages(startTime)
        .then((result) => {
            const { queueMessages } = result;
            if (result) {
                const tempData = { data: { queueMsgs: queueMessages } };
                handleLambdaResponse(tempData);
            }
            if (queueMessages.length > 0) {
                const newTimestamp =
                    queueMessages[queueMessages.length - 1].createdOn;
                lastChekedDate = newTimestamp;
                fetchMessagesTillTheEnd(sessionId, newTimestamp + 1);
            } else if (queueMessages.length === 0) {
                inProgress = false;
            }
        })
        .catch((error) => {
            inProgress = false;
            return;
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
    const res = await Queue.dequeueNetworkRequest();
    try {
        if (!res) {
            processingFutureRequest = false;
            return;
        }
        requestId = res.id;
        key = res.key;
        const options = res.request;
        const parameters = JSON.parse(options.params.parameters);

        const item = parameters.messages[0];
        const fileDataString = await AsyncStorage.getItem(
            'file_' + item.messageId
        );

        if (fileDataString) {
            let fileData = null;
            try {
                fileData = JSON.parse(fileDataString);
            } catch (err) {}
            if (fileData) {
                await Resource.uploadFile(
                    fileData.newUri,
                    fileData.conversationId,
                    fileData.message,
                    fileData.ResourceTypes,
                    fileData.type
                );
                await AsyncStorage.removeItem('file_' + item.messageId);
            }
        }

        const response = await Network(options);

        if (response && response.data) {
            const results = response.data;
            await Queue.completeNetworkRequest(requestId, key, results);
            if (options.params.parameters) {
                parameters.messages.forEach(async (item) => {
                    const dbMessage = await MessageDAO.selectMessageById(
                        item.messageId
                    );
                    dbMessage.setStatus(1);
                    await MessageHandler.persistOnDevice(
                        options.params.conversation.conversationId,
                        dbMessage
                    );
                    EventEmitter.emit(MessageEvents.backgroundMessageSend, {
                        message: dbMessage,
                        conversationId:
                            options.params.conversation.conversationId
                    });
                });
            }
        }
        dequeueAndProcessQueueRequest();
    } catch (err) {
        console.log('dequeueNetworkRequest catch', err);
        if (requestId) {
            try {
                const options = res.request;
                if (options.params?.parameters) {
                    const parameters = JSON.parse(options.params.parameters);
                    parameters?.messages?.forEach(async (item) => {
                        const dbMessage = await MessageDAO.selectMessageById(
                            item.messageId
                        );
                        dbMessage.setStatus(-1);
                        await MessageHandler.persistOnDevice(
                            options.params.conversation.conversationId,
                            dbMessage
                        );
                        EventEmitter.emit(MessageEvents.backgroundMessageSend, {
                            message: dbMessage,
                            conversationId:
                                options.params.conversation.conversationId
                        });
                    });
                }
                await Queue.handleNetworkRequestFailure(requestId, key);
            } catch (exception) {
                console.log(
                    '**MSG Q** error Processing queue request handling failure',
                    JSON.stringify(exception)
                );
            }
            dequeueAndProcessQueueRequest();
        } else {
            processingFutureRequest = false;
        }
    }
};

const processNetworkQueue = () => {
    if (Network.isOnline()) {
        processNetworkQueueRequest();
    } else {
        EventEmitter.emit(SatelliteConnectionEvents.notConnectedToSatellite);
    }
};

const handleOnSatelliteResponse = (res) => {
    if (res.data.onSatellite) {
        EventEmitter.emit(SatelliteConnectionEvents.connectedToSatellite);
    } else {
        EventEmitter.emit(SatelliteConnectionEvents.notConnectedToSatellite);
    }
};

const requestMessagesBeforeDateFromLambda = (
    user,
    conversationId,
    botId,
    date
) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `${
                config.proxy.protocol +
                config.proxy.host +
                config.proxy.archivedMessages
            }?conversationId=${conversationId}&botId=${botId}`,
            headers: {
                sessionId: user.creds.sessionId
            },
            data: {
                conversationId,
                botId
            }
        };
        console.log('Options : ', options);

        return resolve(Network(options));
    });

const handlePreviousMessages = (res, conversationId, botId, date, user) => {
    const prevMessagesData = res.data.content;
    const messages = [];
    if (prevMessagesData && prevMessagesData.length > 0) {
        prevMessagesData.map((mData) => {
            if (
                mData &&
                mData.contentType &&
                mData.contentType !== '470' &&
                mData.contentType !== '250' &&
                mData.contentType !== '460' &&
                mData.contentType !== '550' &&
                mData.contentType !== '1000' &&
                mData.contentType !== '1001'
            ) {
                const message = Message.from(mData, user, conversationId);
                MessageHandler.persistOnDevice(conversationId, message);
                messages.push(message.toBotDisplay());
            }
        });
    }
    return messages;
};

const fetchMessagesBeforeDateFromLambda = (user, conversationId, botId, date) =>
    new Promise((resolve, reject) => {
        requestMessagesBeforeDateFromLambda(user, conversationId, botId, date)
            .then((res) => {
                console.log('Messages before date : ', res, date);
                handleOnSatelliteResponse(res);
                handleLambdaResponse(res, user);
                const messages = handlePreviousMessages(
                    res,
                    conversationId,
                    botId,
                    date,
                    user
                );
                resolve(messages);
            })
            .catch((error) => {
                console.log(
                    'Error in fetching old messages from lambda before date',
                    error
                );
            });
    });

const fetchOldMessagesBeforeDate = (conversationId, botId, date) =>
    new Promise((resolve, reject) => {
        const authUser = Auth.getUserData();
        resolve(
            fetchMessagesBeforeDateFromLambda(
                authUser,
                conversationId,
                botId,
                date
            )
        );
    });

const ping = (user) => {
    const options = {
        method: 'get',
        url: config.proxy.protocol + config.proxy.host + config.proxy.pingPath
    };
    return Network(options);
};

const keepAlive = () => {};

export default {
    poll,
    readLambda,
    keepAlive,
    fetchOldMessagesBeforeDate,
    clearTime,
    setCheckTime
};
