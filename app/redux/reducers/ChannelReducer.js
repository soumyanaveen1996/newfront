import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const ChannelReducer = (state = initialState.channels, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_CHANNEL_FILTER:
        return {
            ...state,
            ...{ filters: [...state.filters, ...action.payload] }
        };
    case Actions.CLEAR_CHANNEL_FILTER:
        return {
            ...state,
            ...{ filters: [] }
        };
    default:
        return state;
    }
};
