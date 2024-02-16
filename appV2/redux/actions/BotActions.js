import { ActionTypes as Actions } from './ActionTypes';

export const setLoadedBot = payload => ({
    type: Actions.SET_LOADED_BOT,
    payload
});

export const setDebugEnabledByBot = payload => ({
    type: Actions.SET_DEBUG_ENABLED_BY_BOT,
    payload
});

export const messageBroadcastByBot = payload => ({
    type: Actions.MESSAGE_BROADCAST_BY_BOT,
    payload
});

export const otherUserProfileUpdated = payload => ({
    type: Actions.OTHER_USER_PROFILE_UPDATED,
    payload
});
