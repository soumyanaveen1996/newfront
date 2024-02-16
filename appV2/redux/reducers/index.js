import { combineReducers } from 'redux';
import { UserReducer as user } from './UserReducer';
import { BotReducer as bots } from './BotReducer';
import { ChannelReducer as channel } from './ChannelReducer';
import { TimelineReducer as timeline } from './TimeLineReducer';
import { ActionTypes as Actions } from '../actions/ActionTypes';
import { SessionReducer as session } from './SessionReducer';
import { MessageStateReducer as messageState } from './MessageStateReducer';

const frontmReducer = combineReducers({
    user,
    bots,
    channel,
    timeline,
    session,
    messageState
});

const rootReducer = (state, action) => {
    if (action.type === Actions.LOGOUT) {
        state = undefined;
    }
    return frontmReducer(state, action);
};

export default rootReducer;
