import { Platform, NativeModules } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import queryString from 'querystring';
import _, { result } from 'lodash';
import Config from '../config/config';
import { Network_http } from './capability';
import { AuthError } from './capability/Auth';
import I18n from '../config/i18n/i18n';
import AuthService from '../apiV2/AuthService';

const axios = require('axios');

const clientIdAndroid = Config.auth.android.google.dev.webClientId;

if (Platform.OS === 'ios') {
    GoogleSignin.configure({
        scopes: Config.auth.ios.google.scopes,
        iosClientId: Config.auth.ios.google.iosClientId,
        webClientId: Config.auth.ios.google.iosClientId,
        serverClientID: Config.auth.ios.google.iosClientId,
        offlineAccess: true,
        forceConsentPrompt: true,
        shouldFetchBasicProfile: true,
        clientID: Config.auth.ios.google.iosClientId,
        forceCodeForRefreshToken: true
    });
} else {
    GoogleSignin.configure({
        scopes: Config.auth.ios.google.scopes,
        // iosClientId: Config.auth.ios.google.iosClientId,
        webClientId: __DEV__
            ? Config.auth.android.google.dev.webClientId
            : Config.auth.android.google.prod.webClientId,
        serverClientID: clientIdAndroid,
        offlineAccess: true,
        forceConsentPrompt: true,
        shouldFetchBasicProfile: true,
        // clientID: __DEV__ ? Config.auth.android.google.dev.webClientId : Config.auth.android.google.prod.webClientId,
        clientID:
            '705702062891-m66qc0b738egbp54nnhoiipmbb4a6udi.apps.googleusercontent.com',
        forceCodeForRefreshToken: true
    });
}

class FrontmAuth {
    constructor() {
        AWS.config.region = Config.aws.region;
        this.credentials = {};
    }

    meRequestCallback(
        conversationId,
        botName,
        resolve,
        reject,
        error,
        result
    ) {}

    getInfoFromFacebook(accessToken) {
        return new Promise((resolve, reject) => {
            reject({
                type: 'error',
                error: 'Facebook login not supported anymore'
            });
        });
    }

    facebookLogout() {
        // LoginManager.logOut();
    }

    loginWithFacebook(conversationId, botName) {
        return new Promise((resolve, reject) => {
            reject({
                type: 'error',
                error: 'Facebook login not supported anymore'
            });
        });
    }

    fetchRefreshToken(user) {
        return new Promise((resolve, reject) => {
            if (user.refreshToken) {
                resolve(user);
            } else {
                let options;
                if (Platform.OS === 'android') {
                    options = {
                        method: 'post',
                        url: 'https://www.googleapis.com/oauth2/v4/token',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: queryString.stringify({
                            code: user.serverAuthCode,
                            grant_type: 'authorization_code',
                            client_id:
                                Config.auth.android.google.dev.webClientId,
                            client_secret:
                                Config.auth.android.google.dev.clientSecret
                        })
                    };
                } else {
                    options = {
                        method: 'post',
                        url: 'https://www.googleapis.com/oauth2/v4/token',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: queryString.stringify({
                            code: user.serverAuthCode,
                            grant_type: 'authorization_code',
                            client_id: Config.auth.ios.google.iosClientId
                        })
                    };
                }
                return Network_http(options)
                    .then((res) => {
                        // console.log('res : ', res);
                        user.idToken = res.data.id_token;
                        user.refreshToken = res.data.refresh_token;
                        user.accessToken = res.data.access_token;
                        console.log('Google user after refresh token : ', user);
                        resolve(user);
                    })
                    .catch((err) => {
                        console.log('Error', err);
                        reject(err);
                    });
            }
        });
    }

    loginWithGoogle(conversationId, botName) {
        const self = this;
        console.log('Google sign in');
        return new Promise((resolve, reject) => {
            GoogleSignin.signOut();
            GoogleSignin.signIn()
                .then((user) => {
                    console.log('Google user : ', user);
                    self.credentials = user;
                    // throw 'hello';
                    return self.fetchRefreshToken(user);
                })
                .then((user) => {
                    AuthService.signinWithGoogle({
                        idToken: user.idToken,
                        refreshToken: user.refreshToken
                    })
                        .then((result) => {
                            if (result.success !== true) {
                                return reject({
                                    type: 'error',
                                    error: result.message,
                                    errorMessage:
                                        result.errorCode ===
                                        'UserNotFoundException'
                                            ? I18n.t('UserNotFoundErrorMessage')
                                            : result.message
                                });
                            } else {
                                self.credentials.google =
                                    self.credentialsFromSigninResponse(result);
                                console.log('Credentials ', self.credentials);
                                return resolve({
                                    type: 'success',
                                    credentials: self.credentials
                                });
                            }
                        })
                        .catch((err) => {
                            return reject({
                                type: 'error',
                                error: error.code
                            });
                        });
                })
                .catch((err) => {
                    console.log('Google signin error : ', err);
                    if (
                        err.code === -5 ||
                        err.code === 12501 ||
                        (err.description &&
                            err.description.indexOf('cancel') !== -1)
                    ) {
                        return resolve({
                            type: 'cancel',
                            msg: 'login canceled'
                        });
                    }
                    reject({ type: 'error', error: err.code });
                });
        });
    }

