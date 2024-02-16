/**
 * Config related to frontm app. chage content of this file only in developmet branch.
 */
const config = {
    defaultProvider: '',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'frontmai',
        appType: 'frontm',
        showLoginLoader: true,
        domaintoFilterOut: null,
        socialLoginEnabled: true,
        fullImageOnSplashScreen: false,
        hideLableInTable: false,
        hideNetworkIcon: false,
        hideSearchBar: true
    },
    showPSTNCalls: true,
    showVoipCalls: true,
    showTopUp: true,
    showBottomTabs: true,
    contactsAvailable: true,
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
    googleAnalytics: {
        trackingId: 'UA-37782731-2'
    },
    supportEmail: {
        address: 'support@frontm.com'
    }
};

export default config;
