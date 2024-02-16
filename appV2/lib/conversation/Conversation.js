import sha1 from 'sha1';
import _ from 'lodash';
import { ConversationDAO } from '../persistence';
import {
    Auth,
    ConversationContext,
    DeviceStorage,
    Channel,
    Contact
} from '../capability';
import BackgroundTaskProcessor from '../BackgroundTask/BackgroundTaskProcessor';
import BotContext from '../botcontext/BotContext';
import SystemBot from '../bot/SystemBot';
import { completeConversationsLoad } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';

import EventEmitter, { TimelineEvents } from '../events';
import ContactServices from '../../apiV2/ContactServices';
import ConversationServices from '../../apiV2/ConversationServices';
import { ContactType } from '../capability/Contact';

export const IM_CHAT = 'imchat';
export const CHANNEL_CHAT = 'channels';
export const FAVOURITE_BOTS = 'favourite_bots';

/**
 * Can be used for people chat - for person to person, peer to peer or channels
 */
export default class Conversation {
    static getIMConversationId = (firstUserId, secondUserId) => {
        const userIds = [firstUserId, secondUserId];
        const text = _.join(_.sortBy(userIds), '-');
        return sha1(text).substr(0, 22);
    };

    static getAllIMConversations = () =>
        new Promise((resolve, reject) =>
            resolve(ConversationDAO.selectConversationsByType(IM_CHAT))
        );

    static getAllChannelConversations = () =>
        new Promise((resolve, reject) =>
            resolve(ConversationDAO.selectConversationsByType(CHANNEL_CHAT))
        );

    static grpcGetTimeline = (user) => ConversationServices.getTimeline();

    static constructTimelineConversation = (conversatinData, message) => {
        return {
            bot: {
                botId: message.bot
            },
            onChannels: conversatinData.onChannels,
            participants: _.map(conversatinData.participants, (p) => p.userId),
            userDomain: conversatinData.userDomain
        };
    };

    static asyncDoesConversationBelongToDomain = async (
        conversation,
        domain
    ) => {
        let contacts = await Contact.getAddedContacts();
        if (
            Conversation.doesConversationBelongToDomain(
                conversation,
                domain,
                contacts
            )
        ) {
            return true;
        }
        contacts = await Contact.getFreshContacts();
        if (
            Conversation.doesConversationBelongToDomain(
                conversation,
                domain,
                contacts
            )
        ) {
            return true;
        }
        return false;
    };

