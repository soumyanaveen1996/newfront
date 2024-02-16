import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import SplashScreen from 'react-native-splash-screen';
import persist from './setupPersistence';
import styles from './styles';
import { DataManager } from '../../lib/DataManager';
import { Auth, Message, DeviceStorage } from '../../lib/capability';
import BotUtils from '../../lib/utils';
import Config from '../../config/config';
import EventEmitter, { TwilioEvents, AuthEvents } from '../../lib/events';

import { ContactsCache } from '../../lib/ContactsCache';
// import { MessageCounter } from '../../lib/MessageCounter';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import SystemBot from '../../lib/bot/SystemBot';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import reduxStore from '../../redux/store/configureStore';
import { syncNoNetwork } from '../../lib/UserData/SyncData';
import AfterLogin from '../Auth/Login/afterLogin';
import { userLogin } from '../../redux/actions/SessionAction';
import NavigationAction from '../../navigation/NavigationAction';
import _ from 'lodash';
import UserDomainsManager from '../../lib/UserDomainsManager/UserDomainsManager';

const VERSION = 714; //  Update this number every time we update initial_bots
const VERSION_KEY = 'version';
export default class Splash extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: props.duration || 2000,
            loginState: false,
            loading: false,
            loadingText: ''
        };
    }

    async componentDidMount() {
        DataManager.init();
        ContactsCache.init(); // after loging. Logout should clear it.
        // await MessageCounter.init(); // after login or check for login / logout events and clear data or initialize data as necessary
        await GoogleAnalytics.init();
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.APP,
            GoogleAnalyticsEventsActions.APP_LAUNCHED,
            null,
            0,
            null
        );
        // Before login
        const versionString = await DeviceStorage.get(VERSION_KEY);
        const version = parseInt(versionString, 10);
        const forceUpdate = isNaN(version) || version < VERSION;
        if (Config.useLocalBots && forceUpdate) {
            await BotUtils.copyIntialBots(forceUpdate);
            await DeviceStorage.save(VERSION_KEY, VERSION);
        }

        this.listenToEvents();

        // Chain all setup stuff
        // Before login
        try {
            await persist.runMigrations(); // before login
        } catch (err) {
            console.error(
                '>>>>>>>>>>>>Error<<<<<<<<<< : running migrations!!!!',
                err
            );
        }
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        const checkStatus = await AsyncStorage.getItem('signupStage');

        if (isUserLoggedIn) {
            Auth.getUser()
                .then(async (user) => {
                    console.log('isUserLoggedIn true : user:', user);
                    reduxStore.dispatch(userLogin(user));
                    if (user) {
                        // Need the Contacts Cache fetched as fast as possible
                        ContactsCache.init();
                        await AfterLogin.executeAfterLogin();
                        this.listenToEvents();

                        this.showMainScreen();
                    } else {
                        this.goToLoginPage();
                    }
                })
                .catch((err) => {
                    console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
                    this.goToLoginPage();
                });
        } else if (checkStatus && checkStatus === 'checkCode') {
            NavigationAction.push(NavigationAction.SCREENS.confirmationScreen);
        } else {
            this.goToLoginPage();
        }

        // Chain all setup stuff
        // Before login
        persist
            .runMigrations() // before login
            .catch((err) => {
                console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
            });

        SplashScreen.hide();
    }

    sendOnboardingBackgroundMessage = async () => {
        const message = new Message();
        message.setCreatedBy({ addedByBot: true });
        message.backgroundEventMessage('onboarding_bot_new', {});

        const bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.onboardingBot
        });
        await bgBotScreen.initialize();
        bgBotScreen.next(message, {}, [], bgBotScreen.getBotContext());
    };

    userLoggedOutHandler = async () => {
        NavigationAction.resetOnLogout();
    };

    goToLoginPage = () => {
        NavigationAction.replace(NavigationAction.SCREENS.swiperScreen, {
            swiperIndex: 0
        });
    };

    showMainScreen = (moveToOnboarding = false) => {
        syncNoNetwork();
        NavigationAction.replace(
            NavigationAction.SCREENS.drawer,
            {},
            this.props.route.key,
            this.props.navigation.getState().key
        );
    };

    listenToEvents = async () => {
        // For now the user should not be taken back
        this.userListener = EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
    };

    removeListeners = () => {
        this.userListener?.remove();
    };

    render() {
        return this.props.params?.actionType != 'accept' ? (
            <View style={styles.container}>
                <StatusBar
                    hidden={false}
                    backgroundColor="grey"
                    barStyle={
                        Platform.OS === 'ios' ? 'dark-content' : 'light-content'
                    }
                />

                <Spinner
                    visible={this.state.loading}
                    textContent={this.state.loadingText}
                />
            </View>
        ) : null;
    }
}
