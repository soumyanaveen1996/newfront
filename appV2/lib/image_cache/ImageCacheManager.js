import RNFetchBlob from 'react-native-blob-util';
import SHA1 from 'crypto-js/sha1';
import CryptoJS from 'crypto-js';
import URL from 'url';
import PathParse from 'path-parse';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import Auth from '../capability/Auth';
import utils from '../utils';
import { Network } from '../capability';

const CACHE_DIR = `${RNFetchBlob.fs.dirs.DocumentDir}/image-cache`;
const CACHE_SIZE = 200 * 1024 * 1024; // 200 MB

export default class ImageCacheManager {
    constructor() {
        this.cache = {};
        this.lastChecked = {};
        this.createCacheDir();
        this.purgeOldFilesIfNeeded();
    }

    /**
     * Creates the cache directory if its not present.
     */
    // TODO: Handle case when Cache directory cannot be created.
    async createCacheDir() {
        const exists = await RNFetchBlob.fs.exists(CACHE_DIR);
        if (!exists) {
            RNFetchBlob.fs.mkdir(CACHE_DIR);
        }
    }

    /**
     * Checks the cache if its size exceeds the CACHE_SIZE. If yes, deletes the files based on
     * lastModified time to purge the old files.
     */
    async purgeOldFilesIfNeeded() {
        try {
            const stats = await RNFetchBlob.fs.lstat(CACHE_DIR);
            const totalCacheSize = _.sumBy(stats, (stat) =>
                parseInt(stat.size, 10)
            );
            if (totalCacheSize > CACHE_SIZE) {
                const sortedStats = _.orderBy(stats, 'lastModified');
                let totalDeletedSize = 0;
                let index = 0;
                while (
                    index < sortedStats.length &&
                    totalCacheSize - totalDeletedSize > CACHE_SIZE
                ) {
                    const stat = sortedStats[index];
                    RNFetchBlob.fs.unlink(stat.path);
                    totalDeletedSize += stat.size;
                    index += 1;
                }
            }
        } catch (error) {}
    }

    /**
     * @return Returns the path of the image from the cache if it exists in cache. If not
     * returns undefined
     */
    async getImagePathFromCache(uri) {
        const path = this.getPath(uri);
        const exists = await RNFetchBlob.fs.exists(path);
        if (exists) {
            return Platform.OS === 'android' ? `file://${path}` : path;
        } else {
            return null;
        }
    }

    async removeFromCache(uri) {
        const path = await this.getImagePathFromCache(uri);
        if (path) {
            await RNFetchBlob.fs.unlink(path);
            this.cache[uri] = undefined;
            this.lastChecked[uri] = undefined;
        } else if (this.cache[uri]) {
            this.cache[uri] = undefined;
            this.lastChecked[uri] = undefined;
        }
    }

    /**
     * Generates path for given URI
     * @return path of the file in CACHE_DIRECTORY for given URI.
     */
    getPath(uri) {
        const uriComponents = URL.parse(uri);
        const pathComponents = PathParse(uriComponents.pathname);
        const extension =
            pathComponents.ext === '' ? '.img' : pathComponents.ext;
        const sha1value = SHA1(uri).toString(CryptoJS.enc.Hex);
        const path = `${CACHE_DIR}/${sha1value}${extension}`;
        // console.log('Sourav Logging:::: Image Path', path);
        return path;
    }

    /**
     * Creates a cache entry in the cache dictionary and starts fetching of image from
     * cache or from remote. This stores the list of handlers so that it can notify
     * them when image download is started or ended.
     */
    fetch(uri, handler, headers = {}) {
        headers = { ...headers, ...{ 'Cache-Control': 'no-store' } };
        if (!this.cache[uri]) {
            this.cache[uri] = {
                uri,
                headers,
                downloading: false,
                handlers: [handler],
                path: this.getPath(uri)
            };
        } else {
            this.cache[uri].handlers.push(handler);
        }
        this.get(uri);
    }

    isLastCheckedWithinThreshold(uri) {
        // Not checking if previously checked in last 1 hour.
        if (this.lastChecked[uri]) {
            if (moment().diff(this.lastChecked[uri]) < 1 * 60 * 60 * 1000) {
                return true;
            }
        }

        return false;
    }

