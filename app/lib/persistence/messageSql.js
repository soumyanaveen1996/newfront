const createMessageTable = `
    CREATE TABLE IF NOT EXISTS messages (
        message_id text PRIMARY KEY NOT NULL,
        bot_key text NOT NULL,
        msg text NOT NULL,
        message_type text NOT NULL,
        options text,
        added_by_bot integer NOT NULL,
        message_date text NOT NULL,
        read integer NOT NULL DEFAULT 0,
        is_favorite integer DEFAULT 0,
        created_by text
    ) WITHOUT ROWID;
`;

const createV2MessageTable = `
    CREATE TABLE IF NOT EXISTS messages (
        message_id text PRIMARY KEY NOT NULL,
        bot_key text NOT NULL,
        msg text NOT NULL,
        message_type text NOT NULL,
        options text,
        added_by_bot integer NOT NULL,
        message_date integer NOT NULL,
        read integer NOT NULL DEFAULT 0,
        is_favorite integer DEFAULT 0,
        created_by text
    ) WITHOUT ROWID;
`;

const insertMessage = `
    INSERT INTO messages (
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const updateMessageById = `
    UPDATE messages
    SET bot_key = ?,
        msg = ?,
        message_type = ?,
        options = ?,
        added_by_bot = ?,
        message_date = ?,
        read = ?,
        is_favorite = ?,
        created_by = ?,
        completed = ?,
        status = ?
    WHERE message_id = ?
`;

const markAsRead = `
    UPDATE messages SET read = 1 where message_id = ? and bot_key = ?;
`;

const markAllBotMessagesAsRead = `
    UPDATE messages SET read = 1 where bot_key = ? and read = 0;
`;

const markAsFavorite = `
    UPDATE messages SET is_favorite = 1 where message_id = ? and bot_key = ?;
`;

const markAsUnFavorite = `
    UPDATE messages SET is_favorite = 0 where message_id = ? and bot_key = ?;
`;

const unreadCount = `
    SELECT COUNT(*) from messages where read = 0 and bot_key = ?
`;

const selectRecentMessages = `
    SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    FROM messages
    WHERE bot_key = ?
    ORDER BY message_date desc
    LIMIT ?
    OFFSET ?;
`;

const selectMessagesOfType = `
    SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    FROM messages
    WHERE bot_key = ?
        AND message_type = ?
`;

const selectMessagesBeforeDate = `
    SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    FROM messages
    WHERE bot_key = ? AND message_date < ?
    ORDER BY message_date desc
    LIMIT ?
`;

const selectFavoriteMessages = `
    SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    FROM messages
    WHERE is_favorite = 1
    ORDER BY message_date desc
    LIMIT ?
    OFFSET ?;
`;

const selectMessageById = `
    SELECT
        message_id,
        bot_key,
        msg,
        message_type,
        options,
        added_by_bot,
        message_date,
        read,
        is_favorite,
        created_by,
        completed,
        status
    FROM messages
    WHERE message_id = ?
`;

const deleteMessage = 'TBD';

// Total Messages typed by the user, since a date string. Empty message_date ('') means since beginning.
const totalUserMessageCountSince = `
    SELECT
        COUNT(*)
    FROM messages
    WHERE bot_key = ?
        AND message_date >= ?
        AND added_by_bot = 0 ;
`;

const moveMessagesToNewBotKey = `
    UPDATE messages SET bot_key = ? where bot_key = ?;
`;

const deleteBotMessages = `
    DELETE FROM messages where bot_key = ?;
`;

const addCompletedColumn = `
    ALTER TABLE messages ADD COLUMN completed INTEGER NOT NULL DEFAULT 0
`;

const addMessageCreatedAtIndex = `
    CREATE INDEX idx_bot_key_date ON messages (bot_key, message_date DESC);
`;

const deleteAllMessages = `
    DELETE FROM messages;
`;
// Add a New Status Column
const addStatusColumn = `
    ALTER TABLE messages ADD COLUMN status INTEGER NOT NULL DEFAULT 0
`;
export default {
    createMessageTable: createMessageTable,
    createV2MessageTable: createV2MessageTable,
    insertMessage: insertMessage,
    selectRecentMessages: selectRecentMessages,
    selectMessagesOfType: selectMessagesOfType,
    selectMessagesBeforeDate: selectMessagesBeforeDate,
    deleteMessage: deleteMessage,
    markAsRead: markAsRead,
    unreadCount: unreadCount,
    totalUserMessageCountSince: totalUserMessageCountSince,
    markAllBotMessagesAsRead: markAllBotMessagesAsRead,
    selectFavoriteMessages: selectFavoriteMessages,
    markAsUnFavorite: markAsUnFavorite,
    markAsFavorite: markAsFavorite,
    moveMessagesToNewBotKey: moveMessagesToNewBotKey,
    deleteBotMessages: deleteBotMessages,
    updateMessageById: updateMessageById,
    addCompletedColumn: addCompletedColumn,
    selectMessageById: selectMessageById,
    addMessageCreatedAtIndex: addMessageCreatedAtIndex,
    deleteAllMessages: deleteAllMessages,
    addStatusColumn
};
