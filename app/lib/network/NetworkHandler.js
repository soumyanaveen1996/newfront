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
import {} from '../../redux/actions/UserActions';

import RStore from '../../redux/store/configureStore';
import { setNetwork } from '../../redux/actions/UserActions';
import {
    NativeModules,
    NativeEventEmitter,
    Platform,
    InteractionManager
} from 'react-native';
import RemoteLogger from '../utils/remoteDebugger';
// TODO(amal): This is a hack to see only one call of the function is processing the enqueued future requests
let processingFutureRequest = false;

const QueueServiceClient = NativeModules.QueueServiceClient;
eventEmitter = new NativeEventEmitter(QueueServiceClient);
var messageSubscriptions = [];
var endSubscriptions = [];
var logoutSubscriptions = [];
/**
 * Polls the local queue for pending network request and makes them.
 * TODO: Should there be retry here? How to validate there is data? etc - logic needs to be incoporated
 *  - Right now it is kinda dumb
 */
const poll = () => {
    InteractionManager.runAfterInteractions(() => {
        Auth.getUser().then(authUser => {
            processNetworkQueue();
            readRemoteLambdaQueue(authUser);
        });
    });
};

const readLambda = (force = false) => {
    InteractionManager.runAfterInteractions(() => {
        Auth.getUser().then(authUser => {
            processNetworkQueue();
            readRemoteLambdaQueue(authUser, force);
        });
    });
};

const handleLambdaResponse = (res, user) => {
    let resData = res.data.queueMsgs || [];

    if (resData.length > 0) {
        let messages = resData;
        messages = messages.reverse();
        messages.forEach((message, index) => {
            setTimeout(() => {
                MessageQueue.push(message);
            }, index * 100);
        });
        // _.forEach(messages, function(message) {
        //     MessageQueue.push(message);
        // });
    }
};

let currentlyReading = false;

const readRemoteLambdaQueue = (user, force = false) => {
    // we will remove Subscription when the APp goes to background

    // console.log('Sourav Logging:::: currently Reading', currentlyReading);
    // if (currentlyReading === true) {
    //     return;
    // }
    currentlyReading = true;

    let logoutSubscribtion;
    messageSubscriptions.push(
        eventEmitter.addListener('message', message => {
            const rand = (Math.floor(Math.random() * 5) + 1) * 1000;
            setTimeout(() => {
                handleLambdaResponse(message, user);
            }, rand);
        })
    );

    endSubscriptions.push(
        eventEmitter.addListener('end', message => {
            const rand = (Math.floor(Math.random() * 5) + 2) * 1000;
            setTimeout(() => {
                cleanupSubscriptions();
            }, rand);
        })
    );

    logoutSubscriptions.push(
        eventEmitter.addListener('logout', message => {
            // subscription.remove();
            // endSubscribtion.remove();
            // logoutSubscribtion.remove();
            // currentlyReading = false;
            cleanupSubscriptions();
            Auth.logout();
        })
    );

    if (Platform.OS === 'android') {
        QueueServiceClient.getAllQueueMessages(user.creds.sessionId, force);
    } else {
        QueueServiceClient.getAllQueueMessages(user.creds.sessionId);
    }

    /*
    readQueue(user)
        .then(res => {
            PushNotification.setApplicationIconBadgeNumber(0);
            return handleLambdaResponse(res, user);
        })
        .catch(error => {
            console.log('Error in Reading Lambda queue', error);
        }); */
};

const cleanupSubscriptions = () => {
    for (let sub of messageSubscriptions) {
        sub.remove();
    }
    for (let sub of endSubscriptions) {
        sub.remove();
    }
    for (let sub of logoutSubscriptions) {
        sub.remove();
    }
    messageSubscriptions.splice(0, messageSubscriptions.length);
    endSubscriptions.splice(0, endSubscriptions.length);
    logoutSubscriptions.splice(0, logoutSubscriptions.length);
};

const processNetworkQueueRequest = () => {
    if (processingFutureRequest) {
        console.log('Sourav Logging:::: I am processing Future Request');
        return;
    }
    processingFutureRequest = true;
    dequeueAndProcessQueueRequest();
};

const debounce = () => {
    return new Promise((resolve, reject) => {
        setTimeout(
            () => resolve(),
            (Math.floor(Math.random() * 10) + 1) * 1000
        );
    });
};

console.log('Sourav Logging:::: Processing Network Request');

const dequeueAndProcessQueueRequest = async () => {
    // Add Delay
    await debounce();
    let requestId = null;
    let key = null;
    try {
        let res = await Queue.dequeueNetworkRequest();

        if (!res) {
            console.log('Sourav Logging:::: Nothing to PRocess now...');
            processingFutureRequest = false;
            return;
        }
        requestId = res.id;
        key = res.key;
        // let request = res.request;
        const options = res.request;
        console.log(
            'Sourav Logging:::: Processing Request',
            res.request.serviceName
        );

        const response = await Network(options);
        // const response = await Network(request.getNetworkRequestOptions();

        if (response && response.data) {
            let results = response.data;
            await Queue.completeNetworkRequest(requestId, key, results);
        }
        dequeueAndProcessQueueRequest();
    } catch (err) {
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
        // connected = false;
        if (connected) {
            processNetworkQueueRequest();
        }
    });
};

/*
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
    }); */

const handleOnSatelliteResponse = res => {
    if (res.data.onSatellite) {
        EventEmitter.emit(SatelliteConnectionEvents.connectedToSatellite);
        Store.updateStore({ satelliteConnection: true });
        RStore.dispatch(setNetwork('satellite'));
    } else {
        EventEmitter.emit(SatelliteConnectionEvents.notConnectedToSatellite);
        Store.updateStore({ satelliteConnection: false });
        RStore.dispatch(setNetwork('full'));
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
            method: 'GET',
            url:
                config.proxy.protocol +
                config.proxy.host +
                config.proxy.archivedMessages +
                '?conversationId=' +
                conversationId +
                '&botId=' +
                botId,
            headers: {
                sessionId: user.creds.sessionId
            },
            data: {
                conversationId: conversationId,
                botId: botId
            }
        };
        console.log('Options : ', options);

        return resolve(Network(options));
    });

const handlePreviousMessages = (res, conversationId, botId, date, user) => {
    const prevMessagesData = res.data.content;
    let messages = [];
    _.each(prevMessagesData, mData => {
        if (mData.contentType !== '470' && mData.contentType !== '460') {
            let message = Message.from(mData, user, conversationId);
            MessageHandler.persistOnDevice(conversationId, message);
            messages.push(message.toBotDisplay());
        }
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
    keepAlive: keepAlive,
    fetchOldMessagesBeforeDate: fetchOldMessagesBeforeDate
};