    static doesConversationBelongToDomain = (
        conversation,
        domain,
        contacts
    ) => {
        if (conversation.bot.botId === 'im-bot') {
            if (_.isEmpty(conversation.onChannels)) {
                const remoteContacts = contacts.filter(
                    (contact) => contact.contactType !== ContactType.LOCAL
                );
                const uuids = _.filter(
                    conversation.participants,
                    (p) => p !== Store.getState().session.user.userId
                );
                console.log(
                    'Coversation UUIDS : ',
                    conversation.participants,
                    uuids,
                    Store.getState().session.user.userId
                );
                const filteredContacts = _.filter(
                    remoteContacts,
                    (contact) => uuids.indexOf(contact.userId) > -1
                );
                console.log(
                    'Coversation : ',
                    domain,
                    filteredContacts.length,
                    JSON.stringify(filteredContacts, null, 2)
                );
                return uuids.length === filteredContacts.length;
            } else {
                return conversation.onChannels[0].userDomain === domain;
            }
        } else {
            return conversation.userDomain === domain;
        }
    };
    /**
     * Get remote conversations from the backend
     */
    static downloadRemoteConversations = (emitEvent = true) => {
        return new Promise((resolve, reject) => {
            let user;
            // remote
            Auth.getUser()
                .then((usr) => {
                    user = usr;
                    Store.dispatch(completeConversationsLoad(false));
                    return Contact.refreshContacts(true);
                })
                .then(() => {
                    return Conversation.grpcGetTimeline(user);
                })
                .then(async (res) => {
                    const manifestChan = await SystemBot.get(
                        SystemBot.channelsBotManifestName
                    );
                    const manifest = await SystemBot.get(
                        SystemBot.channelsBotManifestName
                    );
                    const contacts = await Contact.getFreshContacts();

                    // And the DS has changed :(
                    console.log(
                        'Conversations : ',
                        res.content.conversations.length
                    );

                    const domainConversations = _.filter(
                        res.content.conversations,
                        (conversation) => {
                            return Conversation.doesConversationBelongToDomain(
                                conversation,
                                Store.getState().user.currentDomain,
                                contacts
                            );
                        }
                    );

                    const domainFavorites = _.filter(
                        res.content.favourites,
                        (conversation) => {
                            return Conversation.doesConversationBelongToDomain(
                                conversation,
                                Store.getState().user.currentDomain,
                                contacts
                            );
                        }
                    );
                    console.log(
                        'Favorites data : ',
                        JSON.stringify(res.content.favourites, null, 2)
                    );
                    console.log(
                        'Filtered Conversations : ',
                        domainConversations.length
                    );

                    const conversations = domainConversations.map((conv) => ({
                        ...conv,
                        favorite: false
                    }));
                    const favorites = domainFavorites.map((conv) => ({
                        ...conv,
                        favorite: true
                    }));

                    const unfilteredConv = [...conversations, ...favorites];
                    const allConversations = unfilteredConv.filter(
                        (conv) => conv.bot.botId === 'im-bot'
                    );
                    const botConversations = unfilteredConv.filter(
                        (conv) => conv.bot.botId !== 'im-bot'
                    );
                    const favBots = [];
                    botConversations.forEach((item) => {
                        if (item.favorite) favBots.push(item.bot.botId);
                    });

                    if (favBots.length > 0) {
                        DeviceStorage.saveArrayValues(FAVOURITE_BOTS, favBots)
                            .then(() => {
                                console.log('FavBot stored to device', favBots);
                            })
                            .catch((e) => {
                                console.log('FavBot error to device', favBots);
                            });
                    }
                    // let conversations = res.data.content
                    const localConversations =
                        await Conversation.getLocalConversations();
                    localConversations.forEach((localConversation) => {
                        const index = allConversations.find(
                            (c) =>
                                c.conversationId ===
                                localConversation.conversationId
                        );
                        if (index === undefined) {
                            Conversation.deleteConversation(
                                localConversation.conversationId
                            ).then(() => {
                                ConversationContext.deleteConversationContext(
                                    localConversation.conversationId
                                );
                                EventEmitter.emit(
                                    TimelineEvents.refreshTimeline
                                );
                            });
                        }
                    });
                    const promise = _.map(allConversations, (conversation) => {
                        if (
                            conversation.onChannels &&
                            conversation.onChannels.length > 0
                        ) {
                            let botContext;

                            const devConv = localConversations.filter(
                                (lconversation) =>
                                    lconversation.conversationId ==
                                    conversation.conversationId
                            );
                            if (devConv.length > 0) {
                                return null;
                            }

                            return Conversation.createChannelConversation(
                                conversation.conversationId,
                                conversation.unreadCount,
                                conversation.modifiedOn,
                                conversation.favorite
                            )
                                .then(() => {
                                    const botScreen =
                                        BackgroundTaskProcessor.generateScreen(
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
                                .then((newChanConvContext) => {
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
                                    const { content, ...rest } =
                                        conversation.lastMessage;
                                    const message = {
                                        details: [
                                            {
                                                message: content[0]
                                            }
                                        ],
                                        ...rest
                                    };
                                    return BackgroundTaskProcessor.processLastMessageonLoad(
                                        message,
                                        conversation.bot.botId,
                                        conversation.conversationId,
                                        false,
                                        false
                                    );
                                })
                                .catch(() => null);
                        }

                        if (
                            conversation.contact &&
                            conversation.onChannels.length == 0
                        ) {
                            console.log(
                                'conversation contact',
                                conversation.contact
                            );
                            let botContext;
                            const otherParticipant = {
                                userName: conversation.contact.userName,
                                userId: conversation.contact.userId
                            };
                            const devConv = localConversations.filter(
                                (lconversation) =>
                                    lconversation.conversationId ==
                                    conversation.conversationId
                            );
                            // if (devConv.length > 0) {
                            //     return null;
                            // }
                            const botScreen =
                                BackgroundTaskProcessor.generateScreen(
                                    conversation.bot.botId,
                                    conversation.conversationId
                                );
                            botContext = new BotContext(botScreen, manifest);
                            return ConversationContext.createNewConversationContext(
                                botContext,
                                user,
                                conversation.conversationId
                            )
                                .then((newConvContext) => {
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
                                .then(() =>
                                    ConversationContext.setParticipants(
                                        conversation.participants,
                                        botContext
                                    )
                                )
                                .then(() => {
                                    const { content, ...rest } =
                                        conversation.lastMessage;
                                    if (content && content[0]) {
                                        const message = {
                                            details: [
                                                {
                                                    message: content[0]
                                                }
                                            ],
                                            ...rest
                                        };
                                        if (conversation.unreadCount == 0) {
                                            message.isOpened = true;
                                        }
                                        return BackgroundTaskProcessor.processLastMessageonLoad(
                                            message,
                                            conversation.bot.botId,
                                            conversation.conversationId,
                                            false,
                                            false
                                        );
                                    } else {
                                        resolve();
                                    }
                                })
                                .then(() => {
                                    {
                                        return Conversation.createIMConversation(
                                            conversation.conversationId,
                                            conversation.unreadCount,
                                            conversation.modifiedOn,
                                            conversation.favorite
                                        );
                                    }
                                })
                                .catch((e) => {
                                    console.log(
                                        'conversation contact error',
                                        e
                                    );
                                    return null;
                                });
                        }
                        return Promise.resolve(null);
                    });
                    return Promise.all(promise);
                })
                .then(() => {
                    console.log('Conversation Promises resolved ');
                    Store.dispatch(completeConversationsLoad(true));
                    if (emitEvent) {
                        EventEmitter.emit(TimelineEvents.refreshTimeline);
                    }
                    return resolve();
                })
                .catch((error) => {
                    Store.dispatch(completeConversationsLoad(true));
                    console.log('Conversation Promises errores ', error);
                    reject(error);
                });
        });
    };

    /**
     * Get local conversations from the device database
     */
    static getLocalConversations = () =>
        new Promise((resolve, reject) =>
            resolve(ConversationDAO.selectConversations())
        );

    /**
     * Get remote and local conversations
     */
    static getAllConversations = () =>
        new Promise((resolve, reject) => {
            Conversation.downloadRemoteConversations().then(() =>
                resolve(Conversation.getLocalConversations())
            );
        });

    static createConversation = (
        conversationId,
        type,
        unreadCount,
        createTime,
        favorite
    ) =>
        new Promise((resolve, reject) => {
            ConversationDAO.insertConversation(
                conversationId,
                type,
                createTime,
                unreadCount,
                favorite
            )
                .then((id) =>
                    resolve({
                        id,
                        conversationId
                    })
                )
                .catch((err) => {
                    reject(err);
                });
        });

    static createIMConversation = (
        conversationId,
        unreadCount,
        createTime,
        favorite
    ) =>
        Conversation.createConversation(
            conversationId,
            IM_CHAT,
            unreadCount,
            createTime,
            favorite
        );

    static createChannelConversation = (
        conversationId,
        unreadCount,
        createTime,
        favorite
    ) =>
        Conversation.createConversation(
            conversationId,
            CHANNEL_CHAT,
            unreadCount,
            createTime,
            favorite
        );

    static removeConversation = (conversationId, type) =>
        new Promise((resolve, reject) => {
            ConversationDAO.deleteConversation(conversationId, type)
                .then((id) => {
                    EventEmitter.emit(TimelineEvents.refreshTimeline);
                    resolve({
                        conversationId
                    });
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static deleteConversation = (conversationId) =>
        Conversation.removeConversation(conversationId, IM_CHAT);

    static deleteChannelConversation = (conversationId) =>
        Conversation.removeConversation(conversationId, CHANNEL_CHAT);

    static deleteContacts = (body) => {
        // console.log('sending data for delete before', body);
        let currentUserId;
        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        currentUserId = user.userId;
                        return ContactServices.remove(body.users);
                    }
                })
                .then(async (response) => {
                    if (response.error === 0) {
                        console.log('response fav ', response);
                        const otherUserId = body.users[0];
                        return Promise.resolve({
                            otherUserId,
                            currentUserId
                        });
                    } else {
                        return Promise.reject(response.message);
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    };

    static deleteLocalContacts = (body) =>
        ContactServices.removeLocal(body.localContacts);

    static updateConversation = (oldConversationId, newConversationId) =>
        new Promise((resolve, reject) => {
            ConversationDAO.updateConversationId(
                oldConversationId,
                newConversationId
            )
                .then((id) =>
                    resolve({
                        oldConversationId,
                        newConversationId
                    })
                )
                .catch((err) => {
                    reject(err);
                });
        });

    static getConversation = (conversationId) =>
        new Promise((resolve, reject) =>
            resolve(ConversationDAO.selectConversation(conversationId))
        );

    static getIMConversation = (conversationId) =>
        new Promise((resolve, reject) =>
            resolve(
                ConversationDAO.selectConversationByType(
                    conversationId,
                    IM_CHAT
                )
            )
        );

    static getChannelConversation = (conversationId) =>
        new Promise((resolve, reject) =>
            resolve(
                ConversationDAO.selectConversationByType(
                    conversationId,
                    CHANNEL_CHAT
                )
            )
        );

    static isChannelConversation = (conversation) =>
        conversation.type === CHANNEL_CHAT;

    static grpcUpdateFavorites = (user, params) =>
        ConversationServices.updateFavourites(params);

    /**
     *
     * @param {*} data
     * @param {*} databaseUpdateCallBack
     * @param {*} localOnly update in DB only, do not call APi
     * @returns
     */
    static setFavorite = (data, databaseUpdateCallBack, localOnly) => {
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

        if (data.conversationId) {
            console.log('setting fav of conversationg ');
            ConversationDAO.updateConvFavorite(
                data.conversationId,
                favorite
            ).then(() => {
                databaseUpdateCallBack?.();
            });
        }
        if (data.channelName) {
            console.log('setting fav of channel ');
            if (data.channelConvId) {
                console.log('channel conversation id', data.channelConvId);

                Channel.changeIsFavourite(
                    data.channelName,
                    data.userDomain,
                    channelIsFavourite
                ).then((chanelData) => {
                    console.log('channel changeIsFavourite', chanelData);
                    ConversationDAO.updateConvFavorite(
                        data.channelConvId,
                        favorite
                    ).then(() => {
                        databaseUpdateCallBack?.();
                    });
                });
            } else {
                Channel.changeIsFavourite(
                    data.channelName,
                    data.userDomain,
                    channelIsFavourite
                ).then((channelData) => {
                    databaseUpdateCallBack?.();
                    console.log('changeIsFavourite', chanelData);
                });
            }
        } else if (data.botId) {
            console.log('setting fav of bots ');
            if (channelIsFavourite === 1) {
                DeviceStorage.saveArrayValue(FAVOURITE_BOTS, data.botId).then(
                    () => {
                        databaseUpdateCallBack?.();
                    }
                );
            } else if (channelIsFavourite === 0) {
                DeviceStorage.removeArrayValue(FAVOURITE_BOTS, data.botId).then(
                    () => {
                        databaseUpdateCallBack?.();
                    }
                );
            }
        }

        // if (data.userId) {
        //     const otherUserId = data.userId;
        //     return Promise.resolve({
        //         otherUserId,
        //         currentUserId
        //     });
        // }

        return new Promise((resolve, reject) => {
            if (localOnly) resolve();
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        console.log('GRPC::::update   ', jsonData);
                        currentUserId = user.userId;
                        return Conversation.grpcUpdateFavorites(user, jsonData);
                    }
                })
                .then(async (response) => {
                    console.log('response fav ', response);
                    if (response.success) {
                        resolve({
                            currentUserId: currentUserId,
                            otherUserId: data.userId
                        });
                    } else {
                        reject(response);
                    }
                })
                .catch(reject);
        });
    };
    static getPaginatedArchivedMessages = (
        conversationId,
        botId,
        startTime,
        fetchDirection
    ) => {
        const params = {
            conversationId,
            botId,
            startTime,
            fetchDirection
        };
        return ConversationServices.getPaginatedArchivedMessages(params).then(
            (response) => {
                if (
                    response.success ||
                    response.error === 0 ||
                    response.error === ''
                ) {
                    return {
                        moreMessagesExist: response.moreMessagesExist,
                        messages: response.content
                    };
                }
                throw new Error(response.message);
            }
        );
    };
}
