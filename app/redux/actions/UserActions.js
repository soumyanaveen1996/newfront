import { ActionTypes as Actions } from './ActionTypes';

export const setSatMode = payload => ({
    type: Actions.SET_SAT_MODE,
    payload
});

export const completeBotInstall = payload => ({
    type: Actions.COMPLETE_BOT_INSTALL,
    payload
});

export const completeChannelInstall = () => ({
    type: Actions.COMPLETE_CHANNEL_INSTALL
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
