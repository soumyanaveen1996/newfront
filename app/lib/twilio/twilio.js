import { Network } from '../capability';
import config from '../../config/config';
import { Platform } from 'react-native';
import utils from '../utils';

import { NativeModules, NativeEventEmitter } from 'react-native';
const UserServiceClient = NativeModules.UserServiceClient;

const getAccessToken = user => {
    const platform = Platform.OS;
    const env = __DEV__ ? 'dev' : 'prod';
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return new Promise(function(resolve, reject) {
        UserServiceClient.generateTwilioToken(
            user.creds.sessionId,
            { env: env },
            (error, result) => {
                if (error) {
                    return reject({
                        type: 'error',
                        error: error.code
                    });
                }
                if (result.data && result.data.accessToken) {
                    resolve(result.data.accessToken);
                } else {
                    reject(new Error('Unable to grant access to the user.'));
                }
            }
        );
    });
};

const enableVoIP = user => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return new Promise(function(resolve, reject) {
        UserServiceClient.enableVOIP(user.creds.sessionId, (error, result) => {
            if (error) {
                return reject({
                    type: 'error',
                    error: error.code
                });
            }
            if (result.data && result.data.success) {
                resolve(true);
            } else {
                reject(new Error('Unable to enable VoIP for the user'));
            }
        });
    });
};

const disableVoip = user => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return new Promise(function(resolve, reject) {
        UserServiceClient.disableVOIP(user.creds.sessionId, (error, result) => {
            if (error) {
                return reject({
                    type: 'error',
                    error: error.code
                });
            }
            if (result.data && result.data.success) {
                resolve(true);
            } else {
                reject(new Error('Unable to enable VoIP for the user'));
            }
        });
    });
};

const isVoIPEnabled = (otherUserId, user) => {
    console.log('Twilio VoIP token : ', !!user);
    if (!user) {
        return;
    }
    return new Promise(function(resolve, reject) {
        UserServiceClient.getVOIPStatus(
            user.creds.sessionId,
            { userId: otherUserId },
            (error, result) => {
                console.log('GRPC:::Twilio VoIP token : ', error, result);
                if (error) {
                    return reject({
                        type: 'error',
                        error: error.code
                    });
                }
                if (result.data && result.data.voipEnabled) {
                    resolve(result.data.voipEnabled);
                } else {
                    resolve(false);
                }
            }
        );
    });
};

const getAccessTokenURL = user => {
    return `${config.network.queueProtocol}${config.proxy.host}${
        config.proxy.twilioPath
    }`;
};

export default {
    getAccessToken,
    getAccessTokenURL,
    enableVoIP,
    disableVoip,
    isVoIPEnabled
};