    loginWithApple(conversationId, botName, code, userName) {
        const self = this;
        console.log('+++++apple sign in, calking native method now ');
        return new Promise((resolve, reject) => {
            AuthService.signinWithApple({
                code,
                userName
            })
                .then((result) => {
                    if (result.success == true) {
                        self.credentials.google =
                            self.credentialsFromSigninResponse(result);
                        console.log('Credentials ', self.credentials);
                        return resolve({
                            type: 'success',
                            credentials: self.credentials
                        });
                    } else {
                        return reject({
                            type: 'error',
                            error: result.message,
                            errorMessage:
                                result.errorCode === 'UserNotFoundException'
                                    ? I18n.t('UserNotFoundErrorMessage')
                                    : result.message
                        });
                    }
                })
                .catch((err) => {
                    return reject({
                        type: 'error',
                        error: error.code
                    });
                });
        });
    }

    credentialsFromSigninResponse(result) {
        console.log('2FA credentialsFromSigninResponse', result);
        return {
            sessionId: result.sessionId,
            userId: result.user.userId,
            info: {
                searchable: result.user.searchable,
                visible: result.user.visible,
                emailAddress: result.user.emailAddress,
                userId: result.user.userId,
                userName: result.user.userName,
                domains: result.user.domains,
                archiveMessages: result.user.archiveMessages,
                phoneNumbers: result.user.phoneNumbers,
                userCompanyName: result.user.userCompanyName,
                userTimezone: result.user.userTimezone,
                address: result.address,
                isPostpaidUser: result.user.isPostpaidUser,
                softwareMfaEnabled: result.user.softwareMfaEnabled
            }
        };
    }

    // signinWithFrontm(payload) {
    //     const self = this;
    //     return new Promise((resolve, reject) => {
    //         AuthService.signinWithFrontm(payload)
    //             .then((result) => {})
    //             .catch((err) => {
    //                 return reject({ type: 'error', error: error.code });
    //             });
    //         AuthService.signinWithFrontm(payload, (error, result) => {
    //             if (error) {
    //             }
    //             if (result.data.success !== true) {
    //                 return reject({
    //                     type: 'error',
    //                     error: result.message,
    //                     errorMessage:
    //                         result.errorCode === 'UserNotFoundException'
    //                             ? I18n.t('UserNotFoundErrorMessage')
    //                             : result.message
    //                 });
    //             }
    //             self.credentials.frontm = self.credentialsFromSigninResponse(
    //                 result
    //             );
    //             console.log('Credentials ', self.credentials);
    //             return resolve({
    //                 type: 'success',
    //                 credentials: self.credentials
    //             });
    //         });
    //     });
    // }

    updatePassword(sessionId, payload, user) {
        return new Promise((resolve, reject) => {
            AuthService.changePassword(payload)
                .then((result) => {
                    console.log('changepassword result : ', result);
                    if (result.success === true) {
                        resolve(result);
                    } else {
                        const error = new AuthError(98, result.message);
                        console.log('changepassword error obj : ', error);
                        reject(error);
                    }
                })
                .catch((err) => {
                    if (err.message) {
                        reject(new AuthError(98, err.message));
                    } else {
                        reject(new AuthError(98, 'Error changing password'));
                    }
                });
        });
    }

    refreshTokens(user) {
        const options = {
            method: 'post',
            url:
                Config.proxy.protocol +
                Config.proxy.host +
                Config.proxy.refreshPath,
            headers: {
                provider_name: user.provider.name.toLowerCase(),
                refresh_token: user.provider.refreshToken,
                platform: Platform.OS
            }
        };
        console.log('Options for refresh : ', options);
        return new Promise((resolve, reject) => {
            Network(options)
                .then((res) => {
                    const resData = res ? res.data : {};
                    if (resData.sessionId) {
                        const updatedCreds = {
                            sessionId: resData.sessionId
                        };
                        return resolve(updatedCreds);
                    }
                    reject();
                })
                .catch((err) => {
                    console.log('Error making refresh token call::', err);
                    return reject(err);
                });
        });
    }

    twoFactorAuth(sessionId, payload, user) {
        return new Promise((resolve, reject) => {
            AuthService.initiateSoftwareMfa(payload)
                .then((result) => {
                    if (result.data.success === true) {
                        resolve(result.data);
                    } else {
                        console.log('Error', result);
                        const error = new AuthError(98, result.message);
                        reject(error);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    validateCode(sessionId, payload, user) {
        AuthService.activateSoftwareMfa(payload)
            .then((result) => {
                if (result.data.success === true) {
                    resolve(result.data);
                } else {
                    console.log('Error', result);
                    const error = new AuthError(98, result.message);
                    reject(error);
                }
            })
            .catch((err) => {
                reject(err);
            });
    }

    disableTwoFactorAuth(sessionId, payload, user) {
        return new Promise((resolve, reject) => {
            AuthService.deactivateSoftwareMfa(payload)
                .then((result) => {
                    if (result.data.success === true) {
                        resolve(result.data);
                    } else {
                        console.log('Error', result);
                        const error = new AuthError(98, result.message);
                        reject(error);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

export default new FrontmAuth();
