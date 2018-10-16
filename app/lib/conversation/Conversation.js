import { ConversationDAO } from '../persistence';
import sha1 from 'sha1';
import _ from 'lodash';
import { Network, Auth, ConversationContext } from '../capability';
import config from '../../config/config';
import Utils from '../../components/MainScreen/Utils';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import BotContext from '../botcontext/BotContext';
import SystemBot from '../bot/SystemBot';
export const IM_CHAT = 'imchat';
export const CHANNEL_CHAT = 'channels';

/**
 * Can be used for people chat - for person to person, peer to peer or channels
 */
export default class Conversation {
    static getIMConversationId = (firstUserId, secondUserId) => {
        let userIds = [firstUserId, secondUserId];
        const text = _.join(_.sortBy(userIds), '-');
        return sha1(text).substr(0, 22);
    };

    static getAllIMConversations = () =>
        new Promise((resolve, reject) => {
            return resolve(ConversationDAO.selectConversationsByType(IM_CHAT));
        });

    static getAllChannelConversations = () =>
        new Promise((resolve, reject) => {
            return resolve(
                ConversationDAO.selectConversationsByType(CHANNEL_CHAT)
            );
        });

    /**
     * Get remote conversations from the backend
     */
    static downloadRemoteConversations = () =>
        new Promise((resolve, reject) => {
            let user;
            //remote
            Auth.getUser()
                .then(usr => {
                    user = usr;
                    const options = {
                        method: 'GET',
                        url:
                            config.proxy.protocol +
                            config.proxy.host +
                            '/users/timeline',
                        headers: {
                            sessionId: user.creds.sessionId
                        }
                    };
                    return Network(options);
                })
                .then(async res => {
                    let manifestChan = await Promise.resolve(
                        SystemBot.get(SystemBot.channelsBotManifestName)
                    );
                    let manifest = await Promise.resolve(
                        SystemBot.get(SystemBot.channelsBotManifestName)
                    );
                    conversations = res.data.content;
                    let promise = _.map(conversations, conversation => {
                        if (conversation.bot === 'im-bot') {
                            let botContext;
                            Conversation.createChannelConversation(
                                conversation.conversationId
                            )
                                .then(() => {
                                    const botScreen = BackgroundTaskProcessor.generateScreen(
                                        conversation.bot,
                                        conversation.conversationId
                                    );
                                    botContext = new BotContext(
                                        botScreen,
                                        manifestChan
                                    );
                                    return ConversationContext.createNewChannelConversationContext(
                                        botContext,
                                        user,
                                        conversation.channel
                                    );
                                })
                                .then(newChanConvContext => {
                                    ConversationContext.updateParticipants(
                                        newChanConvContext,
                                        conversation.participants
                                    );
                                    return ConversationContext.saveConversationContext(
                                        newChanConvContext,
                                        botContext,
                                        user
                                    );
                                });
                        } else if (conversation.bot.botId === 'im-bot') {
                            let botContext;
                            const otherParticipant = {
                                userName: conversation.contact.userName,
                                userId: conversation.contact.userId
                            };
                            Conversation.createIMConversation(
                                conversation.conversationId
                            )
                                .then(() => {
                                    const botScreen = BackgroundTaskProcessor.generateScreen(
                                        conversation.bot.botId,
                                        conversation.conversationId
                                    );
                                    botContext = new BotContext(
                                        botScreen,
                                        manifest
                                    );
                                    return ConversationContext.createNewConversationContext(
                                        botContext,
                                        user,
                                        conversation.conversationId
                                    );
                                })
                                .then(newConvContext => {
                                    ConversationContext.updateParticipants(
                                        newConvContext,
                                        [otherParticipant]
                                    );
                                    return ConversationContext.saveConversationContext(
                                        newConvContext,
                                        botContext,
                                        user
                                    );
                                })
                                .then(() => {
                                    return ConversationContext.setParticipants(
                                        conversation.participants,
                                        botContext
                                    );
                                });
                        } else {
                            return null;
                        }
                    });
                    return Promise.all(promise);
                })
                .then(resolve);
        });

    /**
     * Get local conversations from the device database
     */
    static getLocalConversations = () =>
        new Promise((resolve, reject) => {
            return resolve(ConversationDAO.selectConversations());
        });

    /**
     * Get remote and local conversations
     */
    static getAllConversations = () =>
        new Promise((resolve, reject) => {
            Conversation.downloadRemoteConversations().then(() => {
                return resolve(Conversation.getLocalConversations());
            });
        });

    static createConversation = (conversationId, type) =>
        new Promise((resolve, reject) => {
            ConversationDAO.insertConversation(conversationId, type)
                .then(id => {
                    return resolve({
                        id: id,
                        conversationId: conversationId
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });

    static createIMConversation = conversationId =>
        Conversation.createConversation(conversationId, IM_CHAT);

    static createChannelConversation = conversationId =>
        Conversation.createConversation(conversationId, CHANNEL_CHAT);

    static removeConversation = (conversationId, type) =>
        new Promise((resolve, reject) => {
            ConversationDAO.deleteConversation(conversationId, type)
                .then(id => {
                    return resolve({
                        conversationId: conversationId
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });

    static deleteConversation = conversationId =>
        Conversation.removeConversation(conversationId, IM_CHAT);
    static deleteChannelConversation = conversationId =>
        Conversation.removeConversation(conversationId, CHANNEL_CHAT);

    static updateConversation = (oldConversationId, newConversationId) =>
        new Promise((resolve, reject) => {
            ConversationDAO.updateConversationId(
                oldConversationId,
                newConversationId
            )
                .then(id => {
                    return resolve({
                        oldConversationId: oldConversationId,
                        newConversationId: newConversationId
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });

    static getConversation = conversationId =>
        new Promise((resolve, reject) => {
            return resolve(ConversationDAO.selectConversation(conversationId));
        });

    static getIMConversation = conversationId =>
        new Promise((resolve, reject) => {
            return resolve(
                ConversationDAO.selectConversationByType(
                    conversationId,
                    IM_CHAT
                )
            );
        });

    static getChannelConversation = conversationId =>
        new Promise((resolve, reject) => {
            return resolve(
                ConversationDAO.selectConversationByType(
                    conversationId,
                    CHANNEL_CHAT
                )
            );
        });

    static isChannelConversation = conversation =>
        conversation.type === CHANNEL_CHAT;
}
