import { Platform, Alert } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import Config from '../config/config';
import { Network } from './capability';
import { UUID } from '../lib/capability/Utils';
import GoogleSignin from 'react-native-google-sign-in';
import {
    AccessToken,
    LoginManager,
    GraphRequest,
    GraphRequestManager
} from 'react-native-fbsdk';
import _ from 'lodash';
import config from '../config/config';
import queryString from 'querystring';

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
        //webClientId: __DEV__ ? Config.auth.android.google.dev.webClientId : Config.auth.android.google.prod.webClientId,
        serverClientID: Config.auth.android.google.dev.webClientId,
        offlineAccess: true,
        forceConsentPrompt: true,
        shouldFetchBasicProfile: true,
        //clientID: __DEV__ ? Config.auth.android.google.dev.webClientId : Config.auth.android.google.prod.webClientId,
        clientID:
            '705702062891-m66qc0b738egbp54nnhoiipmbb4a6udi.apps.googleusercontent.com',
        forceCodeForRefreshToken: true
    });
    /*
    GoogleSignin.hasPlayServices({ autoResolve: true }).then(() => {
        GoogleSignin.configure({
            webClientId: Config.auth.android.google.webClientId,
            offlineAccess: false
        }).then(() => {
            console.log('Google signin configured');
        }).catch((err) => {
            console.log('Error while configuring Google-signin. Error:', err);
        });
    }).catch((error) => {
        console.log('Error while resolving Google Play services. Error:', error);
    }); */
}

class FrontmAuth {
    constructor() {
        AWS.config.region = Config.aws.region;
        this.credentials = {};
    }

    meRequestCallback(conversationId, botName, resolve, reject, error, result) {
        var self = this;
        if (error) {
            console.log('Error fetching data: ' + error.toString());
            reject(new Error('Error fetching facebook data'));
        } else {
            console.log('Success fetching data: ' + JSON.stringify(result));

            // {"first_name":"amal","name":"amal r","last_name":"r","id":"101583750666079","email":"amal_trmtkhd_r@tfbnw.net"}
            const fbDetails = result;
            const data = {
                user: {
                    emailAddress: fbDetails.email,
                    givenName: fbDetails.first_name,
                    screenName: fbDetails.name
                        ? fbDetails.name.replace(/ /g, '')
                        : '',
                    surname: fbDetails.last_name || '',
                    userName: fbDetails.name,
                    userId: fbDetails.id
                }
            };
            AccessToken.getCurrentAccessToken().then(token => {
                console.log('Access Token ', token);
                let options = {
                    method: 'post',
                    url:
                        Config.proxy.protocol +
                        Config.proxy.host +
                        Config.proxy.authPath,
                    headers: {
                        token: token.accessToken,
                        provider_name: 'facebook',
                        platform: Platform.OS
                    },
                    data: data
                };
                Network(options)
                    .then(res => {
                        let resData =
                            res && res.data && res.data.creds
                                ? res.data
                                : { creds: {} };
                        if (
                            _.isEmpty(resData) ||
                            _.isEmpty(resData.creds) ||
                            _.isEmpty(resData.user)
                        ) {
                            reject(new Error('Empty response from the server'));
                            return;
                        }
                        self.credentials.facebook = {
                            sessionId: resData.sessionId,
                            userId: resData.user.userId,
                            info: resData.user || data.user,
                            refreshToken: resData.longTermToken
                        };
                        console.log(
                            'Facebook credentials : ',
                            self.credentials.facebook
                        );

                        return resolve({
                            type: 'success',
                            credentials: self.credentials
                        });
                    })
                    .catch(err => {
                        return reject({ type: 'error', error: err });
                    });
            });
        }
    }

