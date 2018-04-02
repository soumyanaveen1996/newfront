const S3_HOST = 'localhost:3000';
const CATALOG_HOST = 'localhost:3000';
const QUEUE_HOST = 'localhost:3000';
const PROXY_HOST = 'localhost:3000';

// TODO: Replace the facebook App ID. It belons to a Amal's personal account App.
const config = {
    app: {
        hideFilter: true,
        hideAddContacts: true
    },
    aws: {
        region: 'us-east-1'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId: '948594463167-ek2t5ctm2jq6kia2bi1l9d5e6uvki5fp.apps.googleusercontent.com',
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
                scopes: ['profile', 'email'],
                webClientId: '705702062891-d1f5q7nh6k8defah173n247vh4kp5kt9.apps.googleusercontent.com'
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
        s3bucket: 'v1',
        s3ServiceApi: 's3',
        binaryS3Bucket: 'bin',
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
            keepAliveInterval: 120000,
        },
        gsm: {
            pollingInterval: 60000,
        },
        queueProtocol: 'http://',
        queueHost: QUEUE_HOST,
        queuePath: '/queue/Development/items',
        pingPath: '/ping',
        queueServiceApi: 'execute-api',
        contactsPath: '/contacts',
        channelsPath: '/channels',
        userDetailsPath: '/userDetails',
    },
    proxy: {
        enabled: true,
        host: PROXY_HOST,
        protocol: 'http://',
        queuePath: '/queueLambda',
        pingPath: '/ping',
        catalogPath: '/catalog',
        authPath: '/auth',
        refreshPath: '/refresh',
        conversationPath: '/conversation'
    }
}

export default config;
