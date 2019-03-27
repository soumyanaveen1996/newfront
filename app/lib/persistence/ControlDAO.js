import Promise from '../Promise';
import moment from 'moment';
import { db } from './db';
import controlSql from './controlSql';
import Utils from '../utils/index';
import _ from 'lodash';

const createControlTable = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                controlSql.createControlTable,
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

const insertControl = (
    controlId,
    content,
    type,
    controlDate,
    originalMessageId
) =>
    new Promise((resolve, reject) => {
        const args = [
            controlId,
            JSON.stringify(content),
            type,
            moment(controlDate).valueOf(),
            originalMessageId
        ];
        db.transaction(transaction => {
            transaction.executeSql(
                controlSql.insertControl,
                args,
                function success(tx, res) {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const updateControl = (controlId, content, type, controlDate) =>
    new Promise((resolve, reject) => {
        const args = [
            JSON.stringify(content),
            type,
            moment(controlDate).valueOf(),
            controlId
        ];
        db.transaction(transaction => {
            transaction.executeSql(
                controlSql.updateControl,
                args,
                function success(tx, res) {
                    return resolve(true);
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const getContentById = controlId =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                controlSql.selectContentById,
                [controlId],
                function success(tx, res) {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    let dbControl = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    let contents = _.map(dbControl, ctrl => {
                        return JSON.parse(ctrl.content);
                    });
                    return resolve(contents[0]);
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

const controlExist = controlId =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                controlSql.selectContentById,
                [controlId],
                function success(tx, res) {
                    if (res.rows.length > 0) {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                },
                function failure(tx, err) {
                    return reject(err);
                }
            );
        });
    });

export default {
    createControlTable: createControlTable,
    getContentById: getContentById,
    insertControl: insertControl,
    updateControl: updateControl,
    controlExist: controlExist
};
