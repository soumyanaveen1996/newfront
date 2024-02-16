import { update } from 'lodash';
import RNFetchBlob from 'react-native-blob-util';
import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class FileService {
    static uploadFile = async (
        fileName,
        conversationId,
        filePath,
        fileScope = null
    ) => {
        const fileData = await RNFetchBlob.fs.readFile(filePath, 'base64');
        return apiClient().post('file.FileService/UploadFileBase64', {
            ...getBaseParams(),
            ...{
                base64File: fileData,
                scopeId: conversationId,
                fileName,
                fileScope
            }
        });
    };
    static uploadFileForThumbnail = async (
        fileName,
        filePath,
        conversationId,
        fileScope = null,
        generateThumbnail = true
    ) => {
        const fileData = await RNFetchBlob.fs.readFile(filePath, 'base64');
        return apiClient().post('file.FileService/UploadFileBase64', {
            ...getBaseParams(),
            ...{
                base64File: fileData,
                scopeId: conversationId,
                fileName,
                fileScope,
                generateThumbnail
            }
        });
    };

    static uploadGroupImageForThumbnailAlso = async (
        chennalId,
        filePath,
        fileName,
        isBase64Encoded
    ) => {
        const fileData = await RNFetchBlob.fs.readFile(filePath, 'base64');
        return apiClient().post('file.FileService/UploadChannelLogo', {
            ...getBaseParams(),
            ...{
                channelId: chennalId,
                file: fileData,
                fileName: fileName,
                isBase64Encoded: isBase64Encoded
            }
        });
    };
}
