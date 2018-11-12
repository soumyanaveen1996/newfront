import { combineReducers } from 'redux';
import { UserReducer as user } from '../reducers/UserReducer';
import { ActionTypes as Actions } from '../actions/ActionTypes';

const frontmReducer = combineReducers({
    user
});

const rootReducer = (state, action) => {
    if (action.type === Actions.LOGOUT) {
        state = undefined;
    }
    return frontmReducer(state, action);
};

export default rootReducer;
