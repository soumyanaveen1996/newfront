import Promise from '../Promise';
import { db } from './db';
import conversationSql from './conversationSql';
import moment from 'moment';

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

const insertNetworkRequest = (conversationId, type) => new Promise((resolve, reject) => {
    const nowString = moment().format();
    const args = [conversationId, type, nowString];
    db.transaction(tx => {
        tx.executeSql(conversationSql.insertConversation, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectConversations = (type) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(conversationSql.selectConversations, [type], function success(tx, res) {
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


export default {
    createConversationTable: createConversationTable,
    insertNetworkRequest: insertNetworkRequest,
    selectConversations: selectConversations,
    selectConversation: selectConversation
};
