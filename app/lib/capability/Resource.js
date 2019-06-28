import { AssetFetcher } from '../dce';
import Auth from './Auth';
import ImageCache from '../../lib/image_cache';
import ImageResizer from 'react-native-image-resizer';
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
        base64Data,
        fileUri,
        bucketName,
        filenameWithoutExtension,
        user = undefined,
        resourceType,
        fileMIMEType,
        clearCache = false,
        forceReload = false
    ) {
        if (!user) {
            user = await Auth.getUser();
        }
        if (!user) {
            throw new Error('Auth Failure: No Authenticated user');
        }

        // Resizing the image
        if (resourceType === ResourceTypes.Image) {
            try {
                let imageResizeResponse = await ImageResizer.createResizedImage(
                    fileUri,
                    800,
                    800,
                    'PNG',
                    50,
                    0,
                    null
                );
                fileUri = imageResizeResponse.uri;
                base64Data = null;
            } catch (error) {
                throw error;
            }
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
        if (!base64Data) {
            fileUri = decodeURI(fileUri);
            base64Data = await AssetFetcher.getFile(fileUri, 'base64');
        }
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
        if (res && resourceType === ResourceTypes.Image) {
            await ImageCache.imageCacheManager.storeIncache(res, fileUri);
        }
        return res;
    }
}
