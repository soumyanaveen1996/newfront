import { Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';

export default Permissions = {
    CAMERA:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA,
    MICROPHONE:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.MICROPHONE
            : PERMISSIONS.ANDROID.RECORD_AUDIO,
    LOCATION:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    LOCATION_ALWAYS:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_ALWAYS
            : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    CONTACTS:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CONTACTS
            : PERMISSIONS.ANDROID.READ_CONTACTS,
    STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    GALLERY:
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.PHOTO_LIBRARY
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
};
