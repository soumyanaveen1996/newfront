const createControlTable = `
    CREATE TABLE IF NOT EXISTS controls (
        control_id text PRIMARY KEY NOT NULL,
        content text NOT NULL,
        type text NOT NULL,
        control_date text NOT NULL,
        original_message_id text NOT NULL
    ) WITHOUT ROWID;
`;

const insertControl = `
INSERT INTO controls (
        control_id,
        content,
        type,
        control_date,
        original_message_id
) VALUES (?, ?, ?, ?, ?);
`;

const updateControl = `
UPDATE controls
SET content = ?,
    type = ?,
    control_date = ?
WHERE control_id = ?
`;

const selectControlById = `
    SELECT
        control_id,
        content,
        type,
        control_date,
        original_message_id
    FROM controls
    WHERE control_id = ?
    ORDER BY control_date desc
    LIMIT 1
`;

const selectContentById = `
    SELECT
        content
    FROM controls
    WHERE control_id = ?
    ORDER BY control_date desc
    LIMIT 1
`;

export default {
    createControlTable: createControlTable,
    selectControlById: selectControlById,
    selectContentById: selectContentById,
    insertControl: insertControl,
    updateControl: updateControl
};
