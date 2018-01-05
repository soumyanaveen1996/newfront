import Promise from '../Promise';
import { db } from './db';
import networkSql from './networkSql';
import moment from 'moment';
import Utils from '../utils/index';

/**
 * Create the network_queue table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createNetworkRequestQueueTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(networkSql.createNetworkQueueTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertNetworkRequest = (key, requestOptions, status = networkSql.STATUS_CONSTANTS.pending, result = '') => new Promise((resolve, reject) => {
    const nowString = moment().format();
    let requestFormatted = '';
    let resultFormatted = '';
    try {
        requestFormatted = JSON.stringify(requestOptions);
        resultFormatted = JSON.stringify(result);
    } catch (error) {
        return reject(error);
    }

    const args = [key, status, requestFormatted, nowString, nowString, resultFormatted];
    db.transaction(tx => {
        tx.executeSql(networkSql.insertNetworkOperation, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
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
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteNetworkRequest = (id) => new Promise((resolve, reject) => {
    const args = [id];
    db.transaction(tx => {
        tx.executeSql(networkSql.deleteNetworkOperation, args, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectFirstPendingNetworkRequest = () => new Promise((resolve, reject) => {
    const args = [];
    db.transaction(tx => {
        tx.executeSql(networkSql.selectPendingEarliestNetworkRequest, args, function success(tx, res) {
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
                    request: requestFormatted
                };
                return resolve(nw);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectCompletedNetworkRequests = (key) => new Promise((resolve, reject) => {
    const args = [key];
    db.transaction(tx => {
        tx.executeSql(networkSql.selectCompletedtNetworkRequestForKey, args, function success(tx, res) {
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
                    result: resultFormatted
                };
            });
            return resolve(formattedResults);
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
    selectCompletedNetworkRequests: selectCompletedNetworkRequests
};
