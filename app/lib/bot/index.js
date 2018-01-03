import events from 'events';
import _ from 'lodash';
import config from '../../config/config';
import dce from '../dce';
import { Bot as DceBot } from '../dce';
import { Utils, Network, Auth, Promise } from '../capability';
import { NetworkError } from '../network';
import SystemBot from './SystemBot';

class Bot extends events.EventEmitter {

    constructor(options) {
        super(options);

        this.details = options;
    }

    static install = async (bot) => {
        if (!bot) {
            throw new Error('A valid bot is required for installing a bot');
        }
        // Check if the bot is already installed - if so, throw an error?
        const bots = await Bot.getInstalledBots();
        const present = _.findIndex(bots, {id: bot.id});

        if (present > -1) {
            throw new Error('The supplied bot is already an installed bot:', bot.id);
        }

        await bot.Load();
    }

    static update = async (bot) => {
        if (!bot) {
            throw new Error('A valid bot is required for updating a bot');
        }
        // First delete the older version
        const bots = await Bot.getInstalledBots();
        const currentBot = _.find(bots, { id: bot.id });
        if (currentBot) {
            const dceBot = dce.bot(currentBot);
            await Bot.delete(dceBot);
        }

        // Then install newer version
        await Bot.install(bot);
    }

    static delete = async (bot) => {
        if (!bot) {
            throw new Error('A valid bot is required for uninstalling a bot');
        }

        // Check if the bot to install is in list of installed bots:
        const bots = await Bot.getInstalledBots();
        const present = _.findIndex(bots, {id: bot.id});

        if (present < 0) {
            throw new Error('The supplied bot is not an installed bot:', bot.id);
        }

        await bot.Delete();
    }

    static async getInstalledBots() {
        try {
            const bots = await DceBot.installedBots();
            return bots;
        } catch (e) {
            return [];
        }
    }

    // TODO: This function is just temporary. Have to replace with logic to
    // find top Timeline bots
    static async getTimeLineBots() {
        return Bot.getInstalledBots()
    }

    static async getCatalog() {
        try {
            // For now since we do not have a search
            let postReq = {
                context: '',
                capabilities: []
            };
            let user = await Promise.resolve(Auth.getUser());

            let options = {
                'method': 'post',
                'url': getUrl(),
                'headers': getHeaders(user, postReq),
                'data': postReq
            };
            let results = await Network(options);
            const catalog = _.get(results, 'data');

            // Update the latest catalog
            const systemBotsCatalog = catalog.systemBots;
            if (systemBotsCatalog) {
                // Why do we care to await?
                await Promise.resolve(SystemBot.update(systemBotsCatalog));
            }

            return catalog;
        } catch (e) {
            // TODO: handle errors
            console.log('Error occurred getting the catalog!:', e);
            throw new NetworkError('Error getting catalog', e);
        }

        function getUrl() {
            if (config.proxy.enabled) {
                return config.proxy.protocol + config.proxy.host + config.proxy.catalogPath;
            } else {
                return config.bot.baseProtocol + config.bot.catalogHost + config.bot.catalogPath;
            }
        }

        function getHeaders(user, postReq) {
            if (config.proxy.enabled) {
                return  {
                    accessKeyId: user.aws.accessKeyId,
                    secretAccessKey: user.aws.secretAccessKey,
                    sessionToken: user.aws.sessionToken
                };
            } else {
                return Utils.createAuthHeader(config.bot.catalogHost, 'post', config.bot.catalogPath, config.bot.catalogServiceApi, postReq, user);
            }
        }

    }

    static getDefaultCatalog() {
        return {
            'developer': [],
            'categories': [],
            'featured': [],
            'bots': []
        };
    }

}

export default Bot;
