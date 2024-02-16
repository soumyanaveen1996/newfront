/**
 * Config related to vikand direct app. chage content of this file only in dev/vikand branch.
 */
const config = {
    defaultProvider: 'VikandUser',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'vikand',
        appType: 'vikand',
        showLoginLoader: false,
        domaintoFilterOut: 'frontmai',
        socialLoginEnabled: false,
        fullImageOnSplashScreen: true,
        hideLableInTable: false,
        hideNetworkIcon: false,
        hideSearchBar: true,
        multiDomainSupport: true,
        newProfileScreen: false
    },
    showPSTNCalls: false,
    showVoipCalls: true,
    showTopUp: false,
    showBottomTabs: true,
    contactsAvailable: true,
    showHomeBanners: false,
    customHomeScreen: false,
    simpleLogin: false,
    loginImageEnabled: false,
    signUpEnabled: false,
    showApps: true,
    gcm: {
        senderID: '834750737902'
    },
    auth: {
        ios: {
            google: {
                behavior: 'web',
                iosClientId:
                    '359084752845-2u9vq8d628ahvm2ean7ns6qp1f4q9nma.apps.googleusercontent.com',
                callback: 'com.frontm.aagehempel:/oauth2redirect',
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
                        '459332022904-7nn662jh9jgef8299e9l3dv7a38nae54.apps.googleusercontent.com',
                    clientSecret: 'L2bxpMFZ3TVB50NC6QL-d6R0'
                },
                prod: {
                    scopes: ['profile', 'email'],
                    webClientId:
                        '459332022904-7nn662jh9jgef8299e9l3dv7a38nae54.apps.googleusercontent.com',
                    clientSecret: 'L2bxpMFZ3TVB50NC6QL-d6R0'
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
