import { Platform } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import Config from '../config/config';
import { Network } from './capability';
import UUID from 'uuid/v4';
import { GoogleSignin } from 'react-native-google-signin';

if (Platform.OS === 'ios') {
    GoogleSignin.configure({
        scopes: Config.auth.ios.google.scopes,
        iosClientId: Config.auth.ios.google.iosClientId,
        webClientId: Config.auth.ios.google.iosClientId,
        offlineAccess: false,
        forceConsentPrompt: true,
    });
} else {
    GoogleSignin.hasPlayServices({ autoResolve: true }).then(() => {
        GoogleSignin.configure(config.auth.android.google);
    }).catch((error) => {
        console.log('Error while configuring Google-signin. Error:', error);
    });
}

class FrontmAuth {
    constructor() {
        AWS.config.region = Config.aws.region;
        this.credentials = {};
    }

    //TODO(expo) : Implement Facebook auth
    /*
    loginWithFacebook(conversationId, botName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            Expo.Facebook.logInWithReadPermissionsAsync(Config.auth.ios.facebook.appId, {
                permissions: Config.auth.ios.facebook.permissions,
            }).then((response) => {
                switch (response.type) {
                case 'success':
                    // TODO: Get Cognito tokens for the authenticated facebook access Token.
                    self.credentials.facebook = {
                        facebookToken: response.token
                    }
                    return resolve({ type: 'success', credentials: self.credentials });
                case 'cancel':
                    return resolve({ type: 'cancel', msg: 'login canceled' })
                default:
                    return reject({ type: 'error', error: 'login failed' })
                }
            }).catch((error) => {
                reject({ type: 'error', error: 'Facebook login failed' })
            });
        });
    } */

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
                        creatorInstanceId: UUID()
                    };
                    let options = {
                        'method': 'post',
                        'url': Config.proxy.protocol + Config.proxy.host + Config.proxy.authPath,
                        'headers': {
                            token: user.idToken
                        },
                        'data': data
                    };
                    Network(options)
                        .then((res) => {
                            let resData = res && res.data && res.data.creds ? res.data : { creds: {} };
                            self.credentials.google = {
                                identityId: resData.creds.identityId,
                                accessKeyId: resData.creds.accessKeyId,
                                secretAccessKey: resData.creds.secretAccessKey,
                                sessionToken: resData.creds.sessionToken,
                                userUUID: resData.userUuid,
                                refreshToken: user.refreshToken,
                                info: data.user
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
