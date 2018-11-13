import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const BotReducer = (state = initialState.botState, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_LOADED_BOT:
        return { ...state, ...{ id: action.payload } };
    default:
        return state;
    }
};
