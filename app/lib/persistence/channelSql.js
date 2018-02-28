const createChannelsTable = `
    CREATE TABLE IF NOT EXISTS channel ( 
        id integer primary key, 
        name text NOT NULL, 
        description text NOT NULL,
        logo text NOT NULL,
        domain text NOT NULL,
        conversationId text
    );
`;

const insertChannel = `
    INSERT INTO channel ( 
        name, 
        description,
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
        id = ?
`;

const selectChannels = `
    SELECT
        id,
        conversationId,
        name,
        description,
        logo,
        domain
    FROM channel
`;

const selectChannel = `
    SELECT
        id,
        conversationId,
        name,
        description,
        logo,
        domain
    FROM channel
    WHERE id = ?
`;

const selectChannelByNameAndDomain = `
    SELECT
        id,
        conversationId,
        name,
        description,
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
    selectChannels,
    selectChannel,
    deleteAllChannels,
    selectChannelByNameAndDomain
};
