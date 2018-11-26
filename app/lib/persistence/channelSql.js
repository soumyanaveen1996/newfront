const createChannelsTable = `
    CREATE TABLE IF NOT EXISTS channel (
        id integer primary key,
        name text NOT NULL,
        desc text NOT NULL,
        logo text NOT NULL,
        domain text NOT NULL,
        conversationId text
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
        ownerId,
        createdOn,
        subcription
    ) VALUES (?, ?, ?, ?, ?, ? ,? ,?, ?, ?);
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
        ownerId,
        createdOn,
        subcription
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
        ownerId,
        createdOn,
        subcription
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
        ownerId,
        createdOn,
        subcription
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
        ownerId,
        createdOn,
        subcription
    FROM channel
    WHERE name = ?
    AND domain = ?
`;

const deleteAllChannels = `
    DELETE from channel
`;

// Add a New owner Column
const addOwnerColumn = `
ALTER TABLE channel ADD ownerEmail varchar(20);
`;
const addOwnerName = `
ALTER TABLE channel ADD ownerName varchar(20);
`;
const addOwnerId = `
ALTER TABLE channel ADD ownerId varchar(20);
`;
const addCreatedOn = `
ALTER TABLE channel ADD createdOn varchar(20);
`;
const addisSubscribed = `
ALTER TABLE channel ADD subcription varchar(20);
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
    addOwnerColumn,
    addOwnerName,
    addOwnerId,
    addCreatedOn,
    addisSubscribed
};
