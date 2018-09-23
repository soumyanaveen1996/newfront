import Bot from '../bot'
import dce from '../dce'
import utils from '../utils'
import { Auth, Network } from '../capability';
import config from '../../config/config'
import _ from 'lodash'

class BotInstall {

    /**
     * Return all the bots the user is subscribed to.
     * @returns {Promise} Array of Bot IDs
     */
    static GetSubscribedBots = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'get',
                            url: `${config.network.queueProtocol}${config.proxy.host}/v2/users/bots`,
                            headers: {
                                accessKeyId: user.aws.accessKeyId,
                                secretAccessKey: user.aws.secretAccessKey,
                                sessionToken: user.aws.sessionToken
                            }
                        };
                        return Network(options);
                    }
                })
                .then(subscribedBots => {
                    resolve(subscribedBots.data.content)
                })
                .catch(reject);
        });

    /**
     * @param {String} botId Bot's ID
     * @param {Array} catalog Bot catalog. Use getCatalog() from lib/bot/indexjs
     * @returns {Object} Bot's Manifest
     */
    static GetBotManifestFromId = (botID, catalog) => {
        catalog = catalog.bots
        const subscribedBotManifest = _.find(catalog, (manifest) => {
            return manifest.botId === botID
        })
        return subscribedBotManifest
    }

    /**
 * @param {Object} botManifest Bot's manifest
 * @returns {Promise} True if installed or updated, False if not.
 */
    static InstallBot = (botManifest) =>
        new Promise(async (resolve, reject) => {
            const installedBotsManifests = await Bot.getInstalledBots()
            const botStatus = utils.checkBotStatus(installedBotsManifests, botManifest)
            try {
                if (!botStatus.installed) {
                    const dceBot = dce.bot(botManifest);
                    if (botStatus.update) {
                        await Bot.update(dceBot);
                    } else {
                        await Bot.install(dceBot);
                    }
                    resolve(true)
                } else {
                    console.log(botManifest.botName + ': already installed')
                    resolve(false)
                }
            } catch (e) {
                console.log('ERROR: ' + JSON.stringify(e, undefined, 2))
                resolve(false)
            }
        })

    /**
     * Install all the bots the user is subscribed to. Respond success if at least one bot was installed and error if no bots are installed. 
     * @returns {Promise} Success if at least one bot is installed
     */
    static InstallAllSubscribedBots = () =>
        new Promise((resolve, reject) => {
            BotInstall.GetSubscribedBots()
                .then(async (subscribedBotsIds) => {
                    const catalog = await Bot.getCatalog()
                    const manifests = _.map(subscribedBotsIds, (botId) => {
                        return BotInstall.GetBotManifestFromId(botId, catalog)
                    })
                    return manifests
                })
                .then(async (subscribedBotsManifests) => {
                    const results = _.map(subscribedBotsManifests, (botManifest) => {
                        return BotInstall.InstallBot(botManifest)
                            .then((res) => {
                                return res
                            })
                    })
                    Promise.all(results).then((res) => {
                        if (_.some(res, (result) => { return result === true })) {
                            console.log('Bots installed')
                            resolve()
                        } else {
                            console.log('No bot was installed')
                            resolve()
                        }
                    })
                })
                .catch(reject)
        })
}

export default BotInstall;
