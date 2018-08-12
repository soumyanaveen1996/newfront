const createNetworkQueueTable = `
    CREATE TABLE IF NOT EXISTS network_queue (
        id integer primary key,
        key text NOT NULL,
        status text NOT NULL default 'pending',
        request text NOT NULL,
        result text,
        created_at_date text NOT NULL,
        updated_at_date text NOT NULL
    );
`;

const createV2NetworkQueueTable = `
    CREATE TABLE IF NOT EXISTS network_queue (
        id integer primary key,
        key text NOT NULL,
        status text NOT NULL default 'pending',
        request text NOT NULL,
        result text,
        created_at_date integer NOT NULL,
        updated_at_date integer NOT NULL
    );
`;

const insertNetworkOperation = `
    INSERT INTO network_queue (
        key,
        status,
        request,
        created_at_date,
        updated_at_date,
        result,
        message_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
`;

const updateRequest = `
    UPDATE network_queue
        SET status = ?,
            updated_at_date = ?,
            result = ?
        WHERE id = ?;
`;

const deleteNetworkOperation = `
    DELETE FROM network_queue WHERE id = ?;
`;

const selectPendingEarliestNetworkRequest = `
    SELECT
        id,
        key,
        request
    FROM
        network_queue
    WHERE status = 'pending'
    ORDER BY datetime(created_at_date) ASC
    LIMIT 1;
`;

const selectCompletedtNetworkRequestForKey = `
    SELECT
        id,
        key,
        result,
        updated_at_date
    FROM
        network_queue
    WHERE status = 'complete'
        AND key = ?
    ORDER BY datetime(updated_at_date) ASC;
`;

const selectByMessageId = `
    SELECT
        id,
        key,
        result,
        status,
        updated_at_date,
        message_id
    FROM
        network_queue
    WHERE message_id = ?
`;

const createV3NetworkQueueTable = `
    ALTER TABLE network_queue ADD COLUMN message_id text default '';
`;

const deleteAllRows = `
    DELETE FROM network_queue;
`

const STATUS_CONSTANTS = {
    pending: 'pending',
    complete: 'complete',
    failure: 'failure'
};

export default {
    createNetworkQueueTable: createNetworkQueueTable,
    createV2NetworkQueueTable: createV2NetworkQueueTable,
    createV3NetworkQueueTable: createV3NetworkQueueTable,
    insertNetworkOperation: insertNetworkOperation,
    updateRequest: updateRequest,
    deleteNetworkOperation: deleteNetworkOperation,
    selectPendingEarliestNetworkRequest: selectPendingEarliestNetworkRequest,
    selectCompletedtNetworkRequestForKey: selectCompletedtNetworkRequestForKey,
    selectByMessageId: selectByMessageId,
    deleteAllRows: deleteAllRows,
    STATUS_CONSTANTS: STATUS_CONSTANTS
};
