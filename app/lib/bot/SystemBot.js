import DeviceStorage from '../capability/DeviceStorage';

const DEVICE_STORAGE_KEY = 'SystemBot-manifest';

export const SYSTEM_BOT_MANIFEST_NAMES = {
    'im-bot': 'im-bot',
    'onboarding-bot': 'onboarding-bot',
    'contacts-bot': 'contacts-bot',
    'channels-bot': 'channels-bot'
};

// This is initial configuration - every release make sure the versions are updated
// The app still picks the latest from the server once the user visits the botstore once
export const SYSTEM_BOT_MANIFEST = {
    'im-bot': {
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
    'onboarding-bot': {
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
    'contacts-bot': {
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
    },
    'channels-bot': { name: 'ChannelsBot',
        'id': 'de3a7fe6-b2a7-4468-8099-40c57848387d',
        'vendor': 'frontmai',
        'slug': 'channels-bot',
        'url': 'botfarm/channelsBot.js',
        'logoUrl': 'Survey_logopng.png',
        'description': 'channels bot',
        'version': '0.1.0',
        'featured': true,
        'allowResetConversation': 'false',
        'category': [],
        'developer': 'FrontM',
        'systemBot': true,
        'dependencies': {
            'authContext': {
                version: '1.0.0',
                remote: true,
                url: 'botfarm/rc/authContext.js'
            },
            agentGuardService: {
                version: '1.0.0',
                remote: true,
                url: 'botfarm/rc/agentGuardService.js'
            }
        }
    }
};

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
        SystemBot.get(SystemBot.onboardingBotManifestName)
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

    static onboardingBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['onboarding-bot'];
    static imBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['im-bot'];
    static contactsBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['contacts-bot'];
    static channelsBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['channels-bot'];

    static onboardingBot = SYSTEM_BOT_MANIFEST['onboarding-bot'];
    static imBot = SYSTEM_BOT_MANIFEST['im-bot'];
    static contactsBot = SYSTEM_BOT_MANIFEST['contacts-bot'];
    static channelsBot = SYSTEM_BOT_MANIFEST['channels-bot'];
}
