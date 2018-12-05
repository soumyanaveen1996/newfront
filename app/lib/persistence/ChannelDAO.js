import Promise from '../Promise';
import { db } from './db';
import channelSql from './channelSql';
import Utils from '../utils/index';

const createChannelsTable = () =>
    new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                channelSql.createChannelsTable,
                null,
                function success() {
                    return resolve();
                },
                function failure(tx2, err) {
                    return reject(err);
                }
            );
        });
    });

const insertChannel = (
    name,
    description,
    logo,
    domain,
    channelId,
    ownerEmail,
    ownerName,
    ownerId,
    createdOn,
    subcription,
    isPlatformChannel,
    channelType
) =>
    new Promise((resolve, reject) => {
        let isPlatform = isPlatformChannel ? 1 : 0;
        const args = [
            name,
            description,
            logo,
            domain,
            channelId,
            ownerEmail,
            ownerName,
            ownerId,
            createdOn,
            subcription,
            isPlatform,
            channelType
        ];
        db.transaction(tx => {
            tx.executeSql(
                channelSql.insertChannel,
                args,
                function success(tx2, res) {
                    console.log('res : ', res);
                    return resolve(+res.insertId || 0);
                },
                function failure(tx3, err) {
                    return reject(err);
                }
            );
        });
    });

const deleteChannel = channelId =>
    new Promise((resolve, reject) => {
        const args = [channelId];
        db.transaction(tx => {
            tx.executeSql(
                channelSql.deleteChannel,
                args,
                function success(tx2, res) {
                    return resolve(+res.insertId || 0);
                },
                function failure(tx3, err) {
                    return reject(err);
                }
            );
        });
    });

const updateConversationForChannel = (name, domain, conversationId) =>
    new Promise((resolve, reject) => {
        const args = [conversationId, name, domain];
        db.transaction(tx => {
            tx.executeSql(
                channelSql.updateConversationForChannel,
                args,
                function success(tx2, res) {
                    return resolve(+res.insertId || 0);
                },
                function failure(tx3, err) {
                    return reject(err);
                }
            );
        });
    });

const updateChannel = (name, domain, desc) =>
    new Promise((resolve, reject) => {
        const args = [desc, name, domain];
        console.log('ChannelDAO::updateChannel::', args);
        db.transaction(tx => {
            tx.executeSql(
                channelSql.updateChannel,
                args,
                function success(tx2, res) {
                    console.log('ChannelDAO::updateChannel::', args);
                    return resolve(+res.insertId || 0);
                },
                function failure(tx3, err) {
                    return reject(err);
                }
            );
        });
    });

const updateChannelSubscription = (name, domain, subscription) =>
    new Promise((resolve, reject) => {
        const args = [subscription, name, domain];
        console.log('ChannelDAO::updateChannel::', args);
        db.transaction(tx => {
            tx.executeSql(
                channelSql.setChannelSubscription,
                args,
                function success(tx2, res) {
                    console.log('ChannelDAO::Subscribe Updated::', args);
                    return resolve(+res.insertId || 0);
                },
                function failure(tx3, err) {
                    return reject(err);
                }
            );
        });
    });

const selectChannels = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.selectChannels,
                [],
                function success(tx, res) {
                    res = Utils.addArrayToSqlResults(res);
                    console.log('in the success ====== ', res);
                    let dbResults = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve([]);
                    } else {
                        let formattedResults = dbResults.map(dbResult => {
                            return channelDataFromDbResult(dbResult);
                        });
                        return resolve(formattedResults);
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const channelDataFromDbResult = dbResult => {
    return {
        id: dbResult.id,
        channelName: dbResult.name,
        description: dbResult.desc,
        logo: dbResult.logo,
        userDomain: dbResult.domain,
        channelId: dbResult.conversationId,
        ownerEmail: dbResult.ownerEmail,
        ownerName: dbResult.ownerName,
        ownerId: dbResult.ownerId,
        createdOn: dbResult.createdOn,
        subcription: dbResult.subcription,
        isPlatformChannel: dbResult.isPlatformChannel,
        channelType: dbResult.channelType
    };
};

const selectChannelByConversationId = conversationId =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.selectChannelByConversationId,
                [conversationId],
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
                        return resolve(channelDataFromDbResult(dbResults[0]));
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const selectChannel = channelId =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.selectChannel,
                [channelId],
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
                        return resolve(channelDataFromDbResult(dbResults[0]));
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const selectChannelByNameAndDomain = (name, domain) =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.selectChannelByNameAndDomain,
                [name, domain],
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
                        return resolve(channelDataFromDbResult(dbResults[0]));
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const insertIfNotPresent = (
    name,
    description,
    logo,
    domain,
    channelId,
    ownerEmail,
    ownerName,
    ownerId,
    createdOn,
    subcription,
    isPlatformChannel,
    channelType
) =>
    new Promise((resolve, reject) => {
        selectChannelByNameAndDomain(name, domain)
            .then(channel => {
                if (!channel) {
                    let isPlatform = isPlatformChannel ? 1 : 0;
                    return insertChannel(
                        name,
                        description,
                        logo,
                        domain,
                        channelId,
                        ownerEmail,
                        ownerName,
                        ownerId,
                        createdOn,
                        subcription,
                        isPlatform,
                        channelType
                    );
                } else {
                    resolve();
                }
            })
            .then(resolve)
            .catch(reject);
    });

const deleteAllChannels = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.deleteAllChannels,
                null,
                function success() {
                    return resolve();
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const addOwnerColumn = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addOwnerColumn,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(
                        new Error('Unable to add Owner Email column')
                    );
                }
            );
        });
    });

const addOwnerName = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addOwnerName,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(new Error('Unable to add Name column'));
                }
            );
        });
    });

const addOwnerId = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addOwnerId,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(new Error('Unable to add status column'));
                }
            );
        });
    });
const addCreatedOn = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addCreatedOn,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(new Error('Unable to add createdOn column'));
                }
            );
        });
    });
const addisSubscribed = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addisSubscribed,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(
                        new Error('Unable to add subcription column')
                    );
                }
            );
        });
    });

const addisPlatform = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addIsPlatformChannel,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(new Error('Unable to add platform column'));
                }
            );
        });
    });

const addChannelType = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                channelSql.addChannelType,
                [],
                function success() {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(
                        new Error('Unable to add channelType column')
                    );
                }
            );
        });
    });

export default {
    createChannelsTable,
    insertChannel,
    deleteChannel,
    updateConversationForChannel,
    updateChannel,
    selectChannel,
    selectChannels,
    deleteAllChannels,
    selectChannelByNameAndDomain,
    insertIfNotPresent,
    selectChannelByConversationId,
    addOwnerColumn,
    addOwnerName,
    addOwnerId,
    addCreatedOn,
    addisSubscribed,
    addisPlatform,
    addChannelType,
    updateChannelSubscription
};
