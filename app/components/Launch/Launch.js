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
import { overrideConsole } from '../../config/config';
import EventEmitter, { AuthEvents } from '../../lib/events';
import SystemBot, { SYSTEM_BOT_MANIFEST_NAMES } from '../../lib/bot/SystemBot';

export default class Splash extends React.Component {

    constructor(props) {
        super(props);
        this.state = { duration: props.duration || 2000 };
    }

    componentDidMount() {
        // Override logging in prod builds
        let truConsole = global.console;
        global.console = overrideConsole(truConsole);

        console.log('Overrode console object. Now starting initialization');

        // Chain all setup stuff
        persist.createMessageTable()
            .then(() => {
                return persist.createNetworkRequestQueueTable()
            })
            .then(() => {
                return persist.createConversationTable()
            })
            .then(() => {
                return persist.createArrayStorageTable()
            })
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
                return Notification.deviceInfo()
            })
            .then((info) => {
                if (info) {
                    Notification.configure();
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
            .catch((err) => {
                // ignore
                console.log(err);
            });
    }

    userLoggedInHandler = async () => {
        this.showMainScreen();
    }

    userLoggedOutHandler = async () => {
        this.showOnboardingScreen();
    }

    showMainScreen = () => {
        Actions.lightbox({ type: ActionConst.REPLACE });
        return;
    }

    showOnboardingScreen = () => {
        SystemBot.get(SYSTEM_BOT_MANIFEST_NAMES.OnboardingBot)
            .then((onboardingBot) => {
                Actions.onboarding({ bot: onboardingBot, type: ActionConst.REPLACE, onBack: this.showMainScreen.bind(this) });
            })
        return;
    }

    listenToEvents = async () => {
        // For now the user should not be taken back
        // EventEmitter.addListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.addListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
    }

    removeListeners = () => {
        // EventEmitter.removeListener(AuthEvents.userLoggedIn, this.userLoggedInHandler);
        EventEmitter.removeListener(AuthEvents.userLoggedOut, this.userLoggedOutHandler);
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.imageStyle} source={Icon} resizeMode={'contain'} />
            </View>
        );
    }
}
