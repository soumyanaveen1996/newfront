/**
 * Config related to onship app. chage content of this file only in dev/onship branch.
 */
const config = {
    defaultProvider: 'onshipEndUser',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'onecare',
        appType: 'onecare',
        showLoginLoader: false,
        domaintoFilterOut: 'frontmai',
        socialLoginEnabled: false,
        fullImageOnSplashScreen: false,
        hideLableInTable: false,
        hideNetworkIcon: false,
        hideSearchBar: false,
        allowAccountDeletion: true,
        multiDomainSupport: true,
        newProfileScreen: true
    },
    showPSTNCalls: false,
    showVoipCalls: true,
    showTopUp: false,
    showBottomTabs: true,
    contactsAvailable: true,
    showHomeBanners: false,
    customHomeScreen: true,
    simpleLogin: true,
    loginImageEnabled: true,
    signUpEnabled: false,
    showApps: false,
    gcm: {
        senderID: '834750737902'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId:
                    '834750737902-e95anddgm6np74ks07b7aoh5i2ho6igt.apps.googleusercontent.com',
                callback: 'com.frontm.onship:/oauth2redirect',
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
                        '834750737902-mve86aq37ndgevoi7qmpn99tbuulma8u.apps.googleusercontent.com',
                    clientSecret: 'Uw8-NB6GSXTFWhkA5J6WXcPo'
                },
                prod: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '834750737902-mve86aq37ndgevoi7qmpn99tbuulma8u.apps.googleusercontent.com',
                    clientSecret: 'Uw8-NB6GSXTFWhkA5J6WXcPo'
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
    },
    appType: 'onecare',
    appDomain: 'onecare',
    assistandBotId: 'nvYDkqiLpvkfvQzWurBMZa'
};

export default config;
