import { Network } from '../capability';
import config from '../../config/config';
import { Platform } from 'react-native';
import utils from '../utils';


const getAccessToken = (user) => {

    const platform = Platform.OS;
    const env = __DEV__ ? 'dev' : 'prod'
    if (!user) {
        return;
    }
    let options = {
        'method': 'get',
        'url': `${config.network.queueProtocol}${config.proxy.host}${config.proxy.twilioPath}`,
        'headers': {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken
        },
        'params': {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken,
            platform: platform,
            env: env
        }
    };
    return Network(options)
        .then((response) => {
            if (response.data && response.data.accessToken) {
                return response.data.accessToken;
            } else {
                throw new Error('Unable to grant access to the user.')
            }
        })
}

const enableVoIP = (user) => {
    let options = {
        'method': 'GET',
        'url': `${config.network.queueProtocol}${config.proxy.host}${config.proxy.enableVoIPPath}`,
        'headers': {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken
        }
    };
    return Network(options)
        .then((response) => {
            if (response.data && response.data.success) {
                return true;
            } else {
                throw new Error('Unable to enable VoIP for the user')
            }
        })
}

const isVoIPEnabled = (otherUserId, user) => {
    let options = {
        'method': 'GET',
        'url': `${config.network.queueProtocol}${config.proxy.host}${config.proxy.getVoIPStatusPath}?userId=${otherUserId}`,
        'headers': {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken
        }
    };
    return Network(options)
        .then((response) => {
            if (response.data && response.data.voipEnabled) {
                return response.data.voipEnabled;
            } else {
                return false;
            }
        })
}

const getAccessTokenURL = (user) => {
    return `${config.network.queueProtocol}${config.proxy.host}${config.proxy.twilioPath}`;
}

export default {
    getAccessToken,
    getAccessTokenURL,
    enableVoIP,
    isVoIPEnabled
}