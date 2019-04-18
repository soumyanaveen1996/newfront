import DeviceStorage from './DeviceStorage';
import Promise from './Promise';
import FrontmAuth from '../frontm_auth';
import { User, DefaultUser, isDefaultUser } from '../../lib/user';
import _ from 'lodash';
import config from '../../config/config';
import EventEmitter, { AuthEvents } from '../events';
import {
    ConversationDAO,
    BackgroundTaskDAO,
    ChannelDAO,
    NetworkDAO,
    ArrayStorageDAO
} from '../../lib/persistence';
import Bot from '../../lib/bot/index';
import { Network } from '../capability';
import { AsyncStorage } from 'react-native';
import { MessageHandler } from '../message';
import { Twilio } from '../twilio';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import { Message, MessageTypeConstants } from '../../lib/capability';
import SystemBot from '../../lib/bot/SystemBot';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import { NativeModules } from 'react-native';

const AuthServiceClient = NativeModules.AuthServiceClient;
const UserServiceClient = NativeModules.UserServiceClient;

const USER_SESSION = 'userSession';

export const AUTH_PROVIDERS = {
    google: 'google',
    facebook: 'facebook',
    frontm: 'FrontM'
};

export class AuthError extends Error {
    constructor(code, message) {
        super(code, message);
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
    2: 'Logout Error',
    98: 'Custom Error',
    99: 'Unknown error'
};

const sendMessageCount = async () => {
    try {
        const message = new Message({
            options: JSON.stringify({
                key: 'MessageUsageUpdate'
            }),
            messageType: MessageTypeConstants.MESSAGE_TYPE_BACKGROUND_EVENT
        });
        message.setCreatedBy({ addedByBot: true });
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });
        await bgBotScreen.initialize();
        await bgBotScreen.next(message, {}, [], bgBotScreen.getBotContext());
        console.log('test');
        return true;
    } catch (error) {
        console.log(error);
        return true;
    }
};

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
    static login = (provider, conversationId, botName) =>
        new Promise((resolve, reject) => {
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

    static loginWithGoogle = (conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then(user => {
                    currentUser = user;
                    return FrontmAuth.loginWithGoogle(conversationId, botName);
                })
                .then(result => {
                    if (result && result.type === 'success') {
                        const creds = result.credentials.google;
                        currentUser = new User({
                            userId: creds.userId
                        });
                        currentUser.creds = {
                            sessionId: creds.sessionId
                        };
                        currentUser.provider = {
                            name: AUTH_PROVIDERS.google,
                            refreshToken: creds.refreshToken,
                            lastRefreshTime: Date.now()
                        };
                        currentUser.info = creds.info;
                        Auth.saveUser(currentUser)
                            .then(user => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch(error => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch(error => {
                    console.log('Error in google login : ', error);
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                });
        });

    static loginWithFacebook = (conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then(user => {
                    currentUser = user;
                    return FrontmAuth.loginWithFacebook(
                        conversationId,
                        botName
                    );
                })
                .then(result => {
                    if (result && result.type === 'success') {
                        const creds = result.credentials.facebook;
                        currentUser = new User({
                            userId: creds.userId
                        });
                        currentUser.creds = {
                            sessionId: creds.sessionId
                        };
                        currentUser.provider = {
                            name: AUTH_PROVIDERS.facebook,
                            refreshToken: creds.refreshToken,
                            lastRefreshTime: Date.now()
                        };
                        currentUser.info = creds.info;

                        Auth.saveUser(currentUser)
                            .then(user => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch(error => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch(error => {
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                });
        });

    static signupWithFrontm = userDetails =>
        new Promise((resolve, reject) => {
            AuthServiceClient.signup(userDetails, (err, result) => {
                if (err) {
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                } else {
                    console.log('signup result : ', result);
                    if (result.success === true) {
                        resolve(result.data);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                }
            });
        });

    static confirmFrontmSignup = userDetails =>
        new Promise((resolve, reject) => {
            AuthServiceClient.confirmSignup(userDetails, (err, result) => {
                if (err) {
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                } else {
                    console.log('confirm signup result : ', result);
                    if (result.success === true) {
                        console.log('confirm signup result1 : ', result);
                        resolve(result.data);
                    } else {
                        console.log('confirm signup result2 : ', result);
                        reject(new AuthError(98, result.message));
                    }
                }
            });
        });

    static resendFrontmSignupCode = userDetails =>
        new Promise((resolve, reject) => {
            AuthServiceClient.resendSignupCode(userDetails, (err, result) => {
                if (err) {
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                } else {
                    console.log(
                        'resendFrontmSignupCode signup result : ',
                        result
                    );
                    if (result.success === true) {
                        resolve(result.data);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                }
            });
        });

    static resetPassword = userDetails => {
        return new Promise((resolve, reject) => {
            AuthServiceClient.resetPassword(userDetails, (err, result) => {
                if (err) {
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                } else {
                    console.log(
                        'resendFrontmSignupCode signup result : ',
                        result
                    );
                    if (result.success === true) {
                        resolve(result.data);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                }
            });
        });
    };

    static confirmReset = userDetails =>
        new Promise((resolve, reject) => {
            AuthServiceClient.confirmPasswordReset(
                userDetails,
                (err, result) => {
                    if (err) {
                        reject(
                            new AuthError(
                                99,
                                'Error in Authenticating the user'
                            )
                        );
                    } else {
                        console.log(
                            'resendFrontmSignupCode signup result : ',
                            result
                        );
                        if (result.success === true) {
                            resolve(result.data);
                        } else {
                            reject(new AuthError(98, result.message));
                        }
                    }
                }
            );
        });

    static loginWithFrontm = (userDetails, conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then(user => {
                    currentUser = user;
                    return FrontmAuth.signinWithFrontm(userDetails);
                })
                .then(result => {
                    console.log('frontm login result : ', result);
                    if (result) {
                        const creds = result.credentials.frontm;
                        currentUser = new User({
                            userId: creds.userId
                        });
                        currentUser.creds = {
                            sessionId: creds.sessionId
                        };
                        currentUser.provider = {
                            name: AUTH_PROVIDERS.frontm,
                            refreshToken: creds.refreshToken,
                            lastRefreshTime: Date.now()
                        };
                        currentUser.info = creds.info;
                        console.log('Saving current user : ', currentUser);
                        Auth.saveUser(currentUser)
                            .then(user => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch(error => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch(error => {
                    console.log('Login error message', error);
                    if (error.errorMessage) {
                        reject(new AuthError(98, error.errorMessage));
                    } else {
                        reject(
                            new AuthError(
                                99,
                                'Error in Authenticating the user'
                            )
                        );
                    }
                });
        });

    static deleteUser = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        AuthServiceClient.deleteUser(
                            user.creds.sessionId,
                            (err, result) => {
                                if (err) {
                                    throw new AuthError(
                                        99,
                                        'Error in Deleting the user'
                                    );
                                } else {
                                    console.log(
                                        'delete user signup result : ',
                                        result
                                    );
                                    if (result.success === true) {
                                        return Auth.logout();
                                    } else {
                                        throw new AuthError(98, result.message);
                                    }
                                }
                            }
                        );
                    } else {
                        resolve();
                    }
                })
                .then(resolve)
                .catch(reject);
        });

    /**
     * Invalidate the session for now
     * @return {Promise}
     */

    static logout = async () => {
        const res = await sendMessageCount();
        console.log(res);

        return new Promise((resolve, reject) => {
            DeviceStorage.delete(USER_SESSION)
                .then(() => {
                    return Bot.unInstallBots();
                })
                .then(() => {
                    return ConversationDAO.deleteAllConversations();
                })
                .then(() => {
                    return MessageHandler.deleteAllMessages();
                })
                .then(() => {
                    return ChannelDAO.deleteAllChannels();
                })
                .then(() => {
                    return NetworkDAO.deleteAllRows();
                })
                .then(() => {
                    return ArrayStorageDAO.deleteAllRows();
                })
                .then(() => {
                    return AsyncStorage.clear();
                })
                .then(() => {
                    return BackgroundTaskDAO.deleteAllTasks();
                })
                .then(() => {
                    EventEmitter.emit(AuthEvents.userLoggedOut);
                    // Logging in as Default user for Onboarding bot
                    resolve(Auth.saveUser(DefaultUser));
                })
                .catch(error => {
                    console.log('Error in logging out : ', error);
                    reject(new AuthError(2, AuthErrorCodes[2]));
                });
        });
    };

    /**
     * A device level method for getting the user session
     * @param {obj} user A user object
     * @return {Promise}
     */
    static saveUser = user =>
        new Promise((resolve, reject) => {
            if (!user) {
                return reject('Valid user object required');
            }
            DeviceStorage.save(USER_SESSION, user)
                .then(resolve)
                .catch(reject);
        });

    /**
     * A device level method for getting the user session
     * @return {Promise} user
     */
    static getUser = () =>
        new Promise(resolve => {
            return resolve(DeviceStorage.get(USER_SESSION));
        });

    /**
     * A device level method for checking if a User is logged In.
     * Or a default user session exists.
     *
     * @return {Promise} bool
     */
    static isUserLoggedIn = () =>
        new Promise(resolve => {
            DeviceStorage.get(USER_SESSION).then(user => {
                if (!user || isDefaultUser(user)) {
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
    static updateUserDetails = details =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    user.info.userName = details.userName || user.info.userName;
                    user.info.phoneNumbers = details.phoneNumbers || {};
                    user.info.searchable = details.searchable || false;
                    user.info.visible = details.visible || false;

                    // user.info.surname = details.surname || user.info.surname;
                    // user.info.givenName =
                    //     details.givenName || user.info.givenName;
                    // user.info.name = user.info.userName;
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            });
        });

    static updatingUserProfile = userDetails =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    UserServiceClient.updateUserProfile(
                        user.creds.sessionId,
                        userDetails,
                        (err, result) => {
                            if (err) {
                                return reject(
                                    new AuthError(99, 'Unknown Error')
                                );
                            }
                            if (
                                result.data.content &&
                                result.data.content.length > 0
                            ) {
                                resolve(result.data.content);
                            } else {
                                reject(null);
                            }
                        }
                    );
                } else {
                    reject(new AuthError(99, 'No Logged in user'));
                }
            });
        });

    static setUserSetting = (key, value) =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    user.info[key] = value;
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            });
        });

    static getUserSetting = (key, defaultValue = undefined) =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    resolve(user.info[key] || defaultValue);
                } else {
                    reject('No valid user session');
                }
            });
        });

    /**
     * Method to add domains to the existing user.
     * @param domains Either a single domain or a list of domains
     *
     * @return {Promise} user
     */
    static addDomains = domains =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    user.info.domains = _.concat(
                        user.info.domains || [],
                        domains
                    );
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            });
        });

    /**
     * Method to set domains to the existing user.
     * @param domains Either a single domain or a list of domains
     *
     * @return {Promise} user
     */
    static setDomains = domains =>
        new Promise((resolve, reject) => {
            return Auth.getUser().then(user => {
                if (user) {
                    user.info.domains = domains;
                    return resolve(Auth.saveUser(user));
                } else {
                    reject('No valid user session');
                }
            });
        });

    static updatePassword = payload =>
        new Promise((resolve, reject) => {
            return Auth.getUser()
                .then(user => {
                    console.log('update password User : ', user);
                    if (user) {
                        return FrontmAuth.updatePassword(
                            user.creds.sessionId,
                            payload
                        );
                    } else {
                        reject('No valid user session');
                    }
                })
                .then(resolve)
                .catch(error => {
                    if (error && error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        reject(
                            new AuthError(
                                99,
                                'Error in updating the password for the user'
                            )
                        );
                    }
                });
        });

    /**
     * Invalidate the session for now
     * @return {Promise}
     */
    static refresh = user =>
        new Promise((resolve, reject) => {
            const lastRefreshTime = _.get(user, 'provider.lastRefreshTime');

            if (
                !lastRefreshTime ||
                Date.now() - lastRefreshTime <
                    config.auth.cognito.tokenRefreshTime
            ) {
                // No need to refresh
                return resolve(user);
            }
            console.log(
                'Auth::refresh::Going to refresh the user token at::',
                new Date()
            );

            return FrontmAuth.refreshTokens(user)
                .then(result => {
                    if (result) {
                        user.creds.sessionId = result.sessionId;
                        user.provider.lastRefreshTime = Date.now();

                        return resolve(Auth.saveUser(user));
                    }
                })
                .catch(error => {
                    reject('Error with authing the user', error);
                });
        });

    /**
     * @return Returns Auth Providers
     */
    static authProviders = () => {
        return AUTH_PROVIDERS;
    };
}
