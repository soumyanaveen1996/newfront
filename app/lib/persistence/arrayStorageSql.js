const createArrayStorageTable = `
    CREATE TABLE IF NOT EXISTS array_storage ( 
        id integer primary key, 
        key text NOT NULL, 
        value text NOT NULL
    );
`;

// Values will be added by DAO dynamically
const insertArrayValues = `
    INSERT INTO array_storage ( 
        key, 
        value
    ) 
`;

const selectArrayValues = `
    SELECT
        id,
        key,
        value
    FROM array_storage
    WHERE key = ?
`;

const deleteAllArrayValues = `
    DELETE FROM array_storage
    WHERE key = ?
`;

const deleteArrayValue = `
    DELETE FROM array_storage
    WHERE key = ? AND value = ?
`;

export default {
    createArrayStorageTable: createArrayStorageTable,
    insertArrayValues: insertArrayValues,
    selectArrayValues: selectArrayValues,
    deleteAllArrayValues: deleteAllArrayValues,
    deleteArrayValue: deleteArrayValue
};
