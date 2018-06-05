var RNImagePicker = require('react-native-image-picker');
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import I18n from '../../config/i18n/i18n';
import { Platform, Alert } from 'react-native';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import ImagePickerAndroidWrapper from './ImagePicker';


export const DefaultCameraOptions = {
    allowsEditing: false,
    exif: true,
    base64: true,
    storageOptions: {
        skipBackup: true,
        path: 'camera_images'
    }
}

export default class Media {

    // Returns a promise that resolves to {cancelled: false, uri: 'uri', base64: 'base64' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static pickMediaFromLibrary = (cameraOptions = DefaultCameraOptions) => new Promise((resolve, reject) => {
        var options = _.extend({ title : I18n.t('Select_image') }, cameraOptions);

        const ImagePicker = Platform.OS === 'ios' ? RNImagePicker : ImagePickerAndroidWrapper;
        Media.hasImageLibraryPermission().then((permission) => {
            if (permission === 'undetermined') {
                Media.requestImageLibraryPermission().then((rp) => {
                    if (rp === 'authorized') {
                        ImagePicker.launchImageLibrary(options, (response) => {
                            if (response.didCancel) {
                                resolve({ cancelled: true });
                            } else if (response.error) {
                                resolve({ cancelled: true });
                            } else {
                                resolve({ cancelled: false, base64: response.data, uri: response.uri });
                            }
                        });
                    }
                });
            } else if (permission === 'authorized') {
                ImagePicker.launchImageLibrary(options, (response) => {
                    if (response.didCancel) {
                        resolve({ cancelled: true });
                    } else if (response.error) {
                        resolve({ cancelled: true });
                    } else {
                        resolve({ cancelled: false, base64: response.data, uri: response.uri });
                    }
                });
            } else {
                Media.alertForPhotoLibraryPermission();
            }
        });
    });

    static hasImageLibraryPermission() {
        return Permissions.check('photo');
    }

    static requestImageLibraryPermission() {
        return Permissions.request('photo');
    }

    static alertForPhotoLibraryPermission() {
        Alert.alert(
            undefined,
            'We need Photo Library access to set your profile picture.',
            [
                {
                    text: 'cancel',
                    onPress: () => console.log('Permission denied'),
                    style: 'cancel',
                },
                {text: 'Open Settings', onPress: (Platform.OS === 'ios') ? Permissions.openSettings : AndroidOpenSettings.appDetailsSettings},
            ],
        );
    }

    static hasCameraPermission() {
        return Permissions.check('camera');
    }

    static requestCameraPermission() {
        return Permissions.request('camera');
    }

    static alertForCameraPermission() {
        Alert.alert(
            undefined,
            'We need Camera access to take pictures.',
            [
                {
                    text: 'cancel',
                    onPress: () => console.log('Permission denied'),
                    style: 'cancel',
                },
                {text: 'Open Settings', onPress: (Platform.OS === 'ios') ? Permissions.openSettings : AndroidOpenSettings.appDetailsSettings},
            ],
        );
    }

    // Returns a promise that resolves to {cancelled: false, uri: 'uri', base64: 'base64' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static takePicture = (cameraOptions = DefaultCameraOptions) => new Promise((resolve, reject) => {
        var options = _.extend({ title : I18n.t('Take_picture') }, cameraOptions);

        const ImagePicker = Platform.OS === 'ios' ? RNImagePicker : ImagePickerAndroidWrapper;
        Media.hasCameraPermission().then((permission) => {
            if (permission === 'undetermined') {
                Media.requestCameraPermission().then((rp) => {
                    if (rp === 'authorized') {
                        ImagePicker.launchCamera(options, (response) => {
                            if (response.didCancel) {
                                resolve({ cancelled: true });
                            } else if (response.error) {
                                resolve({ cancelled: true });
                            } else {
                                resolve({ cancelled: false, base64: response.data, uri: response.uri });
                            }
                        });
                    }
                });
            } else if (permission === 'authorized') {
                ImagePicker.launchCamera(options, (response) => {
                    if (response.didCancel) {
                        resolve({ cancelled: true });
                    } else if (response.error) {
                        resolve({ cancelled: true });
                    } else {
                        resolve({ cancelled: false, base64: response.data, uri: response.uri });
                    }
                });
            } else {
                Media.alertForCameraPermission();
            }
        });
    });

    // Returns a promise that resolves to {cancelled: false, uri: 'uri' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static recordVideo = () => new Promise((resolve, reject) => {
        let filePath = '';
        if (Platform.OS === 'ios') {
            filePath = filePath + 'file://';
        }
        const onVideoCapture = (data) => {
            resolve({
                cancelled: false,
                uri: filePath + data.path,
            });
        };

        const onCancel = () => {
            resolve({
                cancelled: true,
            });
        };

        Actions.videoRecorder({
            onVideoCaptured: onVideoCapture,
            onCancel: onCancel
        });
    });

    static readBarcode = () => new Promise((resolve, reject) => {
        const onBarcodeRead = (result) => {
            resolve({
                cancelled: false,
                data: result.data,
            });
        };

        const onCancel = () => {
            resolve({
                cancelled: true,
            });
        };

        Actions.barCodeScanner({
            onBarcodeRead: onBarcodeRead,
            onCancel: onCancel
        });
    });
}
