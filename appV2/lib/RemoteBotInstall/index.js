import _ from 'lodash';
import { NativeModules } from 'react-native';
import Bot from '../bot';
import dce from '../dce';
import utils from '../utils';
import { Auth, DeviceStorage } from '../capability';
import Store from '../../redux/store/configureStore';
import {
    botInstallEnd,
    botInstallStart,
    completeBotInstall
} from '../../redux/actions/UserActions';

import EventEmitter, { TimelineEvents } from '../events';
import UserServices from '../../apiV2/UserServices';
import eventEmitter from '../events/EventEmitter';
import TimelineBuilder from '../TimelineBuilder/TimelineBuilder';

export const FAVOURITE_BOTS = 'favourite_bots';

class RemoteBotInstall {
    static getGrpcSubscribedBots = () => {
        return UserServices.getBotSubscriptions()
            .then((result) => {
                if (result.error !== 0) {
                    throw new Error('Unknown Error');
                }
                return result;
            })
            .catch((err) => {
                throw err;
            });
    };

    /**
     * Return all the bots the user is subscribed to.
     * @returns {Promise} Array of Bot IDs
     */
    static getSubscribedBots = () =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                RemoteBotInstall.getGrpcSubscribedBots(user)
                    .then((subscribedBots) => {
                        resolve(subscribedBots.content);
                    })
                    .catch(reject);
            } else {
                throw new Error('No Logged in user');
            }
        });

    /**
     * @param {String} botId Bot's ID
     * @param {Array} catalog Bot catalog. Use getCatalog() from lib/bot/indexjs
     * @returns {Object} Bot's Manifest
     */
    static getBotManifestFromId = (botID, catalog) => {
        catalog = catalog.bots;
        const subscribedBotManifest = _.find(
            catalog,
            (manifest) => manifest.botId === botID
        );
        return subscribedBotManifest;
    };

    /**
     * @returns {Promise} true if the device is using satellite network
     */
    static isSatellite = () => new Promise((resolve, reject) => resolve(false));

    /**
     * Install the manifest's bot only if the device is not on satellite network.
     * @param {Object} botManifest Bot's manifest
     * @returns {Promise} True if installed or updated, False if not.
     */
    static installBot = (botManifest, catelog = undefined) =>
        new Promise((resolve, reject) => {
            if (botManifest?.systemBot) {
                performInstallation(botManifest, catelog).then((installed) => {
                    resolve(installed);
                });
            } else {
                RemoteBotInstall.isSatellite().then((isSat) => {
                    if (isSat) {
                        reject(
                            'Download refused: the device is on satellite network'
                        );
                    } else {
                        performInstallation(botManifest, catelog).then(
                            (installed) => {
                                resolve(installed);
                            }
                        );
                    }
                });
            }
        });

    /**
     * Install all the bots the user is subscribed to. Respond success if at least one bot was installed and error if no bots are installed.
     * @returns {Promise} Success if at least one bot is installed
     */
    static syncronizeBots = (emitEvent = true) =>
        new Promise((resolve, reject) => {
            RemoteBotInstall.isSatellite()
                .then((isSat) => {
                    if (isSat) {
                        throw 'Bots syncronization stopped: device is on satellite network';
                    } else {
                    }
                })
                .then(() => RemoteBotInstall.getSubscribedBots())
                .then(async (subscribedBotsIds) => {
                    if (!subscribedBotsIds) {
                        console.log(
                            '|||||| Synchronizing.... syncronizeBots done'
                        );
                        Store.dispatch(completeBotInstall(true));
                        resolve();
                    }

                    if (
                        subscribedBotsIds.favourites === undefined ||
                        subscribedBotsIds.favourites === null
                    ) {
                        subscribedBotsIds.favourites = [];
                    }
                    DeviceStorage.saveArrayValues(
                        FAVOURITE_BOTS,
                        subscribedBotsIds.favourites
                    );

                    const catalog = await Bot.getCatalog();
                    const manifests = _.map(
                        subscribedBotsIds.subscribed,
                        (botId) =>
                            RemoteBotInstall.getBotManifestFromId(
                                botId,
                                catalog
                            )
                    );
                    return manifests;
                })
                .then(async (subscribedBotsManifests) => {
                    const fileteredManifests = _.filter(
                        subscribedBotsManifests,
                        (m) => m
                    );
                    const installedBots = await Bot.getInstalledBots();
                    console.log(
                        '||||| remote bptstall check: already installed bots',
                        installedBots
                    );
                    const results = _.map(fileteredManifests, (botManifest) =>
                        performInstallation(botManifest, installedBots).then(
                            (res) => {
                                TimelineBuilder.buildTiimeline();
                                if (emitEvent) {
                                    EventEmitter.emit(
                                        TimelineEvents.refreshTimeline
                                    );
                                }

                                return res;
                            }
                        )
                    );

                    // Store.dispatch(completeBotInstall(true));
                    return Promise.all(results).then((res) => {
                        console.log(
                            '||||| Synchronizing.... syncronizeBots done'
                        );
                        if (_.some(res, (result) => result === true)) {
                            Store.dispatch(completeBotInstall(true));
                            eventEmitter.emit(TimelineEvents.botSyncDone);
                            // return resolve();
                        } else {
                            eventEmitter.emit(TimelineEvents.botSyncDone);
                            Store.dispatch(completeBotInstall(true));
                            // return resolve();
                        }
                    });
                })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    eventEmitter.emit(TimelineEvents.botSyncDone);
                    console.log('Synchronizing.... syncronizeBots error');
                    Store.dispatch(completeBotInstall(true));
                    reject(error);
                });
        });
}

/**
 * Install the bot. It's private because it doesn't check connection type.
 * @param {Object} botManifest Bot's manifest
 * @returns {Promise} True if installed or updated, False if not.
 */
function performInstallation(botManifest, installedBotsManifests) {
    if (!botManifest) {
        return Promise.resolve(true);
    }
    return new Promise(async (resolve, reject) => {
        if (!installedBotsManifests) {
            installedBotsManifests = await Bot.getInstalledBots();
        }
        const botStatus = utils.checkBotStatus(
            installedBotsManifests,
            botManifest
        );
        try {
            if (botStatus.installed) {
                if (botStatus.update) {
                    const dceBot = dce.bot(botManifest);
                    Store.dispatch(botInstallStart(botManifest.botId));
                    await Bot.update(dceBot);
                    Store.dispatch(botInstallEnd(botManifest.botId));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                const dceBot = dce.bot(botManifest);
                await Bot.install(dceBot);
                resolve(false);
            }
        } catch (e) {
            Store.dispatch(botInstallEnd(botManifest.botId));
            resolve(false);
        }
    });
}

export default RemoteBotInstall;
