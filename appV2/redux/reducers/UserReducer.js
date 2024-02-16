import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';
import EventEmitter, { TimelineEvents } from '../../lib/events';

export const UserReducer = (state = initialState.user, action) => {
    switch (action.type) {
        case Actions.SET_FIRST_LOGIN:
            return { ...state, ...{ firstLogin: action.payload } };
        case Actions.SET_APP_MODE: // not used anywhere
            return { ...state, ...{ satelliteMode: action.payload } };
        case Actions.COMPLETE_BOT_INSTALL:
            return {
                ...state,
                ...{
                    remoteBotsInstalled: action.payload,
                    userDataSynchronized:
                        state.userDataSynchronized ||
                        (action.payload && state.allConversationsLoaded)
                }
            };
        case Actions.COMPLETE_CONVERSATIONS_LOAD:
            return {
                ...state,
                ...{
                    allConversationsLoaded: action.payload,
                    userDataSynchronized:
                        state.userDataSynchronized ||
                        (action.payload && state.remoteBotsInstalled)
                }
            };
        case Actions.COMPLETE_CHANNEL_INSTALL:
            if (state.allChannelsLoaded === action.payload) {
                return state;
            }
            return { ...state, ...{ allChannelsLoaded: action.payload } };
        case Actions.COMPLETE_CATALOG_LOAD:
            if (state.catalogLoaded === action.payload) {
                return state;
            }
            return { ...state, ...{ catalogLoaded: action.payload } };
        case Actions.COMPLETE_CONTACTS_LOAD:
            if (state.contactsLoaded === action.payload) {
                return state;
            }
            return { ...state, ...{ contactsLoaded: action.payload } };
        case Actions.SET_CURRENT_SCENE:
            if (state.currentScene === action.payload) {
                return state;
            }
            return { ...state, ...{ currentScene: action.payload } };
        case Actions.REFRESH_TIMELINE:
            return { ...state, ...{ refreshTimeline: action.payload } };
        case Actions.REFRESH_CHANNELS:
            return { ...state, ...{ refreshChannels: action.payload } };
        case Actions.REFRESH_CONTACTS:
            return { ...state, ...{ refreshContacts: action.payload } };
        case Actions.UPDATE_RANK_ROLE_GROUP_COLORS:
            return { ...state, ...{ roleL2Colors: action.payload.data } };
        case Actions.USER_EMAIL:
            return { ...state, ...{ refreshUserEmail: action.payload } };
        case Actions.SET_NETWORK:
            if (action.payload === state.network) {
                return state;
            }
            if (action.payload === 'none') {
                return {
                    ...state,
                    ...{ network: action.payload, networkMsgUI: true }
                };
            }
            return {
                ...state,
                ...{ network: action.payload, networkMsgUI: false }
            };
        case Actions.SET_NETWORK_MSG_UI:
            return { ...state, ...{ networkMsgUI: action.payload } };
        case Actions.SET_CURRENT_CONVERSATION_ID:
            return { ...state, ...{ currentConversationId: action.payload } };
        case Actions.SET_CURRENT_DOMAIN:
            return { ...state, ...{ currentDomain: action.payload } };
        case Actions.SET_CURRENT_MAP:
            return { ...state, ...{ currentMap: action.payload } };
        case Actions.SET_CURRENT_FORM:
            return { ...state, ...{ currentForm: action.payload } };
        case Actions.UPLOAD_IMAGE:
            return { ...state, ...{ upload: state.upload + 1 } };
        case Actions.SET_PHONE_CONTACTS:
            return { ...state, ...{ phoneContacts: action.payload } };
        case Actions.GET_NEW_REQ_PENDING_CONTACTS:
            return {
                ...state,
                ...{ filteredContactNewReqPending: action.payload }
            };
        case Actions.TIMELINE_REBUILD:
            return { ...state, ...{ timelineBuild: action.payload } };
        case Actions.SET_PHONE_CONTACTS_STATUS:
            return { ...state, ...{ phoneContactsStatus: action.payload } };
        case Actions.BOT_INSTALL_START:
            return {
                ...state,
                ...{
                    activeInstalls: [...state.activeInstalls, action.payload]
                }
            };
        case Actions.REINTILIAZE_SYNCHRONIZE:
            return {
                ...state,
                remoteBotsInstalled: false,
                userDataSynchronized: false,
                activeInstalls: []
            };
        case Actions.BOT_INSTALL_END:
            state.activeInstalls.splice(
                state.activeInstalls.indexOf(action.payload),
                1
            );
            return {
                ...state,
                ...{
                    activeInstalls: [...state.activeInstalls]
                }
            };
        case Actions.INCREASE_NOTIFICATION_COUNT:
            return {
                ...state,
                notificationCount: (state.notificationCount || 0) + 1
            };
        case Actions.RESET_NOTIFICATION_COUNT:
            return {
                ...state,
                notificationCount: 0
            };
        case Actions.SET_USER_DOMAINS:
            return {
                ...state,
                userDomains: action.payload
            };
        case Actions.SET_SOCKET_STATE:
            return {
                ...state,
                socketAlive: action.payload
            };
        case Actions.SET_BOT_DOWNLOAD_STATE:
            return {
                ...state,
                downloadingBot: action.payload
            };
        case Actions.SET_CALL_STATE:
            return {
                ...state,
                callActive: action.payload
            };
        case Actions.CHANNEL_FAV_UPDATE:
            return {
                ...state,
                updatedFavChannelIds: action.payload
            };
        default:
            return state;
    }
};
