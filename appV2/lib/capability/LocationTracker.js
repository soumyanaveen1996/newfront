import moment from 'moment';
import DeviceStorage from './DeviceStorage';
import { Auth, Message, ConversationContext } from '../capability';
import Store from '../../redux/store/configureStore';
import EventEmitter, { MessageEvents } from '../events';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import BackgroundMessageSender from '../BackgroundTask/BackgroundMessageSender';
import Permissions, { RESULTS } from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import PermissionList from '../utils/PermissionList';
import AlertDialog from '../utils/AlertDialog';
import { Platform } from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

let watchId = null;
export default class LocationTracker {
    static status = false;
    static start_tracking = async (
        data,
        precision = 100,
        heartbeatInterval = 10000
    ) => {
        if (this.status) {
            console.log('location tracking is already in progress');
        }
        await DeviceStorage.save('location_bot', data);
        Permissions.request(PermissionList.LOCATION_ALWAYS).then((res) => {
            console.log('Location result', res);
            if (res === RESULTS.GRANTED) {
                Geolocation.setRNConfiguration({
                    skipPermissionRequests: false,
                    authorizationLevel: 'always',
                    locationProvider: 'auto'
                });
                this.status = true;
                watchId = BackgroundTimer.setInterval(() => {
                    console.log('BackgroundTimer Location');
                    Geolocation.getCurrentPosition(
                        LocationTracker.onLocation,
                        LocationTracker.onError
                    );
                }, heartbeatInterval);
            } else {
                setTimeout(() => {
                    Toast.show({ text1: 'Please enable location' });
                    AlertDialog.show(
                        'We need to access location in the background.',
                        'In settings, select location and allow the app to use always',
                        [
                            {
                                text: 'Cancel',
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
                }, 1500);
            }
        });
    };

    static report_location = async (location) => {
        const user = Auth.getUserData();
        if (!user) {
            return;
        }
        const currentLocation = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            altitude: parseFloat(location.altitude),
            speed: parseFloat(location.speed)
        };

        let message = new Message();
        message.setCreatedBy({
            addedByBot: false,
            messageDate: moment().valueOf()
        });
        message.locationMessage(currentLocation, {});

        // If our Bot is currently in Foreground then Handle Differently
        const data = await DeviceStorage.get('location_bot');
        const activeBot = Store.getState().bots.id;
        if (activeBot === data.botId)
            EventEmitter.emit(MessageEvents.LocationUpdate, {
                message,
                targetBot: data.botId
            });
        else {
            const messageSender = new BackgroundMessageSender(data.botId);
            messageSender.sendMessage(message);
        }
    };

    static onLocation = async (location) => {
        try {
            console.log('Location--->>> ON Location', location);
            await LocationTracker.report_location(location.coords);
        } catch (error) {}
    };

    static stop_tracking = () => {
        Geolocation.clearWatch(watchId);
        watchId = null;
        this.status = true;
    };

    static onError = async (error) => {
        Geolocation.clearWatch(watchId);
        watchId = null;
        this.status = true;
        console.log('Location--->>> ON error', error);
    };
}
