import moment from 'moment';
import _ from 'lodash';
import { Auth } from '../capability';
import Message from '../capability/Message';
import { MessageHandler, MessageQueue } from '../message';
import { NETWORK_STATE } from '../network';
import Store from '../../redux/store/configureStore';
import Conversation from './Conversation';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
export default class MessageManager {
    static PAGE_SIZE = 25;

    static async getPaginatedMessages(conversationId, botId, startTime, init) {
        try {
            let messages = [];
            let moreMessagesExist = true;
            const localMessages =
                await MessageHandler.fetchDeviceMessagesBeforeDate(
                    conversationId,
                    this.PAGE_SIZE,
                    startTime
                );
            messages = messages.concat(localMessages);
            if (init && messages.length >= 1) {
                return { messages, moreMessagesExist: true };
            }
            if (
                (!localMessages || localMessages.length < this.PAGE_SIZE) &&
                Store.getState().user.network !== NETWORK_STATE.none
            ) {
                if (localMessages.length > 1) {
                    startTime = localMessages[localMessages.length - 1].message
                        .getMessageDate()
                        .getTime();
                } else if (init) {
                    startTime = undefined;
                }
                try {
                    const page =
                        await Conversation.getPaginatedArchivedMessages(
                            conversationId,
                            botId,
                            startTime ? startTime - 1 : startTime
                        );
                    const user = Auth.getUserData();
                    const formattedMessages = this.formatAndSaveMessages(
                        page.messages,
                        conversationId,
                        user,
                        !page.moreMessagesExist &&
                            page.messages.length === 1 &&
                            init
                    );
                    moreMessagesExist = page.moreMessagesExist;
                    // if there is not start time, we are getting latest, ignore the messages which are already present.
                    if (startTime) {
                        return {
                            messages: messages.concat(formattedMessages),
                            moreMessagesExist
                        };
                    }
                    if (formattedMessages.length === 0) {
                        return {
                            messages: messages.concat(formattedMessages),
                            moreMessagesExist
                        };
                    }
                    return {
                        messages: formattedMessages,
                        moreMessagesExist
                    };
                } catch (e) {
                    console.log(e);
                    return { messages, moreMessagesExist: false };
                }
            }
            return { messages, moreMessagesExist: true };
        } catch (error) {
            Toast.show({
                text1: error.name,
                text2: error.message
            });
            return error;
        }
    }

    static async getNewArchivedMessages(conversationId, botId, startTime) {
        console.log('Get new archived messages wtf ', startTime);
        const page = await Conversation.getPaginatedArchivedMessages(
            conversationId,
            botId,
            startTime,
            'NEWER'
        );
        const user = Auth.getUserData();
        if (page.messages && page.messages.length > 0) {
            latestMessageTime =
                page.messages[page.messages.length - 1].createdOn;

            this.formatAndSaveMessages(
                page.messages.reverse(),
                conversationId,
                user,
                true
            );
            if (page.moreMessagesExist && latestMessageTime > startTime) {
                await this.getNewArchivedMessages(
                    conversationId,
                    botId,
                    latestMessageTime - 30 * 60 * 1000
                );
            }
        }
    }

    /**
     * Saves messages in the local database and returns their formatted version for the chat screen.
     * @param {Array} messages
     * @param {String} conversationId
     * @param {String} user
     * @returns {Array} Array of formatted messages
     */
    static formatAndSaveMessages(messages, conversationId, user, process) {
        const formattedMessages = [];
        if (messages && messages.length > 0) {
            messages.forEach((mData) => {
                if (
                    mData &&
                    mData.contentType &&
                    mData.contentType !== '470' &&
                    mData.contentType !== '250' &&
                    mData.contentType !== '460' &&
                    mData.contentType !== '550' &&
                    mData.contentType !== '1000'
                ) {
                    if (process) {
                        if (
                            mData.contentType === '1001' &&
                            messages.length === 1
                        ) {
                            const json = JSON.parse(JSON.stringify(mData));
                            const myUserID = user.userId;
                            if (json.createdBy != myUserID) {
                                const messageString = {
                                    bot: 'im-bot',
                                    contentType: parseInt(json.contentType, 10),
                                    conversation: conversationId,
                                    createdBy: json.createdBy,
                                    createdOn: json.createdOn,
                                    isOpened: json.isOpened,
                                    details: [],
                                    messageId: json.messageId,
                                    userId: myUserID
                                };
                                messageString.details.push({
                                    message: json.content[0]
                                });
                                MessageQueue.push(messageString);
                            }
                            return;
                        }
                    }

                    const message = Message.from(mData, user, conversationId);
                    MessageHandler.persistOnDevice(conversationId, message);
                    formattedMessages.push(message.toBotDisplay());
                }
            });
        }
        return formattedMessages;
    }
}
