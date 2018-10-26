const R = require('ramda');
let store = {};
const initStore = state => {
    store = R.merge(store, state);
    return;
};
const updateStore = state => {
    store = R.merge(store, state);
    return;
};
const clearStore = () => (store = {});
const getState = () => {
    return store;
};

export default {
    initStore,
    updateStore,
    clearStore,
    getState
};
