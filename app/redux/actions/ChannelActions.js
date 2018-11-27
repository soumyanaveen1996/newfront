import { ActionTypes as Actions } from './ActionTypes';

export const setChannelFilter = payload => ({
    type: Actions.SET_CHANNEL_FILTER,
    payload
});

export const clearChannelFilter = payload => ({
    type: Actions.CLEAR_CHANNEL_FILTER,
    payload
});
