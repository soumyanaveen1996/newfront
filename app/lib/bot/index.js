import events from 'events';
import _ from 'lodash';
import config from '../../config/config';
import dce from '../dce';
import { Bot as DceBot } from '../dce';
import { Utils, Network, Auth, Promise } from '../capability';
import { NetworkError } from '../network';
import SystemBot, { SYSTEM_BOT_MANIFEST } from './SystemBot';
import { MessageHandler } from '../message';
import FrontmUtils from '../../lib/utils';

class Bot extends events.EventEmitter {
    constructor(options) {
        super(options);

        this.details = options;
    }

    static install = async bot => {
        if (!bot) {
            throw new Error('A valid bot is required for installing a bot');
        }
        // Check if the bot is already installed - if so, throw an error?
        const bots = await Bot.getInstalledBots();
        const present = _.findIndex(bots, { botId: bot.botId });

        if (present > -1) {
            throw new Error(
                'The supplied bot is already an installed bot:',
                bot.botId
            );
        }

        await bot.Load();
    };

    static update = async bot => {
        if (!bot) {
            throw new Error('A valid bot is required for updating a bot');
        }
        // First delete the older version
        const bots = await Bot.getInstalledBots();
        const currentBot = _.find(bots, { botId: bot.botId });
        if (currentBot) {
            console.log('Deleting : ', bot.botId, bot.botName);
            const dceBot = dce.bot(currentBot);
            await Bot.delete(dceBot);
        }

        // Then install newer version
        await Bot.install(bot);
    };

    static delete = async bot => {
        if (!bot) {
            throw new Error('A valid bot is required for uninstalling a bot');
        }

        // Check if the bot to install is in list of installed bots:
        // const bots = await Bot.getInstalledBots()
        // const present = _.findIndex(bots, {botId: bot.botId})

        // if (present < 0) {
        //     throw new Error(
        //         'The supplied bot is not an installed bot:',
        //         bot.botId
        //     )
        // }

        await bot.Delete();
    };

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
        return Bot.getInstalledBots();
    }

    static async unInstallBots() {
        try {
            const bots = await Bot.getInstalledBots();
            const toDeleteBots = _.filter(
                bots,
                bot => SYSTEM_BOT_MANIFEST[bot.botId] === undefined
            );
            _.each(toDeleteBots, async bot => {
                await MessageHandler.deleteBotMessages(bot.botId);
                const dceBot = dce.bot(bot);
                await Bot.delete(dceBot);
            });
        } catch (e) {
            console.log('Error occurred while uninstalling bots !:', e);
            throw e;
        }
    }

    static async getCatalog() {
        try {
            let user = await Promise.resolve(Auth.getUser());
            if (!user) {
                return {};
            }
            // For now since we do not have a search
            let postReq = {
                domains: user.info.domains
            };

            let options = {
                method: 'post',
                url: getUrl(),
                headers: getHeaders(user, postReq),
                data: postReq
            };
            let results = await Network(options);
            let catalog = _.get(results, 'data');
            if (!catalog) {
                throw new NetworkError('Error getting catalog');
            }
            if (!_.isArray(catalog)) {
                throw new NetworkError('Error getting catalog');
            }

            // console.log('data of catalog ', catalog);

            catalog = _.map(catalog, bot =>
                _.merge(bot, { logoUrl: FrontmUtils.botLogoUrl(bot.logoUrl) })
            );

            const catalogData = {
                bots: catalog
            };
            catalogData.featured = _.map(
                _.filter(
                    catalog,
                    bot =>
                        (bot.featured === 'true' || bot.featured === true) &&
                        (bot.systemBot === false ||
                            bot.systemBot === 'false' ||
                            bot.systemBot === undefined)
                ),
                'botId'
            );
            catalogData.systemBots = _.keyBy(
                _.filter(
                    catalog,
                    bot => bot.systemBot === 'true' || bot.systemBot === true
                ),
                'slug'
            );
            const developerBots = _.omit(
                _.groupBy(catalog, 'developer'),
                'undefined'
            );
            catalogData.developer = _.map(_.keys(developerBots), developer => {
                return {
                    name: developer,
                    logoUrl: FrontmUtils.developerLogoUrl(developer),
                    botIds: _.map(developerBots[developer], 'botId')
                };
            });
            const categories = _.reduce(
                catalog,
                (result, bot) => {
                    _.forEach(bot.category, category => {
                        result[category] = _.concat(
                            result[category] || [],
                            bot
                        );
                    });
                    return result;
                },
                {}
            );

            catalogData.categories = _.map(_.keys(categories), category => {
                return {
                    name: category,
                    logoUrl: FrontmUtils.developerLogoUrl(category),
                    botIds: _.map(categories[category], 'botId')
                };
            });

            // Update the latest catalog
            const systemBotsCatalog = catalogData.systemBots;
            if (systemBotsCatalog) {
                // Why do we care to await?
                await Promise.resolve(SystemBot.update(systemBotsCatalog));
            }

            return catalogData;
        } catch (e) {
            // TODO: handle errors
            console.log('Error occurred getting the catalog!:', e);
            throw new NetworkError('Error getting catalog', e);
        }

        function getUrl() {
            if (config.proxy.enabled) {
                return (
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.catalogPath
                );
            } else {
                return (
                    config.bot.baseProtocol +
                    config.bot.catalogHost +
                    config.bot.catalogPath
                );
            }
        }

        function getHeaders(user, postReq) {
            if (config.proxy.enabled) {
                return {
                    sessionId: user.creds.sessionId
                };
            } else {
                return Utils.createAuthHeader(
                    config.bot.catalogHost,
                    'post',
                    config.bot.catalogPath,
                    config.bot.catalogServiceApi,
                    postReq,
                    user
                );
            }
        }
    }

    static getDefaultCatalog() {
        return {
            developer: [],
            categories: [],
            featured: [],
            bots: []
        };
    }
}

export default Bot;
