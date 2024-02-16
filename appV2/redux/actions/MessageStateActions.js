import { ActionTypes as Actions } from './ActionTypes';

export const setCurrentMnuEntry = payload => ({
    type: Actions.SET_CURRENT_ACTIVE_MENU_ENTRY,
    payload
});
export const setWaitingForMessage = payload => ({
    type: Actions.SET_WAITING_FOR_MESSAGE,
    payload
});
