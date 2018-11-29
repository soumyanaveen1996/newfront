import {
    MessageDAO,
    NetworkDAO,
    ConversationDAO,
    ArrayStorageDAO,
    DbVersionDAO
} from '../../lib/persistence';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import ChannelContactDAO from '../../lib/persistence/ChannelContactDAO';
import BackgroundTaskDAO from '../../lib/persistence/BackgroundTaskDAO';

const createMessageTable = MessageDAO.createMessageTable;
const createNetworkRequestQueueTable =
    NetworkDAO.createNetworkRequestQueueTable;
const createConversationTable = ConversationDAO.createConversationTable;
const createArrayStorageTable = ArrayStorageDAO.createArrayStorageTable;

function zeroToOneMigration() {
    return createMessageTable()
        .then(() => {
            return createNetworkRequestQueueTable();
        })
        .then(() => {
            return createConversationTable();
        })
        .then(() => {
            return createArrayStorageTable();
        })
        .then(() => {
            return DbVersionDAO.updateVersion(1);
        });
}

function oneToTwoMigration() {
    return MessageDAO.migrateToV2Messages().then(() => {
        return DbVersionDAO.updateVersion(2);
    });
}

function twoToThreeMigration() {
    return ConversationDAO.migrateToV2Conversations().then(() => {
        return DbVersionDAO.updateVersion(3);
    });
}

function threeToFourMigration() {
    return NetworkDAO.migrateToV2NetworkQueue().then(() => {
        return DbVersionDAO.updateVersion(4);
    });
}

function fourToFiveMigration() {
    return MessageDAO.addCompletedColumn().then(() => {
        return DbVersionDAO.updateVersion(5);
    });
}

function fiveToSixMigration() {
    return ChannelDAO.createChannelsTable().then(() => {
        return DbVersionDAO.updateVersion(6);
    });
}

function sixToSevenMigration() {
    return ChannelContactDAO.createChannelContactsTable().then(() => {
        return DbVersionDAO.updateVersion(7);
    });
}

function sevenToEightMigration() {
    return MessageDAO.createMessageDateIndex().then(() => {
        return DbVersionDAO.updateVersion(8);
    });
}

function eightToNineMigration() {
    return NetworkDAO.migrateToV3NetworkQueue().then(() => {
        return DbVersionDAO.updateVersion(9);
    });
}

function nineToTenMigration() {
    return BackgroundTaskDAO.createBackgroundTaskTable().then(() => {
        return DbVersionDAO.updateVersion(10);
    });
}
function tenToEleven() {
    return MessageDAO.addStatusColumn().then(() => {
        return DbVersionDAO.updateVersion(11);
    });
}

function elevenToTwelve() {
    return ChannelDAO.addOwnerColumn().then(() => {
        return DbVersionDAO.updateVersion(12);
    });
}
function TwelvetoThirteen() {
    return ChannelDAO.addOwnerName().then(() => {
        return DbVersionDAO.updateVersion(13);
    });
}
function ThirteentoFourteen() {
    return ChannelDAO.addOwnerId().then(() => {
        return DbVersionDAO.updateVersion(14);
    });
}
function FourteenToFifteen() {
    return ChannelDAO.addCreatedOn().then(() => {
        return DbVersionDAO.updateVersion(15);
    });
}
function FifteenToSixteen() {
    return ChannelDAO.addisSubscribed().then(() => {
        return DbVersionDAO.updateVersion(16);
    });
}
function SixteenToSeventeen() {
    return ChannelDAO.addisPlatform().then(() => {
        return DbVersionDAO.updateVersion(17);
    });
}
function SeventeenToEighteen() {
    return ChannelDAO.addChannelType().then(() => {
        return DbVersionDAO.updateVersion(18);
    });
}
function runMigrations() {
    return new Promise((resolve, reject) => {
        return DbVersionDAO.isVersionTablePresent()
            .then(exists => {
                if (exists) {
                    return DbVersionDAO.getVersion();
                } else {
                    console.log('CREATTING VERSION TABLE FROM START!!');
                    return DbVersionDAO.createVersionTable(0);
                }
            })
            .then(version => {
                if (version === 0) {
                    return zeroToOneMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 1) {
                    return oneToTwoMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 2) {
                    return twoToThreeMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 3) {
                    return threeToFourMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 4) {
                    return fourToFiveMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 5) {
                    return fiveToSixMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 6) {
                    return sixToSevenMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 7) {
                    return sevenToEightMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 8) {
                    return eightToNineMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 9) {
                    return nineToTenMigration();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 10) {
                    return tenToEleven();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 11) {
                    return elevenToTwelve();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 12) {
                    return TwelvetoThirteen();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 13) {
                    return ThirteentoFourteen();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 14) {
                    return FourteenToFifteen();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 15) {
                    return FifteenToSixteen();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 16) {
                    return SixteenToSeventeen();
                } else {
                    return version;
                }
            })
            .then(version => {
                if (version === 17) {
                    return SeventeenToEighteen();
                } else {
                    return version;
                }
            })
            .then(() => {
                resolve();
            })
            .catch(error => {
                console.error('Migration Error : ', error);
            });
    });
}

export default {
    createMessageTable: createMessageTable,
    createNetworkRequestQueueTable: createNetworkRequestQueueTable,
    createConversationTable: createConversationTable,
    createArrayStorageTable: createArrayStorageTable,
    runMigrations: runMigrations
};
