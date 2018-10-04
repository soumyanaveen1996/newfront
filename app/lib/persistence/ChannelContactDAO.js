import Promise from '../Promise';
import { db } from './db';
import channelContactSql from './channelContactSql';
import Utils from '../utils/index';
import _ from 'lodash';

const createChannelContactsTable = () =>
    new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                channelContactSql.createChannelContactsTable,
                null,
                function success() {
                    return resolve();
                },
                function failure(transaction, err) {
                    return reject(err);
                }
            );
        });
    });

const insertChannelContact = (id, name, email) =>
    new Promise((resolve, reject) => {
        const args = [id, name, email];
        db.transaction(tx => {
            tx.executeSql(
                channelContactSql.insertChannelContact,
                args,
                function success(tx2, res) {
                    return resolve({
                        userId: id,
                        userName: name,
                        email: email
                    });
                },
                function failure(transaction, err) {
                    return reject(err);
                }
            );
        });
    });

const deleteChannelContact = id =>
    new Promise((resolve, reject) => {
        const args = [id];
        db.transaction(tx => {
            tx.executeSql(
                channelContactSql.deleteChannelContact,
                args,
                function success(tx2, res) {
                    return resolve(id || 0);
                },
                function failure(transaction, err) {
                    return reject(err);
                }
            );
        });
    });

const channelContactDataFromDbResult = dbResult => {
    return {
        userId: dbResult.id,
        userName: dbResult.userName,
        email: dbResult.email
    };
};

const selectChannelContact = id =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelContactSql.selectChannelContact,
                [id],
                function success(tx, res) {
                    res = Utils.addArrayToSqlResults(res);
                    let dbResults = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve(null);
                    } else {
                        return resolve(
                            channelContactDataFromDbResult(dbResults[0])
                        );
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const selectAllContacts = id =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelContactSql.selectAllContacts,
                [],
                function success(tx, res) {
                    res = Utils.addArrayToSqlResults(res);
                    let dbResults = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve(null);
                    } else {
                        let contacts = _.map(dbResults, dbResult =>
                            channelContactDataFromDbResult(dbResult)
                        );
                        return resolve(contacts);
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

export default {
    createChannelContactsTable,
    insertChannelContact,
    deleteChannelContact,
    selectChannelContact,
    selectAllContacts
};
