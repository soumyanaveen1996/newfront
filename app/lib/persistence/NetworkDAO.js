import Promise from '../Promise';
import { db } from './db';
import networkSql from './networkSql';
import moment from 'moment';
import Utils from '../utils/index';
import _ from 'lodash';

/**
 * Create the network_queue table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createNetworkRequestQueueTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(networkSql.createNetworkQueueTable, null, function success() {
            return resolve();
        }, function failure(tx2, err) {
            return reject(err);
        });
    });
});

const insertNetworkRequest = (key, requestOptions, status = networkSql.STATUS_CONSTANTS.pending, result = '', messageId = '', createdAt = undefined, updatedAt = undefined) => new Promise((resolve, reject) => {
    const createdAtMilliSeconds = moment(createdAt).valueOf();
    const updatedAtMilliSeconds = moment(updatedAt).valueOf();
    let requestFormatted = '';
    let resultFormatted = '';
    try {
        requestFormatted = JSON.stringify(requestOptions);
        resultFormatted = JSON.stringify(result);
    } catch (error) {
        return reject(error);
    }

    const args = [key, status, requestFormatted, createdAtMilliSeconds, updatedAtMilliSeconds, resultFormatted, messageId];
    db.transaction(tx => {
        tx.executeSql(networkSql.insertNetworkOperation, args, function success(tx2, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx3, err) {
            return reject(err);
        });
    });
});

const updateNetworkRequestStatus = (id, status, result) => new Promise((resolve, reject) => {
    let resultFormatted = '';
    try {
        resultFormatted = JSON.stringify(result);
    } catch (error) {
        // ignore
    }
    const args = [status, moment().format(), resultFormatted, id];
    db.transaction(tx => {
        tx.executeSql(networkSql.updateRequest, args, function success() {
            return resolve();
        }, function failure(tx2, err) {
            return reject(err);
        });
    });
});

const deleteNetworkRequest = (id) => new Promise((resolve, reject) => {
    const args = [id];
    db.transaction(tx => {
        tx.executeSql(networkSql.deleteNetworkOperation, args, function success() {
            return resolve();
        }, function failure(tx2, err) {
            return reject(err);
        });
    });
});

const selectFirstPendingNetworkRequest = () => new Promise((resolve, reject) => {
    const args = [];
    db.transaction(tx => {
        tx.executeSql(networkSql.selectPendingEarliestNetworkRequest, args, function success(tx2, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve();
            } else {
                let requestFormatted = null;
                try {
                    requestFormatted = JSON.parse(dbResults[0].request);
                } catch (error) {
                    return reject(error);
                }

                let nw = {
                    id: dbResults[0].id,
                    key: dbResults[0].key,
                    request: requestFormatted,
                    messageId: dbResults[0].message_id,
                };
                return resolve(nw);
            }
        }, function failure(tx3, err) {
            return reject(err);
        });
    });
});

const selectByMessageId = (messageId) => new Promise((resolve, reject) => {
    const args = [messageId];
    db.transaction(tx => {
        tx.executeSql(networkSql.selectByMessageId, args, function success(tx2, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            console.log('Db results : ', dbResults);
            if (dbResults.length === 0) {
                return resolve();
            } else {
                let nw = {
                    id: dbResults[0].id,
                    key: dbResults[0].key,
                    messageId: dbResults[0].message_id,
                };
                return resolve(nw);
            }
        }, function failure(tx3, err) {
            return reject(err);
        });
    });
});

const selectCompletedNetworkRequests = (key) => new Promise((resolve, reject) => {
    const args = [key];
    db.transaction(tx => {
        tx.executeSql(networkSql.selectCompletedtNetworkRequestForKey, args, function success(tx2, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];

            if (dbResults.length === 0) {
                return resolve();
            }
            let formattedResults = dbResults.map((dbResult) => {
                let resultFormatted = null;
                try {
                    resultFormatted = JSON.parse(dbResult.result);
                } catch (error) {
                    return reject(error);
                }
                return {
                    id: dbResult.id,
                    key: dbResult.key,
                    result: resultFormatted,
                    messageId: dbResult.message_id,
                };
            });
            return resolve(formattedResults);
        }, function failure(tx3, err) {
            return reject(err);
        });
    });
});


const createV2NetworkQueueTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(networkSql.createV2NetworkQueueTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const renameToTemp = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql('ALTER TABLE network_queue RENAME TO tmp_network_queue;', null, function success() {
            return resolve();
        }, function failure(tx, err) {
            console.log('error : ', err);
            return reject(err);
        });
    });
})

const dropTempTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql('DROP TABLE tmp_network_queue;', null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const selectAllTempOperations = () => new Promise((resolve, reject) => {
    const sql = `
    SELECT
        id,
        key,
        status,
        request,
        created_at_date,
        updated_at_date,
        result
    FROM tmp_network_queue
    `;

    db.transaction(transaction => {
        transaction.executeSql(sql, [], function success(tx, res) {
            res = res || {};
            res = Utils.addArrayToSqlResults(res);
            let dbOperations = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            let operations = dbOperations.map((dbOperation) => {
                return {
                    id: dbOperation.id,
                    key: dbOperation.key,
                    status: dbOperation.status,
                    request: JSON.parse(dbOperation.request),
                    created_at_date: moment(dbOperation.created_at_date).toDate(),
                    updated_at_date: moment(dbOperation.updated_at_date).toDate(),
                    result: JSON.parse(dbOperation.result),
                };
            });
            return resolve(operations);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const migrateToV2NetworkQueue = () => new Promise((resolve, reject) => {
    renameToTemp()
        .then(() => {
            return createV2NetworkQueueTable();
        })
        .then(() => {
            return selectAllTempOperations();
        })
        .then((operations) => {
            return Promise.all(_.map(operations, (operation) => {
                return insertNetworkRequest(
                    operation.key,
                    operation.request,
                    operation.status,
                    operation.result,
                    operation.created_at_date,
                    operation.updated_at_date,
                    ''
                )
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

const migrateToV3NetworkQueue = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(networkSql.createV3NetworkQueueTable, null, function success() {
            return resolve();
        }, function failure(tx2, err) {
            return reject(err);
        });
    });
});

const deleteAllRows = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(networkSql.deleteAllRows, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

export default {
    createNetworkRequestQueueTable: createNetworkRequestQueueTable,
    insertNetworkRequest: insertNetworkRequest,
    updateNetworkRequestStatus: updateNetworkRequestStatus,
    deleteNetworkRequest: deleteNetworkRequest,
    selectFirstPendingNetworkRequest: selectFirstPendingNetworkRequest,
    selectCompletedNetworkRequests: selectCompletedNetworkRequests,
    selectByMessageId: selectByMessageId,
    migrateToV2NetworkQueue: migrateToV2NetworkQueue,
    migrateToV3NetworkQueue: migrateToV3NetworkQueue,
    deleteAllRows: deleteAllRows
};
