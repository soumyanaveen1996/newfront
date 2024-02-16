/**
 * Config related to seamplify app. chage content of this file only in dev/aagehempel branch.
 */
const config = {
    defaultProvider: 'aagehempelEndUser',
    app: {
        hideFilter: true,
        hideAddContacts: true,
        domain: 'frontmai',
        appType: 'frontm',
        showLoginLoader: true,
        domaintoFilterOut: 'frontmai',
        socialLoginEnabled: false,
        fullImageOnSplashScreen: false,
        hideLableInTable: true,
        hideNetworkIcon: false,
        hideSearchBar: true
    },
    showPSTNCalls: true,
    showVoipCalls: true,
    showTopUp: true,
    showBottomTabs: true,
    contactsAvailable: true,
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
