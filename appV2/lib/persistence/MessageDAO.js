import moment from 'moment';
import _ from 'lodash';
import Promise from '../Promise';
import { Message } from '../capability';
import { db } from './db';
import messageSql from './messageSql';
import Utils from '../utils/index';
import utilsCapability from '../capability/Utils';
/**
 * Create the message table if it doesn't exist. Should be called during launch (each time is ok).
 */
const createMessageTable = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.createMessageTable,
                null,
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

const createV2MessageTable = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.createV2MessageTable,
                null,
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

const renameToTemp = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                'ALTER TABLE messages RENAME TO tmp_messages;',
                null,
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

const selectAllTempMessages = () =>
    new Promise((resolve, reject) => {
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

        db.transaction((transaction) => {
            transaction.executeSql(
                sql,
                [],
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) => {
                        const opts = {
                            uuid: msg.message_id,
                            botKey: msg.bot_key,
                            msg: msg.msg,
                            messageType: msg.message_type,
                            options: msg.options,
                            addedByBot: !!msg.added_by_bot,
                            messageDate: moment(msg.message_date).toDate(),
                            isRead: msg.read === 1,
                            isFavorite: msg.is_favorite === 1,
                            createdBy: msg.created_by
                        };
                        return new Message(opts);
                    });
                    return resolve(messages);
                },
                (tx, err) => reject(err)
            );
        });
    });

const migrateToV2Messages = () =>
    new Promise((resolve, reject) => {
        renameToTemp()
            .then(() => createV2MessageTable())
            .then(() => selectAllTempMessages())
            .then((messages) =>
                Promise.all(
                    _.map(messages, (message) => insertMessage(message))
                )
            )
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });

const selectMessage = (message) => selectMessageById(message.getMessageId());

const selectMessageById = (messageId) =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.selectMessageById,
                [messageId],
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) =>
                        messageFromDatabaseRow(msg)
                    );
                    if (messages.length > 0) {
                        resolve(messages[0]);
                    } else {
                        resolve();
                    }
                },
                (tx, err) => reject(err)
            );
        });
    });

const insertOrUpdateMessage = (message) =>
    new Promise((resolve, reject) => {
        selectMessage(message).then((dbMessage) => {
            if (dbMessage) {
                updateMessage(message, dbMessage)
                    .then(resolve)
                    .catch((e) => reject(e));
            } else {
                insertMessage(message)
                    .then(resolve)
                    .catch((e) => reject(e));
            }
        });
    });

const updateMessage = (message, dbMessage) =>
    new Promise((resolve, reject) => {
        const args = [
            message.getBotKey(),
            message.getMessageString(),
            message.getMessageType(),
            message.getMessageOptionsString(),
            message.isMessageByBot() ? 1 : 0,
            moment(message.getMessageDate()).valueOf(),
            message.isRead() ? 1 : dbMessage.isRead(),
            message.isFavorite() ? 1 : 0,
            message.getCreatedBy(),
            message.isCompleted() ? 1 : 0,
            message.getStatus(),
            message.getMessageId()
        ];

        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.updateMessageById,
                args,
                (tx, res) => {
                    selectMessageById(message.getMessageId())
                        .then(resolve)
                        .catch((e) => {
                            utilsCapability.addLogEntry({
                                type: 'SYSTEM',
                                entry: {
                                    level: 'LOG',
                                    message: 'DB ERROR'
                                },
                                data: {
                                    location: 'updateMessage',
                                    e: JSON.stringify(e),
                                    t: JSON.stringify(tx)
                                }
                            });
                            reject(e);
                        });
                },
                (tx, err) => {
                    utilsCapability.addLogEntry({
                        type: 'SYSTEM',
                        entry: {
                            level: 'LOG',
                            message: 'DB ERROR'
                        },
                        data: {
                            location: 'updateMessage',
                            e: JSON.stringify(err),
                            t: JSON.stringify(tx)
                        }
                    });
                    reject(err);
                }
            );
        });
    });

const insertMessage = (message) =>
    new Promise((resolve, reject) => {
        const args = [
            message.getMessageId(),
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
            message.getStatus()
        ];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.insertMessage,
                args,
                (tx, res) => {
                    selectMessageById(message.getMessageId())
                        .then((msg) => {
                            resolve();
                        })
                        .catch((e) => {
                            utilsCapability.addLogEntry({
                                type: 'SYSTEM',
                                entry: {
                                    level: 'LOG',
                                    message: 'DB ERROR'
                                },
                                data: {
                                    location: 'insertMessage1',
                                    e: JSON.stringify(e),
                                    t: JSON.stringify(tx),
                                    res: JSON.stringify(res)
                                }
                            });
                            reject(e);
                        });
                },
                (tx, err) => {
                    reject(err);
                }
            );
        });
    });

