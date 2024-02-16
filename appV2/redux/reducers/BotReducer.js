import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const BotReducer = (state = initialState.botState, action) => {
    let newState;
    switch (action.type) {
        case Actions.SET_LOADED_BOT: {
            let currentBot = state.id;
            let activeBots = state.activeBots;
            if (action.payload.newBotId === null) {
                activeBots = activeBots.filter(
                    (bot) => bot !== action.payload.sourceBot
                );
                if (activeBots.length > 0)
                    currentBot = activeBots[activeBots.length - 1];
                else currentBot = null;
            } else {
                currentBot = action.payload.newBotId;
                activeBots.push(action.payload.newBotId);
            }

            return {
                ...state,
                ...{
                    id: currentBot,
                    domain: action.payload.domain,
                    instanceId: action.payload.instanceId,
                    activeBots: activeBots
                }
            };
        }

        case Actions.SET_DEBUG_ENABLED_BY_BOT:
            if (state.isDebugEnabledByBot === action.payload) {
                return state;
            } else {
                return { ...state, ...{ isDebugEnabledByBot: action.payload } };
            }
        case Actions.MESSAGE_BROADCAST_BY_BOT:
            return { ...state, ...{ messageByBot: action.payload } };
        case Actions.OTHER_USER_PROFILE_UPDATED:
            return {
                ...state,
                ...{ isOtherUserProfileUpdated: action.payload }
            };
        case Actions.UPDATE_NONCONV_CHAT:
            if (action.payload.instanceId) {
                if (state.instanceId === action.payload.instanceId) {
                    const newNonConvChatMessages = state.nonConvChatMessages;
                    newNonConvChatMessages[action.payload.id] =
                        action.payload.list;
                    return {
                        ...state,
                        ...{ nonConvChatMessages: newNonConvChatMessages }
                    };
                } else {
                    console.log('Actoin ignored');
                    return {
                        ...state
                    };
                }
            } else {
                const newNonConvChatMessages = state.nonConvChatMessages;
                newNonConvChatMessages[action.payload.id] = action.payload.list;
                return {
                    ...state,
                    ...{ nonConvChatMessages: newNonConvChatMessages }
                };
            }

        case Actions.UPDATE_NONCONV_CONTROLS_LIST:
            if (action.payload.instanceId) {
                if (state.instanceId === action.payload.instanceId) {
                    const newNonConvControlsList = state.nonConvControlsList;
                    newNonConvControlsList[action.payload.id] =
                        action.payload.list;
                    return {
                        ...state,
                        ...{ nonConvControlsList: newNonConvControlsList }
                    };
                } else {
                    console.log('Actoin ignored');
                    return {
                        ...state
                    };
                }
            } else {
                const newNonConvControlsList = state.nonConvControlsList;
                newNonConvControlsList[action.payload.id] = action.payload.list;
                return {
                    ...state,
                    ...{ nonConvControlsList: newNonConvControlsList }
                };
            }

        default:
            return state;
    }
};
