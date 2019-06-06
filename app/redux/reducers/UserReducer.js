import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const UserReducer = (state = initialState.user, action) => {
    let newState;
    switch (action.type) {
    case Actions.SET_FIRST_LOGIN:
        return { ...state, ...{ firstLogin: action.payload } };
    case Actions.SET_APP_MODE:
        return { ...state, ...{ satelliteMode: action.payload } };
    case Actions.COMPLETE_BOT_INSTALL:
        return { ...state, ...{ remoteBotsInstalled: action.payload } };
    case Actions.COMPLETE_CONVERSATIONS_LOAD:
        return { ...state, ...{ allConversationsLoaded: action.payload } };
    case Actions.COMPLETE_CHANNEL_INSTALL:
        return { ...state, ...{ allChannelsLoaded: action.payload } };
    case Actions.COMPLETE_CATALOG_LOAD:
        return { ...state, ...{ catalogLoaded: action.payload } };
    case Actions.COMPLETE_CONTACTS_LOAD:
        return { ...state, ...{ contactsLoaded: action.payload } };
    case Actions.SET_CURRENT_SCENE:
        return { ...state, ...{ currentScene: action.payload } };
    case Actions.REFRESH_TIMELINE:
        return { ...state, ...{ refreshTimeline: action.payload } };
    case Actions.REFRESH_CHANNELS:
        return { ...state, ...{ refreshChannels: action.payload } };
    case Actions.REFRESH_CONTACTS:
        return { ...state, ...{ refreshContacts: action.payload } };
    case Actions.USER_EMAIL:
        return { ...state, ...{ refreshUserEmail: action.payload } };
    case Actions.SET_NETWORK:
        return { ...state, ...{ network: action.payload } };
    case Actions.SET_CURRENT_CONVERSATION_ID:
        return { ...state, ...{ currentConversationId: action.payload } };
    case Actions.SET_CURRENT_MAP:
        return { ...state, ...{ currentMap: action.payload } };
    case Actions.SET_CURRENT_FORM:
        return { ...state, ...{ currentForm: action.payload } };
    case Actions.UPLOAD_IMAGE:
        return { ...state, ...{ upload: state.upload + 1 } };
    default:
        return state;
    }
};
