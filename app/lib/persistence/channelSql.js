const createChannelsTable = `
    CREATE TABLE IF NOT EXISTS channel (
        id integer primary key,
        name text NOT NULL,
        desc text NOT NULL,
        logo text NOT NULL,
        domain text NOT NULL,
        conversationId text,
        ownerEmail text NOT NULL,
        ownerName text NOT NULL,
        ownerId text NOT NULL
    );
`;

const insertChannel = `
    INSERT INTO channel (
        name,
        desc,
        logo,
        domain,
        conversationId,
        ownerEmail,
        ownerName,
        ownerId
    ) VALUES (?, ?, ?, ?, ?, ? ,? ,?);
`;

const deleteChannel = `
    DELETE FROM channel
    WHERE
        id = ?

`;

const updateConversationForChannel = `
    UPDATE channel
    SET
        conversationId = ?
    WHERE
        name = ?
    AND domain = ?
`;

const updateChannel = `
    UPDATE channel
    SET
        desc = ?
    WHERE
        name = ?
    AND domain = ?
`;

const selectChannels = `
    SELECT
        id,
        conversationId,
        name,
        desc,
        logo,
        domain,
        ownerEmail,
        ownerName,
        ownerId
    FROM channel
`;

const selectChannel = `
    SELECT
        id,
        conversationId,
        name,
        desc,
        logo,
        domain,
        ownerEmail,
        ownerName,
        ownerId
    FROM channel
    WHERE id = ?
`;

const selectChannelByConversationId = `
    SELECT
        id,
        conversationId,
        name,
        desc,
        logo,
        domain,
        ownerEmail,
        ownerName,
        ownerId
    FROM channel
    WHERE conversationId = ?
`;

const selectChannelByNameAndDomain = `
    SELECT
        id,
        conversationId,
        name,
        desc,
        logo,
        domain,
        ownerEmail,
        ownerName,
        ownerId
    FROM channel
    WHERE name = ?
    AND domain = ?
`;

const deleteAllChannels = `
    DELETE from channel
`;

// Add a New owner Column
const addOwnerColumn = `
    ALTER TABLE channel ADD (ownerEmail varchar(20), ownerName varchar(20), ownerId varchar(20));
`;

export default {
    createChannelsTable,
    insertChannel,
    deleteChannel,
    updateConversationForChannel,
    updateChannel,
    selectChannels,
    selectChannel,
    selectChannelByConversationId,
    deleteAllChannels,
    selectChannelByNameAndDomain,
    addOwnerColumn
};
