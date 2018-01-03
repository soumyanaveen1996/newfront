import { MessageDAO, NetworkDAO, ConversationDAO, ArrayStorageDAO } from '../../lib/persistence';
const createMessageTable = MessageDAO.createMessageTable;
const createNetworkRequestQueueTable = NetworkDAO.createNetworkRequestQueueTable;
const createConversationTable = ConversationDAO.createConversationTable;
const createArrayStorageTable = ArrayStorageDAO.createArrayStorageTable;

export default {
    createMessageTable: createMessageTable,
    createNetworkRequestQueueTable: createNetworkRequestQueueTable,
    createConversationTable: createConversationTable,
    createArrayStorageTable: createArrayStorageTable
};
