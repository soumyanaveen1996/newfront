import { Platform } from 'react-native';
const S3_HOST = 'localhost:3000';
const CATALOG_HOST = 'localhost:3000';
const QUEUE_HOST = 'localhost:3000';
const PROXY_HOST = 'localhost:3000';
let pollingInterval;
if (Platform.OS === 'android') {
    pollingInterval = 15000;
} else {
    pollingInterval = 180000;
}
// TODO: Replace the facebook App ID. It belons to a Amal's personal account App.
const config = {
    app: {
        hideFilter: true,
        hideAddContacts: true
    },
    aws: {
        region: 'us-east-1'
    },
    gcm: {
        senderID: '705702062891'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId:
                    '705702062891-u7ej27vutmacues3htr8us9uimig906g.apps.googleusercontent.com',
                callback: 'com.frontm.frontm:/oauth2redirect',
                scopes: ['profile', 'email']
            },
            facebook: {
                appId: '150576769074284',
                permissions: ['email', 'public_profile'] // Keep it in sorted order
            }
        },
        android: {
            google: {
                dev: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '705702062891-d1f5q7nh6k8defah173n247vh4kp5kt9.apps.googleusercontent.com',
                    clientSecret: 'NwLXpaQUMeJBxoUDWOt6q_l7'
                },
                prod: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '705702062891-d1f5q7nh6k8defah173n247vh4kp5kt9.apps.googleusercontent.com',
                    clientSecret: 'NwLXpaQUMeJBxoUDWOt6q_l7'
                }
            },
            facebook: {
                permissions: ['public_profile', 'email'] // Keep it in sorted order
            }
        },
        cognito: {
            IdentityPoolId: 'us-east-1:28e68412-a071-43d7-ba52-560756ea3a9e',
            tokenRefreshTime: 2700000 // 2700s === 45 mins
        }
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
            pollingInterval: 600000,
            keepAliveInterval: 120000
        },
        gsm: {
            pollingInterval: pollingInterval,
            backgroundPollingInterval: 300000
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
        uploadFilePath: '/v2/uploadfile',
        downloadFilePath: '/v2/file',
        botDownloadPath: '/v2/botfile',
        twilioPath: '/twilio',
        enableVoIPPath: '/enableVoip',
        getVoIPStatusPath: '/getVoipStatus',
        subscribedBotsPath: '/v2/users/bots',
        subscribeToBot: '/bots/subscribe',
        unsubscribeFromBot: '/bots/unsubscribe'
    },
    googleAnalytics: {
        trackingId: 'UA-37782731-2'
    }
};

export default config;
