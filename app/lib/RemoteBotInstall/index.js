import Bot from '../bot';
import dce from '../dce';
import utils from '../utils';
import { Auth, Network, DeviceStorage } from '../capability';
import config from '../../config/config';
import _ from 'lodash';
import { NetworkHandler } from '../network';
import Store from '../../redux/store/configureStore';
import { completeBotInstall } from '../../redux/actions/UserActions';

export const FAVOURITE_BOTS = 'favourite_bots';

import { NativeModules } from 'react-native';

const UserServiceClient = NativeModules.UserServiceClient;

class RemoteBotInstall {
    static getGrpcSubscribedBots = user =>
        new Promise((resolve, reject) => {
            UserServiceClient.getBotSubscriptions(
                user.creds.sessionId,
                (err, result) => {
                    if (err) {
                        return reject(new Error('Unknown Error'));
                    }
                    console.log('GRPC:::Bots subscription', result.data);
                    if (result.data) {
                        resolve(result);
                    } else {
                        reject(null);
                    }
                }
            );
        });
    /**
     * Return all the bots the user is subscribed to.
     * @returns {Promise} Array of Bot IDs
     */
    static getSubscribedBots = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        return RemoteBotInstall.getGrpcSubscribedBots(user);
                    } else {
                        throw new Error('No Logged in user');
                    }
                })
                .then(subscribedBots => {
                    // console.log(
                    //     'list of bots installed ========== ',
                    //     subscribedBots
                    // );
                    console.log(
                        'GRPC:::list of bots installed',
                        subscribedBots
                    );
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
            return resolve(false);
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
                        throw 'Bots syncronization stopped: device is on satellite network';
                    } else {
                        return;
                    }
                })
                .then(() => {
                    Store.dispatch(completeBotInstall(false));
                    return RemoteBotInstall.getSubscribedBots();
                })
                .then(async subscribedBotsIds => {
                    // console.log(
                    //     'all installed bot from api =========> ',
                    //     subscribedBotsIds
                    // );

                    if (
                        subscribedBotsIds.favourites === undefined ||
                        subscribedBotsIds.favourites === null
                    ) {
                        subscribedBotsIds.favourites = [];
                    }
                    DeviceStorage.save(
                        FAVOURITE_BOTS,
                        subscribedBotsIds.favourites
                    );

                    let catalog = await Bot.getCatalog();
                    const manifests = _.map(
                        subscribedBotsIds.subscribed,
                        botId => {
                            return RemoteBotInstall.getBotManifestFromId(
                                botId,
                                catalog
                            );
                        }
                    );
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
                            if (__DEV__) {
                                console.tron('BOTS INSTALEED');
                            }

                            console.log('Bots installed');
                            Store.dispatch(completeBotInstall(true));
                            return resolve();
                        } else {
                            console.log('No bot was installed');
                            Store.dispatch(completeBotInstall(true));
                            return resolve();
                        }
                    });
                })
                .then(() => resolve())
                .catch(error => console.log(error));
        });
}

/**
 * Install the bot. It's private because it doesn't check connection type.
 * @param {Object} botManifest Bot's manifest
 * @returns {Promise} True if installed or updated, False if not.
 */
function performInstallation(botManifest) {
    if (!botManifest) {
        return Promise.resolve(true);
    }
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
