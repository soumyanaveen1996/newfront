const createConversationTable = `
    CREATE TABLE IF NOT EXISTS conversation ( 
        id integer primary key, 
        conversationId text NOT NULL, 
        type text NOT NULL,
        created_at_date text NOT NULL        
    );
`;

const insertConversation = `
    INSERT INTO conversation ( 
        conversationId, 
        type,
        created_at_date        
    ) VALUES (?, ?, ?);
`;

const selectConversations = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date
    FROM conversation
    WHERE type = ?
    ORDER BY created_at_date desc
`;

const selectConversation = `
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

export default {
    createConversationTable: createConversationTable,
    insertConversation: insertConversation,
    selectConversations: selectConversations,
    selectConversation: selectConversation
};
