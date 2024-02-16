import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const MessageStateReducer = (state = null, action) => {
    switch (action.type) {
    case Actions.SET_CURRENT_ACTIVE_MENU_ENTRY:
        return { ...state, ...{ activeMenuEntry: action.payload } };
    case Actions.SET_WAITING_FOR_MESSAGE:
        return { ...state, ...{ waiting: action.payload } };

    default:
        return state;
    }
};
