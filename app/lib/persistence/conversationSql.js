const createConversationTable = `
    CREATE TABLE IF NOT EXISTS conversation ( 
        id integer primary key, 
        conversationId text NOT NULL, 
        type text NOT NULL,
        created_at_date text NOT NULL        
    );
`;

const createV2ConversationTable = `
    CREATE TABLE IF NOT EXISTS conversation (
        id integer primary key,
        conversationId text NOT NULL,
        type text NOT NULL,
        created_at_date integer NOT NULL
    );
`;

const insertConversation = `
    INSERT INTO conversation ( 
        conversationId, 
        type,
        created_at_date        
    ) VALUES (?, ?, ?);
`;

const deleteConversation = `
    DELETE FROM conversation
    WHERE 
        conversationId = ?
        AND type = ?
`;

const updateConversation = `
    UPDATE conversation
    SET 
        conversationId = ?
    WHERE
        conversationId = ?
`;

const selectConversationsByType = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM conversation
    WHERE type = ?
    ORDER BY created_at_date desc
`;

const selectConversations = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM conversation
    ORDER BY created_at_date desc
`;

const selectConversationByType = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM conversation
    WHERE type = ?
        AND conversationId = ?
    ORDER BY created_at_date desc
`;

const selectConversation = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM conversation
    WHERE conversationId = ?
    ORDER BY created_at_date desc
`;

const deleteAllConversations = `
    DELETE from conversation
`;

export default {
    createConversationTable: createConversationTable,
    insertConversation: insertConversation,
    deleteConversation: deleteConversation,
    selectConversations: selectConversations,
    selectConversationsByType: selectConversationsByType,
    selectConversation: selectConversation,
    selectConversationByType: selectConversationByType,
    updateConversation: updateConversation,
    createV2ConversationTable: createV2ConversationTable,
    deleteAllConversations: deleteAllConversations
};
