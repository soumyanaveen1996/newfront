import User from './User';

const DEFAULT_USER_UUID = 'default_user_uuid';

const defaultUser = new User({
    userUUID: DEFAULT_USER_UUID,
});

export function isDefaultUser(user) {
    return user.userUUID === defaultUser.userUUID;
}

export default defaultUser;
