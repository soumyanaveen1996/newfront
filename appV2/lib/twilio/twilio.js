import config from '../../config/config';
import UserServices from '../../apiV2/UserServices';

const getAccessToken = (user) => {
    if (!user) {
        return;
    }
    return UserServices.generateTwilioToken({ env: config.twilioEnv })
        .then((result) => {
            if (result && result.accessToken) {
                return result.accessToken;
            } else {
                throw new Error('Unable to grant access to the user.');
            }
        })
        .catch((error) => {
            if (error.code) {
                throw {
                    type: 'error',
                    error: error.code
                };
            } else {
                throw error;
            }
        });
};

const enableVoIP = (user) => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return UserServices.enableVoip()
        .then((result) => {
            if (result && result.success) {
                return true;
            } else {
                reject(new Error('Unable to enable VoIP for the user'));
            }
        })
        .catch((error) => {
            if (error.code) {
                throw {
                    type: 'error',
                    error: error.code
                };
            } else {
                throw error;
            }
        });
};

const disableVoip = (user) => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return UserServices.disableVoip()
        .then((result) => {
            if (result && result.success) {
                return true;
            } else {
                reject(new Error('Unable to enable VoIP for the user'));
            }
        })
        .catch((error) => {
            if (error.code) {
                throw {
                    type: 'error',
                    error: error.code
                };
            } else {
                throw error;
            }
        });
};

const isVoIPEnabled = (otherUserId, user) => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return UserServices.getVoipStatus({ userId: otherUserId })
        .then((result) => {
            if (result) {
                return result.voipEnabled;
            } else {
                return false;
            }
        })
        .catch((error) => {
            console.log('isPostpaidUser : ', error);
            if (error.code) {
                throw {
                    type: 'error',
                    error: error.code
                };
            } else {
                throw error;
            }
        });
};

const isPostpaidUser = (user) => {
    if (!user) {
        return;
    }
    return UserServices.getVoipStatus({ userId: user.userId })
        .then((result) => {
            if (result) {
                return result.isPostpaidUser;
            } else {
                return false;
            }
        })
        .catch((error) => {
            if (error.code) {
                throw {
                    type: 'error',
                    error: error.code
                };
            } else {
                throw error;
            }
        });
};

const getAccessTokenURL = (user) => {
    return `${config.network.queueProtocol}${config.proxy.host}${config.proxy.twilioPath}`;
};

export default {
    getAccessToken,
    getAccessTokenURL,
    enableVoIP,
    disableVoip,
    isVoIPEnabled,
    isPostpaidUser
};
