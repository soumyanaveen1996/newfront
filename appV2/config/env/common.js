import { Platform } from 'react-native';
import { APP_VERSION } from '@env';

/** =========================================================
 * import app scecific config for white lable apps here. */
import appSpecificConfig from './AppSpecificConfigs/onship_config';
/** ====================================================== */

const S3_HOST = 'localhost:3000';
const CATALOG_HOST = 'localhost:3000';
const QUEUE_HOST = 'localhost:3000';
const PROXY_HOST = 'localhost:3000';
let pollingInterval;
let clearQueue;
if (Platform.OS === 'android') {
    pollingInterval = 25000;
    clearQueue = 600000;
} else {
    pollingInterval = 25000;
    clearQueue = 18000000;
}

const commonConfig = {
    appVersion: APP_VERSION,
    aws: {
        region: 'us-east-1'
    },
    persist: {
        databaseName: 'frontm.db'
    },
    bot: {
        baseProtocol: 'http://',
        baseUrl: S3_HOST,
        s3bucket: 'frontm-contentdelivery-mobilehub-1030065648',
        s3ServiceApi: 's3',
        binaryS3Bucket: 'dev-frontm-conversations',
        catalogHost: CATALOG_HOST,
        catalogPath: '/v1/catalog',
        catalogServiceApi: 'execute-api'
    },
    dce: {
        botDirName: 'bots',
        manifestFileName: 'manifest',
        botDependenciesDirName: 'bot_dependencies'
    },
    network: {
        satellite: {
            pollingInterval: 25000,
            keepAliveInterval: 120000,
            clearQueue
        },
        gsm: {
            pollingInterval,
            backgroundPollingInterval: 1200 * 1000,
            clearQueue
        },
        queueProtocol: 'http://',
        queueHost: QUEUE_HOST,
        queuePath: '/queue/Development/items',
        pingPath: '/ping',
        queueServiceApi: 'execute-api',
        contactsPath: '/contacts',
        channelsPath: '/channels',
        userDetailsPath: '/userDetails'
    },
    proxy: {
        enabled: true,
        host: PROXY_HOST,
        protocol: 'http://',
        queuePath: '/queueLambda',
        pingPath: '/ping',
        catalogPath: '/catalog',
        authPath: '/auth',
        refreshPath: '/v2/refresh',
        conversationPath: '/conversation',
        signupPath: '/signup/frontm',
        signupconfirmPath: '/v2/signupconfirm/frontm',
        resendSignupCodePath: '/v2/resendSignupCode/frontm',
        signinPath: '/signin/frontm',
        updateSigninPath: '/v2/updateSignin/frontm',
        deleteUserPath: '/v2/deleteUser',
        resetConfirmPath: '/v2/confirmReset/frontm',
        resetSigninPath: '/v2/resetSignin/frontm',
        ssePath: '/chatSSE',
        uploadFilePath: '/uploadfilebase64',
        uploadGroupLogo: './UploadChannelLogo',
        downloadFilePath: '/file',
        botDownloadPath: '/botfile',
        twilioPath: '/twilio',
        enableVoIPPath: '/enableVoip',
        disableVoIPPath: '/disableVoip',
        getVoIPStatusPath: '/getVoipStatus',
        subscribedBotsPath: '/v2/users/bots',
        subscribeToBot: '/bots/subscribe',
        unsubscribeFromBot: '/bots/unsubscribe',
        newProvider: '/v2/subscribeDomain',
        searchCatalog: '/catalog',
        archivedMessages: '/messages/archived'
    }
};

export default { ...commonConfig, ...appSpecificConfig };
