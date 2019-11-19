import { Auth } from '../capability';
import _ from 'lodash';
import Message from '../capability/Message';
import { MessageHandler } from '../../lib/message';
import ConversationServices from '../../api/ConversationServices';
import { NETWORK_STATE } from '../network';
import Store from '../../redux/store/configureStore';

export default class MessageManager {
    static PAGE_SIZE = 25;

    static async getArchivedMessages(conversationId, botId) {
        try {
            const messages = await ConversationServices.getArchivedMessages(
                conversationId,
                botId
            );
            const user = await Auth.getUser();
            const formattedMessages = this.formatAndSaveMessages(
                messages,
                conversationId,
                user
            );
            return formattedMessages;
        } catch (error) {
            return error;
        }
    }

    static async getPaginatedMessages(conversationId, botId, startTime) {
        try {
            let messages = [];
            let moreMessagesExist = true;
            const localMessages = await MessageHandler.fetchDeviceMessagesBeforeDate(
                conversationId,
                this.PAGE_SIZE,
                startTime
            );
            messages = messages.concat(localMessages);
            if (
                (!localMessages || localMessages.length < this.PAGE_SIZE) &&
                Store.getState().user.network !== NETWORK_STATE.none
            ) {
                if (localMessages.length > 0) {
                    startTime = localMessages[localMessages.length - 1].message
                        .getMessageDate()
                        .getTime();
                }
                const page = await ConversationServices.getPaginatedArchivedMessages(
                    conversationId,
                    botId,
                    startTime - 1
                );
                const user = await Auth.getUser();
                const formattedMessages = this.formatAndSaveMessages(
                    page.messages,
                    conversationId,
                    user
                );
                moreMessagesExist = page.moreMessagesExist;
                messages = messages.concat(formattedMessages);
            }
            return { messages: messages, moreMessagesExist: moreMessagesExist };
        } catch (error) {
            return error;
        }
    }

    /**
     * Saves messages in the local database and returns their formatted version for the chat screen.
     * @param {Array} messages
     * @param {String} conversationId
     * @param {String} user
     * @returns {Array} Array of formatted messages
     */
    static formatAndSaveMessages(messages, conversationId, user) {
        let formattedMessages = [];
        if (messages && messages.length > 0) {
            messages.forEach(mData => {
                if (
                    mData &&
                    mData.contentType &&
                    mData.contentType !== '470' &&
                    mData.contentType !== '250' &&
                    mData.contentType !== '460' &&
                    mData.contentType !== '550' &&
                    mData.contentType !== '1000' &&
                    mData.contentType !== '1001'
                ) {
                    const message = Message.from(mData, user, conversationId);
                    MessageHandler.persistOnDevice(conversationId, message);
                    formattedMessages.push(message.toBotDisplay());
                }
            });
        }
        return formattedMessages;
    }
}
