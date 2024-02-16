import AsyncStorage from '@react-native-community/async-storage';
import Promise from './Promise';
import { ArrayStorageDAO } from '../persistence';

/**
 * Note: We could have as well used https://github.com/jasonmerino/react-native-simple-store but since we want to
 * have our Promises exposed we are building this ourselves for now.
 */
export default class DeviceStorage {
    /**
     * Save a key value pair
     * @param  {String} key The key
     * @param  {Any} obj The value to save
     * @return {Promise}
     */
    static save = (key, obj) =>
        new Promise((resolve, reject) => {
            AsyncStorage.setItem(key, JSON.stringify(obj), (err) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                if (key === 'userSession') {
                    console.log('userSession save ', obj);
                    ArrayStorageDAO.insertSession(obj);
                }
                return resolve(obj);
            });
        });

    /**
     * Updates the value in the store for a given key in DeviceStorage
     * @param  {String} key The key
     * @param  {Value} value The value to update with
     * @return {Promise}
     */
    static update = (key, value) =>
        new Promise((resolve, reject) =>
            DeviceStorage.save(key, value)
                .then((obj) => {
                    resolve(obj);
                })
                .catch((err) => {
                    reject(err);
                })
        );

    /**
     * Get a one or more value for a key
     * @param {String|Array} key A key or array of keys
     * @return {Promise}
     */
    static get = (key) =>
        new Promise((resolve, reject) => {
            AsyncStorage.getItem(key, (err, objStr) => {
                if (err) {
                    return reject(err);
                }
                if (!objStr) {
                    return resolve(null);
                }
                try {
                    const obj = JSON.parse(objStr);
                    if (key === 'userSession') {
                        console.error('userSession get from assync ');
                    }
                    return resolve(obj);
                } catch (e) {
                    return reject(e);
                }
            });
        });

    /**
     * Removes the value and key
     * @param  {String} key The key
     * @return {Promise}
     */
    static delete = (key) =>
        new Promise((resolve, reject) =>
            AsyncStorage.removeItem(key)
                .then((obj) => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        );

    /**
     * Removes all the keys
     * @param  {String} key The key
     * @return {Promise}
     */
    static deleteItems = (keys) => AsyncStorage.multiRemove(keys);

    /**
     * Get an array of values associated with key
     * @param {String} key A key
     * @return {Promise}
     */
    static getArrayValues = (key) =>
        new Promise((resolve, reject) =>
            resolve(ArrayStorageDAO.selectArrayValues(key))
        );

    /**
     * Push a value onto an array stored in DeviceStorage by key
     * @param {String} key They key
     * @param {String} val only supports string val
     * @return {Promise}
     */
    static saveArrayValue = (key, val) =>
        new Promise((resolve, reject) =>
            resolve(ArrayStorageDAO.insertArrayValues(key, [val]))
        );

    /**
     * Push a value onto an array stored in DeviceStorage by key. Will be stored as [{key: key, value: value}..]
     * @param {String} key They key
     * @param {String} values only supports array of string val
     * @return {Promise}
     */
    static saveArrayValues = (key, values) =>
        new Promise((resolve, reject) => {
            if (Array.isArray(values)) {
                return resolve(ArrayStorageDAO.insertArrayValues(key, values));
            }
            return resolve(DeviceStorage.saveArrayValue(key, values));
        });

    /**
     * Removes the first element from the array value based on the key. If no key/array exists - returns null.
     * @param {String} key They key
     * @param {String} val val to remove
     * @return {Promise} resolving to the popped first element
     */
    static removeArrayValue = (key, val) =>
        new Promise((resolve, reject) =>
            resolve(ArrayStorageDAO.deleteArrayValues(key, val))
        );

    /**
     * Removes all array elements
     * @param {String} key They key
     * @return {Promise} resolving to the popped first element
     */
    static removeAllArrayValues = (key) =>
        new Promise((resolve, reject) =>
            resolve(ArrayStorageDAO.deleteArrayValues(key))
        );
}