const markBotMessageAsRead = (botkey, messageId) =>
    new Promise((resolve, reject) => {
        const args = [messageId, botkey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.markAsRead,
                args,
                () => {
                    resolve(true);
                },
                (tx, err) => {
                    reject(err);
                }
            );
        });
    });

const markBotMessageAsFavorite = (botkey, messageId) =>
    new Promise((resolve, reject) => {
        const args = [messageId, botkey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.markAsFavorite,
                args,
                () => resolve(true),
                (tx, err) => reject(err)
            );
        });
    });

const markBotMessageAsUnFavorite = (botkey, messageId) =>
    new Promise((resolve, reject) => {
        const args = [messageId, botkey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.markAsUnFavorite,
                args,
                () => resolve(true),
                (tx, err) => reject(err)
            );
        });
    });

const markAllBotMessagesAsRead = (botkey) =>
    new Promise((resolve, reject) => {
        const args = [botkey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.getAllBotUnreadMessageIds,
                args,
                (tx1, unreadMessageResult) => {
                    unreadMessageResult = unreadMessageResult || {};
                    unreadMessageResult = Utils.addArrayToSqlResults(
                        unreadMessageResult
                    );

                    const dbResults = unreadMessageResult.rows
                        ? unreadMessageResult.rows._array
                            ? unreadMessageResult.rows._array
                            : []
                        : [];

                    transaction.executeSql(
                        messageSql.markAllBotMessagesAsRead,
                        args,
                        (tx, res) => {
                            res = res || {};
                            res = Utils.addArrayToSqlResults(res);
                            return resolve(dbResults);
                        },
                        (tx, err) => reject(err)
                    );
                },
                (tx, err) => reject(err)
            );
        });
    });

const unreadMessageCount = (botkey, currentUserID) =>
    new Promise((resolve, reject) => {
        const args = [botkey, currentUserID];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.unreadCount,
                args,
                (tx, res) => {
                    res = Utils.addArrayToSqlResults(res);
                    const dbResults = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve(0);
                    }
                    return resolve(dbResults[0]['COUNT(*)']);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectMessages = (botkey, limit, offset, ignoreMessagesOfType = []) =>
    new Promise((resolve, reject) => {
        ignoreMessagesOfType = ignoreMessagesOfType || [];
        let args = [botkey];
        db.transaction((transaction) => {
            let sql = messageSql.selectRecentMessages;

            // If we need to ignore certain message types then modify sql and args
            try {
                if (ignoreMessagesOfType.length > 0) {
                    let andClause = ' AND message_type not in (';
                    ignoreMessagesOfType.forEach((msgType) => {
                        andClause += '?,';
                        args.push(msgType);
                    });
                    // Remove last comma, and close it
                    andClause = `${andClause.slice(0, -1)}) `;
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

            transaction.executeSql(
                sql,
                args,
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) => {
                        const message = messageFromDatabaseRow(msg);
                        return message.toBotDisplay();
                    });
                    return resolve(messages);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectMessagesOfType = (botkey, messageType) =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.selectMessagesOfType,
                [botkey, messageType],
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) => {
                        const message = messageFromDatabaseRow(msg);
                        return message;
                    });
                    return resolve(messages);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectMessagesBeforeDate = (conversationId, limit, date) =>
    new Promise((resolve, reject) => {
        const args = [conversationId, date, limit];
        db.transaction((transaction) => {
            const sql = messageSql.selectMessagesBeforeDate;

            transaction.executeSql(
                sql,
                args,
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) => {
                        const message = messageFromDatabaseRow(msg);
                        return message.toBotDisplay();
                    });
                    return resolve(messages);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectMessagesAfterDate = (conversationId, date) =>
    new Promise((resolve, reject) => {
        const args = [conversationId, date];
        db.transaction((transaction) => {
            const sql = messageSql.selectMessagesAfterDate;

            transaction.executeSql(
                sql,
                args,
                (tx, unreadMessageResult) => {
                    unreadMessageResult = unreadMessageResult || {};
                    unreadMessageResult = Utils.addArrayToSqlResults(
                        unreadMessageResult
                    );

                    const dbResults = unreadMessageResult.rows
                        ? unreadMessageResult.rows._array
                            ? unreadMessageResult.rows._array
                            : []
                        : [];
                    return resolve(dbResults);
                },
                (tx, err) => reject(err)
            );
        });
    });

const messageFromDatabaseRow = (msg) => {
    const opts = {
        uuid: msg.message_id,
        botKey: msg.bot_key,
        msg: msg.msg,
        messageType: msg.message_type,
        options: msg.options,
        addedByBot: !!msg.added_by_bot,
        messageDate: moment(msg.message_date).toDate(),
        isRead: msg.read === 1,
        isFavorite: msg.is_favorite === 1,
        createdBy: msg.created_by,
        completed: msg.completed === 1,
        status: msg.status
    };
    const message = new Message(opts);
    return message;
};

const selectFavoriteMessages = (limit, offset) =>
    new Promise((resolve, reject) => {
        const args = [limit, offset];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.selectFavoriteMessages,
                args,
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbMessages = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const messages = dbMessages.map((msg) =>
                        messageFromDatabaseRow(msg).toBotDisplay()
                    );
                    return resolve(messages);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectUserMessageCountSince = (botkey, sinceDateString) =>
    new Promise((resolve, reject) => {
        // Empty string means since beginning
        sinceDateString = sinceDateString || '';
        const args = [botkey, sinceDateString];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.totalUserMessageCountSince,
                args,
                (tx, res) => {
                    res = Utils.addArrayToSqlResults(res);
                    const dbResults = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve(0);
                    }
                    return resolve(dbResults[0]['COUNT(*)']);
                },
                (tx, err) => reject(err)
            );
        });
    });

const moveMessagesToNewBotKey = (fromBotKey, toBotKey) =>
    new Promise((resolve, reject) => {
        const args = [toBotKey, fromBotKey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.moveMessagesToNewBotKey,
                args,
                () => resolve(true),
                (tx, err) => reject(err)
            );
        });
    });

const deleteBotMessages = (botKey) =>
    new Promise((resolve, reject) => {
        const args = [botKey];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.deleteBotMessages,
                args,
                () => resolve(true),
                (tx, err) => reject(new Error('Unable to delete bot messages'))
            );
        });
    });

const deleteMessage = (messageId) =>
    new Promise((resolve, reject) => {
        const args = [messageId];
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.deleteMessage,
                args,
                () => resolve(true),
                (tx, err) => reject(new Error('Unable to delete message'))
            );
        });
    });

