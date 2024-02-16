/**
 * Config related to shair app. chage content of this file only in dev/shair branch.
 */
const config = {
    defaultProvider: '',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'frontm',
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
        senderID: '709960744255'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId:
                    '709960744255-u1de4trld1kti8iuf3h3f2m7h4ds08qt.apps.googleusercontent.com',
                callback: 'com.frontm.shair:/oauth2redirect',
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
                        '709960744255-qu5ftm6hrke0npvf5mf4afsntu2h35os.apps.googleusercontent.com',
                    clientSecret: 'aPUZ9ihDNF967Xra9R_Vah93'
                },
                prod: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '709960744255-qu5ftm6hrke0npvf5mf4afsntu2h35os.apps.googleusercontent.com',
                    clientSecret: 'aPUZ9ihDNF967Xra9R_Vah93'
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
