import Promise from '../Promise';
import { Message } from '../capability';
import moment from 'moment';
import { db } from './db';
import messageSql from './messageSql';
import Utils from '../utils/index';
import _ from 'lodash';

/**
 * Create the message table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createMessageTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.createMessageTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const createV2MessageTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.createV2MessageTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const renameToTemp = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql('ALTER TABLE messages RENAME TO tmp_messages;', null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
})


const selectAllTempMessages = () => new Promise((resolve, reject) => {
    const sql = `SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by
    FROM tmp_messages`;

    db.transaction(transaction => {
        transaction.executeSql(sql, [], function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbMessages = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let messages = dbMessages.map((msg) => {
                const opts = {
                    uuid: msg.message_id,
                    botKey: msg.bot_key,
                    msg: msg.msg,
                    messageType: msg.message_type,
                    options: msg.options,
                    addedByBot: msg.added_by_bot ? true : false,
                    messageDate: moment(msg.message_date).toDate(),
                    isRead: (msg.read === 1),
                    isFavorite: (msg.is_favorite === 1),
                    createdBy: msg.created_by
                };
                return new Message(opts);
            });
            return resolve(messages);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const migrateToV2Messages = () => new Promise((resolve, reject) => {
    renameToTemp()
        .then(() => {
            return createV2MessageTable();
        })
        .then(() => {
            return selectAllTempMessages();
        })
        .then((messages) => {
            return Promise.all(_.map(messages, (message) => {
                return insertMessage(message);
            }))
        })
        .then(() => {
            resolve();
        })
        .catch((error) => {
            reject(error);
        })
});

const selectMessage = (message) => {
    return selectMessageById(message.getMessageId());
}

const selectMessageById = (messageId) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.selectMessageById, [messageId], function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbMessages = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let messages = dbMessages.map((msg) => {
                return messageFromDatabaseRow(msg);
            });
            if (messages.length > 0) {
                resolve(messages[0]);
            } else {
                resolve();
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertOrUpdateMessage = (message) => new Promise((resolve, reject) => {
    selectMessage(message)
        .then((dbMessage) => {
            if (dbMessage) {
                updateMessage(message).then(resolve).catch(reject);
            } else {
                insertMessage(message).then(resolve).catch(reject);
            }
        })
});

const updateMessage = (message) => new Promise((resolve, reject) => {
    const args = [
        message.getBotKey(),
        message.getMessageString(),
        message.getMessageType(),
        message.getMessageOptionsString(),
        message.isMessageByBot() ? 1 : 0,
        moment(message.getMessageDate()).valueOf(),
        message.isRead() ? 1 : 0,
        message.isFavorite() ? 1 : 0,
        message.getCreatedBy(),
        message.isCompleted() ? 1 : 0,
        message.getMessageId()
    ];

    db.transaction(transaction => {
        transaction.executeSql(messageSql.updateMessageById, args, function success(tx, res) {
            selectMessageById(message.getMessageId())
                .then(resolve)
                .catch(reject);
        }, function failure(tx, err) {
            reject(err);
        });
    });
});

const insertMessage = (message) => new Promise((resolve, reject) => {
    const args = [message.getMessageId(),
        message.getBotKey(),
        message.getMessageString(),
        message.getMessageType(),
        message.getMessageOptionsString(),
        message.isMessageByBot() ? 1 : 0,
        moment(message.getMessageDate()).valueOf(),
        message.isRead() ? 1 : 0,
        message.isFavorite() ? 1 : 0,
        message.getCreatedBy(),
        message.isCompleted() ? 1 : 0];

    db.transaction(transaction => {
        transaction.executeSql(messageSql.insertMessage, args, function success(tx, res) {
            selectMessageById(message.getMessageId())
                .then(resolve)
                .catch(reject);
        }, function failure(tx, err) {
            reject(err);
        });
    });
});

const markBotMessageAsRead = (botkey, messageId) => new Promise((resolve, reject) => {
    const args = [messageId, botkey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.markAsRead, args, function success() {
            resolve(true);
        }, function failure(tx, err) {
            reject(err);
        });
    });
});

const markBotMessageAsFavorite = (botkey, messageId) => new Promise((resolve, reject) => {
    const args = [messageId, botkey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.markAsFavorite, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const markBotMessageAsUnFavorite = (botkey, messageId) => new Promise((resolve, reject) => {
    const args = [messageId, botkey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.markAsUnFavorite, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const markAllBotMessagesAsRead = (botkey) => new Promise((resolve, reject) => {
    const args = [botkey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.markAllBotMessagesAsRead, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const unreadMessageCount = (botkey) => new Promise((resolve, reject) => {
    const args = [botkey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.unreadCount, args, function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(0);
            } else {
                return resolve(dbResults[0]['COUNT(*)']);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});



const selectMessages = (botkey, limit, offset, ignoreMessagesOfType = []) => new Promise((resolve, reject) => {
    ignoreMessagesOfType = ignoreMessagesOfType || [];
    let args = [botkey];
    db.transaction(transaction => {
        let sql = messageSql.selectRecentMessages;

        // If we need to ignore certain message types then modify sql and args
        try {
            if (ignoreMessagesOfType.length > 0) {
                let andClause = ' AND message_type not in (';
                ignoreMessagesOfType.forEach((msgType) => {
                    andClause = andClause + '?,';
                    args.push(msgType);
                });
                // Remove last comma, and close it
                andClause = andClause.slice(0, -1) + ') ';
                const index = sql.indexOf('ORDER BY');

                // Insert it
                sql = sql.slice(0, index) + andClause + sql.slice(index);
            }
        } catch (error) {
            sql = messageSql.selectRecentMessages;
            args = [botkey];
        }
        // Add limit and offset
        args.push(limit);
        args.push(offset);

        transaction.executeSql(sql, args, function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbMessages = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let messages = dbMessages.map((msg) => {
                let message = messageFromDatabaseRow(msg);
                return message.toBotDisplay();
            });
            return resolve(messages);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const selectMessagesBeforeDate = (botkey, limit, date) => new Promise((resolve, reject) => {
    let args = [botkey, date, limit];
    db.transaction(transaction => {
        let sql = messageSql.selectMessagesBeforeDate;

        transaction.executeSql(sql, args, function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbMessages = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let messages = dbMessages.map((msg) => {
                let message = messageFromDatabaseRow(msg);
                return message.toBotDisplay();
            });
            return resolve(messages);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const messageFromDatabaseRow = (msg) => {
    const opts = {
        uuid: msg.message_id,
        botKey: msg.bot_key,
        msg: msg.msg,
        messageType: msg.message_type,
        options: msg.options,
        addedByBot: msg.added_by_bot ? true : false,
        messageDate: moment(msg.message_date).toDate(),
        isRead: (msg.read === 1),
        isFavorite: (msg.is_favorite === 1),
        createdBy: msg.created_by,
        completed: msg.completed === 1,
    };
    let message = new Message(opts);
    return message;
}

const selectFavoriteMessages = (limit, offset) => new Promise((resolve, reject) => {
    const args = [limit, offset];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.selectFavoriteMessages, args, function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbMessages = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let messages = dbMessages.map((msg) => {
                return messageFromDatabaseRow(msg).toBotDisplay();
            });
            return resolve(messages);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectUserMessageCountSince = (botkey, sinceDateString) => new Promise((resolve, reject) => {
    // Empty string means since beginning
    sinceDateString = sinceDateString || '';
    const args = [botkey, sinceDateString];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.totalUserMessageCountSince, args, function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(0);
            } else {
                return resolve(dbResults[0]['COUNT(*)']);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const moveMessagesToNewBotKey = (fromBotKey, toBotKey) => new Promise((resolve, reject) => {
    const args = [toBotKey, fromBotKey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.moveMessagesToNewBotKey, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteBotMessages = (botKey) => new Promise((resolve, reject) => {
    const args = [botKey];
    db.transaction(transaction => {
        transaction.executeSql(messageSql.deleteBotMessages, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(new Error('Unable to delete bot messages'));
        });
    });

})

const addCompletedColumn = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.addCompletedColumn, [], function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(new Error('Unable to add completed column'));
        });
    });

})

const createMessageDateIndex = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.addMessageCreatedAtIndex, [], function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(new Error('Unable to add index on Message table'));
        });
    });
});

const deleteAllMessages = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(messageSql.deleteAllMessages, [], function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(error);
        });
    });
});


export default {
    createMessageTable: createMessageTable,
    createV2MessageTable: createV2MessageTable,
    migrateToV2Messages: migrateToV2Messages,
    insertMessage: insertMessage,
    selectMessages: selectMessages,
    unreadMessageCount: unreadMessageCount,
    selectUserMessageCountSince: selectUserMessageCountSince,
    markAllBotMessagesAsRead: markAllBotMessagesAsRead,
    markBotMessageAsRead: markBotMessageAsRead,
    markBotMessageAsUnFavorite: markBotMessageAsUnFavorite,
    markBotMessageAsFavorite: markBotMessageAsFavorite,
    selectFavoriteMessages: selectFavoriteMessages,
    moveMessagesToNewBotKey: moveMessagesToNewBotKey,
    deleteBotMessages: deleteBotMessages,
    addCompletedColumn: addCompletedColumn,
    insertOrUpdateMessage: insertOrUpdateMessage,
    selectMessagesBeforeDate: selectMessagesBeforeDate,
    createMessageDateIndex: createMessageDateIndex,
    selectMessageById: selectMessageById,
    deleteAllMessages: deleteAllMessages
};
