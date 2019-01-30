import { ConversationDAO } from '../persistence';
import sha1 from 'sha1';
import _ from 'lodash';
import {
    Network,
    Auth,
    ConversationContext,
    DeviceStorage
} from '../capability';
import config from '../../config/config';
import Utils from '../../components/MainScreen/Utils';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import BotContext from '../botcontext/BotContext';
import SystemBot from '../bot/SystemBot';
import { completeConversationsLoad } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import Message from '../capability/Message';
export const IM_CHAT = 'imchat';
export const CHANNEL_CHAT = 'channels';
export const FAVOURITE_BOTS = 'favourite_bots';

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
                    Store.dispatch(completeConversationsLoad(false));
                    return Network(options);
                })
                .then(async res => {
                    let manifestChan = await Promise.resolve(
                        SystemBot.get(SystemBot.channelsBotManifestName)
                    );
                    let manifest = await Promise.resolve(
                        SystemBot.get(SystemBot.channelsBotManifestName)
                    );
                    // And the DS has changed :(
                    let conversations = res.data.content.conversations.map(
                        conv => ({
                            ...conv,
                            favorite: false
                        })
                    );
                    let favorites = res.data.content.favourites.map(conv => ({
                        ...conv,
                        favorite: true
                    }));

                    const allConversations = [...conversations, ...favorites];

                    // let conversations = res.data.content
                    const localConversations = await Conversation.getLocalConversations();
                    let promise = _.map(allConversations, conversation => {
                        if (conversation.bot === 'im-bot') {
                            let botContext;

                            const devConv = localConversations.filter(
                                lconversation =>
                                    lconversation.conversationId ==
                                    conversation.conversationId
                            );
                            if (devConv.length > 0) {
                                return null;
                            }
                            Conversation.createChannelConversation(
                                conversation.conversationId
                            )
                                .then(() =>
                                    ConversationDAO.updateConvFavorite(
                                        conversation.conversationId,
                                        conversation.favorite
                                    )
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
                                        conversation.channel.participants
                                    );
                                    return ConversationContext.saveConversationContext(
                                        newChanConvContext,
                                        botContext,
                                        user
                                    ).then(() => {
                                        // const message = Message.from(
                                        //     conversation.lastMessage,
                                        //     user,
                                        //     conversation.conversationId
                                        // )
                                        const {
                                            content,
                                            ...rest
                                        } = conversation.lastMessage;
                                        const message = {
                                            details: [{ message: content[0] }],
                                            ...rest
                                        };
                                        return BackgroundTaskProcessor.processLastMessageonLoad(
                                            message,
                                            conversation.bot,
                                            conversation.conversationId
                                        );
                                    });
                                });
                        } else if (conversation.bot.botId === 'im-bot') {
                            let botContext;
                            if (!conversation.contact) {
                                return null;
                            }
                            const otherParticipant = {
                                userName: conversation.contact.userName,
                                userId: conversation.contact.userId
                            };
                            const devConv = localConversations.filter(
                                lconversation =>
                                    lconversation.conversationId ==
                                    conversation.conversationId
                            );
                            if (devConv.length > 0) {
                                return null;
                            }
                            Conversation.createIMConversation(
                                conversation.conversationId
                            )
                                .then(() =>
                                    ConversationDAO.updateConvFavorite(
                                        conversation.conversationId,
                                        conversation.favorite
                                    )
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
                                })
                                .then(() => {
                                    // const message = Message.from(
                                    //     conversation.lastMessage,
                                    //     user,
                                    //     conversation.conversationId
                                    // )
                                    const {
                                        content,
                                        ...rest
                                    } = conversation.lastMessage;
                                    const message = {
                                        details: [{ message: content[0] }],
                                        ...rest
                                    };
                                    return BackgroundTaskProcessor.processLastMessageonLoad(
                                        message,
                                        conversation.bot.botId,
                                        conversation.conversationId
                                    );
                                });
                        } else {
                            return null;
                        }
                    });

                    return Promise.all(promise);
                })
                .then(() => {
                    Store.dispatch(completeConversationsLoad(true));
                    return resolve();
                });
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

    static setFavorite = data => {
        // Call API And set Favorite- TODO
        let favorite = false;
        if (data.action === 'add') {
            favorite = true;
        }

        let currentUserId;
        // console.log('data before sending ', data);

        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        // console.log('user details  ', user);

                        currentUserId = user.userId;
                        let options = {
                            method: 'POST',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }/users/favourites`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: {
                                ...data
                            }
                        };
                        return Network(options);
                    }
                })
                .then(async response => {
                    // console.log('response fav ', response);

                    let err = _.get(response, 'data.error');
                    if (err !== '0' && err !== 0) {
                        reject('Cannot Set Favorites');
                    } else {
                        let favoriteDb = 0;
                        if (favorite) {
                            favoriteDb = 1;
                        }

                        if (data.conversationId) {
                            return ConversationDAO.updateConvFavorite(
                                data.conversationId,
                                favoriteDb
                            );
                        }

                        if (data.botId) {
                            // console.log('favoriteDb ', favoriteDb);
                            let favArry = await DeviceStorage.get(
                                FAVOURITE_BOTS
                            );

                            if (favoriteDb === 1) {
                                if (favArry.indexOf(data.botId) === -1) {
                                    favArry.push(data.botId);
                                }
                            } else {
                                if (favArry.indexOf(data.botId) !== -1) {
                                    favArry.splice(
                                        favArry.indexOf(data.botId),
                                        1
                                    );
                                }
                            }

                            // console.log('new array to update ', favArry);
                            DeviceStorage.update(FAVOURITE_BOTS, favArry);

                            return resolve();
                        }

                        if (data.userId) {
                            const otherUserId = data.userId;
                            return Promise.resolve({
                                otherUserId,
                                currentUserId
                            });
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    };
}
