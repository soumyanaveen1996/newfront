import DeviceStorage from './DeviceStorage';
import Utils from './Utils';
import _ from 'lodash';

/**
 * Format of a conversation context
 *   {
 *       conversationId: UUID(),
 *       creatorInstanceId: UUID(),
 *       participants: [user.userUUID, other_participant's_uuids],
 *       onChannels: [],
 *       closed: false
 *   };
 */
export default class ConversationContext {

    /**
     * Retruns a conversation context. A conversation context is of the format:
     */
    static getConversationContext = (botContext, user) => new Promise((resolve, reject) => {
        // Have we cached one in botContext? if so return it - for performance and repeat calls in bots:
        if (botContext.getConversationContext()) {
            return resolve(botContext.getConversationContext())
        }

        // Else get it from storage
        ConversationContext._getBotConversationContext(botContext)
            .then(function (context) {
                if (context) {
                    botContext.setConversationContext(context);
                    return resolve(context);
                }
                return resolve(ConversationContext.createAndSaveNewConversationContext(botContext, user))
            })
            .catch((err) => {
                reject(err);
            });
    });

    static saveConversationContext = (conversationContext, botContext, user)  => new Promise((resolve, reject) => {
        DeviceStorage.save(ConversationContext._getStorageKey(botContext), conversationContext)
            .then(function (ctx) {
                botContext.setConversationContext(ctx);
                return resolve(ctx);
            })
            .catch((err) => {
                reject(err);
            });
    });

    static createNewConversationContext = (botContext, user)  => new Promise((resolve, reject) => {
        const UUID = Utils.UUID;
        if (user) {
            const context = {
                conversationId: UUID(),
                creatorInstanceId: user.userUUID,
                creator: { name: user.info.screenName, uuid: user.userUUID },
                participantsInfo: [{ name: user.info.screenName, uuid: user.userUUID }],
                participants: [user.userUUID],
                onChannels: [],
                closed: false
            };
            resolve(context);
        } else {
            const context = {
                conversationId: UUID(),
                participantsInfo: [],
                participants: [],
                onChannels: [],
                closed: false
            };
            resolve(context);
        }
    });

    static createAndSaveNewConversationContext = (botContext, user)  => new Promise((resolve, reject) => {
        ConversationContext.createNewConversationContext(botContext, user)
            .then(function (ctx) {
                return ConversationContext.saveConversationContext(ctx, botContext, user);
            })
            .then(function (ctx) {
                return resolve(ctx);
            })
            .catch((err) => {
                reject(err);
            });
    });

    static getPreviousConversationContexts = (botContext, user) => new Promise((resolve, reject) => {
        // TODO: to implement
        resolve([]);
    });

    static activateConversationContext = (context, botContext, user) => new Promise((resolve, reject) => {
        // TODO: to implement
        resolve(true);
    });

    static setInstanceId = (instanceId, botContext) => new Promise((resolve, reject) => {
        ConversationContext._getBotConversationContext(botContext)
            .then(function (context) {
                if (!context) {
                    return resolve();
                }
                context.instanceId = instanceId;
                botContext.setConversationContext(context);
                return resolve(DeviceStorage.save(ConversationContext._getStorageKey(botContext), context));
            })
            .catch((err) => {
                reject(err);
            });
    });

    static setParticipants = (participants, botContext) => new Promise((resolve, reject) => {
        if (!participants || participants.length < 1) {
            resolve();
        }
        ConversationContext._getBotConversationContext(botContext)
            .then(function (context) {
                if (!context) {
                    return resolve();
                }
                context.participants = participants;
                botContext.setConversationContext(context);
                return resolve(DeviceStorage.save(ConversationContext._getStorageKey(botContext), context));
            })
            .catch((err) => {
                reject(err);
            });
    });

    static addParticipants = (participants, botContext) => new Promise((resolve, reject) => {
        if (!participants || participants.length < 1) {
            resolve();
        }
        ConversationContext._getBotConversationContext(botContext)
            .then(function (context) {
                if (!context) {
                    return resolve();
                }
                const allParticipants = context.participants.concat(participants);
                context.participants = allParticipants;
                botContext.setConversationContext(context);
                return resolve(DeviceStorage.save(ConversationContext._getStorageKey(botContext), context));
            })
            .catch((err) => {
                reject(err);
            });
    });

    static _getBotConversationContext = (botContext) => new Promise((resolve, reject) => {
        DeviceStorage.get(ConversationContext._getStorageKey(botContext))
            .then(function (context) {
                return resolve(context);
            })
            .catch((err) => {
                reject(err);
            });
    });

    static getBotConversationContextForId = (conversationId) => new Promise((resolve, reject) => {
        DeviceStorage.get(ConversationContext._getStorageKeyForId(conversationId))
            .then(function (context) {
                return resolve(context);
            })
            .catch((err) => {
                reject(err);
            });
    });

    static _getStorageKey = function (botContext) {
        return 'conversation-' + botContext.getBotKey();
    };

    static _getStorageKeyForId = function (id) {
        return 'conversation-' + id;
    };

    static getChatName = function (conversationContext, user) {
        const otherParticipants = _.filter(conversationContext.participantsInfo, (p) => {
            return p.uuid !== user.userUUID
        });
        const names = _.map(otherParticipants, 'name');
        return names.join(',');
    };

    static getOtherUserId = function(conversationContext, user) {
        const otherParticipants = _.filter(conversationContext.participantsInfo, (p) => {
            return p.uuid !== user.userUUID
        });
        if (otherParticipants.length === 1) {
            return otherParticipants[0].uuid;
        }
        return undefined;
    }

    static updateParticipants = function (conversationContext, participants) {
        let filteredParticipants = _.filter(participants, (participant) => {
            return _.find(conversationContext.participants, (p) => p === participant.uuid) === undefined;
        });
        conversationContext.participantsInfo = conversationContext.participantsInfo || [];
        conversationContext.participants = conversationContext.participants || [];
        conversationContext.participantsInfo = conversationContext.participantsInfo.concat(filteredParticipants);
        conversationContext.participants = conversationContext.participants.concat(_.map(filteredParticipants, 'uuid'));
    }
}
