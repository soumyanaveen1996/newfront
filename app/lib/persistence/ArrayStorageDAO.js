import Promise from '../Promise';
import { db } from './db';
import arrayStorageSql from './arrayStorageSql';
import Utils from '../utils/index';

/**
 * Create the network_queue table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createArrayStorageTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(arrayStorageSql.createArrayStorageTable, null, function success() {
            return resolve();
        }, function failure(t, err) {
            return reject(err);
        });
    });
});

const insertArrayValues = (key, valuesArr = []) => new Promise((resolve, reject) => {
    valuesArr = valuesArr || [];
    if (valuesArr.length < 1) {
        return resolve();
    }
    let sql = arrayStorageSql.insertArrayValues + ' VALUES ';
    const args = [];
    valuesArr.forEach((val) => {
        sql += '(?, ?),';
        args.push(key);
        args.push(JSON.stringify(val));
    });
    // remove last comma
    sql = sql.slice(0, -1);

    db.transaction(tx => {
        tx.executeSql(sql, args, function success(t, res) {
            return resolve(+res.insertId || 0);
        }, function failure(t, err) {
            return reject(err);
        });
    });
});

const selectArrayValues = (key) => new Promise((resolve, reject) => {
    let args = [key];
    db.transaction(transaction => {
        transaction.executeSql(arrayStorageSql.selectArrayValues, args, function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve([]);
            } else {
                let formattedResults = dbResults.map((dbResult) => {
                    return JSON.parse(dbResult.value);
                });
                return resolve(formattedResults);
            }
        }, function failure(t, err) {
            return reject(err);
        });
    });
});

const deleteArrayValues = (key, value = null) => new Promise((resolve, reject) => {
    const args = [key];
    let sql = arrayStorageSql.deleteAllArrayValues;

    if (value) {
        args.push(value);
        sql = arrayStorageSql.deleteArrayValue;
    }
    db.transaction(tx => {
        tx.executeSql(sql, args, function success() {
            return resolve();
        }, function failure(t, err) {
            return reject(err);
        });
    });
});

const deleteAllRows = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(arrayStorageSql.deleteAllRows, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

export default {
    createArrayStorageTable: createArrayStorageTable,
    insertArrayValues: insertArrayValues,
    selectArrayValues: selectArrayValues,
    deleteArrayValues: deleteArrayValues,
    deleteAllRows: deleteAllRows,
};
