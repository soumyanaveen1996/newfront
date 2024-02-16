import events from 'events';
import _ from 'lodash';
import { NativeModules, Platform } from 'react-native';
import config from '../../config/config';
import dce, { Bot as DceBot } from '../dce';

import { Auth, Network, Promise, RemoteBotInstall } from '../capability';
import { NetworkError } from '../network';
import SystemBot, { SYSTEM_BOT_MANIFEST } from './SystemBot';
import { MessageHandler } from '../message';
import FrontmUtils from '../utils';
import Bugsnag from '../../config/ErrorMonitoring';
import ConversationServices from '../../apiV2/ConversationServices';
import UserServices from '../../apiV2/UserServices';

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
        const bots = await Bot.getAllInstalledBots();
        const present = _.findIndex(bots, { botId: bot.botId });

        if (present > -1) {
            console.log(
                `Installing:  bot is already an installed -${bot.botId}`
            );
            throw new Error(
                'The supplied bot is already an installed bot:',
                bot.botId
            );
        }

        try {
            await bot.Load();
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    static update = async (bot) => {
        if (!bot) {
            throw new Error('A valid bot is required for updating a bot');
        }

        // First delete the older version
        const bots = await Bot.getInstalledBots();
        const currentBot = _.find(bots, { botId: bot.botId });
        if (currentBot) {
            const dceBot = dce.bot(currentBot);
            await Bot.delete(dceBot);
        }
        // Then install newer version
        await Bot.install(bot);
    };

    static delete = async (bot) => {
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
            return await DceBot.installedBots();
        } catch (e) {
            return [];
        }
    }

    static async getAllInstalledBots() {
        try {
            const bots = await DceBot.allInstalledBots();
            return bots;
        } catch (e) {
            return [];
        }
    }

    // TODO: This function is just temporary. Have to replace with logic to
    // find top Timeline bots
    static async getTimeLineBots() {
        return await Bot.getInstalledBots();
    }

    static async unInstallBots() {
        try {
            const bots = await Bot.getAllInstalledBots();
            const toDeleteBots = _.filter(
                bots,
                (bot) => SYSTEM_BOT_MANIFEST[bot.botId] === undefined
            );
            _.each(toDeleteBots, async (bot) => {
                await MessageHandler.deleteBotMessages(bot.botId);
                const dceBot = dce.bot(bot);
                await Bot.delete(dceBot);
            });
        } catch (e) {
            console.log('Error occurred while uninstalling bots !:', e);
            throw e;
        }
    }

    static searchBots(searchKey) {
        const postReq = {
            query: {
                searchKey
            }
        };

        return new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                const options = {
                    method: 'POST',
                    url: `${config.proxy.protocol}${config.proxy.host}${config.proxy.searchCatalog}`,
                    headers: {
                        sessionId: user.creds.sessionId
                    },
                    data: postReq
                };
                Network(options)
                    .then((response) => {
                        if (response.status === 200) {
                            return resolve(response.data);
                        }
                        reject(null);
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    static addNewProvider(key) {
        const params = {
            verificationCode: key
        };

        return new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                UserServices.subscribeDomain(params)
                    .then(({ content, error, errorMessage }) => {
                        if (error) {
                            reject(errorMessage);
                        } else if (error !== 0) {
                            reject(errorMessage);
                        } else {
                            resolve(content);
                        }
                    })
                    .catch((error) => {
                        reject('An error occurred.');
                    });
            } else {
                reject('No logged in user');
            }
        });
    }

    // Android Sepcific Code-> Check connection of GRPC endpoint
    static grpcheartbeatCatalog = () => {
        // heartbeat not needed as we are moving to sockets
        return;
    };

    static grpcGetCatalog = (user) => ConversationServices.getCatalog();

    static async getCatalog() {
        try {
            const user = Auth.getUserData();
            if (!user) {
                return {};
            }
            const results = await Bot.grpcGetCatalog(user);

            let catalog = results.bots;

            if (!catalog) {
                throw new NetworkError('Error getting catalog');
            }
            if (!_.isArray(catalog)) {
                throw new NetworkError('Error getting catalog');
            }

            catalog = _.map(catalog, (bot) =>
                _.merge(bot, { logoUrl: FrontmUtils.botLogoUrl(bot.logoUrl) })
            );

            const catalogData = {
                bots: catalog
            };
            catalogData.featured = _.map(
                _.filter(
                    catalog,
                    (bot) =>
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
                    (bot) => bot.systemBot === 'true' || bot.systemBot === true
                ),
                'slug'
            );
            const developerBots = _.omit(
                _.groupBy(
                    catalog.filter(
                        (bot) =>
                            bot.systemBot === false ||
                            bot.systemBot === 'false' ||
                            bot.systemBot === undefined
                    ),
                    'developer'
                ),
                'undefined'
            );
            catalogData.developer = _.map(
                _.keys(developerBots),
                (developer) => ({
                    name: developer,
                    logoUrl: FrontmUtils.developerLogoUrl(developer),
                    botIds: _.map(developerBots[developer], 'botId')
                })
            );
            const categories = _.reduce(
                catalog,
                (result, bot) => {
                    _.forEach(bot.category, (category) => {
                        result[category] = _.concat(
                            result[category] || [],
                            bot
                        );
                    });
                    return result;
                },
                {}
            );

            catalogData.categories = _.map(_.keys(categories), (category) => ({
                name: category,
                logoUrl: FrontmUtils.developerLogoUrl(category),
                botIds: _.map(categories[category], 'botId')
            }));

            // Update the latest catalog
            const systemBotsCatalog = catalogData.systemBots;
            if (systemBotsCatalog) {
                const currentSystemCatelog = await Promise.resolve(
                    SystemBot.getAllSystemBots()
                );
                Object.keys(systemBotsCatalog).forEach(async (bot) => {
                    await RemoteBotInstall.installBot(
                        systemBotsCatalog?.[bot],
                        currentSystemCatelog
                    );
                });
                // Why do we care to await?
                await Promise.resolve(SystemBot.update(systemBotsCatalog));
            }

            return catalogData;
        } catch (e) {
            // TODO: handle errors
            console.log('Error occurred getting the catalog!:', e);
            throw new NetworkError('Error getting catalog', e);
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
