import { ActionTypes as Actions } from './ActionTypes';

export const setSatMode = payload => ({
    type: Actions.SET_SAT_MODE,
    payload
});

export const completeBotInstall = payload => ({
    type: Actions.COMPLETE_BOT_INSTALL,
    payload
});

export const completeChannelInstall = payload => ({
    type: Actions.COMPLETE_CHANNEL_INSTALL,
    payload
});

export const completeCatalogLoad = payload => ({
    type: Actions.COMPLETE_CATALOG_LOAD,
    payload
});

export const completeConversationsLoad = payload => ({
    type: Actions.COMPLETE_CONVERSATIONS_LOAD,
    payload
});

export const completeContactsLoad = payload => ({
    type: Actions.COMPLETE_CONTACTS_LOAD,
    payload
});

export const logout = () => ({
    type: Actions.LOGOUT
});

export const setCurrentScene = payload => ({
    type: Actions.SET_CURRENT_SCENE,
    payload
});

export const refreshTimeline = payload => ({
    type: Actions.REFRESH_TIMELINE,
    payload
});

export const refreshChannels = payload => ({
    type: Actions.REFRESH_CHANNELS,
    payload
});

export const refreshContacts = payload => ({
    type: Actions.REFRESH_CONTACTS,
    payload
});

export const refreshUserEmail = payload => ({
    type: Actions.USER_EMAIL,
    payload
});

export const setNetwork = payload => ({
    type: Actions.SET_NETWORK,
    payload
});

export const setCurrentConversationId = payload => ({
    type: Actions.SET_CURRENT_CONVERSATION_ID,
    payload
});
export const uploadImage = () => ({
    type: Actions.UPLOAD_IMAGE
});
