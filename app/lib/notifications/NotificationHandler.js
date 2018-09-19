import { Platform, PushNotificationIOS } from 'react-native';

const handleNotification = notification => {
    console.log('Notification:', notification);
    if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    }
};

export default {
    handleNotification: handleNotification
};
