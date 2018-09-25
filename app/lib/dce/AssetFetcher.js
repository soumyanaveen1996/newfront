import _ from 'lodash';
import RNFS from 'react-native-fs';
import config from '../../config/config.js';
import AWS from 'aws-sdk';
import { Utils, Promise, Auth } from '../capability';
import axios from 'axios';
import RNFetchBlob from 'react-native-fetch-blob';

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

    static async downloadS3FileRest(filepath, s3RelativePath, user, encoding) {
        try {
            encoding = encoding || 'utf8';
            console.log(`AssetFetcher::Downloading file from S3: ${filepath}`);

            const host = config.bot.baseUrl;
            const path = '/' + config.bot.s3bucket + '/' + s3RelativePath;
            let headers = false;
            const isLoggedIn = await Promise.resolve(Auth.isUserLoggedIn());
            // S3 hates invalid headers even for public files - found out the hard way :)
            if (isLoggedIn) {
                headers = Utils.createAuthHeader(
                    host,
                    'GET',
                    path,
                    config.bot.s3ServiceApi,
                    '',
                    user
                );
            }
            const url = config.bot.baseProtocol + host + path;
            const fileData = await AssetFetcher.downloadFile(
                filepath,
                url,
                headers,
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

    // TODO: improve for production. This is not a good solution as too much is loaded in memory and
    // data is being sent in one shot
    // Ideal algo: chunk data + compress (each chunk) + stream to http2 backend as chunks
    static async uploadFileToS3(
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
            const host = config.bot.baseUrl;

            const s3Config = {
                endpoint: host,
                region: config.aws.region,
                sessionId: user.creds.sessionId
            };
            const s3 = new AWS.S3(s3Config);

            // Fix for upload binary data S3: https://github.com/benjreinhart/react-native-aws3/issues/14
            const Buffer = global.Buffer || require('buffer').Buffer;
            const buf = new Buffer(
                base64Data.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
            );

            const putData = {
                Bucket: config.bot.binaryS3Bucket + '/' + bucketName,
                Key: filenameWithoutExtension + '.' + extension,
                Body: buf,
                ContentType: contentType,
                Metadata: {
                    'Content-Type': contentType
                }
            };

            const putObjectPromise = s3.putObject(putData).promise();
            let a = await Promise.resolve(putObjectPromise);
            console.log('Put Result : ', a);
            const s3UrlToFile =
                config.bot.baseProtocol +
                host +
                '/' +
                config.bot.binaryS3Bucket +
                '/' +
                bucketName +
                '/' +
                filenameWithoutExtension +
                '.' +
                extension;

            console.log(
                `AssetFetcher::Done uploading file ${fileUri} to S3 URL: ${s3UrlToFile}`
            );

            return s3UrlToFile;
        } catch (error) {
            console.log(
                'Failed uploading for file to bucket: ',
                fileUri,
                bucketName,
                error
            );
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

    static async uploadToS3(
        base64Data,
        fileUri,
        conversationId,
        messageId,
        contentType,
        extension,
        user
    ) {
        console.log(
            `AssetFetcher::Uploading file ${fileUri} data with conversationId: ${conversationId}`
        );
        return AssetFetcher.uploadFileToS3(
            base64Data,
            fileUri,
            conversationId,
            messageId,
            contentType,
            extension,
            user
        );
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

                let res = await AssetFetcher.downloadS3FileRest(
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
