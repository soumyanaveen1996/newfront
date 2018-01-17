const createVersionTable = `
    CREATE TABLE IF NOT EXISTS db_version ( 
        version integer NOT NULL
    );
`;

const updateVersion = `UPDATE db_version SET version = ?;`;

const getVersion = `SELECT version FROM db_version LIMIT 1`;

const insertVersion = `INSERT INTO db_version values (?)`;

const tableExists = `SELECT count(*) as row_count FROM sqlite_master WHERE type='table' AND name='db_version';`

export default {
    createVersionTable: createVersionTable,
    updateVersion: updateVersion,
    getVersion: getVersion,
    insertVersion: insertVersion,
    tableExists: tableExists,
};
