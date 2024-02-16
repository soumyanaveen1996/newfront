import moment from 'moment';
import _ from 'lodash';
import Promise from '../Promise';
import { db } from './db';
import controlSql from './controlSql';
import Utils from '../utils/index';
import utilsCapability from '../capability/Utils';

const createControlTable = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.createControlTable,
                null,
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

const insertControl = (
    controlId,
    content,
    type,
    controlDate,
    originalMessageId,
    options
) =>
    new Promise((resolve, reject) => {
        console.log(
            '%c saveControl inserting controll',
            'color:green',
            controlId,
            type,
            content
        );
        const args = [
            controlId,
            JSON.stringify(content),
            type,
            moment(controlDate).valueOf(),
            originalMessageId,
            JSON.stringify(options)
        ];
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.insertControl,
                args,
                (tx, res) => resolve(true),
                (tx, err) => {
                    utilsCapability.addLogEntry({
                        type: 'SYSTEM',
                        entry: {
                            level: 'LOG',
                            message: 'DB ERROR'
                        },
                        data: {
                            location: 'insertControl',
                            e: JSON.stringify(err),
                            t: JSON.stringify(tx)
                        }
                    });
                    reject(err);
                }
            );
        });
    });

const updateControl = (controlId, content, type, controlDate, options) =>
    new Promise((resolve, reject) => {
        console.log(
            '%c saveControl updating controll',
            'color:green',
            controlId,
            type
        );
        const args = [
            JSON.stringify(content),
            type,
            moment(controlDate).valueOf(),
            JSON.stringify(options),
            controlId
        ];
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.updateControl,
                args,
                (tx, res) => resolve(true),
                (tx, err) => {
                    utilsCapability.addLogEntry({
                        type: 'SYSTEM',
                        entry: {
                            level: 'LOG',
                            message: 'DB ERROR'
                        },
                        data: {
                            location: 'updateControl',
                            e: JSON.stringify(err),
                            t: JSON.stringify(tx)
                        }
                    });
                    reject(err);
                }
            );
        });
    });

const getContentById = (controlId) =>
    new Promise((resolve, reject) => {
        console.log('%c getContentById ', 'color:green', controlId);
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.selectContentById,
                [controlId],
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbControl = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const contents = _.map(dbControl, (ctrl) =>
                        JSON.parse(ctrl.content)
                    );
                    return resolve(contents[0]);
                },
                (tx, err) => reject(err)
            );
        });
    });

const getOptionsById = (controlId) =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.selectOptionsById,
                [controlId],
                (tx, res) => {
                    res = res || {};
                    res = Utils.addArrayToSqlResults(res);
                    const dbControl = res.rows
                        ? res.rows._array
                            ? res.rows._array
                            : []
                        : [];
                    const options = _.map(dbControl, (ctrl) =>
                        JSON.parse(ctrl.options)
                    );
                    return resolve(options[0]);
                },
                (tx, err) => reject(err)
            );
        });
    });

const controlExist = (controlId) =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.selectContentById,
                [controlId],
                (tx, res) => {
                    if (res.rows.length > 0) {
                        return resolve(true);
                    }
                    return resolve(false);
                },
                (tx, err) => reject(err)
            );
        });
    });

const addOptions = () =>
    new Promise((resolve, reject) => {
        db.transaction((transaction) => {
            transaction.executeSql(
                controlSql.addOptions,
                [],
                () => resolve(true),
                (tx, err) => reject(new Error('Unable to add options column'))
            );
        });
    });

export default {
    createControlTable,
    getContentById,
    insertControl,
    updateControl,
    controlExist,
    getOptionsById,
    addOptions
};
