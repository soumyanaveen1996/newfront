import { AssetFetcher } from '../dce';
import Auth from './Auth';
import ImageCache from '../../lib/image_cache';
import ImageResizer from 'react-native-image-resizer';

export const ResourceTypes = {
    Image: 'image',
    Video: 'video',
    Audio: 'audio',
}

export default class Resource {
    /**
     * Async method that returns a S3 URL of the file thats uploaded.
     *
     * @param base64Data Base64 data of the resource
     * @param fileUri Local filesystem uri
     * @param fileUri bucketname where you want to upload
     * @param filenameWithoutExtension object name in the bucket without extension
     * @param resourceType Either 'image', 'video', or 'audio'
     * @param user Authenticated user
     *
     * @return S3 URL of the file uploaded
     */
    static async uploadFile(base64Data, fileUri, bucketName, filenameWithoutExtension, resourceType, user = undefined, clearCache = false) {
        if (!user) {
            user = await Auth.getUser();
        }
        if (!user) {
            throw new Error('Auth Failure: No Authenticated user');
        }

        // Resizing the image
        if (resourceType === ResourceTypes.Image) {
            try {
                let imageResizeResponse = await ImageResizer.createResizedImage(fileUri, 800, 800, 'JPEG', 50, 0, null)
                fileUri = imageResizeResponse.uri;
                base64Data = null;
            } catch (error) {
                throw error;
            }
        }

        let contentType = 'image/jpeg';
        let extension = 'jpg';
        if (resourceType === ResourceTypes.Image) {
            contentType = 'image/jpeg';
            extension = 'jpg';
        } else if (resourceType === ResourceTypes.Audio) {
            contentType = 'audio/x-caf';
            extension = 'caf';
        } else if (resourceType === ResourceTypes.Video) {
            contentType = 'video/mp4';
            extension = 'mov';
        }
        if (!base64Data) {
            fileUri = decodeURI(fileUri);
            base64Data = await AssetFetcher.getFile(fileUri, 'base64');
        }

        let res = await AssetFetcher.uploadFileToS3(base64Data, fileUri, bucketName, filenameWithoutExtension, contentType, extension, user);
        if (res && clearCache && resourceType === ResourceTypes.Image) {
            await ImageCache.imageCacheManager.removeFromCache(res);
        }
        await ImageCache.imageCacheManager.storeIncache(res, fileUri);
        return res;
    }
}
