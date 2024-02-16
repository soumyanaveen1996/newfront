import _ from 'lodash';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import buildUrl from 'build-url';
import config from '../../config/config.js';
import { Utils, Promise, Auth } from '../capability';
import mime from 'react-native-mime-types';
import moment from 'moment';
import Store from '../../redux/store/configureStore.js';
import { setBotDownloadState } from '../../redux/actions/UserActions.js';

class AssetFetcher {
    constructor(options) {
        console.log(`Making ${AssetFetcher.DependenciesDir}`);
    }

    static async getFile(filename, encoding, forceEncoding = true) {
        const fileExists = await AssetFetcher.existsOnDevice(filename);
        if (fileExists) {
            const file = await RNFetchBlob.fs.readFile(
                filename,
                encoding || 'utf8'
            );
            return file;
        }

        return false;
    }

    static async writeFile(filename, contents, encoding) {
        try {
            const fileExists = await AssetFetcher.existsOnDevice(filename);

            // Delete if file already exists? - do we need this?

            if (fileExists) {
                await AssetFetcher.deleteFile(filename);
            }

            await RNFS.writeFile(filename, contents, encoding || 'utf8');
        } catch (error) {
            console.log('Failed writing file:', filename, error);
        }
    }

    static async existsOnDevice(filename) {
        const fileExists = await RNFS.exists(filename);
        return fileExists;
    }

    static async readDir(path) {
        const dirExists = await RNFS.exists(path);
        if (!dirExists) {
            return [];
        }
        const contents = await RNFS.readDir(path);
        return contents || [];
    }

    static async downloadFile(
        filepath,
        remoteUrl,
        headers,
        background,
        readFile = true
    ) {
        try {
            const downloadFileOptions = {
                fromUrl: remoteUrl,
                toFile: filepath,
                headers: headers || false,
                background: background || true,
                progress: () => {}
            };
            const rnfsJob = RNFS.downloadFile(downloadFileOptions);

            /**
              type DownloadResult = {
              jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
              statusCode: number;     // The HTTP status code
              bytesWritten: number;   // The number of bytes written to the file
              };
              */
            const downloadResult = await rnfsJob.promise;
            if (downloadResult.statusCode === 200) {
                if (readFile) {
                    const fileData = await AssetFetcher.getFile(filepath);
                    return fileData;
                }
                return downloadResult;
            }
            throw new Error(`Unable to fetch URL : ${remoteUrl}`);
        } catch (e) {
            console.log('Failed downloading', JSON.stringify(e, undefined, 2));
            throw e;
        }
    }

    static async downloadBotFile(filepath, s3RelativePath, user, encoding) {
        try {
            console.log(`AssetFetcher::Downloading file from S3: ${filepath}`);
            //TODO: add download indicator
            Store.dispatch(setBotDownloadState(true));
            encoding = encoding || 'utf8';

            const gatewayUri = `${config.proxy.protocol}${config.proxy.resource_host}`;
            const isLoggedIn = await Auth.isUserLoggedIn();
            const headers = isLoggedIn
                ? {
                      sessionId: user.creds.sessionId,
                      sessionid: user.creds.sessionId
                  }
                : {};

            console.log(
                `AssetFetcher::Downloading file from S3 data: ${isLoggedIn} ${s3RelativePath} ${filepath}`
            );

            const fileUri = buildUrl(gatewayUri, {
                path: `${config.proxy.botDownloadPath}`,
                queryParams: {
                    path: s3RelativePath,
                    bucketName: config.bot.s3bucket
                }
            });

            console.log(
                `AssetFetcher::Downloading file from S3 data: ${fileUri} ${filepath} ${headers}`
            );

            const fileData = await AssetFetcher.downloadFile(
                filepath,
                fileUri,
                headers,
                true,
                true
            );
            Store.dispatch(setBotDownloadState(false));
            return fileData;
        } catch (e) {
            console.log(
                'Failed downloading from s3',
                JSON.stringify(e, undefined, 2)
            );
            Store.dispatch(setBotDownloadState(false));
            throw e;
        }
    }

    static async deleteFile(filepath) {
        try {
            console.log(`AssetFetcher::Deleting file: ${filepath}`);
            const fileExists = await AssetFetcher.existsOnDevice(filepath);

            if (fileExists) {
                return await RNFS.unlink(filepath);
            }
            return;
        } catch (error) {
            console.log(`Failed uploading the file: ${filepath}`, error);
            throw error;
        }
    }

