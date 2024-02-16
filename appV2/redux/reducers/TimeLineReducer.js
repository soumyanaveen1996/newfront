import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const TimelineReducer = (state = initialState.timeline, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_ALL_CHATS_DATA:
        return {
            ...state,
            ...{ allChats: action.payload }
        };
    default:
        return state;
    }
};
