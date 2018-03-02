import { MessageDAO, NetworkDAO, ConversationDAO, ArrayStorageDAO, DbVersionDAO } from '../../lib/persistence';
import ChannelDAO from '../../lib/persistence/ChannelDAO';

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

function twoToThreeMigration() {
    return ConversationDAO.migrateToV2Conversations()
        .then(() => {
            return DbVersionDAO.updateVersion(3);
        })
}

function threeToFourMigration() {
    return NetworkDAO.migrateToV2NetworkQueue()
        .then(() => {
            return DbVersionDAO.updateVersion(4);
        })
}

function fourToFiveMigration() {
    return MessageDAO.addCompletedColumn()
        .then(() => {
            return DbVersionDAO.updateVersion(5);
        })
}

function fiveToSixMigration() {
    return ChannelDAO.createChannelsTable()
        .then(() => {
            return DbVersionDAO.updateVersion(6);
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
            .then((version) => {
                if (version === 2) {
                    return twoToThreeMigration()
                } else {
                    return version;
                }
            })
            .then((version) => {
                if (version === 3) {
                    return threeToFourMigration()
                } else {
                    return version;
                }
            })
            .then((version) => {
                if (version === 4) {
                    return fourToFiveMigration()
                } else {
                    return version;
                }
            })
            .then((version) => {
                if (version === 5) {
                    return fiveToSixMigration()
                } else {
                    return version;
                }
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.log('Migration Error : ', error);
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
