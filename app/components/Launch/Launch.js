import React from 'react';
import { Actions, ActionConst } from 'react-native-router-flux';
import { View, Image } from 'react-native';
import images from '../../config/images';
const Icon = images.splash_page_logo;
import persist from './setupPersistence';
import styles from './styles';
import { DefaultUser } from '../../lib/user';
import { NetworkPoller } from '../../lib/network';
import { Auth, Notification } from '../../lib/capability';
import BotUtils from '../../lib/utils';
import { overrideConsole } from '../../config/config';
import EventEmitter, { AuthEvents, NotificationEvents } from '../../lib/events';
import SystemBot, { SYSTEM_BOT_MANIFEST_NAMES } from '../../lib/bot/SystemBot';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import DeviceStorage from '../../lib/capability/DeviceStorage';

const VERSION = 3; // Corresponding to 2.2.0 build 4
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
                }
            })
            .then(() => {
                return Auth.isUserLoggedIn();
            })
            .then((isUserLoggedIn) => {
                if (isUserLoggedIn) {
                    this.showMainScreen();
                } else {
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
    }

    userLoggedInHandler = async () => {
        this.showMainScreen();
    }

    userLoggedOutHandler = async () => {
        //this.showOnboardingScreen();
    }

    showMainScreen = () => {
        Actions.lightbox({ type: ActionConst.REPLACE });
        return;
    }

    showOnboardingScreen = () => {
        SystemBot.get(SYSTEM_BOT_MANIFEST_NAMES.OnboardingBot)
            .then((onboardingBot) => {
                //Actions.lightbox({ type: ActionConst.REPLACE, duration: 0 });
                Actions.onboarding({ bot: onboardingBot, type: ActionConst.REPLACE, onBack: this.showMainScreen.bind(this), duration: 0 });
            })
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
