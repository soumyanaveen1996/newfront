import { ActionTypes as Actions } from './ActionTypes';

export const setSatMode = payload => ({
    type: Actions.SET_SAT_MODE,
    payload
});

export const completeBotInstall = () => ({
    type: Actions.COMPLETE_BOT_INSTALL
});

export const completeChannelInstall = () => ({
    type: Actions.COMPLETE_CHANNEL_INSTALL
});

export const completeContactsLoad = () => ({
    type: Actions.COMPLETE_CONTACTS_LOAD
});

export const logout = () => ({
    type: Actions.LOGOUT
});
