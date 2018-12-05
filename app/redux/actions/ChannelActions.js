import { ActionTypes as Actions } from './ActionTypes';

export const setChannelFilter = payload => ({
    type: Actions.SET_CHANNEL_FILTER,
    payload
});

export const clearChannelFilter = payload => ({
    type: Actions.CLEAR_CHANNEL_FILTER,
    payload
});

export const setChannelParticipants = payload => ({
    type: Actions.SET_CHANNEL_PARTICIPANTS,
    payload
});
export const setChannelTeam = payload => ({
    type: Actions.SET_CHANNEL_TEAM,
    payload
});