    /**
     * UPLOAD file to backend
     *
     * @param base64Data File payload in base64 format
     * @param fileUri Local file uri
     * @param bucketName Remote directory in the backend of the file
     * @param filename Remote file name with extension
     * @param contentType MIME type of the file
     * @param user Current user
     *
     * @return Remote url to the file
     *
     */
    static async uploadFileToFileGateway(
        base64Data,
        fileUri,
        bucketName,
        filename,
        contentType,
        user
    ) {
        try {
            console.log(
                `AssetFetcher::Uploading file ${fileUri} data to bucketName: ${bucketName}`
            );
            // return;
            const s3UrlToFile = `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.uploadFilePath}/${bucketName}/${filename}`;

            // console.log('url to upload imgae ', s3UrlToFile);

            // const res = await RNFetchBlob.fetch(
            //     'POST',
            //     s3UrlToFile,
            //     {
            //         sessionId: user.creds.sessionId,
            //         sessionid: user.creds.sessionId,
            //         'Content-Type': contentType
            //     },
            //     base64Data
            // );

            console.log('+++++++ uploading to ', s3UrlToFile);
            res = await RNFetchBlob.fetch(
                'POST',
                s3UrlToFile,
                {
                    sessionId: user.creds.sessionId,
                    sessionid: user.creds.sessionId,
                    'Content-Type': contentType
                },
                base64Data
            );
            console.log('+++++++++> RNFetchBlob.fetch done', res);
            console.log({
                sessionId: user.creds.sessionId,
                'Content-Type': contentType
            });
            console.log(
                `AssetFetcher::Done uploading file ${fileUri} to S3 URL: ${s3UrlToFile}`
            );
            return s3UrlToFile;
        } catch (error) {
            console.log(
                'Failed uploading for file to gateway: ',
                fileUri,
                bucketName,
                error
            );
            throw error;
        }
    }

    static depPath(name, version) {
        const depSlug = _.snakeCase(name);
        const dir = `${AssetFetcher.DependenciesDir}${depSlug}/${version}/`;
        const path = `${dir}${depSlug}.js`;
        RNFS.mkdir(`${dir}`);
        return path;
    }

    static async loadDependency(dep_options, user) {
        try {
            const depUrl = dep_options.url;
            const depName = dep_options.name;
            const version = _.get(dep_options, 'version', 'n.a');

            const path = this.depPath(depName, version);
            let data = await AssetFetcher.getFile(path);

            if (!data) {
                console.log(
                    'AssetFetcher::loadDependency::Did not find on filesystem. Loading from url',
                    depUrl,
                    depName,
                    version
                );

                const res = await AssetFetcher.downloadBotFile(
                    path,
                    depUrl,
                    user
                );
                data = res;
            }

            return data;
        } catch (e) {
            console.error('Failed to loadDependency', e);
            throw e;
        }
    }

    static async deleteDependency(name, version = 'n.a') {
        try {
            const depSlug = _.snakeCase(name);
            const dir = `${AssetFetcher.DependenciesDir}${depSlug}/${version}/`;
            const path = `${dir}${depSlug}.js`;

            return await AssetFetcher.deleteFile(path);
        } catch (e) {
            console.error('Failed to delete Dependency', name, e);
        }
    }

    static get DependenciesDir() {
        return `${this.RootDir}/${config.dce.botDependenciesDirName}/`;
    }

    static get RootDir() {
        return RNFS.DocumentDirectoryPath;
    }

    static async uploadChannelFileToFileGateway(
        base64Data,
        fileUri,
        bucketName,
        filename,
        contentType,
        user,
        channelId
    ) {
        try {
            const s3UrlToFile =
                `${config.proxy.protocol}${config.proxy.resource_host}/${bucketName}/${channelId}/` +
                filename;
            console.log('+++++++ uploading to ', s3UrlToFile);
            res = await RNFetchBlob.fetch(
                'POST',
                s3UrlToFile,
                {
                    sessionId: user.creds.sessionId,
                    sessionid: user.creds.sessionId,
                    'Content-Type': contentType
                },
                base64Data
            );
            console.log('+++++++++> RNFetchBlob.fetch done', res);
            console.log({
                sessionId: user.creds.sessionId,
                'Content-Type': contentType
            });
            console.log(
                `AssetFetcher::Done uploading file ${fileUri} to S3 URL: ${s3UrlToFile}`
            );
            console.log('s3UrlToFile', s3UrlToFile);
            return s3UrlToFile;
        } catch (error) {
            console.log(
                'Failed uploading for file to gateway: ',
                fileUri,
                bucketName,
                error
            );
            throw error;
        }
    }
}
console.log('Making DependenciesDir');
RNFS.mkdir(AssetFetcher.DependenciesDir);

export default AssetFetcher;
