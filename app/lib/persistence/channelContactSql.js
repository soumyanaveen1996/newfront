const createChannelContactsTable = `
    CREATE TABLE IF NOT EXISTS channel_contacts ( 
        id text PRIMARY KEY, 
        name text,
        email text,
        screenName text,
        givenName text,
        surname text
    );
`;

const insertChannelContact = `
    INSERT INTO channel_contacts ( 
        id, 
        name,
        email,
        screenName,
        givenName,
        surname
    ) VALUES (?, ?, ?, ?, ?, ?);
`;

const deleteChannelContact = `
    DELETE FROM channel_contacts
    WHERE 
        id = ?
`;

const selectChannelContact = `
    SELECT
        id,
        name,
        email,
        screenName,
        givenName,
        surname
    FROM channel_contacts
    WHERE id = ?
`;


export default {
    createChannelContactsTable,
    insertChannelContact,
    deleteChannelContact,
    selectChannelContact,
};
