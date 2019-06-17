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
import { NativeModules, NativeEventEmitter } from 'react-native';
const UserServiceClient = NativeModules.UserServiceClient;
const ConversationServiceClient = NativeModules.ConversationServiceClient;

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

        try {
            await bot.Load();
        } catch (error) {
            console.log(error);
            throw error;
        }
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

    static searchBots(searchKey) {
        const postReq = {
            query: {
                searchKey: searchKey
            }
        };

        return new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'POST',
                            url: `${config.proxy.protocol}${config.proxy.host}${
                                config.proxy.searchCatalog
                            }`,
                            headers: {
                                sessionId: user.creds.sessionId
                            },
                            data: postReq
                        };
                        return Network(options);
                    }
                })
                .then(response => {
                    if (response.status === 200) {
                        return resolve(response.data);
                    } else {
                        reject(null);
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    static addNewProvider(key) {
        const params = {
            verificationCode: key
        };

        return new Promise(function(resolve, reject) {
            Auth.getUser().then(user => {
                if (user) {
                    UserServiceClient.subscribeDomain(
                        user.creds.sessionId,
                        params,
                        (error, result) => {
                            console.log(
                                'GRPC:::subscribe domain : ',
                                error,
                                result
                            );
                            if (error) {
                                return reject({
                                    type: 'error',
                                    error: error.code
                                });
                            }
                            if (
                                result.data.content &&
                                result.data.content.length > 0
                            ) {
                                console.log(
                                    'GRPC:::subscribing domain ',
                                    result.data
                                );
                                resolve(result.data.content);
                            } else {
                                reject(null);
                            }
                        }
                    );
                } else {
                    reject(new Error('No logged in user'));
                }
            });
        });
    }

    static grpcGetCatalog = user => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {});
            ConversationServiceClient.getCatalog(
                user.creds.sessionId,
                (error, result) => {
                    //console.log('GRPC:::getCatalog : ', error, result);
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };

    static async getCatalog() {
        try {
            let user = await Auth.getUser();
            if (!user) {
                return {};
            }
            let results = await Bot.grpcGetCatalog(user);

            let catalog = _.get(results, 'data');
            catalog = catalog.bots;

            if (!catalog) {
                throw new NetworkError('Error getting catalog');
            }
            if (!_.isArray(catalog)) {
                throw new NetworkError('Error getting catalog');
            }

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
