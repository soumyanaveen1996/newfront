import Bot from '../bot';
import dce from '../dce';
import utils from '../utils';
import { Auth, Network } from '../capability';
import config from '../../config/config';
import _ from 'lodash';
import { NetworkHandler } from '../network';

class RemoteBotInstall {
    /**
     * Return all the bots the user is subscribed to.
     * @returns {Promise} Array of Bot IDs
     */
    static getSubscribedBots = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        let options = {
                            method: 'get',
                            url: `${config.network.queueProtocol}${
                                config.proxy.host
                            }${config.proxy.subscribedBotsPath}`,
                            headers: {
                                sessionId: user.creds.sessionId
                            }
                        };
                        return Network(options);
                    }
                })
                .then(subscribedBots => {
                    resolve(subscribedBots.data.content);
                })
                .catch(reject);
        });

    /**
     * @param {String} botId Bot's ID
     * @param {Array} catalog Bot catalog. Use getCatalog() from lib/bot/indexjs
     * @returns {Object} Bot's Manifest
     */
    static getBotManifestFromId = (botID, catalog) => {
        catalog = catalog.bots;
        const subscribedBotManifest = _.find(catalog, manifest => {
            return manifest.botId === botID;
        });
        return subscribedBotManifest;
    };

    /**
     * @returns {Promise} true if the device is using satellite network
     */
    static isSatellite = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    return NetworkHandler.readQueue(user);
                })
                .then(res => {
                    resolve(res.data.onSatellite);
                });
        });

    /**
     * Install the manifest's bot only if the device is not on satellite network.
     * @param {Object} botManifest Bot's manifest
     * @returns {Promise} True if installed or updated, False if not.
     */
    static installBot = botManifest =>
        new Promise((resolve, reject) => {
            RemoteBotInstall.isSatellite().then(isSat => {
                if (isSat) {
                    reject(
                        'Download refused: the device is on satellite network'
                    );
                } else {
                    performInstallation(botManifest).then(installed => {
                        resolve(installed);
                    });
                }
            });
        });

    /**
     * Install all the bots the user is subscribed to. Respond success if at least one bot was installed and error if no bots are installed.
     * @returns {Promise} Success if at least one bot is installed
     */
    static syncronizeBots = () =>
        new Promise((resolve, reject) => {
            RemoteBotInstall.isSatellite()
                .then(isSat => {
                    if (isSat) {
                        if (__DEV__) {
                            console.tron('Cannot Synchronize Bots');
                        }

                        throw 'Bots syncronization stopped: device is on satellite network';
                    } else {
                        return;
                    }
                })
                .then(() => {
                    return RemoteBotInstall.getSubscribedBots();
                })
                .then(async subscribedBotsIds => {
                    if (__DEV__) {
                        console.tron('Got Subscribed Bots');
                    }

                    let catalog = await Bot.getCatalog();
                    const manifests = _.map(subscribedBotsIds, botId => {
                        return RemoteBotInstall.getBotManifestFromId(
                            botId,
                            catalog
                        );
                    });
                    return manifests;
                })
                .then(async subscribedBotsManifests => {
                    const results = _.map(
                        subscribedBotsManifests,
                        botManifest => {
                            return performInstallation(botManifest).then(
                                res => {
                                    return res;
                                }
                            );
                        }
                    );
                    Promise.all(results).then(res => {
                        if (
                            _.some(res, result => {
                                return result === true;
                            })
                        ) {
                            console.log('Bots installed');
                            resolve();
                        } else {
                            console.log('No bot was installed');
                            resolve();
                        }
                    });
                })
                .catch(error => console.log(error));
        });
}

/**
 * Install the bot. It's private because it doesn't check connection type.
 * @param {Object} botManifest Bot's manifest
 * @returns {Promise} True if installed or updated, False if not.
 */
function performInstallation(botManifest) {
    return new Promise(async (resolve, reject) => {
        const installedBotsManifests = await Bot.getInstalledBots();
        const botStatus = utils.checkBotStatus(
            installedBotsManifests,
            botManifest
        );
        try {
            if (!botStatus.installed) {
                const dceBot = dce.bot(botManifest);
                if (botStatus.update) {
                    await Bot.update(dceBot);
                } else {
                    await Bot.install(dceBot);
                }
                resolve(true);
            } else {
                console.log(botManifest.botName + ': already installed');
                resolve(false);
            }
        } catch (e) {
            console.log('ERROR: ' + JSON.stringify(e, undefined, 2));
            resolve(false);
        }
    });
}

export default RemoteBotInstall;
