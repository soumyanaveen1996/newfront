import events from 'events';
import Promise from '../Promise';
import { MessageDAO } from '../persistence';
import moment from 'moment';

/**
 * Only one instance of this is expected to run - this is handled via the import in index.js module
 * Since we want the event emitter functionality on the class - which can also publish and subscribe to events
 */
export default class MessageHandler extends events.EventEmitter {

    constructor() {
        super();
    }

    /**
     * Persist a given message onto the local device. A botkey is required to key the message.
     * The messages are put in a stack - meaning last in first out (when calling fetch)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param message A Message object to persist
     *
     * @return Promise that resolves once persisted
     */
    persistOnDevice = (botKey, message) => new Promise((resolve, reject) => {
        if (!message || !botKey) {
            reject('A valid message object and botkey is required to persist on local')
        }
        // Just return
        if (!message.getMessage()) {
            resolve(message);
        }
        message.setBotKey(botKey);

        MessageDAO.insertOrUpdateMessage(message).then(resolve).catch(reject);
    });

    /**
     * Persist a favorited message onto the local device. A botkey is required to key the message.
     * The messages are put in a stack - meaning last in first out (when calling fetch)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param message A Message object to persist
     *
     * @return Promise that resolves once persisted
     */
    persistFavoriteMsgOnDevice = (botKey, message) => new Promise((resolve, reject) => {
        if (!message || !botKey) {
            reject('A valid message object and botkey is required to persist on local')
        }
        // Just return
        if (!message.getMessage()) {
            resolve(message);
        }
        message.setBotKey(botKey);

        return resolve(MessageDAO.insertMessage(message));
    });

    /**
     * Persist a given message onto the remote server. A botkey is required to key the message.
     * The messages are put in a stack - meaning last in first out (when calling fetch)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param message A Message object to persist
     *
     * @return Promise that resolves once persisted
     */
    persistOnServer = (botKey, message) => new Promise((resolve, reject) => {
        // For now won't work
        return resolve(false);
    });


    /**
     * Returns the top max (most recent) messages from the local/device storage
     * TODO: Enhance the method to do queries better (from, to, all messages, sort etc)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param max Last 'n' messages required. Default to 5
     *
     * @return Promise that resolves to an array of messages (sorted from least recent to most)
     */
    fetchDeviceMessages = (botKey, max = 5, offset = 0, ignoreMessageOfType = []) => new Promise((resolve, reject) => {
        MessageDAO.selectMessages(botKey, max, offset, ignoreMessageOfType)
            .then((messages) => {
                // we want in reverse order
                resolve(messages.reverse());
            });
    });


    /**
     * Returns the top max (most recent) messages from the local/device storage
     * TODO: Enhance the method to do queries better (from, to, all messages, sort etc)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param max Last 'n' messages required. Default to 5
     * @param dateLimit Fetch Messages that were created before param value
     *
     * @return Promise that resolves to an array of messages (sorted from least recent to most)
     */
    fetchDeviceMessagesBeforeDate = (botKey, max = 5, dateLimit) => new Promise((resolve, reject) => {
        MessageDAO.selectMessagesBeforeDate(botKey, max, dateLimit)
            .then((messages) => {
                // we want in reverse order
                resolve(messages.reverse());
            });
    });

    /**
     * Returns the top max (most recent) messages from the local/device storage
     * TODO: Enhance the method to do queries better (from, to, all messages, sort etc)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param max Last 'n' messages required. Default to 5
     *
     * @return Promise that resolves to an array of messages (sorted from least recent to most)
     */
    fetchFavoriteMessages = (max = 5, offset = 0) => new Promise((resolve, reject) => {
        MessageDAO.selectFavoriteMessages(max, offset)
            .then((messages) => {
                // we want in reverse order
                resolve(messages.reverse());
            });
    });

    /**
     * Returns the count of unread messages for the particular bot
     *
     * @param botKey A string key to indicate the identifier of bot
     *
     * @return Promise that resolves to count of unread messages of the bot.
     */
    unreadMessageCount = (botKey) => new Promise((resolve, reject) => {
        MessageDAO.unreadMessageCount(botKey)
            .then((count) => {
                resolve(count);
            })
    });

    /**
     * Returns the count of messages that the user has sent (response messages aren't counted)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param option supports the following:
     *  null/empty (all messages)
     *  day (last 24 hours)
     *  week (last 7 days)
     *  month (since last month)
     *  startOfMonth (since start of this month)
     *  date (since any date - javascript)
     *
     * @return Promise that resolves to count of users messages of the bot.
     */
    userMessageCountSince = (botKey, option) => new Promise((resolve, reject) => {
        option = option || '';
        let optStr = '';

        if (option instanceof Date) {
            optStr = moment(option).format();
        } else if (option.toLowerCase() === 'day') {
            optStr = moment().subtract(1, 'days').format();
        } else if (option.toLowerCase() === 'week') {
            optStr = moment().subtract(7, 'days').format();
        } else if (option.toLowerCase() === 'month') {
            optStr = moment().subtract(1, 'months').format();
        } else if (option.toLowerCase() === 'startofmonth') {
            optStr = moment().subtract(1, 'months').endOf('month').format();
        }

        MessageDAO.selectUserMessageCountSince(botKey, optStr)
            .then((count) => {
                resolve(count);
            });
    });

    /**
     * Returns the top max (most recent) messages from the local/device storage
     * TODO: Enhance the method to do queries better (from, to, all messages, sort etc)
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param max Last 'n' messages required. Default to 5
     *
     * @return Promise that resolves to an array of messages (sorted from least recent to most)
     */
    fetchServerMessages = (botKey, max = 5) => new Promise((resolve, reject) => {
        // For now won't work
        return resolve(false);
    });

    /**
     * Marks all unread messages of a bot as read.
     *
     * @param botKey A string key to indicate the identifier of bot
     *
     * @return Promise that resolves to a true on success.
     */
    markUnreadMessagesAsRead = (botKey) => {
        return MessageDAO.markAllBotMessagesAsRead(botKey);
    }

    /**
     * Marks the message as read
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param messageId A string key for identifier of message
     *
     * @return Promise that resolves to a true on success or rejects with an error.
     */
    markBotMessageAsRead = (botKey, messageId) => {
        return MessageDAO.markBotMessageAsRead(botKey, messageId);
    }

    /**
     * Marks the message as Favorite
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param messageId A string key for identifier of message
     *
     * @return Promise that resolves to a true on success or rejects with an error.
     */
    toggleFavorite = (botKey, messageId, isFavorite) => {
        return isFavorite ? MessageDAO.markBotMessageAsFavorite(botKey, messageId) : MessageDAO.markBotMessageAsUnFavorite(botKey, messageId)
    }

    /**
     * Deletes all the messages of the bot.
     *
     * @param botKey A string key to indicate the identifier of bot
     *
     * @return Promise that resolves to a true on success.
     */
    deleteBotMessages = (botKey) => {
        return MessageDAO.deleteBotMessages(botKey)
    }

    moveMessages = (fromBotKey, toBotKey) => {
        return MessageDAO.moveMessagesToNewBotKey(fromBotKey, toBotKey);
    }
}
