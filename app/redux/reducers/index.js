import { combineReducers } from 'redux';
import { UserReducer as user } from '../reducers/UserReducer';
import { BotReducer as bots } from '../reducers/BotReducer';
import { ChannelReducer as channel } from '../reducers/ChannelReducer';
import { ActionTypes as Actions } from '../actions/ActionTypes';

const frontmReducer = combineReducers({
    user,
    bots,
    channel
});

const rootReducer = (state, action) => {
    if (action.type === Actions.LOGOUT) {
        state = undefined;
    }
    return frontmReducer(state, action);
};

export default rootReducer;
