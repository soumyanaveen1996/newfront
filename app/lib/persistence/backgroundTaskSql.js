const createBackgroundTaskTable = `
    CREATE TABLE IF NOT EXISTS background_tasks (
        key text,
        bot_id text NOT NULL,
        conversation_id text not NULL,
        time_interval integer NOT NULL,
        options text NOT NULL,
        last_run_time integer DEFAULT 0,
        PRIMARY KEY(key, bot_id, conversation_id)
    ) WITHOUT ROWID;
`;

const insertBackgroundTask = `
    INSERT INTO background_tasks (
        key,
        bot_id,
        conversation_id,
        time_interval,
        options,
        last_run_time
    ) VALUES (?, ?, ?, ?, ?, ?);
`;


const updateLastRunTime = `
    UPDATE background_tasks
    SET last_run_time = ?,
    WHERE key = ? AND bot_id = ? AND conversationId = ?
`;

const deleteBackgroundTask = `
    DELETE from background_tasks where key = ? and bot_id = ? and conversation_id = ?;
`;

const selectAllBackgroundTasks = `
    SELECT
        key,
        bot_id,
        conversation_id,
        time_interval,
        options,
        last_run_time
    FROM background_tasks;
`;

const selectBackgroundTask = `
    SELECT
        key,
        bot_id,
        conversation_id,
        time_interval,
        options,
        last_run_time
    FROM background_tasks
    WHERE key = ? AND bot_id = ? AND conversation_id = ?
`;

export default {
    createBackgroundTaskTable,
    insertBackgroundTask,
    updateLastRunTime,
    deleteBackgroundTask,
    selectAllBackgroundTasks,
    selectBackgroundTask
};
