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
        created_at_date,
        unreadCount,
        favorite
    ) VALUES (?, ?, ?, ?,?);
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
        created_at_date,
        favorite
    FROM conversation
    WHERE type = ?
    ORDER BY created_at_date desc
`;

const selectConversations = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date,
        favorite,
        unreadCount
    FROM conversation
    ORDER BY created_at_date desc
`;

const selectConversationByType = `
    SELECT
        id,
        conversationId,
        type,
        created_at_date,
        favorite
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
        created_at_date,
        favorite
    FROM conversation
    WHERE conversationId = ?
    ORDER BY created_at_date desc
`;

const deleteAllConversations = `
    DELETE from conversation
`;

const addisFavorite = `
ALTER TABLE conversation ADD favorite integer DEFAULT 0;
`;
const setConvFavorite = `
    UPDATE conversation
    SET
        favorite = ?
    WHERE
    conversationId  = ?
`;

const addUnreadCount = `
ALTER TABLE conversation ADD unreadCount integer DEFAULT 0`;

const resetUnreadCount = `
UPDATE conversation SET unreadCount = -1 WHERE
        conversationId = ?`;

export default {
    createConversationTable,
    insertConversation,
    deleteConversation,
    selectConversations,
    selectConversationsByType,
    selectConversation,
    selectConversationByType,
    updateConversation,
    createV2ConversationTable,
    deleteAllConversations,
    addisFavorite,
    setConvFavorite,
    addUnreadCount,
    resetUnreadCount
};
