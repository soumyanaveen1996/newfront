import { db } from './db';
import Utils from '../utils/index';

const createPhoneContactsTable = `
    CREATE TABLE IF NOT EXISTS phonecontacts (
       contact_id text PRIMARY KEY NOT NULL,
       userName text,
       emailAddresses_work text,
       emailAddresses_home text,
       profileImage text,
       phoneNumbers_land text,
       phoneNumbers_mob text,
       phoneNumbers_sat text

    ) WITHOUT ROWID;
`;

const insertPhoneContact = `
    REPLACE INTO phonecontacts (
        contact_id,
        userName,
        emailAddresses_work,
        emailAddresses_home,
        profileImage,
        phoneNumbers_land,
        phoneNumbers_mob,
        phoneNumbers_sat
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

const selectAllContacts = `
    SELECT
        contact_id,
        userName,
        emailAddresses_work,
        emailAddresses_home,
        profileImage,
        phoneNumbers_land,
        phoneNumbers_mob,
        phoneNumbers_sat
    FROM phonecontacts
    ORDER BY userName desc
`;

const selectAllContactsWithEmail = `
    SELECT
        contact_id,
        userName,
        emailAddresses_work,
        emailAddresses_home,
        profileImage,
        phoneNumbers_land,
        phoneNumbers_mob,
        phoneNumbers_sat
    FROM phonecontacts
    WHERE emailAddresses_work <>'' OR emailAddresses_home <>''
    ORDER BY userName desc
`;

const deleteAllContacts = `
    DELETE FROM phonecontacts;
`;

const createContactsTable = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                createPhoneContactsTable,
                null,
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

const insertContacts = async contacts =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            contacts.forEach(async contact => {
                const args = [
                    contact.userId,
                    contact.userName,
                    contact.emailAddresses ? contact.emailAddresses.work : null,
                    contact.emailAddresses ? contact.emailAddresses.home : null,
                    contact.profileImage,
                    contact.phoneNumbers ? contact.phoneNumbers.land : null,
                    contact.phoneNumbers ? contact.phoneNumbers.mobile : null,
                    contact.phoneNumbers ? contact.phoneNumbers.satellite : null
                ];
                res = await transaction.executeSql(insertPhoneContact, args);
            });
            resolve();
        });
    });

const selectContacts = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                selectAllContacts,
                [],
                (tx, res) => {
                    const result = Utils.addArrayToSqlResults(res);
                    const dbResults = result.rows
                        ? result.rows._array
                            ? result.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve([]);
                    }
                    return resolve(dbResults);
                },
                (tx, err) => reject(err)
            );
        });
    });

const selectEmailOnlyContacts = () =>
    new Promise((resolve, reject) => {
        db.transaction(transaction => {
            transaction.executeSql(
                selectAllContactsWithEmail,
                [],
                (tx, res) => {
                    const result = Utils.addArrayToSqlResults(res);
                    const dbResults = result.rows
                        ? result.rows._array
                            ? result.rows._array
                            : []
                        : [];
                    if (dbResults.length === 0) {
                        return resolve([]);
                    }
                    return resolve(dbResults);
                },
                (tx, err) => reject(err)
            );
        });
    });

const deleteAllPhoneBookContacts = () =>
    new Promise((resolve, reject) => {
        console.log('||||||| deletiong contas from db');
        db.transaction(transaction => {
            transaction.executeSql(
                deleteAllContacts,
                [],
                () => resolve(),
                (tx, err) => reject(err)
            );
        });
    });

export default {
    createContactsTable,
    insertContacts,
    selectContacts,
    deleteAllPhoneBookContacts,
    selectEmailOnlyContacts
};
