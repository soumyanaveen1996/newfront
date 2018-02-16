import Promise from '../Promise';
import { db } from './db';
import conversationSql from './conversationSql';
import moment from 'moment';
import Utils from '../utils/index';
import _ from 'lodash';

/**
 * Create the network_queue table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createConversationTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(conversationSql.createConversationTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertConversation = (conversationId, type, createdAt = undefined) => new Promise((resolve, reject) => {
    const nowMilliSeconds = moment(createdAt).valueOf();
    const args = [conversationId, type, nowMilliSeconds];
    db.transaction(tx => {
        tx.executeSql(conversationSql.insertConversation, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteConversation = (conversationId, type) => new Promise((resolve, reject) => {
    const args = [conversationId, type];
    db.transaction(tx => {
        tx.executeSql(conversationSql.deleteConversation, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const updateConversationId = (oldConversationId, newConversationId) => new Promise((resolve, reject) => {
    const args = [newConversationId, oldConversationId];
    db.transaction(tx => {
        tx.executeSql(conversationSql.updateConversation, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectConversations = (type) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(conversationSql.selectConversations, [type], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve([]);
            } else {
                let formattedResults = dbResults.map((dbResult) => {
                    return {
                        id: dbResult.id,
                        conversationId: dbResult.conversationId
                    };
                });
                return resolve(formattedResults);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectConversation = (conversationId, type) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(conversationSql.selectConversation, [type, conversationId], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                const formattedResults = {
                    id: dbResults[0].id,
                    conversationId: dbResults[0].conversationId
                };
                return resolve(formattedResults);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});



const createV2ConversationTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(conversationSql.createV2ConversationTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const renameToTemp = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql('ALTER TABLE conversation RENAME TO tmp_conversations;', null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
})

const dropTempTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql('DROP TABLE tmp_conversations;', null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const selectAllTempConversations = () => new Promise((resolve, reject) => {
    const sql = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM tmp_conversations
    `;

    db.transaction(transaction => {
        transaction.executeSql(sql, [], function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbConversations = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let conversations = dbConversations.map((dbConversation) => {
                return {
                    id: dbConversation.id,
                    conversationId: dbConversation.conversationId,
                    type: dbConversation.type,
                    created_at_date: moment(dbConversation.created_at_date).toDate(),
                };
            });
            return resolve(conversations);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const migrateToV2Conversations = () => new Promise((resolve, reject) => {
    renameToTemp()
        .then(() => {
            return createV2ConversationTable();
        })
        .then(() => {
            return selectAllTempConversations();
        })
        .then((conversations) => {
            return Promise.all(_.map(conversations, (conversation) => {
                return insertConversation(conversation.conversationId, conversation.type, conversation.created_at_date)
            }))
        })
        .then(() => {
            resolve();
        })
        .catch((error) => {
            dropTempTable()
                .then(() => {
                    reject(error);
                })
        })
});


const deleteAllConversations = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(conversationSql.deleteAllConversations, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});



export default {
    createConversationTable: createConversationTable,
    insertConversation: insertConversation,
    deleteConversation: deleteConversation,
    selectConversations: selectConversations,
    selectConversation: selectConversation,
    updateConversationId: updateConversationId,
    createV2ConversationTable: createV2ConversationTable,
    migrateToV2Conversations: migrateToV2Conversations,
    deleteAllConversations: deleteAllConversations
};
