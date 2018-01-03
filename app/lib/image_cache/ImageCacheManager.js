import RNFetchBlob from 'react-native-fetch-blob';
import SHA1 from 'crypto-js/sha1';
import URL from 'url';
import PathParse from 'path-parse';
import _ from 'lodash';

const CACHE_DIR = RNFetchBlob.fs.dirs.DocumentDir + '/image-cache';
const CACHE_SIZE = 200 * 1024 * 1024; // 200 MB

export default class ImageCacheManager {

    constructor() {
        this.cache = {};
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
            let totalCacheSize = _.sumBy(stats, 'size')
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
            return path;
        } else {
            return;
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
        if (!this.cache[uri]) {
            this.cache[uri] = {
                uri,
                headers,
                downloading: false,
                handlers: [ handler ],
                path: this.getPath(uri)
            };
        } else {
            this.cache[uri].handlers.push(handler);
        }
        this.get(uri);
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
            cache.task.then(() => {
                cache.downloading = false;
                cache.path = path;
                this.notifyImageDownloaded(uri);
            }).catch(() => {
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
                handler[handlerFunc](this.cache[uri].path);
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
}
