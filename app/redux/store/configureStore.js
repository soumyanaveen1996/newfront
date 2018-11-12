import { createStore, applyMiddleware, compose } from 'redux';
import reducer from '../reducers';
import thunk from 'redux-thunk';
import Reactotron from '../../../ReactotronConfig';
let Store;
const middleware = [thunk];
if (__DEV__) {
    Store = Reactotron.createStore(reducer, applyMiddleware(...middleware));
} else {
    Store = createStore(reducer, applyMiddleware(...middleware));
}
export default Store;
