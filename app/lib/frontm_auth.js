import { Platform } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import Config from '../config/config';
import { Network } from './capability';
import { UUID } from '../lib/capability/Utils';
import GoogleSignin from 'react-native-google-signin';
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import _ from 'lodash';
import config from '../config/config';

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
        forceCodeForRefreshToken: true,
    });
} else {
    GoogleSignin.configure({
        scopes: Config.auth.ios.google.scopes,
        iosClientId: Config.auth.ios.google.iosClientId,
        webClientId: '705702062891-jo8h886mg8t86qc6g4j5anla0tch8hib.apps.googleusercontent.com',
        serverClientID: Config.auth.ios.google.iosClientId,
        offlineAccess: true,
        forceConsentPrompt: true,
        shouldFetchBasicProfile: true,
        clientID: '705702062891-jo8h886mg8t86qc6g4j5anla0tch8hib.apps.googleusercontent.com',
        forceCodeForRefreshToken: true,
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
                    screenName: fbDetails.name ? fbDetails.name.replace(/ /g, '') : '',
                    surname: fbDetails.last_name || '',
                    userName: fbDetails.name,
                    userId: fbDetails.id
                },
            };
            AccessToken.getCurrentAccessToken()
                .then((token) => {
                    console.log('Access Token ', token);
                    let options = {
                        'method': 'post',
                        'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.authPath,
                        'headers': {
                            token: token.accessToken,
                            provider_name: 'facebook'
                        },
                        'data': data
                    };
                    Network(options)
                        .then((res) => {
                            let resData = res && res.data && res.data.creds ? res.data : { creds: {} };
                            if (_.isEmpty(resData) || _.isEmpty(resData.creds) || _.isEmpty(resData.user)) {
                                reject(new Error('Empty response from the server'));
                                return;
                            }
                            self.credentials.facebook = {
                                identityId: resData.creds.identityId,
                                accessKeyId: resData.creds.accessKeyId,
                                secretAccessKey: resData.creds.secretAccessKey,
                                sessionToken: resData.creds.sessionToken,
                                userId: resData.user.userId,
                                info: resData.user || data.user,
                                refreshToken: resData.longTermToken
                            }
                            console.log('Facebook credentials : ', self.credentials.facebook);

                            return resolve({ type: 'success', credentials: self.credentials });
                        }).catch((err) => {
                            return reject({ type: 'error', error: err });
                        });
                })
        }
    }

    loginWithFacebook(conversationId, botName) {
        return new Promise((resolve, reject) => {
            LoginManager.logInWithReadPermissions(Config.auth.ios.facebook.permissions)
                .then((premissionsResult) => {
                    if (premissionsResult.isCancelled) {
                        return resolve({ type: 'cancel', msg: 'login canceled' });
                    }
                    if (!_.isEqual(premissionsResult.grantedPermissions, Config.auth.ios.facebook.permissions)
                        && !_.isEqual(premissionsResult.grantedPermissions, Config.auth.android.facebook.permissions)) {
                        return reject(new Error('Not granted requested permissions'))
                    }
                    console.log('Facebook response : ', premissionsResult);

                    const infoRequest = new GraphRequest(
                        '/me',
                        {
                            parameters: {
                                fields: {
                                    string: 'email,name,first_name,middle_name,last_name'
                                }
                            }
                        },
                        this.meRequestCallback.bind(this, conversationId, botName, resolve, reject),
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();

                }, (error) => {
                    console.log('Error with facebook : ', error);
                    reject({ type: 'error', error: 'Facebook login failed' })
                });
        });
    }

    loginWithGoogle(conversationId, botName) {
        var self = this;
        console.log('Google sign in');
        return new Promise(function(resolve, reject) {
            GoogleSignin.signOutPromise();
            GoogleSignin.signInPromise()
                .then((user) => {
                    console.log('Google user : ', user);
                    //throw 'hello';
                    const googleUser = user;
                    const data = {
                        user: {
                            emailAddress: googleUser.email,
                            givenName: googleUser.givenName,
                            screenName: googleUser.name ? googleUser.name.replace(/ /g, '') : '',
                            surname: googleUser.familyName || googleUser.surname,
                            userName: googleUser.name,
                            userId: googleUser.id
                        },
                        conversation: {
                            uuid: conversationId || UUID(),
                            bot: botName
                        },
                        creatorInstanceId: UUID(),
                    };
                    let options = {
                        'method': 'post',
                        'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.authPath,
                        'headers': {
                            token: user.idToken,
                            provider_name: 'google'
                        },
                        'data': data
                    };
                    Network(options)
                        .then((res) => {
                            let resData = res && res.data && res.data.creds ? res.data : { creds: {} };
                            if (_.isEmpty(resData) || _.isEmpty(resData.creds) || _.isEmpty(resData.user)) {
                                reject(new Error('Empty response from the server'));
                                return;
                            }
                            self.credentials.google = {
                                identityId: resData.creds.identityId,
                                accessKeyId: resData.creds.accessKeyId,
                                secretAccessKey: resData.creds.secretAccessKey,
                                sessionToken: resData.creds.sessionToken,
                                userUUID: resData.user.uuid,
                                refreshToken: user.refreshToken,
                                info: resData.user || data.user
                            }

                            return resolve({ type: 'success', credentials: self.credentials });
                        }).catch((err) => {
                            return reject({ type: 'error', error: err });
                        });
                }).catch((err) => {
                    console.log('Google signin error : ', err);
                    if (err.code === -5) {
                        return resolve({ type: 'cancel', msg: 'login canceled' });
                    } else {
                        reject({ type: 'error', error: err.code });
                    }
                })
        });
    }

    signinWithFrontm(details, conversationId, botName) {
        var self = this;
        return new Promise((resolve, reject) => {
            const signinOptions = {
                'method': 'post',
                'url': config.proxy.protocol + config.proxy.host + config.proxy.signinPath,
                'data': {
                    user: details
                }
            }
            Network(signinOptions)
                .then((response) => {
                    const result = response.data;
                    if (!(result.success === 'true' || result.success === true)) {
                        return reject({type: 'error', error: result.message, errorMessage: result.message});
                    }
                    console.log('Signin result : ', result);
                    const frontmUser = result.data.user;
                    const defaultScreenName = frontmUser.userName ? frontmUser.userName.replace(/ /g, '') : '';
                    const data = {
                        user: {
                            emailAddress: frontmUser.emailAddress,
                            givenName: frontmUser.givenName,
                            screenName: frontmUser.screenName || defaultScreenName,
                            surname: frontmUser.surname,
                            userName: frontmUser.userName,
                            awsId: frontmUser.awsId,
                        },
                    };
                    let options = {
                        'method': 'post',
                        'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.authPath,
                        'headers': {
                            token: result.data.id_token,
                            provider_name: 'frontm'
                        },
                        'data': data
                    };
                    console.log('network options : ', options);
                    Network(options)
                        .then((res) => {
                            let resData = res && res.data && res.data.creds ? res.data : { creds: {} };
                            console.log('resData : ', res);
                            if (_.isEmpty(resData) || _.isEmpty(resData.creds) || _.isEmpty(resData.user)) {
                                reject(new Error('Empty response from the server'));
                                return;
                            }
                            self.credentials.frontm = {
                                identityId: resData.creds.identityId,
                                accessKeyId: resData.creds.accessKeyId,
                                secretAccessKey: resData.creds.secretAccessKey,
                                sessionToken: resData.creds.sessionToken,
                                userId: resData.user.userId,
                                refreshToken: result.data.refresh_token,
                                info: resData.user || data.user
                            }
                            console.log('Credentials ', self.credentials);
                            return resolve({ type: 'success', credentials: self.credentials });
                        }).catch((err) => {
                            return reject({ type: 'error', error: err });
                        });
                })
                .catch((error) => {
                    reject({ type: 'error', error: error.code });
                });
        });
    }

    updatePassword(payload, user) {
        let options = {
            method: 'POST',
            url: Config.proxy.protocol + Config.proxy.host + Config.proxy.updateSigninPath,
            headers: {
                refresh_token: user.provider.refreshToken,
            },
            data: {
                user: payload
            }
        };
        return new Promise(function (resolve, reject) {
            Network(options)
                .then((res) => {
                    let resData = res.data || {};
                    if (resData.success === 'true' || resData.success === true) {
                        resolve();
                    } else {
                        reject(new Error(resData.message));
                    }
                }).catch(() => {
                    reject();
                });
        })
    }

    refreshTokens(user) {
        console.log('Options for refresh : ', user);
        let options = {
            'method': 'post',
            'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.refreshPath,
            'headers': {
                accesskeyid: user.aws.accessKeyId,
                provider_name: user.provider.name.toLowerCase(),
                refresh_token: user.provider.refreshToken,
                secretaccesskey: user.aws.secretAccessKey,
                sessiontoken: user.aws.sessionToken,
            }
        };
        console.log('Options for refresh : ', options);
        return new Promise(function (resolve, reject) {
            Network(options)
                .then((res) => {
                    console.log('Results for refresh : ', res);
                    let resData = res ? res.data : {};
                    if (resData.identityId && resData.accessKeyId && resData.secretAccessKey && resData.sessionToken) {
                        const updatedCreds = {
                            identityId: resData.identityId,
                            accessKeyId: resData.accessKeyId,
                            secretAccessKey: resData.secretAccessKey,
                            sessionToken: resData.sessionToken,
                        }
                        return resolve(updatedCreds);
                    }
                }).catch((err) => {
                    console.log('Error making refresh token call::', err);
                    return reject(err);
                });
        })
    }
}

export default new FrontmAuth()
