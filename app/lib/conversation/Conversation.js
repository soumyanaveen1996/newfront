import { ConversationDAO } from '../persistence';
const IM_CHAT = 'imchat';
const CHANNEL_CHAT = 'channels';

/**
 * Can be used for people chat - for person to person, peer to peer or channels
 */
export default class Conversation {

    static getAllIMConversations = () => new Promise((resolve, reject) => {
        return resolve(ConversationDAO.selectConversations(IM_CHAT));
    });

    static createConversation = (conversationId, type) => new Promise((resolve, reject) => {
        ConversationDAO.insertConversation(conversationId, type)
            .then((id) => {
                return resolve({
                    id: id,
                    conversationId: conversationId
                });
            })
            .catch((err) => {
                reject(err);
            });
    });

    static createIMConversation = (conversationId) => Conversation.createConversation(conversationId, IM_CHAT)

    static createChannelConversation = (conversationId) => Conversation.createConversation(conversationId, CHANNEL_CHAT)


    static removeConversation = (conversationId, type) => new Promise((resolve, reject) => {
        ConversationDAO.deleteConversation(conversationId, type)
            .then((id) => {
                return resolve({
                    conversationId: conversationId
                });
            })
            .catch((err) => {
                reject(err);
            });
    });

    static deleteConversation = (conversationId) => Conversation.removeConversation(conversationId, IM_CHAT)
    static deleteChannelConversation = (conversationId) => Conversation.removeConversation(conversationId, CHANNEL_CHAT)

    static updateConversation = (oldConversationId, newConversationId) => new Promise((resolve, reject) => {
        ConversationDAO.updateConversationId(oldConversationId, newConversationId)
            .then((id) => {
                return resolve({
                    oldConversationId: oldConversationId,
                    newConversationId: newConversationId
                });
            })
            .catch((err) => {
                reject(err);
            });
    });


    static getIMConversation = (conversationId) => new Promise((resolve, reject) => {
        return resolve(ConversationDAO.selectConversation(conversationId, IM_CHAT));
    });

    static getChannelConversation = (conversationId) => new Promise((resolve, reject) => {
        return resolve(ConversationDAO.selectConversation(conversationId, CHANNEL_CHAT));
    });

}
