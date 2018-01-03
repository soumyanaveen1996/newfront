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

const insertNetworkOperation = `
    INSERT INTO network_queue ( 
        key, 
        status, 
        request,
        created_at_date, 
        updated_at_date,
        result
    ) VALUES (?, ?, ?, ?, ?, ?);
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

const STATUS_CONSTANTS = {
    pending: 'pending',
    complete: 'complete',
    failure: 'failure'
};

export default {
    createNetworkQueueTable: createNetworkQueueTable,
    insertNetworkOperation: insertNetworkOperation,
    updateRequest: updateRequest,
    deleteNetworkOperation: deleteNetworkOperation,
    selectPendingEarliestNetworkRequest: selectPendingEarliestNetworkRequest,
    selectCompletedtNetworkRequestForKey: selectCompletedtNetworkRequestForKey,
    STATUS_CONSTANTS: STATUS_CONSTANTS
};
