import { ConversationDAO } from '../persistence';
const IM_CHAT = 'imchat';

/**
 * Can be used for people chat - for person to person, peer to peer or channels
 */
export default class Conversation {

    static getAllIMConversations = () => new Promise((resolve, reject) => {
        return resolve(ConversationDAO.selectConversations(IM_CHAT));
    });

    static createIMConversation = (conversationId) => new Promise((resolve, reject) => {
        ConversationDAO.insertConversation(conversationId, IM_CHAT)
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

    static deleteConversation = (conversationId) => new Promise((resolve, reject) => {
        ConversationDAO.deleteConversation(conversationId, IM_CHAT)
            .then((id) => {
                return resolve({
                    conversationId: conversationId
                });
            })
            .catch((err) => {
                reject(err);
            });
    });

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

}
