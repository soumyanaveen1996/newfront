import { Platform, Alert } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import Config from '../config/config';
import { Network_http } from './capability';
import { UUID } from '../lib/capability/Utils';
import { GoogleSignin } from 'react-native-google-signin';
import queryString from 'querystring';
import AuthError from '../lib/capability/Auth';

const axios = require('axios');

// import {
//     AccessToken,
//     LoginManager,
//     GraphRequest,
//     GraphRequestManager
// } from 'react-native-fbsdk';
import _ from 'lodash';
import config from '../config/config';

import { NativeModules, NativeEventEmitter } from 'react-native';
const AuthServiceClient = NativeModules.AuthServiceClient;

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
        //iosClientId: Config.auth.ios.google.iosClientId,
        webClientId: __DEV__
            ? Config.auth.android.google.dev.webClientId
            : Config.auth.android.google.prod.webClientId,
        serverClientID: clientIdAndroid,
        offlineAccess: true,
        forceConsentPrompt: true,
        shouldFetchBasicProfile: true,
        //clientID: __DEV__ ? Config.auth.android.google.dev.webClientId : Config.auth.android.google.prod.webClientId,
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

    loginWithFacebook(conversationId, botName) {}

    fetchRefreshToken(user) {
        return new Promise((resolve, reject) => {
            if (user.refreshToken) {
                resolve(user);
            } else {
                const options = {
                    method: 'post',
                    url: 'https://www.googleapis.com/oauth2/v4/token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: queryString.stringify({
                        code: user.serverAuthCode,
                        grant_type: 'authorization_code',
                        client_id: Config.auth.android.google.dev.webClientId,
                        client_secret:
                            Config.auth.android.google.dev.clientSecret
                    })
                };
                return Network_http(options)
                    .then(res => {
                        // console.log('res : ', res);
                        user.idToken = res.data.id_token;
                        user.refreshToken = res.data.refresh_token;
                        user.accessToken = res.data.access_token;
                        console.log('Google user after refresh token : ', user);
                        resolve(user);
                    })
                    .catch(err => {
                        console.log('Error', err);
                        reject(err);
                    });
            }
        });
    }

    loginWithGoogle(conversationId, botName) {
        var self = this;
        console.log('Google sign in');
        return new Promise(function(resolve, reject) {
            GoogleSignin.signOutPromise();
            GoogleSignin.signInPromise()
                .then(user => {
                    console.log('Google user : ', user);
                    //throw 'hello';
                    return self.fetchRefreshToken(user);
                })
                .then(user => {
                    AuthServiceClient.googleSignin(
                        {
                            idToken: user.idToken,
                            refreshToken: user.refreshToken
                        },
                        (error, result) => {
                            if (error) {
                                return reject({
                                    type: 'error',
                                    error: error.code
                                });
                            }
                            if (result.data.success !== true) {
                                return reject({
                                    type: 'error',
                                    error: result.message,
                                    errorMessage: result.message
                                });
                            } else {
                                self.credentials.google = self.credentialsFromSigninResponse(
                                    result
                                );
                                console.log('Credentials ', self.credentials);
                                return resolve({
                                    type: 'success',
                                    credentials: self.credentials
                                });
                            }
                        }
                    );
                })
                .catch(err => {
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
                    } else {
                        reject({ type: 'error', error: err.code });
                    }
                });
        });
    }

    credentialsFromSigninResponse(result) {
        return {
            sessionId: result.data.sessionId,
            userId: result.data.user.userId,
            info: {
                searchable: result.data.user.searchable,
                visible: result.data.user.visible,
                emailAddress: result.data.user.emailAddress,
                userId: result.data.user.userId,
                userName: result.data.user.userName,
                domains: result.data.user.domainsArray,
                archiveMessages: result.data.user.archiveMessages,
                phoneNumbers: result.data.user.phoneNumbers
            }
        };
    }

    signinWithFrontm(payload) {
        var self = this;
        return new Promise((resolve, reject) => {
            AuthServiceClient.frontmSignin(payload, (error, result) => {
                if (error) {
                    return reject({ type: 'error', error: error.code });
                }
                if (result.data.success !== true) {
                    return reject({
                        type: 'error',
                        error: result.message,
                        errorMessage: result.message
                    });
                } else {
                    self.credentials.frontm = self.credentialsFromSigninResponse(
                        result
                    );
                    console.log('Credentials ', self.credentials);
                    return resolve({
                        type: 'success',
                        credentials: self.credentials
                    });
                }
            });
        });
    }

    updatePassword(sessionId, payload, user) {
        return new Promise((resolve, reject) => {
            AuthServiceClient.changePassword(
                sessionId,
                payload,
                (err, result) => {
                    if (err) {
                        reject();
                    } else {
                        console.log('changepassword result : ', result);
                        if (result.data.success === true) {
                            resolve(result.data);
                        } else {
                            reject(new AuthError(98, result.data.message));
                        }
                    }
                }
            );
        });
    }

    refreshTokens(user) {
        let options = {
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
        return new Promise(function(resolve, reject) {
            Network(options)
                .then(res => {
                    let resData = res ? res.data : {};
                    if (resData.sessionId) {
                        const updatedCreds = {
                            sessionId: resData.sessionId
                        };
                        return resolve(updatedCreds);
                    } else {
                        reject();
                    }
                })
                .catch(err => {
                    console.log('Error making refresh token call::', err);
                    return reject(err);
                });
        });
    }
}

export default new FrontmAuth();
