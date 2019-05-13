import DeviceStorage from '../capability/DeviceStorage';
import { botLogoUrl } from '../utils';

console.log('FrontmUtils : ', botLogoUrl);

const DEVICE_STORAGE_KEY = 'SystemBot-manifest';

export const SYSTEM_BOT_MANIFEST_NAMES = {
    'im-bot': 'im-bot',
    'onboarding-bot': 'onboarding-bot',
    'contacts-bot': 'contacts-bot',
    'channels-bot': 'channels-bot',
    'domMgmt-bot': 'domMgmt-bot',
    'backgroundTask-bot': 'backgroundTask-bot'
};

// This is initial configuration - every release make sure the versions are updated
// The app still picks the latest from the server once the user visits the botstore once
export const SYSTEM_BOT_MANIFEST = {
    'im-bot': {
        allowResetConversation: 'false',
        botId: 'im-bot',
        botName: 'IMBot',
        botUrl: 'botfarm/frontmai/imBot/1.7.0/imBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: 'true',
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.3.0/agentGuardService.js',
                version: '1.3.0'
            },
            authContext: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/authContext/1.0.0/authContext.js',
                version: '1.0.0'
            },
            botUtils: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/botUtils/1.0.0/botUtils.js',
                version: '1.0.0'
            }
        },
        description: 'Instant Messenger',
        logoUrl: botLogoUrl('IMBotLogo.png'),
        slug: 'im-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '1.7.0'
    },

    'onboarding-bot': {
        allowResetConversation: 'false',
        botId: 'onboarding-bot',
        botName: 'FrontM Assistant',
        botUrl: 'botfarm/frontmai/onboardingBot/2.2.2/onboardingBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: 'true',
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.3.0/agentGuardService.js',
                version: '1.3.0'
            },
            authContext: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/authContext/1.4.0/authContext.js',
                version: '1.4.0'
            },
            archiveUtils: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/archiveUtils/1.1.0/archiveUtils.js',
                version: '1.1.0'
            }
        },
        description:
            'I am FrontM Assistant and will help you to start using FrontM. Open this conversation to set you up',
        logoUrl: botLogoUrl('AuthenticationLogo.png'),
        slug: 'onboarding-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '2.2.2'
    },
    'contacts-bot': {
        allowResetConversation: 'false',
        botId: '98ff14b8-6373-417f-bcdf-a9855ebdfbe7',
        botName: 'Address Book Management',
        botUrl: 'botfarm/frontmai/contactsBot/1.2.0/contactsBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: 'true',
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.2.0/agentGuardService.js',
                version: '1.2.0'
            },
            authContext: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/authContext/1.0.0/authContext.js',
                version: '1.0.0'
            },
            autoRenewConversationContext: {
                remote: 'true',
                url:
                    'botfarm/rc/frontmai/autoRenewConversationContext/1.0.0/autoRenewConversationContext.js',
                version: '1.0.0'
            }
        },
        description: 'Bot to manage your personal address book',
        logoUrl: botLogoUrl('AddressBookLogo.png'),
        slug: 'contacts-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '1.2.0'
    },
    'channels-bot': {
        allowResetConversation: 'false',
        botId: 'de3a7fe6-b2a7-4468-8099-40c57848387d',
        botName: 'Channels',
        botUrl: 'botfarm/frontmai/channelsBot/1.5.0/channelsBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: true,
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.2.0/agentGuardService.js',
                version: '1.2.0'
            },
            authContext: {
                remote: true,
                url: 'botfarm/rc/frontmai/authContext/1.0.0/authContext.js',
                version: '1.0.0'
            }
        },
        description: 'channels bot',
        featured: true,
        logoUrl: botLogoUrl('ChannelsBotLogo.png'),
        slug: 'channels-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '1.5.0'
    },
    'domMgmt-bot': {
        allowResetConversation: 'false',
        botId: 'domMgmtBot',
        botName: 'Sign in to a new Provider',
        botUrl: 'botfarm/frontmai/domMgmtBot/1.3.0/domMgmtBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: true,
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.2.0/agentGuardService.js',
                version: '1.2.0'
            },
            authContext: {
                remote: true,
                url: 'botfarm/rc/frontmai/authContext/1.4.0/authContext.js',
                version: '1.4.0'
            }
        },
        description: 'Onboarding bot for Frontm',
        logoUrl: botLogoUrl('AuthenticationLogo.png'),
        slug: 'domMgmt-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '1.3.0'
    },
    'backgroundTask-bot': {
        allowResetConversation: 'false',
        botId: 'BackgroundTaskBot',
        botName: 'Background Task',
        botUrl: 'botfarm/frontmai/backgroundTaskBot/1.3.0/backgroundTaskBot.js',
        category: [],
        dependencies: {
            agentGuardService: {
                remote: true,
                version: '1.3.0',
                url:
                    'botfarm/rc/frontmai/agentGuardService/1.3.0/agentGuardService.js'
            },
            authContext: {
                remote: true,
                version: '1.2.0',
                url: 'botfarm/rc/frontmai/authContext/1.2.0/authContext.js'
            },
            archiveUtils: {
                remote: 'true',
                url: 'botfarm/rc/frontmai/archiveUtils/1.1.0/archiveUtils.js',
                version: '1.1.0'
            }
        },
        description: 'Bot that executes jobs in the backend',
        featured: true,
        logoUrl: 'Survey_logopng.png',
        slug: 'backgroundTask-bot',
        systemBot: true,
        userDomain: 'frontmai',
        version: '1.3.0'
    }
};

