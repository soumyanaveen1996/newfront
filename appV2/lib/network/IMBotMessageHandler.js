import { NativeModules, InteractionManager } from 'react-native';
import { Promise, Contact, ConversationContext, Channel } from '../capability';
import { Conversation } from '../conversation';
import { BotContext } from '../botcontext';
import SystemBot from '../bot/SystemBot';
import ChannelDAO from '../persistence/ChannelDAO';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import { ContactsCache } from '../ContactsCache';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import Bugsnag from '../../config/ErrorMonitoring';
import ConversationServices from '../../apiV2/ConversationServices';
import Store from '../../redux/store/configureStore';
import TimelineBuilder from '../TimelineBuilder/TimelineBuilder';

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
        let index = 0;

        function next() {
            if (index < arr.length) {
                return iteratorFn(arr[index++], user).then(next);
            }
        }
        return Promise.resolve().then(next);
    }

    eachSeries(messageQ, handle);
};

const handleMessage = (message, user) => handle(message, user);

/**
 * Check if the message has to be handled - single message. Queue calls this
 * @param {object} message
 * @param {object} user
 */
const handle = (message, user) =>
    new Promise((resolve, reject) => {
        const botKey = message.conversation;
        if (message.contentType === 1001) {
            try {
                const { userId } = message.details?.[0]?.message;
                Contact.getContactFieldForUUIDs([userId]).then((contact) => {
                    if (
                        contact.length === 0 ||
                        !contact[0].ignored ||
                        contact[0].showAcceptIgnoreMsg
                    ) {
                        Conversation.getConversation(botKey)
                            .then((conversation) => {
                                if (conversation) {
                                    setTimeout(() => {
                                        TimelineBuilder.buildTiimeline();
                                    }, 1000);
                                    // Complete the queue call
                                    if (
                                        Conversation.isChannelConversation(
                                            conversation
                                        )
                                    ) {
                                        return checkForContactAndCompleteQueueResponse(
                                            botKey,
                                            message
                                        );
                                    }
                                    return processMessage(message, botKey);
                                }
                                return handleNewConversation(message, user);
                            })
                            .then(resolve)
                            .catch((err) => {
                                console.log(
                                    '~~~******  Error in handling message for IMBot ',
                                    err,
                                    message
                                );
                                reject(err);
                            });
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                console.log('~~~****** ======== error: ', e);
                return processMessage(message, botKey);
            }
        } else {
            // 1. First check if the conversation Exists - if it does, complete Queue call
            // 2. If the conversation doesn't exist then:
            //  - Get the participants and the creator of this message
            //  - Check whether the creator of the message is a contact for this user
            //  - If the creator is NOT a contact for this user - then ignore the message and return
            //  - If the creator is indeed a contact this means that this is the first time the user is getting pinged about this message.
            //  - then, create a new conversation context with the participants, along with the conversationId as the botkey
            //  - then complete Queue call
            Conversation.getConversation(botKey)
                .then((conversation) => {
                    if (conversation) {
                        // Complete the queue call
                        setTimeout(() => {
                            TimelineBuilder.buildTiimeline();
                        }, 1000);

                        if (Conversation.isChannelConversation(conversation)) {
                            return checkForContactAndCompleteQueueResponse(
                                botKey,
                                message
                            );
                        }
                        return processMessage(message, botKey);
                    }
                    return handleNewConversation(message, user);
                })
                .then(resolve)
                .catch((err) => {
                    console.log(
                        'Error in handling message for IMBot ',
                        err,
                        message
                    );
                    reject(err);
                });
        }
    });

const checkForContactAndCompleteQueueResponse = (botKey, message) =>
    new Promise((resolve, reject) => {
        let fetchedContact = false;
        ChannelContactDAO.selectChannelContact(message.createdBy)
            .then((contact) => {
                if (contact) {
                    return contact;
                }
                return ContactsCache.fetchContactDetailsForUser(
                    message.createdBy
                );
            })
            .then((contact) => {
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

const handleNewIMConversation = async (
    conversationData,
    message,
    user,
    botContext,
    creator
) => {
    const belongs = await Conversation.asyncDoesConversationBelongToDomain(
        Conversation.constructTimelineConversation(conversationData, message),
        Store.getState().user.currentDomain
    );
    if (!belongs) {
        return Promise.reject(
            new Error(
                'This IM message does not belong to current selected Domain'
            )
        );
    }
    return new Promise((resolve, reject) => {
        let isUnignoredContact = false;
        const botKey = message.conversation;
        const { participants } = conversationData;

        return Contact.getContactFieldForUUIDs([message.createdBy])
            .then((contacts) => {
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
            .then((conversationContext) => {
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
            .then((conversationContext) => {
                if (isUnignoredContact && conversationContext) {
                    return Conversation.createIMConversation(botKey, -1);
                }
            })
            .then((conv) => {
                if (isUnignoredContact && conv) {
                    return processMessage(message, botKey);
                }
            })
            .then(() => {
                TimelineBuilder.buildTiimeline();
                resolve();
            })
            .catch((err) => {
                console.log(
                    'Error handling the message for IMBot message ',
                    err,
                    message
                );
                reject();
            });
    });
};

const handleNewChannelConversation = (
    conversationData,
    message,
    user,
    botContext,
    creator
) => {
    const channel = conversationData.onChannels[0];
    return Channel.getParticipants(channel.channelName, channel.userDomain)
        .then((response) => {
            if (response.isUserParticipant === true || response.isUserParticipant === undefined) {
                return handleNewChannelConversationForUser(conversationData, message, user, botContext, creator);
            }
        })
}

const handleNewChannelConversationForUser = (
    conversationData,
    message,
    user,
    botContext,
    creator
) => {
    const channel = conversationData.onChannels[0];
    const belongs = channel.userDomain === Store.getState().user.currentDomain;
    if (!belongs) {
        return Promise.reject(
            new Error(
                'This IM message does not belong to current selected Domain'
            )
        );
    }
    return new Promise((resolve, reject) => {
        const botKey = message.conversation;

        ChannelDAO.insertIfNotPresent(
            channel.channelName,
            channel.description,
            channel.logo,
            channel.userDomain,
            channel.channelId
        )
            .then(() =>
                ConversationContext.createNewChannelConversationContext(
                    botContext,
                    user,
                    channel
                )
            )
            .then((conversationContext) => {
                conversationContext.conversationId = botKey;
                conversationContext.onChannels = conversationData.onChannels;
                conversationContext.creatorInstanceId = creator.userId;
                conversationContext.creator = creator;
                return ConversationContext.saveConversationContext(
                    conversationContext,
                    botContext,
                    user,
                    true
                );
            })
            .then(() => Conversation.createChannelConversation(botKey, -1))
            .then(() =>
                checkForContactAndCompleteQueueResponse(botKey, message)
            )
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.log(
                    'Error handling the message for Channel message ',
                    err,
                    message
                );
                reject();
            });
    });
};

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
        const fakeBotContext = getFakeBotKey(message.bot, botKey);
        let creator = null;
        getConversationData(botKey, message.createdBy, user)
            .then((conversationData) => {
                if (conversationData?.error === 0) {
                    const data = conversationData;
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
                    }
                    if (creator != null) {
                        return handleNewChannelConversation(
                            data,
                            message,
                            user,
                            fakeBotContext,
                            creator
                        );
                    }
                    resolve();
                } else resolve();
            })
            .then(resolve)
            .catch((err) => {
                Bugsnag.notify(err, (report) => {
                    report.context =
                        'Error handling the new Message imbotmessageHandler.js';
                });
                console.log('Error handling the new Message ', err, message);
                resolve();
            });
    });

const grpcGetConversation = (conversationId, createdBy, user) =>
    ConversationServices.getConversationDetails({
        conversationId,
        createdBy,
        botId: SystemBot.imBot.botId
    });

const getConversationData = (conversationId, createdBy, user) =>
    grpcGetConversation(conversationId, createdBy, user);

const getFakeBotKey = (botId, botKey) =>
    new BotContext(
        {
            getBotKey() {
                return botKey;
            },
            getBotId() {
                return botId;
            }
        },
        {
            name: 'netWorkPoll'
        }
    );

const processMessage = async (message, botKey) =>
    BackgroundTaskProcessor.sendBackgroundIMMessage(
        message,
        message.bot,
        botKey
    );

export default {
    handleMessageQueue,
    handleMessage
};
