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
        subcription,
        isPlatformChannel,
        channelType,
        discoverable
    ) VALUES (?, ?, ?, ?, ?, ? ,? ,?, ?, ?, ?, ?, ?);
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

const setChannelSubscription = `
    UPDATE channel
    SET
        subcription = ?
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
        subcription,
        isPlatformChannel,
        channelType,
        discoverable
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
        subcription,
        isPlatformChannel,
        channelType,
        discoverable
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
        subcription,
        isPlatformChannel,
        channelType,
        discoverable
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
        subcription,
        isPlatformChannel,
        channelType,
        discoverable
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

const addIsPlatformChannel = `
ALTER TABLE channel ADD isPlatformChannel integer;
`;
const addChannelType = `
ALTER TABLE channel ADD channelType varchar(20);
`;

const addDiscoverable = `
ALTER TABLE channel ADD discoverable varchar(20);
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
    addisSubscribed,
    addIsPlatformChannel,
    addChannelType,
    setChannelSubscription,
    addDiscoverable
};
