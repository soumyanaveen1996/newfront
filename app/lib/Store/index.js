const R = require('ramda');
let store = {};
const initStore = state => {
    store = { ...store, ...state };
    // console.log('Store Initialized', store);

    return;
};
const updateStore = state => {
    store = { ...store, ...state };
    // console.log('Store Updated', store);

    return;
};
const clearStore = () => (store = {});
const getState = () => {
    // console.log('Current Store State', store);
    return store;
};

export default {
    initStore,
    updateStore,
    clearStore,
    getState
};
