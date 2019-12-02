import Mapbox from '@react-native-mapbox-gl/maps';
import { Message, ConversationContext } from '.';
import moment from 'moment';
import { sendBackgroundMessageSafe } from '../BackgroundTask/BackgroundTaskProcessor';
import { Bot } from '../dce';

Mapbox.setAccessToken(
    'pk.eyJ1IjoiZ2FjaWx1IiwiYSI6ImNqcHh0azRhdTFjbXQzeW8wcW5vdXhlMzkifQ.qPfpVkrWbk-GSBY3uc6z3A'
);

export default class OfflineMap {
    /**
     * @callback progressCallback
     * @param {Object} offlineRegion
     * @param {string} status
     */
    /**
     * @callback errorCallback
     * @param {Object} offlineRegion
     * @param {string} error
     */
    /**
     * @typedef {Object} MapPack
     * @property {string} name
     * @property {Array<number>} bounds
     */

    /**
     * Save locally a map pack of the specified area to use offline.
     * `northEastBound` and `southWestBound` are two objects, with `logitude` and `latitude` as properties, defining the rectangular area.
     * @param {string} name name assigned to the map pack in the database. Used to manage and delete the saved map
     * @param {Object} northEastBound coordinates of the north east limit
     * @param {Object} southWestBound coordinates of the south west limit
     * @param {number} [minZoom=0] from 0 to 19
     * @param {number} [maxZoom=16] from 0 to 19
     * @param {progressCallback} [progressListener] callback that listens for status events while downloading the offline resource.
     * @param {errorCallback} [errorListener] callback fired when the download terminates with an error.
     * @param {string} progressUpdateInterval sets the value at which download status events will be sent over the React Native bridge (default: 500ms).
     */
    static saveMap(
        name,
        northEastBound,
        southWestBound,
        minZoom = 0,
        maxZoom = 16,
        progressListener,
        errorListener,
        progressUpdateInterval
    ) {
        const options = {
            name: name,
            styleURL: Mapbox.StyleURL.Street,
            bounds: [
                [northEastBound.longitude, northEastBound.latitude],
                [southWestBound.longitude, southWestBound.latitude]
            ],
            minZoom: minZoom,
            maxZoom: maxZoom
        };
        if (progressUpdateInterval) {
            MapboxGL.setProgressEventThrottle(progressUpdateInterval);
        }
        Mapbox.offlineManager.createPack(
            options,
            progressListener,
            errorListener
        );
    }

    /**
     * Delete from local database map pack named `name`.
     * @param {string} name name of the saved map pack
     */
    static deleteMap(name) {
        Mapbox.offlineManager.deletePack(name);
    }

    /**
     * Unsubscribes any listeners associated with the offline map pack.
     * @param {string} name name of the saved map pack
     */
    static unsubscribe(name) {
        Mapbox.offlineManager.unsubscribe(name);
    }

    /**
     * Subscribe to download status/error events for the requested offline map pack. Fired every 500ms.
     * @param {string} name name of the saved map pack
     * @param {progressCallback} [progressListener] callback fired every 500ms that listens for status events while downloading the offline resource.
     * @param {errorCallback} [errorListener] callback fired when the download terminates with an error.
     */
    static subscribe(name, progressListener, errorListener) {
        Mapbox.offlineManager.subscribe(name, progressListener, errorListener);
    }

    /**
     * Retrieves all the current offline map packs that are stored in the database.
     * @async
     * @returns {Promise<Arry<MapPack>>} downloaded map packs
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            Mapbox.offlineManager
                .getPacks()
                .then(downloadedPacks => {
                    resolve(downloadedPacks);
                })
                .catch(reject);
        });
    }

    /**
     * Retrieves an offline pack that is stored in the database by name.
     * @async
     * @param {string} name map pack name
     * @returns {Promise<MapPack>} downloaded map pack
     */
    static async getByName(name) {
        return new Promise((resolve, reject) => {
            Mapbox.offlineManager
                .getPack(name)
                .then(downloadedPack => {
                    resolve(downloadedPack);
                })
                .catch(reject);
        });
    }

    static async downloadFromBot(
        botId,
        conversationId,
        name,
        northEastBound,
        southWestBound,
        minZoom = 0,
        maxZoom = 16,
        progressUpdateInterval
    ) {
        try {
            if (botId && conversationId) {
                const allBots = await Bot.allInstalledBots();
                const foundBot = allBots.find(bot => {
                    return bot.botId === botId;
                });
                if (foundBot) {
                    const sendMessageUpdate = (offlineRegion, status) => {
                        let message = new Message({
                            addedByBot: true,
                            messageDate: moment().valueOf()
                        });
                        // message.setCreatedBy();
                        message.downloadProgressMessage({
                            offlineRegion,
                            status
                        });
                        sendBackgroundMessageSafe(
                            message,
                            botId,
                            conversationId
                        );
                    };
                    const sendErrorMessage = (offlineRegion, err) => {
                        let message = new Message({
                            addedByBot: true,
                            messageDate: moment().valueOf()
                        });
                        // message.setCreatedBy();
                        message.downloadErrorMessage({
                            offlineRegion,
                            err
                        });
                        sendBackgroundMessageSafe(
                            message,
                            botId,
                            conversationId
                        );
                    };

                    this.saveMap(
                        name,
                        northEastBound,
                        southWestBound,
                        minZoom,
                        maxZoom,
                        sendMessageUpdate,
                        sendErrorMessage,
                        progressUpdateInterval
                    );
                } else {
                    throw new Error('bot not found');
                }
            } else {
                throw new Error('botId and conversationId required');
            }
        } catch (error) {
            console.log('Offline map manager ERROR: ', error.message);
            throw error;
        }
    }
}
