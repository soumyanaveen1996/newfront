import { Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
const handleNotification = notification => {
    console.log('Notification:', notification);
    if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    }
};

export default {
    handleNotification: handleNotification
};
