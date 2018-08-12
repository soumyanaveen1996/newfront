import Promise from '../Promise';
import { db } from './db';
import backgroundTaskSql from './backgroundTaskSql';
import Utils from '../utils/index';

/**
 * Create the message table if it doesn't exist. Should be called during launch (each time is ok)
 */
const createBackgroundTaskTable = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.createBackgroundTaskTable, null, function success() {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const updateBackgroundTaskLastRun = (key, botId, conversationId, lastRunTime) => new Promise((resolve, reject) => {
    const args = [
        lastRunTime,
        key,
        botId,
        conversationId
    ];

    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.updateLastRunTime, args, function success(tx, res) {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const insertBackgroundTask = (key, botId, conversationId, timeInterval, options, lastRunTime = 0) => new Promise((resolve, reject) => {
    const args = [
        key,
        botId,
        conversationId,
        timeInterval,
        JSON.stringify(options),
        lastRunTime
    ];

    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.insertBackgroundTask, args, function success(tx, res) {
            return resolve();
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const deleteBackgroundTask = (key, botId, conversationId) => new Promise((resolve, reject) => {
    const args = [key, botId, conversationId];
    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.deleteBackgroundTask, args, function success() {
            return resolve(true);
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const dbToBackgroundTask = (dbResult) => {
    return {
        key: dbResult.key,
        botId: dbResult.bot_id,
        conversationId: dbResult.conversation_id,
        timeInterval: dbResult.time_interval,
        options: JSON.parse(dbResult.options),
        userDomain: dbResult.domain,
        lastRunTime: dbResult.last_run_time
    };
}

const selectAllBackgroundTasks = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.selectAllBackgroundTasks, [], function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve([]);
            } else {
                let formattedResults = dbResults.map((dbResult) => {
                    return dbToBackgroundTask(dbResult)
                });
                return resolve(formattedResults);
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});

const selectBackgroundTask = (key, botId, conversationId) => new Promise((resolve, reject) => {
    const args = [key, botId, conversationId];
    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.selectBackgroundTask, args, function success(tx, res) {
            res = Utils.addArrayToSqlResults(res);
            let dbResults = res.rows ? (res.rows._array ? res.rows._array : []) : [];
            if (dbResults.length === 0) {
                return resolve(null);
            } else {
                return resolve(dbToBackgroundTask(dbResults[0]));
            }
        }, function failure(tx, err) {
            return reject(err);
        });
    });
});


const insertBackgroundTaskIfNotPresent = (key, botId, conversationId, timeInterval, options, lastRunTime = 0) => new Promise((resolve, reject) => {
    selectBackgroundTask(key, botId, conversationId)
        .then((task) => {
            if (!task) {
                return insertBackgroundTask(key, botId, conversationId, timeInterval, options, lastRunTime);
            } else {
                return resolve(task);
            }
        })
        .then(resolve)
        .catch(reject);
});


const deleteAllTasks = () => new Promise((resolve, reject) => {
    db.transaction(transaction => {
        transaction.executeSql(backgroundTaskSql.deleteAllTasks, [], function success() {
            resolve();
        }, function failure(tx, err) {
            reject(err);
        });
    });
});

export default {
    createBackgroundTaskTable: createBackgroundTaskTable,
    insertBackgroundTask: insertBackgroundTask,
    deleteBackgroundTask: deleteBackgroundTask,
    updateBackgroundTaskLastRun: updateBackgroundTaskLastRun,
    selectAllBackgroundTasks: selectAllBackgroundTasks,
    selectBackgroundTask: selectBackgroundTask,
    insertBackgroundTaskIfNotPresent: insertBackgroundTaskIfNotPresent,
    deleteAllTasks: deleteAllTasks,
};
