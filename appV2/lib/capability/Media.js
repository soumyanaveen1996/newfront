import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import _ from 'lodash';
import { Platform, Linking } from 'react-native';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import I18n from '../../config/i18n/i18n';
import PermissionList from '../utils/PermissionList';
import NavigationAction from '../../navigation/NavigationAction';
import AlertDialog from '../utils/AlertDialog';

export const DefaultCameraOptions = {
    allowsEditing: false,
    exif: true,
    base64: true,
    storageOptions: {
        skipBackup: true,
        path: 'camera_images'
    }
};

export default class Media {
    // Returns a promise that resolves to {cancelled: false, uri: 'uri', base64: 'base64' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static pickMediaFromLibrary = (cameraOptions = DefaultCameraOptions) =>
        new Promise((resolve, reject) => {
            const options = _.extend(
                {
                    title: I18n.t('Select_image'),
                    maxWidth: 800,
                    maxHeight: 640
                },
                cameraOptions
            );
            launchImageLibrary(options, (response) => {
                if (response.didCancel) {
                    resolve({ cancelled: true });
                } else if (response.error) {
                    resolve({ cancelled: true });
                } else {
                    resolve({
                        cancelled: false,
                        base64: response.data,
                        uri: response.uri,
                        name: response.fileName,
                        type: response.type
                    });
                }
            });
        });

    static hasImageLibraryPermission() {
        return Permissions.check(PermissionList.GALLERY);
    }

    static requestImageLibraryPermission() {
        return Permissions.request(PermissionList.GALLERY);
    }

    static alertForPhotoLibraryPermission() {
        AlertDialog.show(
            undefined,
            'We need Photo Library access to set your profile picture.',
            [
                {
                    text: I18n.t('Cancel'),
                    onPress: () => console.log('Permission denied'),
                    style: 'cancel'
                },
                {
                    text: 'Open Settings',
                    onPress:
                        Platform.OS === 'ios'
                            ? Permissions.openSettings
                            : AndroidOpenSettings.appDetailsSettings
                }
            ]
        );
    }

    static hasCameraPermission() {
        return Permissions.check(PermissionList.CAMERA);
    }

    static requestCameraPermission() {
        return Permissions.request(PermissionList.CAMERA);
    }

    static alertForCameraPermission() {
        AlertDialog.show(undefined, 'We need Camera access to take pictures.', [
            {
                text: I18n.t('Cancel'),
                onPress: () => console.log('Permission denied'),
                style: 'cancel'
            },
            {
                text: 'Open Settings',
                onPress:
                    Platform.OS === 'ios'
                        ? Permissions.openSettings
                        : AndroidOpenSettings.appDetailsSettings
            }
        ]);
    }

    // Returns a promise that resolves to {cancelled: false, uri: 'uri', base64: 'base64' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static takePicture = (cameraOptions = DefaultCameraOptions) =>
        new Promise((resolve, reject) => {
            const options = _.extend(
                { title: I18n.t('Take_picture') },
                cameraOptions
            );

            Media.hasCameraPermission().then((permission) => {
                if (permission === Permissions.RESULTS.DENIED) {
                    Media.requestCameraPermission().then((rp) => {
                        if (rp === Permissions.RESULTS.GRANTED) {
                            launchCamera(options, (response) => {
                                if (response.didCancel) {
                                    resolve({ cancelled: true });
                                } else if (response.error) {
                                    resolve({ cancelled: true });
                                } else {
                                    resolve({
                                        cancelled: false,
                                        base64: response.data,
                                        uri: response.uri,
                                        name: response.fileName,
                                        type: response.type
                                    });
                                }
                            });
                        }
                    });
                } else if (permission === Permissions.RESULTS.GRANTED) {
                    launchCamera(options, (response) => {
                        if (response.didCancel) {
                            resolve({ cancelled: true });
                        } else if (response.error) {
                            resolve({ cancelled: true });
                        } else {
                            resolve({
                                cancelled: false,
                                base64: response.data,
                                uri: response.uri,
                                name: response.fileName,
                                type: response.type
                            });
                        }
                    });
                } else {
                    Media.alertForCameraPermission();
                }
            });
        });

    // Returns a promise that resolves to {cancelled: false, uri: 'uri' } on success.
    // On cancel, returns a promise that resolves to {cancelled: true}
    static recordVideo = () =>
        new Promise((resolve, reject) => {
            let filePath = '';
            if (Platform.OS === 'ios') {
                filePath += 'file://';
            }
            const onVideoCapture = (data) => {
                resolve({
                    cancelled: false,
                    data
                });
            };

            const onCancel = () => {
                resolve({
                    cancelled: true
                });
            };

            // Actions.videoRecorder({
            //     onVideoCaptured: onVideoCapture,
            //     onCancel
            // });
        });

    static readBarcode = () =>
        new Promise((resolve, reject) => {
            const onBarcodeRead = (result) => {
                resolve({
                    cancelled: false,
                    data: result.data
                });
            };

            const onCancel = () => {
                resolve({
                    cancelled: true
                });
            };
            NavigationAction.push(NavigationAction.SCREENS.barCodeScanner, {
                onBarcodeRead,
                onCancel
            });
        });

    // for location Helper

    static hasLocationPermission() {
        return Permissions.check(PermissionList.LOCATION);
    }

    static alertForLocationPermission() {
        new Promise((resolve, reject) => {
            AlertDialog.show(undefined, I18n.t('PermissionSubTittleLocation'), [
                {
                    text: I18n.t('Cancel'),
                    onPress: () => {
                        resolve('denied');
                    },
                    style: 'cancel'
                },
                {
                    text: 'Open Settings',
                    onPress: async () => {
                        await Linking.openSettings();
                        resolve(true);
                    }
                }
            ]);
        });
    }

    static alertForLocationOn() {
        new Promise((resolve, reject) => {
            AlertDialog.show(
                undefined,
                `Please turn on your device location.`,
                [
                    {
                        text: I18n.t('Cancel'),
                        onPress: () => {
                            resolve(true);
                        },
                        style: 'cancel'
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            resolve(true);
                        }
                    }
                ]
            );
        });
    }
}
