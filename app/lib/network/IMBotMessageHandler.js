import Queue from './Queue';
import { Promise, Contact, Network, ConversationContext } from '../capability';
import { Conversation } from '../conversation';
import { BotContext } from '../botcontext';
import config from '../../config/config';
import SystemBot from '../../lib/bot/SystemBot';
import ChannelDAO from '../persistence/ChannelDAO';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import { ContactsCache } from '../ContactsCache';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';

/**
 * Guarantees ordering - first in first out
 * @param {object} message
 * @param {object} user
 */
const handleMessageQueue = (messageQ, user) => {
    messageQ = messageQ || [];
    if (messageQ.length < 1) {
        return;
    }
    // Promise in series from: http://www.datchley.name/promise-patterns-anti-patterns/
    // Execute a list of Promise return functions in series
    function eachSeries(arr, iteratorFn) {
        var index = 0;

        function next() {
            if (index < arr.length) {
                return iteratorFn(arr[index++], user).then(next);
            }
        }
        return Promise.resolve().then(next);
    }

    eachSeries(messageQ, handle);
};

const handleMessage = (message, user) => {
    return handle(message, user);
};

/**
 * Check if the message has to be handled - single message. Queue calls this
 * @param {object} message
 * @param {object} user
 */
const handle = (message, user) =>
    new Promise((resolve, reject) => {
        const botKey = message.conversation;

        // 1. First check if the conversation Exists - if it does, complete Queue call
        // 2. If the conversation doesn't exist then:
        //  - Get the participants and the creator of this message
        //  - Check whether the creator of the message is a contact for this user
        //  - If the creator is NOT a contact for this user - then ignore the message and return
        //  - If the creator is indeed a contact this means that this is the first time the user is getting pinged about this message.
        //  - then, create a new conversation context with the participants, along with the conversationId as the botkey
        //  - then complete Queue call
        Conversation.getConversation(botKey)
            .then(conversation => {
                console.log('Handing conversation : ', conversation);
                if (conversation) {
                    // Complete the queue call
                    if (Conversation.isChannelConversation(conversation)) {
                        return checkForContactAndCompleteQueueResponse(
                            botKey,
                            message
                        );
                    } else {
                        return processMessage(message, botKey);
                    }
                } else {
                    return handleNewConversation(message, user);
                }
            })
            .then(resolve)
            .catch(err => {
                console.log(
                    'Error in handling message for IMBot ',
                    err,
                    message
                );
                reject(err);
            });
    });

const checkForContactAndCompleteQueueResponse = (botKey, message) =>
    new Promise((resolve, reject) => {
        var fetchedContact = false;
        ChannelContactDAO.selectChannelContact(message.createdBy)
            .then(contact => {
                if (contact) {
                    return contact;
                } else {
                    return ContactsCache.fetchContactDetailsForUser(
                        message.createdBy
                    );
                }
            })
            .then(contact => {
                if (contact) {
                    fetchedContact = true;
                }
                return processMessage(message, botKey);
            })
            .then(resolve)
            .catch(() => {
                if (!fetchedContact) {
                    return processMessage(message, botKey).then(resolve);
                }
            });
    });

const handleNewIMConversation = (
    conversationData,
    message,
    user,
    botContext,
    creator
) =>
    new Promise((resolve, reject) => {
        let isUnignoredContact = false;
        const botKey = message.conversation;
        let participants = conversationData.participants;

        Contact.getContactFieldForUUIDs([message.createdBy])
            .then(contacts => {
                if (contacts && contacts.length > 0 && contacts[0].ignored) {
                    isUnignoredContact = false;
                } else {
                    isUnignoredContact = true;
                    return ConversationContext.createNewConversationContext(
                        botContext,
                        user,
                        message.conversation
                    );
                }
            })
            .then(conversationContext => {
                if (isUnignoredContact && conversationContext) {
                    conversationContext.conversationId = botKey;
                    ConversationContext.updateParticipants(
                        conversationContext,
                        participants
                    );
                    conversationContext.creatorInstanceId = creator.userId;
                    conversationContext.creator = creator;
                    return ConversationContext.saveConversationContext(
                        conversationContext,
                        botContext,
                        user
                    );
                }
            })
            .then(conversationContext => {
                if (isUnignoredContact && conversationContext) {
                    return Conversation.createIMConversation(botKey);
                }
            })
            .then(conv => {
                if (isUnignoredContact && conv) {
                    return processMessage(message, botKey);
                }
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.log(
                    'Error handling the message for IMBot message ',
                    err,
                    message
                );
                reject();
            });
    });

