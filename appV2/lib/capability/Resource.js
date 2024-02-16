import mime from 'react-native-mime-types';
import Auth from './Auth';
import RNFS from 'react-native-fs';

import { Utils } from '.';
import { AssetFetcher } from '../dce';
import { Platform } from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export const ResourceTypes = {
    Image: 'image',
    Video: 'video',
    Audio: 'audio',
    OtherFile: 'other_file'
};

export default class Resource {
    /**
     * Async method that returns a S3 URL of the file thats uploaded. You can rename the file in the backend swith `filenameWithoutExtension` parameter
     *
     * @param fileUri Local filesystem uri
     * @param bucketName Directory of the backend where to save the file
     * @param filenameWithoutExtension Remote name of the file without extension
     * @param resourceType Either 'image', 'video', 'audio' or 'other_file'
     * @param fileMIMEType MIME type of the file
     * @param clearCache
     * @param forceReload
     * @param scope
     *
     * @return S3 URL of the file uploaded
     */
    static async uploadFile(
        fileUri,
        bucketName,
        filenameWithoutExtension,
        resourceType,
        fileMIMEType,
        scope = null
    ) {
        console.log(
            `~~~~ uploadFile uploading - fileUri: ${fileUri} -- bucketName: ${bucketName} -- filenameWithoutExtension: ${filenameWithoutExtension} -- resourceType: ${resourceType} -- fileMIMEType:${fileMIMEType}`
        );
        try {
            const user = Auth.getUserData();

            if (!user) {
                throw new Error('Auth Failure: No Authenticated user');
            }

            let contentType = 'image/png';
            let extension = 'png';
            if (resourceType === ResourceTypes.Image) {
                contentType = 'image/png';
                extension = 'png';
            } else if (resourceType === ResourceTypes.Audio) {
                contentType = 'audio/aac';
                extension = 'aac';
            } else {
                contentType = fileMIMEType || contentType;
                extension = mime.extension(contentType);
            }
            if (!extension) {
                extension = contentType.split('/')?.pop();
            }
            const filename = `${filenameWithoutExtension}.${extension}`;
            const resFile = await RNFS.stat(fileUri);
            console.log(`~~~~ uploadFile uploading - resFile:`, resFile);
            const filePath =
                Platform.OS === 'android'
                    ? resFile.originalFilepath
                    : resFile.path.replace('file://', '');
            const res = await Utils.uploadFile(
                user?.creds?.sessionId,
                filename,
                bucketName,
                filePath,
                scope
            );
            console.log(
                `~~~~ uploadFile uploading - done in resourcec for filename: ${filename}: bucketname: ${bucketName}: filepath: ${filePath}  `,
                res
            );
            return res;
        } catch (e) {
            Toast.show({ text1: 'A file upload was failed' });
            Utils.addLogEntry({
                type: 'SYSTEM',
                entry: {
                    message: 'File upload failure'
                },
                data: {
                    e: JSON.stringify(e)
                }
            });
            console.log(
                '~~~~ uploadFile  filenameWithoutExtension upoad error Error: ',
                e
            );
            return false;
            // throw new Error(e);
        }
    }
    static async uploadFileForhumbnailAlso(
        fileUri,
        bucketName,
        filenameWithoutExtension,
        resourceType,
        fileMIMEType,
        scope = null,
        generateThumbnail = false
    ) {
        try {
            const user = Auth.getUserData();

            if (!user) {
                throw new Error('Auth Failure: No Authenticated user');
            }

            const fileName = `${filenameWithoutExtension}.png`;
            const resFile = await RNFS.stat(fileUri);
            const filePath =
                Platform.OS === 'android'
                    ? resFile.originalFilepath
                    : resFile.path.replace('file://', '');
            const res = await Utils.uploadProfilePic(
                fileName,
                filePath,
                bucketName,
                scope,
                generateThumbnail
            );

            return res;
        } catch (e) {
            Toast.show({ text1: 'A file upload was failed' });
            Utils.addLogEntry({
                type: 'SYSTEM',
                entry: {
                    message: 'File upload failure'
                },
                data: {
                    e: JSON.stringify(e)
                }
            });

            return false;
            // throw new Error(e);
        }
    }
    static async uploadFileForGroupForThumbnailAlso(
        channelId,
        fileUri,
        fileName,
        generateThumbnail
    ) {
        try {
            const user = Auth.getUserData();

            if (!user) {
                throw new Error('Auth Failure: No Authenticated user');
            }
            const filename = fileName;
            const resFile = await RNFS.stat(fileUri);
            console.log(`~~~~ uploadFile uploading - resFile:`, resFile);
            const filePath =
                Platform.OS === 'android'
                    ? resFile.originalFilepath
                    : resFile.path.replace('file://', '');
            const res = await Utils.uploadGroupImg(
                channelId,
                filePath,
                filename,
                generateThumbnail
            );
            return res;
        } catch (e) {
            Toast.show({ text1: 'A file upload was failed' });
            Utils.addLogEntry({
                type: 'SYSTEM',
                entry: {
                    message: 'File upload failure'
                },
                data: {
                    e: JSON.stringify(e)
                }
            });
            // console.log(
            //     '~~~~ uploadFile  filenameWithoutExtension upoad error Error: ',
            //     e
            // );
            return false;
            // throw new Error(e);
        }
    }

    static async uploadFileWithExtension(
        fileUri,
        bucketName,
        filename,
        fileMIMEType,
        channelId
    ) {
        try {
            const user = Auth.getUserData();

            if (!user) {
                throw new Error('Auth Failure: No Authenticated user');
            }
            const resFile = await RNFS.stat(fileUri);
            console.log(`~~~~ uploadFile uploading - resFile:`, resFile);
            const filePath =
                Platform.OS === 'android'
                    ? resFile.originalFilepath
                    : resFile.path.replace('file://', '');
            const base64Data = await AssetFetcher.getFile(filePath, 'base64');
            console.log(
                'File path to upload : ',
                filePath,
                filename,
                fileMIMEType,
                mime.extension(fileMIMEType)
            );

            const res = await AssetFetcher.uploadChannelFileToFileGateway(
                base64Data || undefined,
                filePath,
                bucketName,
                filename,
                fileMIMEType,
                user,
                channelId
            );
            console.log('RESOURCE', res);
            return res;
        } catch (e) {
            console.log(
                '~~~~ uploadFile  filenameWithoutExtension upoad error Error: ',
                e
            );
            throw new Error(e);
        }
    }
}
