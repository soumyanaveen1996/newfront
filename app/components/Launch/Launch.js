import React from 'react';
import { Actions, ActionConst } from 'react-native-router-flux';
import { View, Image, Platform, PushNotificationIOS } from 'react-native';
import images from '../../config/images';
const Icon = images.splash_page_logo;
import persist from './setupPersistence';
import styles from './styles';
import { DefaultUser } from '../../lib/user';
import { NetworkPoller, NetworkHandler } from '../../lib/network';
import { DataManager } from '../../lib/DataManager';
import { Auth, Notification } from '../../lib/capability';
import BotUtils from '../../lib/utils';
import { overrideConsole } from '../../config/config';
import EventEmitter, { AuthEvents, NotificationEvents } from '../../lib/events';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { DeviceStorage } from '../../lib/capability';
import { ContactsCache } from '../../lib/ContactsCache';
import { MessageCounter } from '../../lib/MessageCounter';
import { GoogleAnalytics, GoogleAnalyticsCategories, GoogleAnalyticsEvents } from '../../lib/GoogleAnalytics';

const VERSION = 21; // Corresponding to 2.9.0 build 3. Update this number every time we update initial_bots
const VERSION_KEY = 'version';

export default class Splash extends React.Component {

    constructor(props) {
        super(props);
        this.state = { duration: props.duration || 2000 };
    }

    async componentDidMount() {

        // Override logging in prod builds

        let truConsole = global.console;
        global.console = overrideConsole(truConsole);

        console.log('Overrode console object. Now starting initialization');

        DataManager.init();
        ContactsCache.init();
        await MessageCounter.init();
        GoogleAnalytics.init();
        GoogleAnalytics.logEvents(GoogleAnalyticsCategories.APP_LAUNCHED, GoogleAnalyticsEvents.APP_OPENED, null, 0, null);

        let versionString = await DeviceStorage.get(VERSION_KEY);
        let version = parseInt(versionString, 10);
        let forceUpdate = isNaN(version) || version < VERSION || global.__DEV__;

        if (forceUpdate) {
            console.log('Copying Bots');
            await BotUtils.copyIntialBots(forceUpdate);
            await DeviceStorage.save(VERSION_KEY, VERSION);
        }

        // Chain all setup stuff
        persist.runMigrations()
            .then(() => {
                return Auth.getUser();
            })
            .then((user) => {
                if (!user) {
                    // Creating a DefaultUser session for OnBoarding Bot.
                    return Auth.saveUser(DefaultUser);
                } else {
                    return user;
                }
            })
            .then(() => {
                return Auth.isUserLoggedIn();
            })
            .then((isUserLoggedIn) => {
                if (isUserLoggedIn) {
                    this.showMainScreen();
                } else {
                    //this.showMainScreen();
                    this.showOnboardingScreen();
                }
            })
            .then(() => {
                NetworkPoller.start();
            })
            .then(() => {
                this.listenToEvents();
            })
            .then(() => {
                this.configureNotifications();
            })
            .catch((err) => {
                // ignore
                console.log(err);
            });
    }

    configureNotifications = () => {
        console.log('In Configurig Notifications');
        Notification.deviceInfo()
            .then((info) => {
                if (info) {
                    Notification.configure(this.handleNotification.bind(this));
                }
            })
    }

    notificationRegistrationHandler = () => {
        this.configureNotifications()
    }

    handleNotification = (notification) => {
        console.log('In HandleNotification : ', notification, Actions.currentScene);
        if (!notification.foreground && notification.userInteraction) {
            if (Actions.currentScene !== ROUTER_SCENE_KEYS.timeline) {
                Actions.popTo(ROUTER_SCENE_KEYS.timeline);
            }
        }
        if (notification.foreground) {
            NetworkHandler.readLambda();
        }
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    }

    userLoggedInHandler = async () => {
        this.showMainScreen();
    }

    userLoggedOutHandler = async () => {
        //this.showOnboardingScreen();
    }

    showMainScreen = (moveToOnboarding = false) => {
        Actions.main({ type: ActionConst.REPLACE, moveToOnboarding: moveToOnboarding });
        return;
    }

    showOnboardingScreen = () => {
        this.showMainScreen(true);
        return;
    }

    listenToEvents = async () => {
        // For now the user should not be taken back
        // EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
        EventEmitter.addListener(NotificationEvents.registeredNotifications, this.notificationRegistrationHandler);
    }

    removeListeners = () => {
        // EventEmitter.removeListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.removeListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
        EventEmitter.removeListener(NotificationEvents.registeredNotifications, this.notificationRegistrationHandler);
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.imageStyle} source={Icon} resizeMode={'contain'} />
            </View>
        );
    }
}
