import DeviceStorage from './DeviceStorage';
import Promise from './Promise';
import FrontmAuth from '../frontm_auth';
import { User, DefaultUser, isDefaultUser } from '../../lib/user';
import _ from 'lodash';
import config from '../../config/config';
import EventEmitter, { AuthEvents } from '../events';
import { ConversationDAO } from '../../lib/persistence';
import Bot from '../../lib/bot/index';

const USER_SESSION = 'userSession';

export const AUTH_PROVIDERS = {
    google: 'google',
    facebook: 'facebook'
};


export class AuthError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
    }

    get code() {
        return this.code;
    }

    get message() {
        return this.message;
    }
}

export const AuthErrorCodes = {
    0: 'User cancelled',
    1: 'Error in saving Auth Session',
    99: 'Unknown error',
}

/**
 * A simple auth wrapper
 */
export default class Auth {

    /**
	 * Auth the user with a given provider (google / facebook etc in future)
	 * @param {string} provider A user object
	 * @param {string} conversationId The bot's conversation id - will be tracked by backend for auth
	 * @param {string} botName The name of the bot that is asking for the auth
	 * @return {Promise}
	 */
    static login = (provider, conversationId, botName) => new Promise((resolve, reject) => {
        if (!AUTH_PROVIDERS[provider]) {
            return reject('Invalid provider. Not supported: ', provider);
        }
        if (provider === AUTH_PROVIDERS.google) {
            return resolve(Auth.loginWithGoogle(conversationId, botName));
        } else if (provider === AUTH_PROVIDERS.facebook) {
            return resolve(Auth.loginWithFacebook(conversationId, botName));
        } else {
            return reject('Not supported right now: ', provider);
        }
    });

    static loginWithGoogle = (conversationId, botName) => new Promise((resolve, reject) => {
        let currentUser = null;
        Auth.getUser()
            .then((user) => {
                currentUser = user;
                return FrontmAuth.loginWithGoogle(conversationId, botName)
            })
            .then((result) => {
                if (result && result.type === 'success') {
                    const creds = result.credentials.google;
                    currentUser = new User({
                        userUUID: creds.userUUID
                    });
                    currentUser.aws = {
                        identityId: creds.identityId,
                        accessKeyId: creds.accessKeyId,
                        secretAccessKey: creds.secretAccessKey,
                        sessionToken: creds.sessionToken
                    };
                    currentUser.provider = {
                        name: AUTH_PROVIDERS.google,
                        refreshToken: creds.refreshToken,
                        lastRefreshTime: Date.now()
                    };
                    currentUser.info = creds.info;

                    Auth.saveUser(currentUser)
                        .then((user) => {
                            EventEmitter.emit(AuthEvents.userLoggedIn, user);
                            resolve(user);
                        })
                        .catch((error) => {
                            reject(new AuthError(1, AuthErrorCodes[1]));
                        });
                } else {
                    reject(new AuthError(0, AuthErrorCodes[0]));
                }
            }).catch((error) => {
                reject(new AuthError(99, 'Error in Authenticating the user'));
            });
    });

    static loginWithFacebook = (conversationId, botName) => new Promise((resolve, reject) => {
        let currentUser = null;
        Auth.getUser()
            .then((user) => {
                currentUser = user;
                return FrontmAuth.loginWithFacebook(conversationId, botName)
            })
            .then((result) => {
                if (result && result.type === 'success') {
                    const creds = result.credentials.facebook;
                    currentUser = new User({
                        userUUID: creds.userUUID
                    });
                    currentUser.aws = {
                        identityId: creds.identityId,
                        accessKeyId: creds.accessKeyId,
                        secretAccessKey: creds.secretAccessKey,
                        sessionToken: creds.sessionToken
                    };
                    currentUser.provider = {
                        name: AUTH_PROVIDERS.facebook,
                        refreshToken: creds.refreshToken,
                        lastRefreshTime: Date.now()
                    };
                    currentUser.info = creds.info;

                    Auth.saveUser(currentUser)
                        .then((user) => {
                            EventEmitter.emit(AuthEvents.userLoggedIn, user);
                            resolve(user);
                        })
                        .catch((error) => {
                            reject(new AuthError(1, AuthErrorCodes[1]));
                        });
                } else {
                    reject(new AuthError(0, AuthErrorCodes[0]));
                }
            }).catch((error) => {
                reject(new AuthError(99, 'Error in Authenticating the user'));
            });
    });


