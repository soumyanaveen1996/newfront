import DeviceStorage from '../capability/DeviceStorage';

const DEVICE_STORAGE_KEY = 'SystemBot-manifest';

export default class SystemBot {

    static get = (botManifestName) => new Promise((resolve, reject) => {
        const defaultManifest = SYSTEM_BOT_MANIFEST[botManifestName];

        if (!defaultManifest) {
            return reject('The botManifestName ' + botManifestName + ' is invalid');
        }
        // First check if there is a more recent version in cold storage, else get from the default manifest
        DeviceStorage.get(DEVICE_STORAGE_KEY)
            .then((allSystemBotsManifest) => {
                // No update available - go with default
                if (!allSystemBotsManifest) {
                    return resolve(defaultManifest);
                }
                const botManifest = allSystemBotsManifest[botManifestName];
                if (botManifest) {
                    return resolve(botManifest);
                } else {
                    return resolve(defaultManifest);
                }
            });
    });

    // Latest greatest manifest from bot catalog
    static update = (allSystemBotsManifest) => new Promise((resolve) => {
        return resolve(DeviceStorage.save(DEVICE_STORAGE_KEY, allSystemBotsManifest));
    });

    static getDefaultBots = () => new Promise((resolve, reject) => {
        SystemBot.get(SYSTEM_BOT_MANIFEST_NAMES.OnboardingBot)
            .then((bot) => {
                resolve([bot]);
            });
    });

    static getAllSystemBots = () => new Promise((resolve, reject) => {
        DeviceStorage.get(DEVICE_STORAGE_KEY)
            .then((allSystemBotsManifest) => {
                // No update available - go with default
                if (!allSystemBotsManifest) {
                    return resolve(SYSTEM_BOT_MANIFEST);
                }
                return resolve(allSystemBotsManifest);
            });
    });
}

export const SYSTEM_BOT_MANIFEST_NAMES = {
    IMChat: 'IMChat',
    OnboardingBot: 'OnboardingBot',
    ContactsBot: 'ContactsBot'
};

// This is initial configuration - every release make sure the versions are updated
// The app still picks the latest from the server once the user visits the botstore once
export const SYSTEM_BOT_MANIFEST = {
    IMChat: {
        'name': 'IMBot',
        'slug': 'im-bot',
        'url': 'botfarm/imBot.js',
        'logoUrl': 'https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/FrontBotLogo.png',
        'description': 'Instant Messenger',
        'id': 'im-bot', // This should never change (permanent)
        'version': '0.1.0',
        'category': 'im, chat',
        'vendor': 'frontm',
        'dependencies': {
            'authContext': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/authContext.js'
            },
            'agentGuardService': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/agentGuardService.js'
            },
            'botUtils': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/botUtils.js'
            }
        }
    },
    OnboardingBot: {
        'name': 'Onboarding Bot',
        'slug': 'onboarding-bot',
        'url': 'botfarm/onboardingBot.js',
        'logoUrl': 'https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/AuthenticationLogo.png',
        'description': 'Onboarding bot for Frontm',
        'id': 'onboarding-bot',
        'version': '0.1.0',
        'category': 'onboarding, authentication',
        'vendor': 'frontm',
        'dependencies': {
            'authContext': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/authContext.js'
            },
            'agentGuardService': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/agentGuardService.js'
            }
        }
    },
    ContactsBot: {
        'name': 'Address Book Management',
        'slug': 'contacts-bot',
        'url': 'botfarm/contactsBot.js',
        'logoUrl': 'https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/AddressBookLogo.png',
        'description': 'Bot to manage your personal address book',
        'id': '98ff14b8-6373-417f-bcdf-a9855ebdfbe7',
        'version': '0.1.0',
        'category': 'im, chat',
        'vendor': 'frontm',
        'dependencies': {
            'authContext': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/authContext.js'
            },
            'agentGuardService': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/agentGuardService.js'
            },
            'autoRenewConversationContext': {
                'version': '1.0.0',
                'remote': true,
                'url': 'botfarm/rc/autoRenewConversationContext.js'
            }
        }
    }
};