const addCompletedColumn = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.addCompletedColumn,
                [],
                () => resolve(true),
                (tx, err) => reject(new Error('Unable to add completed column'))
            );
        });
    });

const createMessageDateIndex = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.addMessageCreatedAtIndex,
                [],
                () => resolve(true),
                (tx, err) =>
                    reject(new Error('Unable to add index on Message table'))
            );
        });
    });

const addStatusColumn = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.addStatusColumn,
                [],
                () => resolve(true),
                (tx, err) => reject(new Error('Unable to add status column'))
            );
        });
    });

const deleteAllMessages = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                messageSql.deleteAllMessages,
                [],
                () => resolve(),
                (tx, err) => reject(error)
            );
        });
    });

const lastMessageDate = () =>
    new Promise((resolve, reject) => {
        const args = [];
        db.transaction((transaction) => {
            const sql = messageSql.lastMessageDate;

            transaction.executeSql(
                sql,
                args,
                (tx, lastMessageDateResult) => {
                    lastMessageDateResult = lastMessageDateResult || {};
                    lastMessageDateResult = Utils.addArrayToSqlResults(
                        lastMessageDateResult
                    );

                    const dbResults = lastMessageDateResult.rows
                        ? lastMessageDateResult.rows._array
                            ? lastMessageDateResult.rows._array
                            : []
                        : [];
                    return resolve(dbResults);
                },
                (tx, err) => reject(err)
            );
        });
    });

export default {
    createMessageTable,
    createV2MessageTable,
    migrateToV2Messages,
    insertMessage,
    selectMessages,
    selectMessagesOfType,
    unreadMessageCount,
    selectUserMessageCountSince,
    markAllBotMessagesAsRead,
    markBotMessageAsRead,
    markBotMessageAsUnFavorite,
    markBotMessageAsFavorite,
    selectFavoriteMessages,
    moveMessagesToNewBotKey,
    deleteBotMessages,
    addCompletedColumn,
    insertOrUpdateMessage,
    selectMessagesBeforeDate,
    createMessageDateIndex,
    selectMessageById,
    deleteAllMessages,
    deleteMessage,
    addStatusColumn,
    selectMessagesAfterDate,
    lastMessageDate
};
