import Promise from '../Promise';
import { db } from './db';
import channelContactSql from './channelContactSql';
import Utils from '../utils/index';
import _ from 'lodash';


const createChannelContactsTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(channelContactSql.createChannelContactsTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const insertChannelContact = (id, name, email, screenName, givenName, surname) => new Promise((resolve, reject) => {
    const args = [id, name, email, screenName, givenName, surname];
    db.transaction(tx => {
        tx.executeSql(channelContactSql.insertChannelContact, args, function success(tx, res) {
            return resolve({
                id: id,
                name: name,
                email: email,
                screenName: screenName,
                givenName: givenName,
                surname: surname
            });
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteChannelContact = (id) => new Promise((resolve, reject) => {
    const args = [id];
    db.transaction(tx => {
        tx.executeSql(channelContactSql.deleteChannelContact, args, function success(tx, res) {
            return resolve(id || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const channelContactDataFromDbResult = (dbResult) => {
    return {
        id: dbResult.id,
        name: dbResult.name,
        email: dbResult.email,
        givenName: dbResult.givenName,
        surname: dbResult.surname,
        screenName: dbResult.screenName
    };
}


const selectChannelContact = (id) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelContactSql.selectChannelContact, [id], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                return resolve(channelContactDataFromDbResult(dbResults[0]));
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectAllContacts = (id) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelContactSql.selectAllContacts, [], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                let contacts = _.map(dbResults, (dbResult) => channelContactDataFromDbResult(dbResult));
                return resolve(contacts);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

export default {
    createChannelContactsTable,
    insertChannelContact,
    deleteChannelContact,
    selectChannelContact,
    selectAllContacts,
};