const handleNewChannelConversation = (
    conversationData,
    message,
    user,
    botContext,
    creator
) =>
    new Promise((resolve, reject) => {
        const botKey = message.conversation;
        let channel = conversationData.onChannels[0];

        ChannelDAO.insertIfNotPresent(
            channel.channelName,
            channel.description,
            channel.logo,
            channel.userDomain,
            channel.channelId
        )
            .then(() => {
                return ConversationContext.createNewChannelConversationContext(
                    botContext,
                    user,
                    channel
                );
            })
            .then(conversationContext => {
                conversationContext.conversationId = botKey;
                conversationContext.onChannels = conversationData.onChannels;
                conversationContext.creatorInstanceId = creator.userId;
                conversationContext.creator = creator;
                return ConversationContext.saveConversationContext(
                    conversationContext,
                    botContext,
                    user
                );
            })
            .then(() => {
                return Conversation.createChannelConversation(botKey);
            })
            .then(() => {
                return checkForContactAndCompleteQueueResponse(botKey, message);
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.log(
                    'Error handling the message for Channel message ',
                    err,
                    message
                );
                reject();
            });
    });

// 2. If the conversation doesn't exist then:
//  - Get the participants ( are array of {name, uuid} ) and the creator ({name, uuid}) of this message
//  - Check whether the creator of the message is a contact for this user
//  - If the creator is a ignored contact for this user - then ignore the message and return
//  - If the creator is not a contact in added contacts, this means that this is the first time the user is getting pinged about this message.
//  - then, create a new conversation context with the participants, along with the conversationId as the botkey
//  - then complete Queue call
const handleNewConversation = (message, user) =>
    new Promise((resolve, reject) => {
        const botKey = message.conversation;
        let fakeBotContext = getFakeBotKey(message.bot, botKey);
        let creator = null;

        getConversationData(botKey, message.createdBy, user)
            .then(conversationData => {
                if (conversationData && conversationData.data) {
                    const data = conversationData.data;
                    if (!data) {
                        return null;
                    }
                    creator = data.conversationOwner;
                    if (data.onChannels.length === 0) {
                        return handleNewIMConversation(
                            data,
                            message,
                            user,
                            fakeBotContext,
                            creator
                        );
                    } else {
                        return handleNewChannelConversation(
                            data,
                            message,
                            user,
                            fakeBotContext,
                            creator
                        );
                    }
                }
            })
            .then(resolve)
            .catch(err => {
                console.log('Error handling the new Message ', err, message);
            });
    });

const getConversationData = (conversationId, createdBy, user) => {
    let options = {
        method: 'get',
        url:
            getUrl() +
            '?conversationId=' +
            conversationId +
            '&botId=' +
            SystemBot.imBot.botId +
            '&createdBy=' +
            createdBy,
        headers: getHeaders(user)
    };

    function getUrl() {
        return (
            config.proxy.protocol +
            config.proxy.host +
            config.proxy.conversationPath
        );
    }

    function getHeaders() {
        return {
            sessionId: user.creds.sessionId
        };
    }
    return Network(options);
};

const getFakeBotKey = (botId, botKey) => {
    return new BotContext(
        {
            getBotKey: function() {
                return botKey;
            },
            getBotId: function() {
                return botId;
            }
        },
        {
            name: 'netWorkPoll'
        }
    );
};

const processMessage = async (message, botKey) => {
    return BackgroundTaskProcessor.sendBackgroundIMMessage(
        message,
        message.bot,
        botKey
    );
};

export default {
    handleMessageQueue: handleMessageQueue,
    handleMessage: handleMessage
};
