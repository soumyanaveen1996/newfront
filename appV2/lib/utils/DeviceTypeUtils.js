import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const isTabletOrIpad = () => {
    return DeviceInfo.isTablet();
};

export const isIOS = () => {
    return Platform.OS === 'ios';
};
