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
        domain
    ) VALUES (?, ?, ?, ?);
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
        domain
    FROM channel
`;

const selectChannel = `
    SELECT
        id,
        conversationId,
        name,
        desc,
        logo,
        domain
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
        domain
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
        domain
    FROM channel
    WHERE name = ?
    AND domain = ?
`;


const deleteAllChannels = `
    DELETE from channel
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
    selectChannelByNameAndDomain
};