    loginWithFacebook(conversationId, botName) {
        return new Promise((resolve, reject) => {
            LoginManager.logInWithReadPermissions(
                Config.auth.ios.facebook.permissions
            ).then(
                premissionsResult => {
                    console.log(
                        'Facebook permission result : ',
                        premissionsResult
                    );
                    if (premissionsResult.isCancelled) {
                        return resolve({
                            type: 'cancel',
                            msg: 'login canceled'
                        });
                    }
                    if (
                        !_.isEqual(
                            premissionsResult.grantedPermissions,
                            Config.auth.ios.facebook.permissions
                        ) &&
                        !_.isEqual(
                            premissionsResult.grantedPermissions,
                            Config.auth.android.facebook.permissions
                        )
                    ) {
                        return reject(
                            new Error('Not granted requested permissions')
                        );
                    }
                    console.log('Facebook response : ', premissionsResult);

                    const infoRequest = new GraphRequest(
                        '/me',
                        {
                            parameters: {
                                fields: {
                                    string:
                                        'email,name,first_name,middle_name,last_name'
                                }
                            }
                        },
                        this.meRequestCallback.bind(
                            this,
                            conversationId,
                            botName,
                            resolve,
                            reject
                        )
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();
                },
                error => {
                    console.log('Error with facebook : ', error);
                    reject({ type: 'error', error: 'Facebook login failed' });
                }
            );
        });
    }

    fetchRefreshToken(user) {
        return new Promise((resolve, reject) => {
            if (user.refreshToken) {
                resolve(user);
            } else {
                Network({
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
                })
                    .then(res => {
                        console.log('res : ', res);
                        user.idToken = res.data.id_token;
                        user.refreshToken = res.data.refresh_token;
                        user.accessToken = res.data.access_token;
                        console.log('Google user after refresh token : ', user);
                        resolve(user);
                    })
                    .catch(reject);
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
                    const data = {
                        user: {
                            emailAddress: user.email,
                            givenName: user.givenName,
                            screenName: user.name
                                ? user.name.replace(/ /g, '')
                                : '',
                            surname: user.familyName || user.surname,
                            userName: user.name,
                            userId: user.id
                        },
                        conversation: {
                            uuid: conversationId || UUID(),
                            bot: botName
                        },
                        creatorInstanceId: UUID()
                    };
                    let options = {
                        method: 'post',
                        url:
                            Config.proxy.protocol +
                            Config.proxy.host +
                            Config.proxy.authPath,
                        headers: {
                            token: user.idToken,
                            provider_name: 'google',
                            platform: Platform.OS,
                            refresh_token: user.refreshToken
                        },
                        data: data
                    };

                    Network(options)
                        .then(res => {
                            let resData =
                                res && res.data && res.data.creds
                                    ? res.data
                                    : { creds: {} };
                            if (
                                _.isEmpty(resData) ||
                                _.isEmpty(resData.creds) ||
                                _.isEmpty(resData.user)
                            ) {
                                reject(
                                    new Error('Empty response from the server')
                                );
                                return;
                            }
                            self.credentials.google = {
                                sessionId: resData.sessionId,
                                userId: resData.user.userId,
                                refreshToken: user.refreshToken,
                                info: resData.user || data.user
                            };
                            console.log(
                                'Google credentials : ',
                                self.credentials
                            );
                            return resolve({
                                type: 'success',
                                credentials: self.credentials
                            });
                        })
                        .catch(err => {
                            return reject({ type: 'error', error: err });
                        });
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

    signinWithFrontm(details, conversationId, botName) {
        var self = this;
        return new Promise((resolve, reject) => {
            const signinOptions = {
                method: 'post',
                url:
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.signinPath,
                data: {
                    user: details
                }
            };
            console.log('Signin optons : ', signinOptions);
            Network(signinOptions)
                .then(response => {
                    console.log('signin result ', result);
                    const result = response.data;
                    if (
                        !(result.success === 'true' || result.success === true)
                    ) {
                        return reject({
                            type: 'error',
                            error: result.message,
                            errorMessage: result.message
                        });
                    }
                    console.log('Signin result : ', result);
                    const frontmUser = result.data.user;
                    const defaultScreenName = frontmUser.userName
                        ? frontmUser.userName.replace(/ /g, '')
                        : '';
                    const data = {
                        user: {
                            emailAddress: frontmUser.emailAddress,
                            givenName: frontmUser.givenName,
                            screenName:
                                frontmUser.screenName || defaultScreenName,
                            surname: frontmUser.surname,
                            userName: frontmUser.userName,
                            awsId: frontmUser.awsId
                        }
                    };
                    let options = {
                        method: 'post',
                        url:
                            Config.proxy.protocol +
                            Config.proxy.host +
                            Config.proxy.authPath,
                        headers: {
                            token: result.data.id_token,
                            provider_name: 'frontm',
                            platform: Platform.OS,
                            refresh_token: result.data.refresh_token
                        },
                        data: data
                    };
                    console.log('network options : ', options);
                    Network(options)
                        .then(res => {
                            let resData =
                                res && res.data && res.data.creds
                                    ? res.data
                                    : { creds: {} };
                            console.log('resData : ', res);
                            if (
                                _.isEmpty(resData) ||
                                _.isEmpty(resData.creds) ||
                                _.isEmpty(resData.user)
                            ) {
                                reject(
                                    new Error('Empty response from the server')
                                );
                                return;
                            }
                            self.credentials.frontm = {
                                sessionId: resData.sessionId,
                                userId: resData.user.userId,
                                refreshToken: result.data.refresh_token,
                                info: resData.user || data.user
                            };
                            console.log('Credentials ', self.credentials);
                            return resolve({
                                type: 'success',
                                credentials: self.credentials
                            });
                        })
                        .catch(err => {
                            return reject({ type: 'error', error: err });
                        });
                })
                .catch(error => {
                    console.log('Error in Authing server : ', error);
                    reject({ type: 'error', error: error.code });
                });
        });
    }

    updatePassword(payload, user) {
        let options = {
            method: 'POST',
            url:
                Config.proxy.protocol +
                Config.proxy.host +
                Config.proxy.updateSigninPath,
            headers: {
                refresh_token: user.provider.refreshToken
            },
            data: {
                user: payload
            }
        };
        return new Promise(function(resolve, reject) {
            Network(options)
                .then(res => {
                    let resData = res.data || {};
                    if (
                        resData.success === 'true' ||
                        resData.success === true
                    ) {
                        resolve();
                    } else {
                        reject(new Error(resData.message));
                    }
                })
                .catch(() => {
                    reject();
                });
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
                accesskeyid: user.aws.accessKeyId,
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
                    if (
                        resData.identityId &&
                        resData.accessKeyId &&
                        resData.secretAccessKey &&
                        resData.sessionId
                    ) {
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
