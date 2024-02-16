import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceStorage from './DeviceStorage';
import Promise from './Promise';
import FrontmAuth from '../frontm_auth';
import { User, isDefaultUser } from '../user';
import config from '../../config/config';
import EventEmitter, { AuthEvents } from '../events';
import {
    ConversationDAO,
    BackgroundTaskDAO,
    ChannelDAO,
    NetworkDAO,
    ArrayStorageDAO,
    PhoneContactsDAO
} from '../persistence';
import Bot from '../bot/index';
import { Network, Notification, Message, MessageTypeConstants, Utils } from '.';
import { MessageHandler } from '../message';

import SystemBot from '../bot/SystemBot';
import { BackgroundBotChat } from '../BackgroundTask';
import { PurchaseManager } from './InAppPurchase';
import Bugsnag from '../../config/ErrorMonitoring';
import I18n from '../../config/i18n/i18n';
import { userLogin } from '../../redux/actions/SessionAction';
import Store from '../../redux/store/configureStore';
import AuthService from '../../apiV2/AuthService';
import UserServices from '../../apiV2/UserServices';
import { resetApiClient } from '../../apiV2/Api';
import { CONTACT_STORAGE_KEY_CAPABILITY } from './Contact';

const USER_SESSION = 'userSession';
const POSTPAID_USER = 'postpaidUser';

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
        const bgBotScreen = new BackgroundBotChat({
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
            }
            if (provider === AUTH_PROVIDERS.facebook) {
                return resolve(Auth.loginWithFacebook(conversationId, botName));
            }
            return reject('Not supported right now: ', provider);
        });

    static loginWithGoogle = (conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then((user) => {
                    currentUser = user;

                    return FrontmAuth.loginWithGoogle(conversationId, botName);
                })
                .then((result) => {
                    if (result && result.type === 'success') {
                        const creds = result.credentials.google;
                        const tokenid = result.credentials.idToken;
                        const code = result.credentials.serverAuthCode;
                        const refreshId = result.credentials.refreshToken;

                        currentUser = new User({
                            userId: creds.userId
                        });
                        currentUser.creds = {
                            sessionId: creds.sessionId,
                            searchable: true
                        };
                        currentUser.provider = {
                            name: AUTH_PROVIDERS.google,
                            refreshToken: creds.refreshToken,
                            lastRefreshTime: Date.now()
                        };
                        currentUser.info = creds.info;
                        Auth.saveUser(currentUser)
                            .then((user) => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch((error) => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch((error) => {
                    Bugsnag.notify(
                        new Error(JSON.stringify(error)),
                        (report) => {
                            report.context = 'Error in google login';
                        }
                    );
                    reject(
                        new AuthError(
                            99,
                            error.message
                                ? error.message
                                : 'Error in Authenticating the user'
                        )
                    );
                });
        });

    static loginWithFacebook = (conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then((user) => {
                    currentUser = user;
                    return FrontmAuth.loginWithFacebook(
                        conversationId,
                        botName
                    );
                })
                .then((result) => {
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
                            .then((user) => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch((error) => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch((error) => {
                    console.log('Error in facefook login : ', error);
                    Bugsnag.notify(
                        new Error(JSON.stringify(error)),
                        (report) => {
                            report.context = 'Error inloginWithFacebook';
                        }
                    );
                    reject(
                        new AuthError(
                            99,
                            error.message
                                ? error.message
                                : 'Error in Authenticating the user'
                        )
                    );
                });
        });

    static loginWithApple = (conversationId, botName, code, name) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then((user) => {
                    currentUser = user;
                    console.log(
                        '+++apple sign in, calking FrontmAuth method now with '
                    );
                    return FrontmAuth.loginWithApple(
                        conversationId,
                        botName,
                        code,
                        name
                    );
                })
                .then((result) => {
                    console.log('+++++++ apple logn done:', result);
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
                            .then((user) => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch((error) => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(0, AuthErrorCodes[0]));
                    }
                })
                .catch((error) => {
                    console.log('+++++++ apple logn error:', error);
                    Bugsnag.notify(
                        new Error(JSON.stringify(error)),
                        (report) => {
                            report.context = 'Error in apple login';
                        }
                    );
                    reject(
                        new AuthError(
                            99,
                            error.message
                                ? error.message
                                : 'Error in Authenticating the user'
                        )
                    );
                });
        });

    static signupWithFrontm = (userDetails) =>
        new Promise((resolve, reject) => {
            AuthService.signup(userDetails)
                .then((result) => {
                    console.log('signup result : ', result);
                    if (result.success === true) {
                        resolve(result);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                })
                .catch((err) => {
                    console.log('Error in signupWithFrontm : ', err);
                    Bugsnag.notify(new Error(JSON.stringify(err)), (report) => {
                        report.context = 'Error in signupWithFrontm';
                    });
                    reject(
                        new AuthError(
                            99,
                            err.message
                                ? err.message
                                : 'Error in Authenticating the user'
                        )
                    );
                });
        });

    static confirmFrontmSignup = (userDetails) =>
        new Promise((resolve, reject) => {
            AuthService.confirmSignup(userDetails)
                .then((result) => {
                    console.log('signup result : ', result);
                    if (result.success === true) {
                        resolve(result);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                })
                .catch((err) => {
                    console.log('Error in confirmFrontmSignup : ', err);
                    Bugsnag.notify(new Error(JSON.stringify(err)), (report) => {
                        report.context = 'Error in confirmFrontmSignup';
                    });
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                });
        });

    static resendFrontmSignupCode = (userDetails) =>
        new Promise((resolve, reject) => {
            AuthService.resendSignupCode(userDetails)
                .then((result) => {
                    console.log('signup result : ', result);
                    if (result.success === true) {
                        resolve(result);
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                })
                .catch((err) => {
                    console.log('Error in resendFrontmSignupCode : ', err);
                    Bugsnag.notify(new Error(JSON.stringify(err)), (report) => {
                        report.context = 'Error in resendFrontmSignupCode';
                    });
                    reject(
                        new AuthError(99, 'Error in Authenticating the user')
                    );
                });
        });

    static resetPassword = (userDetails) =>
        AuthService.resetPassword(userDetails);

    static confirmReset = (userDetails) =>
        AuthService.confirmPasswordReset(userDetails);

    static loginWithFrontm = (userDetails, conversationId, botName) =>
        new Promise((resolve, reject) => {
            let currentUser = null;
            Auth.getUser()
                .then((user) => {
                    currentUser = user;
                    // return FrontmAuth.signinWithFrontm(userDetails);
                    return AuthService.signinWithFrontm(userDetails);
                })
                .then((result) => {
                    console.log('frontm login result : ', result);
                    if (result.success) {
                        const creds = result.user;
                        console.log('frontm login user : ', creds);
                        currentUser = new User({
                            userId: creds.userId
                        });
                        currentUser.creds = {
                            sessionId: result.sessionId
                        };
                        currentUser.provider = {
                            name: AUTH_PROVIDERS.frontm,
                            refreshToken: creds.refreshToken,
                            lastRefreshTime: Date.now()
                        };
                        currentUser.info = creds;
                        console.log(
                            'Saving current user : ',
                            JSON.stringify(currentUser, null, 2)
                        );
                        Auth.saveUser(currentUser)
                            .then((user) => {
                                EventEmitter.emit(
                                    AuthEvents.userLoggedIn,
                                    user
                                );
                                resolve(user);
                            })
                            .catch((error) => {
                                reject(new AuthError(1, AuthErrorCodes[1]));
                            });
                    } else {
                        reject(new AuthError(98, result.message));
                    }
                })
                .catch((error) => {
                    console.log('Login error message', error);
                    if (error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        Bugsnag.notify(
                            new Error(JSON.stringify(error)),
                            (report) => {
                                report.context =
                                    'Error in loginWithFrontm, exception';
                            }
                        );
                        reject(
                            new AuthError(
                                99,
                                'System timeout, please try again later'
                            )
                        );
                    }
                });
        });

    static deleteAccountLogout = async () => {
        return new Promise((resolve, reject) => {
            const logoutsteps = [];
            PurchaseManager.unsubscribe();
            ArrayStorageDAO.deleteSession()
                .then(() => {
                    logoutsteps.push("DeviceStorage.delete'");
                    Bugsnag.leaveBreadcrumb('DeviceStorage.delete');
                    return Bot.unInstallBots();
                })
                .then(() => {
                    logoutsteps.push('unInstallBots');
                    Bugsnag.leaveBreadcrumb('unInstallBots');
                    return ConversationDAO.deleteAllConversations();
                })
                .then(() => {
                    logoutsteps.push('deleteAllConversations');
                    Bugsnag.leaveBreadcrumb('deleteAllConversations');
                    return MessageHandler.deleteAllMessages();
                })
                .then(() => {
                    logoutsteps.push('deleteAllMessages');
                    Bugsnag.leaveBreadcrumb('deleteAllMessages');
                    return ChannelDAO.deleteAllChannels();
                })
                .then(() => {
                    logoutsteps.push('deleteAllChannels');
                    Bugsnag.leaveBreadcrumb('deleteAllChannels');
                    return NetworkDAO.deleteAllRows();
                })
                .then(() => {
                    logoutsteps.push('etworkDAO.deleteAllRows');
                    Bugsnag.leaveBreadcrumb('NetworkDAO.deleteAllRows');
                    return PhoneContactsDAO.deleteAllPhoneBookContacts();
                })
                .then(() => {
                    logoutsteps.push('deleteAllPhoneBookContacts');
                    Bugsnag.leaveBreadcrumb('deleteAllPhoneBookContacts');
                    return ArrayStorageDAO.deleteAllRows();
                })
                .then(() => {
                    logoutsteps.push('ArrayStorageDAO.deleteAllRows');
                    Bugsnag.leaveBreadcrumb('ArrayStorageDAO.deleteAllRows');
                    return AsyncStorage.clear();
                })
                .then(() => {
                    logoutsteps.push('AsyncStorage.clear');
                    Bugsnag.leaveBreadcrumb('AsyncStorage.clear');
                    return BackgroundTaskDAO.deleteAllTasks();
                })
                .then(() => {
                    logoutsteps.push('deleteAllTasks');
                    Bugsnag.leaveBreadcrumb('deleteAllTasks');
                    return AsyncStorage.removeItem('signupStage');
                })
                .then(() => {
                    logoutsteps.push('removeItemSignupStage');
                    Bugsnag.leaveBreadcrumb('removeItemSignupStage');
                    return AsyncStorage.removeItem('userEmail');
                })
                .then(() => {
                    console.log('Logged out ', logoutsteps);
                    EventEmitter.emit(AuthEvents.userLoggedOut);
                    resetApiClient();
                    AsyncStorage.removeItem('existingUser');
                    AsyncStorage.getAllKeys().then((keys) =>
                        AsyncStorage.multiRemove(keys)
                    );
                    Bugsnag.notify(
                        new AuthError(0, 'manual handling'),
                        (report) => {
                            report.context = 'Success in logout';
                            report.addMetadata('data', {
                                error: 'error string'
                            });
                        }
                    );
                })
                .catch((error) => {
                    console.log('Error in logging out : ', error);
                    Utils.addBotLogs(logoutsteps, 'Logout Error');
                    reject(new AuthError(2, AuthErrorCodes[2]));
                    Bugsnag.notify(
                        new AuthError(2, AuthErrorCodes[2]),
                        (report) => {
                            report.context = 'Error in logout';
                            report.addMetadata('data', {
                                error: JSON.stringify(error)
                            });
                        }
                    );
                });
        });
    };

    static deleteUser = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        AuthService.deleteUser(
                            user.creds.sessionId,
                            (err, result) => {
                                if (result && result.success) {
                                    return Auth.deleteAccountLogout();
                                } else {
                                    throw new AuthError(99, err);
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

    static notificationDeregister = (attempt) => {
        return new Promise((resolve) => {
            Notification.deregister(true)
                .then(resolve)
                .catch(() => {
                    if (attempt < 2) {
                        return Auth.notificationDeregister(attempt + 1);
                    } else {
                        return { error: 'After attempt 2' };
                    }
                })
                .then(resolve);
        });
    };

    static cleanDomainData = () => {
        return ConversationDAO.deleteAllConversations()
            .then(() => {
                return Bot.unInstallBots();
            })
            .then(() => {
                Bugsnag.leaveBreadcrumb('deleteAllConversations');
                return MessageHandler.deleteAllMessages();
            })
            .then(() => {
                Bugsnag.leaveBreadcrumb('deleteAllMessages');
                return ChannelDAO.deleteAllChannels();
            })
            .then(() => {
                Bugsnag.leaveBreadcrumb('NetworkDAO.deleteAllRows');
                return PhoneContactsDAO.deleteAllPhoneBookContacts();
            })
            .then(() => {
                Bugsnag.leaveBreadcrumb('deleteAllPhoneBookContacts');
                return DeviceStorage.delete(CONTACT_STORAGE_KEY_CAPABILITY);
            });
    };

    /**
     * Invalidate the session for now
     * @return {Promise}
     */

    static logout = async () => {
        const res = await sendMessageCount();
        console.log(res);
        console.log('Logging out');
        return new Promise((resolve, reject) => {
            FrontmAuth.facebookLogout();
            const logoutsteps = [];
            PurchaseManager.unsubscribe();
            Auth.notificationDeregister(0)
                .then(() => {
                    logoutsteps.push('NotificationDregister');
                    Bugsnag.leaveBreadcrumb('NotificationDeregister');
                    return ArrayStorageDAO.deleteSession();
                })
                .then(() => {
                    logoutsteps.push("DeviceStorage.delete'");
                    Bugsnag.leaveBreadcrumb('DeviceStorage.delete');
                    return Bot.unInstallBots();
                })
                .then(() => {
                    logoutsteps.push('unInstallBots');
                    Bugsnag.leaveBreadcrumb('unInstallBots');
                    return ConversationDAO.deleteAllConversations();
                })
                .then(() => {
                    logoutsteps.push('deleteAllConversations');
                    Bugsnag.leaveBreadcrumb('deleteAllConversations');
                    return MessageHandler.deleteAllMessages();
                })
                .then(() => {
                    logoutsteps.push('deleteAllMessages');
                    Bugsnag.leaveBreadcrumb('deleteAllMessages');
                    return ChannelDAO.deleteAllChannels();
                })
                .then(() => {
                    logoutsteps.push('deleteAllChannels');
                    Bugsnag.leaveBreadcrumb('deleteAllChannels');
                    return NetworkDAO.deleteAllRows();
                })
                .then(() => {
                    logoutsteps.push('etworkDAO.deleteAllRows');
                    Bugsnag.leaveBreadcrumb('NetworkDAO.deleteAllRows');
                    return PhoneContactsDAO.deleteAllPhoneBookContacts();
                })
                .then(() => {
                    logoutsteps.push('deleteAllPhoneBookContacts');
                    Bugsnag.leaveBreadcrumb('deleteAllPhoneBookContacts');
                    return ArrayStorageDAO.deleteAllRows();
                })
                .then(() => {
                    logoutsteps.push('ArrayStorageDAO.deleteAllRows');
                    Bugsnag.leaveBreadcrumb('ArrayStorageDAO.deleteAllRows');
                    return AsyncStorage.clear();
                })
                .then(() => {
                    logoutsteps.push('AsyncStorage.clear');
                    Bugsnag.leaveBreadcrumb('AsyncStorage.clear');
                    return BackgroundTaskDAO.deleteAllTasks();
                })
                .then(() => {
                    logoutsteps.push('deleteAllTasks');
                    Bugsnag.leaveBreadcrumb('deleteAllTasks');
                    return AsyncStorage.removeItem('signupStage');
                })
                .then(() => {
                    logoutsteps.push('removeItemSignupStage');
                    Bugsnag.leaveBreadcrumb('removeItemSignupStage');
                    return AsyncStorage.removeItem('userEmail');
                })
                .then(() => {
                    console.log('Logged out ', logoutsteps);
                    EventEmitter.emit(AuthEvents.userLoggedOut);
                    resetApiClient();
                    AsyncStorage.removeItem('existingUser');
                    AsyncStorage.getAllKeys().then((keys) =>
                        AsyncStorage.multiRemove(keys)
                    );
                    resolve();
                    // Bugsnag.notify(
                    //     new AuthError(0, 'manual handling'),
                    //     (report) => {
                    //         report.context = 'Success in logout';
                    //         report.addMetadata('data', {
                    //             error: 'error string'
                    //         });
                    //     }
                    // );
                })
                .catch((error) => {
                    console.log('Error in logging out : ', error);
                    console.log('Error in logging out : ', logoutsteps);
                    Utils.addBotLogs(logoutsteps, 'Logout Error');
                    reject(new AuthError(2, AuthErrorCodes[2]));
                    Bugsnag.notify(
                        new AuthError(2, AuthErrorCodes[2]),
                        (report) => {
                            report.context = 'Error in logout';
                            report.addMetadata('data', {
                                error: JSON.stringify(error)
                            });
                        }
                    );
                });
        });
    };

    /**
     * A device level method for getting the user session
     * @param {obj} user A user object
     * @return {Promise}
     */
    static saveUser = (user) =>
        new Promise((resolve, reject) => {
            if (!user) {
                return reject('Valid user object required');
            }
            Store.dispatch(userLogin(user));
            console.log('saving User session to async', user);
            DeviceStorage.save(USER_SESSION, user).then(resolve).catch(reject);
        });

    static saveAndUpdateProfile = (key, obj) =>
        new Promise((resolve, reject) => {
            AsyncStorage.setItem(key, JSON.stringify(obj), (err) => {
                if (err) {
                    console.log('ERROR IN saveAndUpdateProfile', err);
                    return reject(err);
                }
                if (key === 'userSession') {
                    console.log('userSession save ', obj);
                    ArrayStorageDAO.deleteSession();
                    ArrayStorageDAO.insertSession(obj);
                    return resolve(obj);
                }
            });
        });
    /**
     * A device level method for getting the user session
     * @return {Promise} user
     * @deprecated use getUserData instead and get user onject direclty without promise. use this only for initial app launch
     */

    static getUser = () => {
        const { session } = Store.getState();
        if (session && session.user) {
            return Promise.resolve(session.user);
        }
        console.log('not in state getting User session from async');
        // return DeviceStorage.get(USER_SESSION);
        return ArrayStorageDAO.selectSession();
    };

    /**
     * A device level method for getting the user session
     * @return {user} data
     */
    static getUserData = () => {
        const { session } = Store.getState();
        if (session && session.user) {
            return session.user;
        }
    };

    /**
     * A device level method for checking if a User is logged In.
     * Or a default user session exists.
     *
     * @return {Promise} bool
     */
    static isUserLoggedIn = () =>
        new Promise((resolve) => {
            // DeviceStorage.get(USER_SESSION).then((user) => {
            Auth.getUser().then((user) => {
                if (!user || isDefaultUser(user)) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    static setPostPaidUser = (isPostPaidUser) =>
        new Promise((resolve) => {
            Auth.getUser().then((user) => {
                user.info.isPostpaidUser = isPostPaidUser;
                return resolve(Auth.saveUser(user));
            });
        });

    static isPostPaidUser = () =>
        new Promise((resolve) => {
            Auth.getUser().then((user) => {
                if (user && user.info && user.info.isPostpaidUser) {
                    resolve(true);
                } else {
                    resolve(false);
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
    static updateUserDetails = (details) =>
        new Promise((resolve, reject) =>
            Auth.getUser().then((user) => {
                if (user) {
                    user.info.userName = details.userName || user.info.userName;
                    user.info.phoneNumbers = details.phoneNumbers || {};
                    user.info.searchable = details.searchable || false;
                    user.info.visible = details.visible || false;
                    user.info.userCompanyName = details.userCompanyName || '';
                    user.info.address = details.address || {};
                    user.info.userTimezone = details.userTimezone || 'Etc/UTC';
                    user.info.rankLevel1 = details.rankLevel1;
                    user.info.rankLevel2 = details.rankLevel2;
                    user.info.rankLevel3 = details.rankLevel3;
                    user.info.nationality = details.nationality || false;
                    user.info.sailingStatus = details.sailingStatus;
                    user.info.shipIMO = details.shipIMO;
                    user.info.shipName = details.shipName;

                    return resolve(
                        Auth.saveAndUpdateProfile('userSession', user)
                    );
                }
                reject('No valid user session');
            })
        );

    static updatingUserProfile = (userDetails) =>
        new Promise((resolve, reject) => {
            return UserServices.updateUserProfile(userDetails)
                .then((result) => {
                    if (result.error === 0) {
                        resolve(result.content);
                    } else {
                        reject(null);
                    }
                })
                .catch((error) => {
                    reject(null);
                });
        });

    static updateUserDetailsForTimeZone = (userTimezone) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then(async (user) => {
                    if (user) {
                        user.info.userTimezone = userTimezone;
                        return Auth.updatingUserProfile(user).then((res) => {
                            if (res && !res[0]) {
                                return reject('No valid user session');
                            } else {
                                return resolve(user);
                            }
                        });
                    } else {
                        reject('No valid user session');
                    }
                })
                .catch((error) => {
                    reject(null);
                })
        );

    static setUserSetting = (key, value) =>
        new Promise((resolve, reject) =>
            Auth.getUser().then((user) => {
                if (user) {
                    user.info[key] = value;
                    return resolve(Auth.saveUser(user));
                }
                reject('No valid user session');
            })
        );

    static getUserSetting = (key, defaultValue = undefined) =>
        new Promise((resolve, reject) =>
            Auth.getUser().then((user) => {
                if (user) {
                    resolve(user.info[key] || defaultValue);
                } else {
                    reject('No valid user session');
                }
            })
        );

    /**
     * Method to add domains to the existing user.
     * @param domains Either a single domain or a list of domains
     *
     * @return {Promise} user
     */
    static addDomains = (domains) =>
        new Promise((resolve, reject) =>
            Auth.getUser().then((user) => {
                if (user) {
                    user.info.domains = _.concat(
                        user.info.domains || [],
                        domains
                    );
                    return resolve(Auth.saveUser(user));
                }
                reject('No valid user session');
            })
        );

    /**
     * Method to set domains to the existing user.
     * @param domains Either a single domain or a list of domains
     *
     * @return {Promise} user
     */
    static setDomains = (domains) =>
        new Promise((resolve, reject) =>
            Auth.getUser().then((user) => {
                if (user) {
                    user.info.domains = domains;
                    return resolve(Auth.saveUser(user));
                }
                reject('No valid user session');
            })
        );

    static updatePassword = (payload) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then((user) => {
                    console.log('update password User : ', user);
                    if (user) {
                        return FrontmAuth.updatePassword(
                            user.creds.sessionId,
                            payload
                        );
                    }
                    reject('No valid user session');
                })
                .then(resolve)
                .catch((error) => {
                    if (error && error.message) {
                        console.log('update password error : ', error);
                        reject(error);
                    } else {
                        reject(
                            new AuthError(
                                99,
                                'Error in updating the password for the user'
                            )
                        );
                    }
                })
        );

    static twoFactorAuth = (payload) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        return FrontmAuth.twoFactorAuth(
                            user.creds.sessionId,
                            payload
                        );
                    }
                    reject('No valid user session');
                })
                .then(resolve)
                .catch((error) => {
                    if (error && error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        reject(new AuthError(99, 'Error'));
                    }
                })
        );

    static validateCode = (payload) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        return FrontmAuth.validateCode(
                            user.creds.sessionId,
                            payload
                        );
                    }
                    reject('No valid user session');
                })
                .then(resolve)
                .catch((error) => {
                    if (error && error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        reject(new AuthError(99, 'Error'));
                    }
                })
        );

    static disableTwoFactorAuth = (payload) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        return FrontmAuth.disableTwoFactorAuth(
                            user.creds.sessionId,
                            payload
                        );
                    }
                    reject('No valid user session');
                })
                .then(resolve)
                .catch((error) => {
                    if (error && error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        reject(new AuthError(99, 'Error'));
                    }
                })
        );

    static resetUserActivity = (botId, password, otpToken) =>
        new Promise((resolve, reject) =>
            Auth.getUser()
                .then((user) => {
                    if (user) {
                        const payload = {
                            botId,
                            password,
                            otpToken,
                            loginProvider: 'frontm',
                            appType: 'frontm'
                        };
                        AuthService.resetUserActivity(
                            user.creds.sessionId,
                            payload,
                            (err, result) => {
                                console.log(
                                    '~~~~~resetUserActivity result,error : ',
                                    result,
                                    err
                                );
                                if (err) reject(new AuthError(98, err.message));
                                else resolve(result);
                            }
                        );
                    } else reject(new AuthError(99, 'No valid user'));
                })
                .catch((error) => {
                    if (error && error.message) {
                        reject(new AuthError(98, error.message));
                    } else {
                        reject(new AuthError(99, 'Error'));
                    }
                })
        );

    /**
     * Invalidate the session for now
     * @return {Promise}
     */
    static refresh = (user) =>
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
                .then((result) => {
                    if (result) {
                        user.creds.sessionId = result.sessionId;
                        user.provider.lastRefreshTime = Date.now();

                        return resolve(Auth.saveUser(user));
                    }
                })
                .catch((error) => {
                    reject('Error with authing the user', error);
                });
        });

    /**
     * @return Returns Auth Providers
     */
    static authProviders = () => AUTH_PROVIDERS;

    /**
     *
     * @returns domain name
     */
    static getSelectedDomain = () => Store.getState()?.user?.currentDomain;
}
