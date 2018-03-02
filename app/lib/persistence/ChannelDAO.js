import Promise from '../Promise';
import { db } from './db';
import channelSql from './channelSql';
import Utils from '../utils/index';


const createChannelsTable = () => new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(channelSql.createChannelsTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const insertChannel = (name, description, logo, domain) => new Promise((resolve, reject) => {
    const args = [name, description, logo, domain];
    db.transaction(tx => {
        tx.executeSql(channelSql.insertChannel, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteChannel = (channelId) => new Promise((resolve, reject) => {
    const args = [channelId];
    db.transaction(tx => {
        tx.executeSql(channelSql.deleteChannel, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const updateConversationForChannel = (name, domain, conversationId) => new Promise((resolve, reject) => {
    const args = [conversationId, name, domain];
    db.transaction(tx => {
        tx.executeSql(channelSql.updateConversationForChannel, args, function success(tx, res) {
            return resolve(+res.insertId || 0);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const selectChannels = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelSql.selectChannels, [], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve([]);
            } else {
                let formattedResults = dbResults.map((dbResult) => {
                    return channelDataFromDbResult(dbResult)
                });
                return resolve(formattedResults);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const channelDataFromDbResult = (dbResult) => {
    return {
        id: dbResult.id,
        name: dbResult.name,
        desc: dbResult.desc,
        logo: dbResult.logo,
        conversationId: dbResult.conversationId,
        domain: dbResult.domain
    };
}
selectChannelByConversationId

const selectChannelByConversationId = (conversationId) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelSql.selectChannelByConversationId, [conversationId], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                return resolve(channelDataFromDbResult(dbResults[0]));
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectChannel = (channelId) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelSql.selectChannel, [channelId], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                return resolve(channelDataFromDbResult(dbResults[0]));
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectChannelByNameAndDomain = (name, domain) => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelSql.selectChannelByNameAndDomain, [name, domain], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                return resolve(channelDataFromDbResult(dbResults[0]));
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertIfNotPresent = (name, description, logo, domain) => new Promise((resolve, reject) => {
    selectChannelByNameAndDomain(name, domain)
        .then((channel) => {
            if (!channel) {
                return insertChannel(name, description, logo, domain);
            } else {
                resolve();
            }
        })
        .then(resolve)
        .catch(reject);
});

const deleteAllChannels = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(channelSql.deleteAllChannels, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});



export default {
    createChannelsTable,
    insertChannel,
    deleteChannel,
    updateConversationForChannel,
    selectChannel,
    selectChannels,
    deleteAllChannels,
    selectChannelByNameAndDomain,
    insertIfNotPresent,
    selectChannelByConversationId
};