    checkIfModified(path, user, uri, headers = {}) {
        let stat;
        const headHeaders = user
            ? { sessionId: user.creds.sessionId }
            : undefined;
        return new Promise((resolve, reject) => {
            RNFetchBlob.fs
                .stat(path)
                .then((res) => {
                    stat = res;
                    axios({
                        method: 'HEAD',
                        url: uri,
                        headers: headHeaders
                    })
                        .then((response) => {
                            if (!response.headers['last-modified']) {
                                resolve(false);
                            }
                            this.lastChecked[uri] = moment();
                            const localData = moment(stat.lastModified);
                            const remoteData = moment(
                                response.headers['last-modified']
                            );
                            if (
                                response.status === 200 &&
                                localData.diff(remoteData) < 0
                            ) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch((error) => {
                            resolve(false);
                        });
                })
                .catch(reject);
        });
    }

    // Only call this if file exists in cache.
    async checkAndUpdateIfModified(uri, handler, headers = {}) {
        const user = Auth.getUserData();
        if (!this.isLastCheckedWithinThreshold(uri)) {
            const cachedImagePath = await this.getImagePathFromCache(uri);
            const shouldUpdate = await this.checkIfModified(
                cachedImagePath,
                user,
                uri,
                headers
            );
            if (shouldUpdate) {
                await this.removeFromCache(uri);
                this.fetch(uri, handler, headers);
            }
        }
    }

    /**
     * Method for handlers to unsubscribe themselves.
     */
    unsubscribe(uri, handler) {
        const cache = this.cache[uri];
        if (cache) {
            cache.handlers.forEach((h, index) => {
                if (h === handler) {
                    cache.handlers.splice(index, 1);
                }
            });
        }
    }

    /**
     * Downloads the image and stores it in the cache directory using RNFetchBlob.
     *
     * @param cache Cache Entry for the URI.
     */
    download(cache) {
        const { uri, headers } = cache;
        if (!cache.downloading) {
            const path = this.getPath(uri);
            this.notifyImageDownloadStarted(uri);
            cache.downloading = true;
            if (Network.isOnline()) {
                cache.task = RNFetchBlob.config({ path }).fetch(
                    'GET',
                    uri,
                    headers
                );
                cache.task
                    .then((response) => {
                        cache.downloading = false;
                        // console.log(
                        //     'Profile Image downloading file: ',
                        //     response.respInfo.status,
                        //     path
                        // );
                        if (
                            response.respInfo.status >= 200 &&
                            response.respInfo.status < 300
                        ) {
                            cache.path = path;
                        } else {
                            RNFetchBlob.fs.unlink(path);
                            this.lastChecked[uri] = moment();
                            cache.path = undefined;
                        }
                        this.notifyImageDownloaded(uri);
                    })
                    .catch((e) => {
                        cache.downloading = false;
                        // Removing the file in case parts were downloaded
                        RNFetchBlob.fs.unlink(path).catch((e) => {
                            // console.log(e)
                        });
                        this.lastChecked[uri] = moment();
                        cache.path = undefined;
                        this.notifyImageDownloaded(uri);
                    });
            } else {
                this.notifyImageDownloaded(uri);
            }
        }
    }

    /**
     * Checks if the cache has the image. If yes, returns notifies the handlers.
     * If no, starts the download of the image for the cache.
     *
     * @param uri A uri of the image
     */
    get(uri) {
        const cache = this.cache[uri];
        if (cache.path) {
            RNFetchBlob.fs.exists(cache.path).then((exists) => {
                if (exists) {
                    this.notifyImageFromCache(uri);
                } else {
                    this.download(cache);
                }
            });
        } else {
            this.download(cache);
        }
    }

    notify(uri, handlerFunc) {
        const { handlers } = this.cache[uri];
        handlers.forEach((handler) => {
            if (handler[handlerFunc]) {
                const { path } = this.cache[uri];
                handler[handlerFunc](
                    Platform.OS === 'android' && path ? `file://${path}` : path
                );
            }
        });
    }

    /**
     * Notify the handlers for the particular URI that the image download has started
     */
    notifyImageDownloadStarted(uri) {
        this.notify(uri, 'imageDownloadStarted');
    }

    /**
     * Notify the handlers for the particular URI that the image has been downloaded
     */
    notifyImageDownloaded(uri) {
        this.notify(uri, 'imageDownloaded');
    }

    /**
     * Notify the handlers for the particular URI with the image Path from the cache
     */
    notifyImageFromCache(uri) {
        this.notify(uri, 'imageFromCache');
    }

    async storeIncache(uri, imagePath) {
        await this.removeFromCache(uri);
        const path = this.getPath(uri);
        await RNFS.copyFile(imagePath, path);
    }
}