    /**
	 * Invalidate the session for now
	 * @return {Promise}
	 */
    static logout = () => new Promise((resolve, reject) => {
        DeviceStorage.delete(USER_SESSION)
            .then(() => {
                return Bot.unInstallBots();
            })
            .then(() => {
                return ConversationDAO.deleteAllConversations();
            })
            .then(() => {
                EventEmitter.emit(AuthEvents.userLoggedOut);
                // Logging in as Default user for Onboarding bot
                resolve(Auth.saveUser(DefaultUser));
            })
            .catch((error) => {
                reject(error);
            })
    });

    /**
	 * A device level method for getting the user session
	 * @param {obj} user A user object
	 * @return {Promise}
	 */
    static saveUser = (user) => new Promise((resolve, reject) => {
        if (!user) {
            return reject('Valid user object required');
        }
        return resolve(DeviceStorage.save(USER_SESSION, user));
    });

    /**
	 * A device level method for getting the user session
	 * @return {Promise} user
	 */
    static getUser = () => new Promise((resolve) => {
        return resolve(DeviceStorage.get(USER_SESSION));
    });


    /**
     * A device level method for checking if a User is logged In.
     * Or a default user session exists.
     *
     * @return {Promise} bool
	 */
    static isUserLoggedIn = () => new Promise((resolve) => {
        DeviceStorage.get(USER_SESSION)
            .then((user) => {
                if (isDefaultUser(user) || !user) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
    });


    /**
     * Method to update user details like screenName, givenName, surName.
     * @param {obj} details Method expects a object with screenName, givenName or surName.
     *  if none of those keys exist, user is not updated.
     *
     * @return {Promise} user
	 */
    static updateUserDetails = (details) => new Promise((resolve, reject) => {
        return Auth.getUser()
            .then((user) => {
                if (user) {
                    user.info.screenName = details.screenName || user.info.screenName;
                    user.info.surname = details.surname || user.info.surname;
                    user.info.givenName = details.givenName || user.info.givenName;
                    user.info.name = user.info.givenName + ' ' + user.info.surname;
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            })
    })

    /**
     * Method to add domains to the existing user.
     * @param domains Either a single domain or a list of domains
     *
     * @return {Promise} user
	 */
    static addDomains = (domains) => new Promise((resolve, reject) => {
        return Auth.getUser()
            .then((user) => {
                if (user) {
                    user.info.domains = _.concat(user.info.domains || [], domains);
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            })
    })


    /**
	 * Invalidate the session for now
	 * @return {Promise}
	 */
    static refresh = (user) => new Promise((resolve, reject) => {
        const lastRefreshTime = _.get(user, 'provider.lastRefreshTime');

        if (!lastRefreshTime || (Date.now() - lastRefreshTime) < config.auth.cognito.tokenRefreshTime) {
            // No need to refresh
            return (resolve(user));
        }
        console.log('Auth::refresh::Going to refresh the user token at::', new Date());

        return FrontmAuth.refreshTokens(user)
            .then((result) => {
                if (result) {
                    user.aws.identityId = result.identityId || user.aws.identityId;
                    user.aws.accessKeyId = result.accessKeyId;
                    user.aws.secretAccessKey = result.secretAccessKey;
                    user.aws.sessionToken = result.sessionToken;
                    user.provider.lastRefreshTime = Date.now()

                    return resolve(Auth.saveUser(user));
                }
            }).catch((error) => {
                reject('Error with authing the user', error);
            });
    });

    /**
     * @return Returns Auth Providers
     */
    static authProviders = () => {
        return AUTH_PROVIDERS;
    }
}
