import Promise from '../Promise';
import { db } from './db';
import dbVersionSql from './dbVersionSql';
import Utils from '../utils/index';

const createVersionTable = (version) => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(dbVersionSql.createVersionTable, null, function success() {
            insertVersion(version)
                .then((insertedVersion) => {
                    resolve(insertedVersion);
                })
                .catch((error) => {
                    reject(error);
                })
        }, function failure(tx2, err) {
            return reject(err);
        });
    });
});

const getVersion = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(dbVersionSql.getVersion, [], function success(tx2, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(-1);
            } else {
                return resolve(dbResults[0].version);
            }
        }, function failure(tx3, err) {
            return resolve(-1);
        });
    });
});

const isVersionTablePresent = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(dbVersionSql.tableExists, [], function success(tx2, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(false);
            } else {
                return resolve(dbResults[0].row_count > 0);
            }
        }, function failure(tx3, err) {
            return resolve(-1);
        });
    });
})


const updateVersion = (version) => new Promise((resolve, reject) => {
    const args = [version];
    db.transaction(transaction => {
        transaction.executeSql(dbVersionSql.updateVersion, args, function success() {
            return resolve(version);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertVersion = (version) => new Promise((resolve, reject) => {
    const args = [version];
    db.transaction(transaction => {
        transaction.executeSql(dbVersionSql.insertVersion, args, function success() {
            return resolve(version);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


export default {
    createVersionTable: createVersionTable,
    getVersion: getVersion,
    updateVersion: updateVersion,
    insertVersion: insertVersion,
    isVersionTablePresent: isVersionTablePresent,
};
