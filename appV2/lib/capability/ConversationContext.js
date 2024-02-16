import _ from 'lodash';
import DeviceStorage from './DeviceStorage';
import { UUID } from './Utils';
import { newBotConversationId } from '../utils';
import Constants from '../../config/constants';
import constants from '../../config/constants';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

/**
 * Format of a conversation context
 *   {
 *       conversationId: UUID(),
 *       creatorInstanceId: UUID(),
 *       participants: [user.userId, other_participant's_uuids],
 *       onChannels: [],
 *       closed: false
 *   };
 */
export default class ConversationContext {
    /**
     * Retruns a conversation context. A conversation context is of the format:
     */
    static getConversationContext = (botContext, user, channel = false) =>
        new Promise((resolve, reject) => {
            // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
            if (botContext.getConversationContext()) {
                return resolve(botContext.getConversationContext());
            }

            // Else get it from storage
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (context) {
                        botContext.setConversationContext(context);
                        return Promise.resolve(context);
                    }
                    console.log('Amal :: Creating new context');
                    return ConversationContext.createAndSaveNewConversationContext(
                        botContext,
                        user
                    );
                })
                .then(resolve)
                .catch((err) => {
                    reject(err);
                });
        });

    static fetchConversationContext = (botContext, user, channel = false) =>
        new Promise((resolve, reject) => {
            // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
            if (botContext.getConversationContext()) {
                return resolve(botContext.getConversationContext());
            }

            // Else get it from storage
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => resolve(context))
                .catch((err) => {
                    reject(err);
                });
        });

    static getIMConversationContext = (botContext, user, conversationId) =>
        new Promise((resolve, reject) => {
            // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
            if (botContext.getConversationContext()) {
                return resolve(botContext.getConversationContext());
            }

            // Else get it from storage
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (context) {
                        botContext.setConversationContext(context);
                        return resolve(context);
                    }
                    return resolve(
                        ConversationContext.createAndSaveNewConversationContext(
                            botContext,
                            user,
                            conversationId
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static fetchIMConversationContext = (botContext, user, conversationId) =>
        new Promise((resolve, reject) => {
            // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
            if (botContext.getConversationContext()) {
                return resolve(botContext.getConversationContext());
            }

            // Else get it from storage
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (context) {
                        botContext.setConversationContext(context);
                    }
                    return resolve(context);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static getChannelConversationContext = (botContext, user, channel) =>
        new Promise((resolve, reject) => {
            // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
            if (botContext.getConversationContext()) {
                return resolve(botContext.getConversationContext());
            }

            // Else get it from storage
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (context) {
                        botContext.setConversationContext(context);
                        return resolve(context);
                    }
                    return resolve(
                        ConversationContext.createAndSaveNewChannelConversationContext(
                            botContext,
                            user,
                            channel
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static saveConversationContext = (
        conversationContext,
        botContext,
        user,
        isChannel = false
    ) =>
        new Promise((resolve, reject) => {
            if (!isChannel && conversationContext.participants.length < 0) {
                reject(err);
            } else {
                console.log(ConversationContext._getStorageKey(botContext));
                DeviceStorage.save(
                    ConversationContext._getStorageKey(botContext),
                    conversationContext
                )
                    .then((ctx) => {
                        botContext.setConversationContext(ctx);
                        return resolve(ctx);
                    })
                    .catch((err) => {
                        console.log(
                            'Amal :: Error in saving conversation context'
                        );
                        reject(err);
                    });
            }
        });

    static createNewConversationContext = (
        botContext,
        user,
        conversationId = undefined
    ) =>
        new Promise((resolve, reject) => {
            if (user) {
                const context = {
                    conversationId:
                        conversationId ||
                        newBotConversationId(
                            user.userId,
                            botContext.getBotId()
                        ),
                    creatorInstanceId: user.userId,
                    creator: {
                        userName: user.info.userName,
                        uuid: user.userId
                    },
                    participantsInfo: [
                        { userName: user.info.userName, userId: user.userId }
                    ],
                    participants: [user.userId],
                    onChannels: [],
                    closed: false,
                    client: constants.SOURCE,
                    userDomain: botContext.userDomain,
                    brand: DeviceInfo.getBrand(),
                    model: DeviceInfo.getDeviceId(),
                    OSVersion: DeviceInfo.getSystemVersion(),
                    platform: Platform.OS
                };
                resolve(context);
            } else {
                const context = {
                    conversationId:
                        conversationId ||
                        newBotConversationId(undefined, botContext.getBotId()),
                    participantsInfo: [],
                    participants: [],
                    onChannels: [],
                    client: constants.SOURCE,
                    closed: false,
                    brand: DeviceInfo.getBrand(),
                    model: DeviceInfo.getDeviceId(),
                    OSVersion: DeviceInfo.getSystemVersion(),
                    platform: Platform.OS
                };
                resolve(context);
            }
        });

    static createNewChannelConversationContext = (
        botContext,
        currentUser,
        channel,
        conversationId = undefined
    ) =>
        new Promise((resolve, reject) => {
            if (currentUser && channel) {
                const context = {
                    conversationId: conversationId || UUID(),
                    creatorInstanceId: currentUser.userId,
                    onChannels: [
                        {
                            channelName: channel.channelName,
                            userDomain: channel.userDomain
                        }
                    ],
                    client: constants.SOURCE,
                    closed: false
                };
                resolve(context);
            } else {
                const context = {
                    conversationId: conversationId || UUID(),
                    participantsInfo: [],
                    participants: [],
                    onChannels: [],
                    client: constants.SOURCE,
                    closed: false
                };
                resolve(context);
            }
        });

    static createAndSaveNewConversationContext = (
        botContext,
        user,
        conversationId
    ) =>
        new Promise((resolve, reject) => {
            ConversationContext.createNewConversationContext(
                botContext,
                user,
                conversationId
            )
                .then((ctx) =>
                    ConversationContext.saveConversationContext(
                        ctx,
                        botContext,
                        user
                    )
                )
                .then((ctx) => resolve(ctx))
                .catch((err) => {
                    reject(err);
                });
        });

    static createAndSaveNewChannelConversationContext = (
        botContext,
        user,
        channel
    ) =>
        new Promise((resolve, reject) => {
            ConversationContext.createNewChannelConversationContext(
                botContext,
                user,
                channel
            )
                .then((ctx) =>
                    ConversationContext.saveConversationContext(
                        ctx,
                        botContext,
                        user,
                        true
                    )
                )
                .then((ctx) => resolve(ctx))
                .catch((err) => {
                    reject(err);
                });
        });

    static getPreviousConversationContexts = (botContext, user) =>
        new Promise((resolve, reject) => {
            // TODO: to implement
            resolve([]);
        });

    static activateConversationContext = (context, botContext, user) =>
        new Promise((resolve, reject) => {
            // TODO: to implement
            resolve(true);
        });

    static setInstanceId = (instanceId, botContext) =>
        new Promise((resolve, reject) => {
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (!context) {
                        return resolve();
                    }
                    context.instanceId = instanceId;
                    botContext.setConversationContext(context);
                    return resolve(
                        DeviceStorage.save(
                            ConversationContext._getStorageKey(botContext),
                            context
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static setConversationCreated = (botContext, created = true) =>
        new Promise((resolve, reject) => {
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (!context) {
                        return resolve();
                    }
                    context.created = created;
                    botContext.setConversationContext(context);
                    return resolve(
                        DeviceStorage.save(
                            ConversationContext._getStorageKey(botContext),
                            context
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static setParticipants = (participants, botContext) =>
        new Promise((resolve, reject) => {
            if (!participants || participants.length < 1) {
                resolve();
            }
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (!context) {
                        return resolve();
                    }
                    context.participants = participants;
                    botContext.setConversationContext(context);
                    return resolve(
                        DeviceStorage.save(
                            ConversationContext._getStorageKey(botContext),
                            context
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static addParticipants = (participants, botContext) =>
        new Promise((resolve, reject) => {
            if (!participants || participants.length < 1) {
                resolve();
            }
            console.log('Participants : ', participants);
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (!context) {
                        return resolve();
                    }
                    const allParticipants =
                        context.participants.concat(participants);
                    context.participants = allParticipants;
                    botContext.setConversationContext(context);
                    return resolve(
                        DeviceStorage.save(
                            ConversationContext._getStorageKey(botContext),
                            context
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static setConversational = (conversational, botContext) =>
        new Promise((resolve, reject) => {
            ConversationContext._getBotConversationContext(botContext)
                .then((context) => {
                    if (!context) {
                        return resolve();
                    }
                    context.conversational = conversational;
                    botContext.setConversationContext(context);
                    return resolve(
                        DeviceStorage.save(
                            ConversationContext._getStorageKey(botContext),
                            context
                        )
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static _getBotConversationContext = (botContext) =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(ConversationContext._getStorageKey(botContext))
                .then((context) => resolve(context))
                .catch((err) => {
                    reject(err);
                });
        });

    static getBotConversationContextForId = (conversationId) =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(
                ConversationContext._getStorageKeyForId(conversationId)
            )
                .then((context) => resolve(context))
                .catch((err) => {
                    reject(err);
                });
        });

    static _getStorageKey = function (botContext) {
        const key = botContext.getBotKey();
        return `conversation-${key}`;
    };

    static _getStorageKeyForId = function (id) {
        return `conversation-${id}`;
    };

    static getChatName = function (conversationContext, user) {
        if (!conversationContext) {
            return;
        }

        if (conversationContext.onChannels.length > 0) {
            return conversationContext.onChannels[0].channelName;
        }
        const otherParticipants = _.filter(
            conversationContext.participantsInfo,
            (p) => p.userId !== user.userId
        );
        const names = _.map(otherParticipants, 'userName');
        return names.join(',');
    };

    static deleteConversationContext = (conversationId) =>
        new Promise((resolve, reject) => {
            DeviceStorage.delete(
                ConversationContext._getStorageKeyForId(conversationId)
            )
                .then((ctx) => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });

    static getOtherUserId = function (conversationContext, user) {
        if (!conversationContext) {
            return;
        }
        const otherParticipants = _.filter(
            conversationContext.participantsInfo,
            (p) => p.userId !== user.userId
        );
        if (otherParticipants.length === 1) {
            return otherParticipants[0].userId;
        }
        return undefined;
    };

    static updateParticipants = function (conversationContext, participants) {
        const filteredParticipants = _.filter(
            participants,
            (participant) =>
                _.find(
                    conversationContext.participants,
                    (p) => p === participant.userId
                ) === undefined
        );
        conversationContext.participantsInfo =
            conversationContext.participantsInfo || [];
        conversationContext.participants =
            conversationContext.participants || [];
        conversationContext.participantsInfo =
            conversationContext.participantsInfo.concat(filteredParticipants);
        conversationContext.participants =
            conversationContext.participants.concat(
                _.map(filteredParticipants, 'userId')
            );
    };
}
