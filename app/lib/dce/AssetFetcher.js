import _ from 'lodash';
import RNFS from 'react-native-fs';
import config from '../../config/config.js';
import { Utils, Promise, Auth } from '../capability';
import RNFetchBlob from 'react-native-fetch-blob';
import buildUrl from 'build-url';

class AssetFetcher {
    constructor(options) {
        console.log(`Making ${AssetFetcher.DependenciesDir}`);
    }

    static async getFile(filename, encoding, forceEncoding = true) {
        let fileExists = await AssetFetcher.existsOnDevice(filename);

        if (fileExists) {
            let file = await RNFS.readFile(filename, encoding || 'utf8');
            return file;
        }

        return false;
    }

    static async writeFile(filename, contents, encoding) {
        try {
            let fileExists = await AssetFetcher.existsOnDevice(filename);

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
        let fileExists = await RNFS.exists(filename);
        return fileExists;
    }

    static async readDir(path) {
        let dirExists = await RNFS.exists(path);
        if (!dirExists) {
            return [];
        }
        let contents = await RNFS.readDir(path);
        return contents || [];
    }

    static async downloadFile(
        filepath,
        url,
        headers,
        background,
        readFile = true
    ) {
        try {
            console.log(
                `AssetFetcher::Downloading file via RNFS: ${filepath} from ${url}`
            );

            let downloadFileOptions = {
                fromUrl: url,
                toFile: filepath,
                headers: headers || false,
                background: background || true,
                progress: () => {}
            };

            let rnfsJob = RNFS.downloadFile(downloadFileOptions);

            /**
              type DownloadResult = {
              jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
              statusCode: number;     // The HTTP status code
              bytesWritten: number;   // The number of bytes written to the file
              };
              */
            let downloadResult = await rnfsJob.promise;
            if (downloadResult.statusCode === 200) {
                if (readFile) {
                    const fileData = await AssetFetcher.getFile(filepath);
                    return fileData;
                }
                return;
            } else {
                throw new Error(`Unable to fetch URL : ${url}`);
            }
        } catch (e) {
            console.log('Failed downloading', JSON.stringify(e, undefined, 2));
            throw e;
        }
    }

    static async downloadBotFile(filepath, s3RelativePath, user, encoding) {
        try {
            console.log(`AssetFetcher::Downloading file from S3: ${filepath}`);
            encoding = encoding || 'utf8';
            const host = config.bot.baseUrl;

            const gatewayUri = `${config.proxy.protocol}${config.proxy.host}`;
            const path = '/' + config.bot.s3bucket + '/' + s3RelativePath;
            const botUri = config.bot.baseProtocol + host + path;
            const isLoggedIn = await Auth.isUserLoggedIn();
            let headers = isLoggedIn ? { sessionid: user.creds.sessionId } : {};

            console.log(
                `AssetFetcher::Downloading file from S3 data: ${isLoggedIn}`
            );

            const fileUri = buildUrl(gatewayUri, {
                path: `${config.proxy.botDownloadPath}`,
                queryParams: {
                    path: s3RelativePath,
                    bucketName: config.bot.s3bucket
                }
            });

            console.log(
                `AssetFetcher::Downloading file from S3 data: ${fileUri} ${botUri} ${filepath} ${headers}`
            );

            let fileData = await AssetFetcher.downloadFile(
                filepath,
                fileUri,
                headers,
                true,
                true
            );
            return fileData;
        } catch (e) {
            console.log(
                'Failed downloading from s3',
                JSON.stringify(e, undefined, 2)
            );
            throw e;
        }
    }

    static async deleteFile(filepath) {
        try {
            console.log(`AssetFetcher::Deleting file: ${filepath}`);
            let fileExists = await AssetFetcher.existsOnDevice(filepath);

            if (fileExists) {
                return await RNFS.unlink(filepath);
            }
            return;
        } catch (error) {
            console.log('Failed uploading the file: ' + filepath, error);
            throw error;
        }
    }

    static async uploadFileToFileGateway(
        base64Data,
        fileUri,
        bucketName,
        filenameWithoutExtension,
        contentType,
        extension,
        user
    ) {
        try {
            console.log(
                `AssetFetcher::Uploading file ${fileUri} data to bucketName: ${bucketName}`
            );
            // return;
            const uploadUrl = `${config.proxy.protocol}${config.proxy.host}${
                config.proxy.uploadFilePath
            }`;
            const filename = `${filenameWithoutExtension}.${extension}`;
            const res = await RNFetchBlob.fetch(
                'POST',
                uploadUrl,
                {
                    sessionId: user.creds.sessionId,
                    'Content-Type': 'multipart/form-data'
                },
                [
                    { name: 'folderName', data: bucketName },
                    { name: 'fileName', data: filename },
                    {
                        name: 'file',
                        filename: filename,
                        data: base64Data,
                        type: contentType
                    }
                ]
            );

            console.log({
                sessiontoken: user.creds.sessionId,
                'Content-Type': 'multipart/form-data'
            });
            console.log('AssetFetcher::');
            console.log(res);

            const s3UrlToFile = `${config.proxy.protocol}${config.proxy.host}${
                config.proxy.downloadFilePath
            }/${bucketName}/${filename}`;
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
        let depSlug = _.snakeCase(name);
        let dir = `${AssetFetcher.DependenciesDir}${depSlug}/${version}/`,
            path = `${dir}${depSlug}.js`;
        RNFS.mkdir(`${dir}`);
        return path;
    }

    static async loadDependency(dep_options, user) {
        try {
            let depUrl = dep_options.url,
                depName = dep_options.name,
                version = _.get(dep_options, 'version', 'n.a');

            let path = this.depPath(depName, version),
                data = await AssetFetcher.getFile(path);

            if (!data) {
                console.log(
                    'AssetFetcher::loadDependency::Did not find on filesystem. Loading from url',
                    depUrl,
                    depName,
                    version
                );

                let res = await AssetFetcher.downloadBotFile(
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
            let depSlug = _.snakeCase(name);
            let dir = `${AssetFetcher.DependenciesDir}${depSlug}/${version}/`,
                path = `${dir}${depSlug}.js`;

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
}
console.log('Making DependenciesDir');
RNFS.mkdir(AssetFetcher.DependenciesDir);

export default AssetFetcher;
