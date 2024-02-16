import User from './User';

// const DEFAULT_USER_UUID = 'default_user_uuid';
const DEFAULT_USER_UUID = null;

const defaultUser = new User({
    userId: DEFAULT_USER_UUID
});

export function isDefaultUser(user) {
    return user.userId === defaultUser.userId;
}

export default defaultUser;
