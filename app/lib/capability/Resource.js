import { AssetFetcher } from '../dce';
import Auth from './Auth';
import ImageCache from '../../lib/image_cache';
import { lastDayOfISOWeek } from 'date-fns';
import moment from 'moment';
import Store from '../../redux/store/configureStore';
import mime from 'react-native-mime-types';

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
     * @param base64Data Base64 data of the resource
     * @param fileUri Local filesystem uri
     * @param bucketName Directory of the backend where to save the file
     * @param filenameWithoutExtension Remote name of the file without extension
     * @param user Authenticated user
     * @param resourceType Either 'image', 'video', 'audio' or 'other_file'
     * @param fileMIMEType MIME type of the file
     * @param clearCache
     * @param forceReload
     *
     * @return S3 URL of the file uploaded
     */
    static async uploadFile(
        fileUri,
        bucketName,
        filenameWithoutExtension,
        resourceType,
        fileMIMEType,
        clearCache = false,
        forceReload = false
    ) {
        try {
            const user = await Auth.getUser();
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
            } else if (resourceType === ResourceTypes.Video) {
                contentType = 'video/mp4';
                extension = 'mp4';
            } else {
                contentType = fileMIMEType || contentType;
                extension = mime.extension(contentType);
            }

            // if (!base64Data) {
            fileUri = decodeURI(fileUri);
            const base64Data = await AssetFetcher.getFile(fileUri, 'base64');
            // }

            const filename = filenameWithoutExtension + '.' + extension;

            let res = await AssetFetcher.uploadFileToFileGateway(
                base64Data,
                fileUri,
                bucketName,
                filename,
                contentType,
                user
            );
            // const reduxState = Store.getState();
            // console.log('Upload Number: ', reduxState.user.upload);
            // const uploadNumber = reduxState.user.upload;
            // if (res && resourceType === ResourceTypes.Image) {
            //     await ImageCache.imageCacheManager.storeIncache(res, fileUri);
            // }
            return res;
        } catch (e) {
            console.log('Error: ', e);
            throw new Error(e);
        }
    }
}
