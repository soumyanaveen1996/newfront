import { MessageDAO, NetworkDAO, ConversationDAO, ArrayStorageDAO, DbVersionDAO } from '../../lib/persistence';

const createMessageTable = MessageDAO.createMessageTable;
const createNetworkRequestQueueTable = NetworkDAO.createNetworkRequestQueueTable;
const createConversationTable = ConversationDAO.createConversationTable;
const createArrayStorageTable = ArrayStorageDAO.createArrayStorageTable;

function zeroToOneMigration() {
    return createMessageTable()
        .then(() => {
            return createNetworkRequestQueueTable()
        })
        .then(() => {
            return createConversationTable()
        })
        .then(() => {
            return createArrayStorageTable()
        })
        .then(() => {
            return DbVersionDAO.updateVersion(1);
        })
}

function oneToTwoMigration() {
    return MessageDAO.migrateToV2Messages()
        .then(() => {
            return DbVersionDAO.updateVersion(2);
        })
}

function runMigrations() {
    return new Promise((resolve, reject) => {
        return DbVersionDAO.isVersionTablePresent()
            .then((exists) => {
                if (exists) {
                    return DbVersionDAO.getVersion();
                } else {
                    return DbVersionDAO.createVersionTable(0);
                }
            })
            .then((version) => {
                if (version === 0) {
                    return zeroToOneMigration()
                } else {
                    return version;
                }
            })
            .then((version) => {
                if (version === 1) {
                    return oneToTwoMigration()
                } else {
                    return version;
                }
            })
            .then(() => {
                resolve();
            })
    });
}

export default {
    createMessageTable: createMessageTable,
    createNetworkRequestQueueTable: createNetworkRequestQueueTable,
    createConversationTable: createConversationTable,
    createArrayStorageTable: createArrayStorageTable,
    runMigrations: runMigrations,
};
