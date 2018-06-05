import RNFetchBlob from 'react-native-fetch-blob';
import SHA1 from 'crypto-js/sha1';
import URL from 'url';
import PathParse from 'path-parse';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import Auth from '../capability/Auth';
import utils from '../../lib/utils';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const CACHE_DIR = RNFetchBlob.fs.dirs.DocumentDir + '/image-cache';
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
        let exists = await RNFetchBlob.fs.exists(CACHE_DIR);
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
            let stats = await RNFetchBlob.fs.lstat(CACHE_DIR);
            let totalCacheSize = _.sumBy(stats, (stat) => parseInt(stat.size, 10));
            if (totalCacheSize > CACHE_SIZE) {
                let sortedStats = _.orderBy(stats, 'lastModified');
                let totalDeletedSize = 0;
                let index = 0;
                while (index < sortedStats.length && totalCacheSize - totalDeletedSize > CACHE_SIZE) {
                    let stat = sortedStats[index];
                    RNFetchBlob.fs.unlink(stat.path);
                    totalDeletedSize += stat.size;
                    index += 1;
                }
            }
        } catch (error) { }
    }

    /**
     * @return Returns the path of the image from the cache if it exists in cache. If not
     * returns undefined
     */
    async getImagePathFromCache(uri) {
        let path = this.getPath(uri);
        let exists = await RNFetchBlob.fs.exists(path);
        if (exists) {
            return Platform.OS === 'android' ? 'file://' + path : path
        } else {
            return;
        }
    }

    async removeFromCache(uri) {
        let path = await this.getImagePathFromCache(uri);
        if (path) {
            await RNFetchBlob.fs.unlink(path);
            this.cache[uri] = undefined;
        }
    }

    /**
     * Generates path for given URI
     * @return path of the file in CACHE_DIRECTORY for given URI.
     */
    getPath(uri) {
        let uriComponents = URL.parse(uri);
        let pathComponents = PathParse(uriComponents.pathname);
        let extension = pathComponents.ext === '' ? '.img' : pathComponents.ext
        return CACHE_DIR + '/' + SHA1(uri) + extension;
    }

    /**
     * Creates a cache entry in the cache dictionary and starts fetching of image from
     * cache or from remote. This stores the list of handlers so that it can notify
     * them when image download is started or ended.
     */
    fetch(uri, handler, headers = {}) {
        headers = {...headers, ...{'Cache-Control' : 'no-store'}}
        if (!this.cache[uri]) {
            this.cache[uri] = {
                uri,
                headers: headers,
                downloading: false,
                handlers: [ handler ],
                path: this.getPath(uri)
            };
        } else {
            this.cache[uri].handlers.push(handler);
        }
        this.get(uri);
    }

    isLastCheckedWithinThreshold(uri) {
        // Not checking if previously checked in last 2 hours.
        if (this.lastChecked[uri] && moment().diff(this.lastChecked[uri]) < 2 * 60 * 60 * 1000) {
            return true;
        } else {
            return false;
        }
    }

    checkIfModified(path, user, uri, headers = {}) {
        var stat;
        const headHeaders = utils.s3DownloadHeaders(uri, user, 'HEAD') || undefined;
        return new Promise((resolve, reject) => {
            RNFetchBlob.fs.stat(path)
                .then((res) => {
                    stat = res;
                    axios({
                        method: 'HEAD',
                        url: uri,
                        headers: headHeaders,
                    }).then((response) => {
                        this.lastChecked[uri] = moment();
                        if (response.status === 200 &&
                            moment(stat.lastModified).diff(moment(response.headers['last-modified'])) < 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }).catch((error) => {
                        console.log(error);
                    })
                })
                .catch(reject);
        });
    }

    // Only call this if file exists in cache.
    async checkAndUpdateIfModified(uri, handler, headers = {}) {
        const user = await Auth.getUser();
        if (!this.isLastCheckedWithinThreshold(uri)) {
            const cachedImagePath = await this.getImagePathFromCache(uri);
            const shouldUpdate = await this.checkIfModified(cachedImagePath, user, uri, headers);
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
            cache.task = RNFetchBlob.config({ path }).fetch('GET', uri, headers);
            cache.task.then((response) => {
                cache.downloading = false;
                if (response.respInfo.status === 200) {
                    cache.path = path;
                } else if (response.respInfo.status === 403 || response.respInfo.status === 404) {
                    RNFetchBlob.fs.unlink(path);
                    this.lastChecked[uri] = moment();
                    cache.path = undefined;
                }
                this.notifyImageDownloaded(uri);
            }).catch(() => {
                console.log('ImageCacheManager Error downloading file : ');
                cache.downloading = false;
                // Removing the file in case parts were downloaded
                RNFetchBlob.fs.unlink(path);
            });
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
        console.log('Image Cache manager : In get ');
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
        const handlers = this.cache[uri].handlers;
        handlers.forEach(handler => {
            if (handler[handlerFunc]) {
                const path = this.cache[uri].path;
                handler[handlerFunc]((Platform.OS === 'android' && path) ? 'file://' +  path : path);
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
