import SQLite from 'react-native-sqlite-storage';
import config from '../../config/config';

// Happens once since we have ensured there is only opened once
const db = SQLite.openDatabase({ name: config.persist.databaseName });

export { db };
