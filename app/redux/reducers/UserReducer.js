import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const UserReducer = (state = initialState.user, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_APP_MODE:
        return { ...state, ...{ satelliteMode: action.payload } };
    case Actions.COMPLETE_BOT_INSTALL:
        return { ...state, ...{ remoteBotsInstalled: action.payload } };
    case Actions.COMPLETE_CHANNEL_INSTALL:
        return { ...state, ...{ allChannelsLoaded: true } };
    case Actions.COMPLETE_CONTACTS_LOAD:
        return { ...state, ...{ contactsLoaded: true } };
    case Actions.SET_CURRENT_SCENE:
        return { ...state, ...{ currentScene: action.payload } };
    case Actions.REFRESH_TIMELINE:
        return { ...state, ...{ refreshTimeline: action.payload } };
    default:
        return state;
    }
};
