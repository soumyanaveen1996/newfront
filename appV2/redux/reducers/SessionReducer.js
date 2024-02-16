import initialState from '../store/initialState';
import { ActionTypes as Actions } from '../actions/ActionTypes';

export const SessionReducer = (state = initialState.session, action) => {
    let newState;
    switch (action.type) {
        case Actions.USER_LOGIN:
            console.log('USER_SESSION update in redux', action);
            return { ...state, ...{ user: action.payload } };
        default:
            return state;
    }
};
