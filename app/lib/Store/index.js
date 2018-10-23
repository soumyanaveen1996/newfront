const R = require('ramda');
const store = {};
export const initStore = state => R.merge(store, state);
export const updateStore = state => R.merge(store, state);
export const clearStore = () => (store = {});
export const getState = () => {
    return store;
};
