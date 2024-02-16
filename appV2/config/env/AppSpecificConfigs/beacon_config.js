/**
 * Config related to Beacon assist app. chage content of this file only in dev/beacon branch.
 */
const config = {
    defaultProvider: 'macnEndUser',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'macn',
        appType: 'macn',
        showLoginLoader: true,
        domaintoFilterOut: 'frontmai',
        socialLoginEnabled: false,
        fullImageOnSplashScreen: false,
        hideLableInTable: false,
        hideNetworkIcon: true,
        hideSearchBar: false,
        landingBot: true,
        multiDomainSupport: false,
        newProfileScreen: false
    },
    showPSTNCalls: false,
    showVoipCalls: true,
    showTopUp: false,
    showBottomTabs: false,
    contactsAvailable: false,

    gcm: {
        senderID: '834750737902'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId:
                    '772435176220-svepojakratbk5iv5uj3kj9cqeprdahd.apps.googleusercontent.com',
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
                        '772435176220-m5l8d6i68t67h06kqpvufk24as8qiacj.apps.googleusercontent.com',
                    clientSecret: 'b1e8iVY9gYzTKs8QPZmRCCd2'
                },
                prod: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '772435176220-m5l8d6i68t67h06kqpvufk24as8qiacj.apps.googleusercontent.com',
                    clientSecret: 'b1e8iVY9gYzTKs8QPZmRCCd2'
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