export default class SystemBot {
    static get = botManifestName =>
        new Promise((resolve, reject) => {
            const defaultManifest = SYSTEM_BOT_MANIFEST[botManifestName];

            if (!defaultManifest) {
                return reject(
                    'The botManifestName ' + botManifestName + ' is invalid'
                );
            }
            // First check if there is a more recent version in cold storage, else get from the default manifest
            DeviceStorage.get(DEVICE_STORAGE_KEY).then(
                allSystemBotsManifest => {
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
                }
            );
        });

    // Latest greatest manifest from bot catalog
    static update = allSystemBotsManifest =>
        new Promise(resolve => {
            return resolve(
                DeviceStorage.save(DEVICE_STORAGE_KEY, allSystemBotsManifest)
            );
        });

    static getDefaultBots = () =>
        new Promise((resolve, reject) => {
            SystemBot.get(SystemBot.onboardingBotManifestName).then(bot => {
                resolve([bot]);
            });
        });

    static getAllSystemBots = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(DEVICE_STORAGE_KEY).then(
                allSystemBotsManifest => {
                    // No update available - go with default
                    if (!allSystemBotsManifest) {
                        return resolve(SYSTEM_BOT_MANIFEST);
                    }
                    return resolve(allSystemBotsManifest);
                }
            );
        });

    static isSystemBot = botId =>
        SYSTEM_BOT_MANIFEST_NAMES[botId] !== undefined;

    static onboardingBotManifestName =
        SYSTEM_BOT_MANIFEST_NAMES['onboarding-bot'];
    static imBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['im-bot'];
    static contactsBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['contacts-bot'];
    static channelsBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['channels-bot'];
    static domainMgmtBotManifestName = SYSTEM_BOT_MANIFEST_NAMES['domMgmt-bot'];
    static backgroundTaskBotManifestName =
        SYSTEM_BOT_MANIFEST_NAMES['backgroundTask-bot'];

    static onboardingBot = SYSTEM_BOT_MANIFEST['onboarding-bot'];
    static imBot = SYSTEM_BOT_MANIFEST['im-bot'];
    static contactsBot = SYSTEM_BOT_MANIFEST['contacts-bot'];
    static channelsBot = SYSTEM_BOT_MANIFEST['channels-bot'];
    static domainMgmtBot = SYSTEM_BOT_MANIFEST['domMgmt-bot'];
    static backgroundTaskBot = SYSTEM_BOT_MANIFEST['backgroundTask-bot'];
}
