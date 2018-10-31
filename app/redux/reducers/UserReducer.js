import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const UserReducer = (state = initialState.user, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_APP_MODE:
        return { ...state, ...{ satelliteMode: action.payload } };
    case Actions.COMPLETE_BOT_INSTALL:
        return { ...state, ...{ remoteBotsInstalled: true } };
    case Actions.COMPLETE_CHANNEL_INSTALL:
        return { ...state, ...{ allChannelsLoaded: true } };
    case Actions.COMPLETE_CONTACTS_LOAD:
        return { ...state, ...{ contactsLoaded: true } };
    default:
        return state;
    }
};
