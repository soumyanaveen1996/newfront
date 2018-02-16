import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import Config from '../config/config';
import { Network } from './capability';
import UUID from 'uuid/v4';
import { GoogleSignin } from 'react-native-google-signin';
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import _ from 'lodash';

GoogleSignin.configure({
    scopes: Config.auth.ios.google.scopes,
    iosClientId: Config.auth.ios.google.iosClientId,
    webClientId: Config.auth.ios.google.iosClientId,
    offlineAccess: false,
    forceConsentPrompt: true,
});

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
                    name: fbDetails.name,
                    userId: fbDetails.id
                },
                conversation: {
                    uuid: conversationId || UUID(),
                    bot: botName
                },
                creatorInstanceId: UUID(),
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
                                userUUID: resData.user.uuid,
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

    //TODO(expo) : Implement Facebook auth
    loginWithFacebook(conversationId, botName) {
        var self = this;
        return new Promise((resolve, reject) => {
            LoginManager.logInWithReadPermissions(Config.auth.ios.facebook.permissions)
                .then((premissionsResult) => {
                    if (premissionsResult.isCancelled) {
                        return resolve({ type: 'cancel', msg: 'login canceled' });
                    }
                    if (!_.isEqual(premissionsResult.grantedPermissions, Config.auth.ios.facebook.permissions)) {
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
        return new Promise(function(resolve, reject) {

            GoogleSignin.signOut();
            GoogleSignin.signIn()
                .then((user) => {
                    const googleUser = user;
                    const data = {
                        user: {
                            emailAddress: googleUser.email,
                            givenName: googleUser.givenName,
                            screenName: googleUser.name ? googleUser.name.replace(/ /g, '') : '',
                            surname: googleUser.familyName || googleUser.surname,
                            name: googleUser.name,
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
                    if (err.code === -5) {
                        return resolve({ type: 'cancel', msg: 'login canceled' });
                    } else {
                        reject({ type: 'error', error: err.code });
                    }
                })
        });
    }

    refreshTokens(user) {
        let options = {
            'method': 'post',
            'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.refreshPath,
            'headers': {
                refresh_token: user.provider.refreshToken,
                provider_name: user.provider.name
            }
        };
        return new Promise(function (resolve, reject) {
            Network(options)
                .then((res) => {
                    let resData = res ? res.data : {};
                    const updatedCreds = {
                        identityId: resData.identityId || undefined,
                        accessKeyId: resData.accessKeyId,
                        secretAccessKey: resData.secretAccessKey,
                        sessionToken: resData.sessionToken,
                    }
                    return resolve(updatedCreds);
                }).catch((err) => {
                    console.log('Error making refresh token call::', err);
                    return reject(err);
                });
        })
    }
}

export default new FrontmAuth()
