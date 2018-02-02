import Promise from '../Promise';
import { db } from './db';
import conversationSql from './conversationSql';
import moment from 'moment';
import Utils from '../utils/index';

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

const insertConversation = (conversationId, type) => new Promise((resolve, reject) => {
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


export default {
    createConversationTable: createConversationTable,
    insertConversation: insertConversation,
    deleteConversation: deleteConversation,
    selectConversations: selectConversations,
    selectConversation: selectConversation,
    updateConversationId: updateConversationId
};
