import { ActionTypes as Actions } from './ActionTypes';

export const userLogin = payload => ({
    type: Actions.USER_LOGIN,
    payload
});
