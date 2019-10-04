import { ConversationDAO } from '../persistence';
import sha1 from 'sha1';
import _ from 'lodash';
import {
    Network,
    Auth,
    ConversationContext,
    DeviceStorage,
    Channel
} from '../capability';
import config from '../../config/config';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import BotContext from '../botcontext/BotContext';
import SystemBot from '../bot/SystemBot';
import { completeConversationsLoad } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
export const IM_CHAT = 'imchat';
export const CHANNEL_CHAT = 'channels';
export const FAVOURITE_BOTS = 'favourite_bots';
import { NativeModules } from 'react-native';
const ConversationServiceClient = NativeModules.ConversationServiceClient;
const ContactsServiceClient = NativeModules.ContactsServiceClient;

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

    static grpcGetTimeline = user => {
        return new Promise((resolve, reject) => {
            ConversationServiceClient.getTimeline(
                user.creds.sessionId,
                (error, result) => {
                    console.log('GRPC:::grpcUpdateFavorites : ', error, result);
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };
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
                    Store.dispatch(completeConversationsLoad(false));
                    return Conversation.grpcGetTimeline(user);
                })
                .then(async res => {
                    console.log('GRPC:::Timeline : ', res);
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

                    const unfilteredConv = [...conversations, ...favorites];
                    const allConversations = unfilteredConv.filter(
                        conv => conv.bot.botId === 'im-bot'
                    );
                    // let conversations = res.data.content
                    const localConversations = await Conversation.getLocalConversations();

                    let promise = _.map(allConversations, conversation => {
                        if (
                            conversation.onChannels &&
                            conversation.onChannels.length > 0
                        ) {
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
                                        conversation.bot.botId,
                                        conversation.conversationId
                                    );
                                    botContext = new BotContext(
                                        botScreen,
                                        manifestChan
                                    );
                                    return ConversationContext.createNewChannelConversationContext(
                                        botContext,
                                        user,
                                        conversation.onChannels[0],
                                        conversation.conversationId
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
                                        user,
                                        true
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
                                })
                                .catch(() => {
                                    return null;
                                });
                        } else if (
                            conversation.contact &&
                            conversation.onChannels.length == 0
                        ) {
                            let botContext;
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
                            const botScreen = BackgroundTaskProcessor.generateScreen(
                                conversation.bot.botId,
                                conversation.conversationId
                            );
                            botContext = new BotContext(botScreen, manifest);
                            ConversationContext.createNewConversationContext(
                                botContext,
                                user,
                                conversation.conversationId
                            )
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
                                })
                                .then(() => {
                                    return Conversation.createIMConversation(
                                        conversation.conversationId
                                    );
                                })
                                .then(() => {
                                    return ConversationDAO.updateConvFavorite(
                                        conversation.conversationId,
                                        conversation.favorite
                                    );
                                })
                                .catch(() => {
                                    return null;
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
                })
                .catch(error => {
                    return reject(error);
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

    static grpcDeleteContacts = (user, userIds) => {
        // console.log('delete grpc contcat ', userIds);

        return new Promise((resolve, reject) => {
            ContactsServiceClient.remove(
                user.creds.sessionId,
                { userIds },
                (error, result) => {
                    console.log('GRPC:::delete contacts : ', error, result);
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };

    static grpcDeleteLocalContacts = (user, localContacts) => {
        // console.log('delete grpc contcat ', localContacts);

        return new Promise((resolve, reject) => {
            ContactsServiceClient.remove(
                user.creds.sessionId,
                { localContacts },
                (error, result) => {
                    console.log('GRPC:::delete contacts : ', error, result);
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };

    static deleteContacts = body => {
        // console.log('sending data for delete before', body);
        let currentUserId;
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        currentUserId = user.userId;
                        return Conversation.grpcDeleteContacts(
                            user,
                            body.users
                        );
                    }
                })
                .then(async response => {
                    console.log('response fav ', response);
                    const otherUserId = body.users[0];
                    return Promise.resolve({
                        otherUserId,
                        currentUserId
                    });
                })
                .then(resolve)
                .catch(reject);
        });
    };

    static deleteLocalContacts = body => {
        // console.log('sending data for local conatct delete before', body);

        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        return Conversation.grpcDeleteLocalContacts(
                            user,
                            body.localContacts
                        );
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    };

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

    static grpcUpdateFavorites = (user, params) => {
        return new Promise((resolve, reject) => {
            ConversationServiceClient.updateFavorites(
                user.creds.sessionId,
                params,
                (error, result) => {
                    console.log('GRPC:::grpcUpdateFavorites : ', error, result);
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };

    static setFavorite = data => {
        // Call API And set Favorite- TODO
        let favorite = false;
        let channelIsFavourite = 0;
        if (data.action === 'add') {
            favorite = true;
            channelIsFavourite = 1;
        }
        let jsonData;

        switch (data.type) {
        case 'conversation':
            jsonData = {
                conversationId: data.conversationId,
                action: data.action,
                userDomain: data.userDomain
            };
            break;
        case 'channel':
            jsonData = {
                channelName: data.channelName,
                action: data.action,
                userDomain: data.userDomain
            };
            break;
        case 'contacts':
            jsonData = {
                userId: data.userId,
                action: data.action,
                userDomain: data.userDomain
            };
            break;
        default:
            jsonData = {
                botId: data.botId,
                action: data.action,
                userDomain: data.userDomain
            };
            break;
        }

        let currentUserId;

        console.log('data before sending ', jsonData);

        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        console.log('GRPC::::update   ', jsonData);
                        currentUserId = user.userId;
                        return Conversation.grpcUpdateFavorites(user, jsonData);
                    }
                })
                .then(async response => {
                    console.log('response fav ', response);

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

                        if (data.channelName) {
                            if (data.channelConvId) {
                                console.log(
                                    'channel conversation id',
                                    data.channelConvId
                                );

                                Channel.changeIsFavourite(
                                    data.channelName,
                                    data.userDomain,
                                    channelIsFavourite
                                ).then(chanelData => {
                                    console.log(
                                        'favourite part data ',
                                        chanelData
                                    );

                                    return ConversationDAO.updateConvFavorite(
                                        data.channelConvId,
                                        favoriteDb
                                    );
                                });
                            } else {
                                Channel.changeIsFavourite(
                                    data.channelName,
                                    data.userDomain,
                                    channelIsFavourite
                                ).then(channelData => {
                                    return resolve(channelData);
                                });
                            }
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
