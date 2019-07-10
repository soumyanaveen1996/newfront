import React from 'react';
import { Actions, ActionConst } from 'react-native-router-flux';
import {
    View,
    Image,
    Platform,
    PushNotificationIOS,
    AsyncStorage,
    StatusBar,
    InteractionManager
} from 'react-native';
import images from '../../config/images';
const Icon = images.splash_page_logo;
import persist from './setupPersistence';
import styles from './styles';
import { DefaultUser } from '../../lib/user';
import { NetworkPoller, NetworkHandler } from '../../lib/network';
import { DataManager } from '../../lib/DataManager';
import { Auth, Notification, Message } from '../../lib/capability';
import BotUtils from '../../lib/utils';
import Config, { overrideConsole } from '../../config/config';
import EventEmitter, { AuthEvents, NotificationEvents } from '../../lib/events';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { DeviceStorage } from '../../lib/capability';
import { ContactsCache } from '../../lib/ContactsCache';
import { MessageCounter } from '../../lib/MessageCounter';
import {
    GoogleAnalytics,
    GoogleAnalyticsCategories,
    GoogleAnalyticsEvents
} from '../../lib/GoogleAnalytics';
import { TwilioVoIP } from '../../lib/twilio';
import { Telnet } from '../../lib/capability';
import SystemBot from '../../lib/bot/SystemBot';
import Bot from '../../lib/bot';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import codePush from 'react-native-code-push';
import Spinner from 'react-native-loading-spinner-overlay';
import Store from '../../lib/Store';
import { PhoneState } from '../../components/Phone';
import {
    synchronizeUserData,
    synchronizePhoneBook,
    syncNoNetwork
} from '../../lib/UserData/SyncData';
import AfterLogin from '../../services/afterLogin';
import DefaultPreference from 'react-native-default-preference';
import { Conversation } from '../../lib/conversation';
import { IM_CHAT } from '../../lib/conversation/Conversation';
import ReduxStore from '../../redux/store/configureStore';
import RemoteLogger from '../../lib/utils/remoteDebugger';
import PushNotification from 'react-native-push-notification';

//import jsonEncoder from 'serialize-json';

// const BusyIndicator = require('react-native-busy-indicator')

// Switch off During FINAL PROD RELEASE
// const CODE_PUSH_ACTIVATE = true;
const CODE_PUSH_ACTIVATE = false;
const VERSION = 116; // Corresponding to 2.17.0 build 2. Update this number every time we update initial_bots
const VERSION_KEY = 'version';

import { NativeModules, NativeEventEmitter } from 'react-native';
import twilio from '../../lib/twilio/twilio';

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
        // Override logging in prod builds

        console.log('[FRONTM] Code Push Active', CODE_PUSH_ACTIVATE);

        if (CODE_PUSH_ACTIVATE) {
            //  We will check for CodePush Updates --Only in Dev Mode
            console.log('[FRONTM] Checking for Code Changes in Server');

            codePush.sync(
                {
                    updateDialog: {
                        appendReleaseDescription: true,
                        descriptionPrefix: '\n\nChange log:\n'
                    },
                    installMode: codePush.InstallMode.IMMEDIATE
                },
                status => {
                    switch (status) {
                    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                        this.setState({
                            loading: true,
                            loadingText: 'Downloading Package...'
                        });
                        break;
                    case codePush.SyncStatus.INSTALLING_UPDATE:
                        this.setState({
                            loading: true,
                            loadingText: 'Installing Package...'
                        });
                        break;
                    default:
                        this.setState({ loading: false, loadingText: '' });
                    }
                }
            );
        }
        let truConsole = global.console;
        global.console = overrideConsole(truConsole);

        DataManager.init();
        ContactsCache.init(); // after loging. Logout should clear it.
        await MessageCounter.init(); // after login or check for login / logout events and clear data or initialize data as necessary
        GoogleAnalytics.init();
        if (Platform.OS !== 'android') {
            GoogleAnalytics.logEvents(
                GoogleAnalyticsCategories.APP_LAUNCHED,
                GoogleAnalyticsEvents.APP_OPENED,
                null,
                0,
                null
            );
        }

        Store.initStore({
            satelliteConnection: false
        });
        // Before login
        let versionString = await DeviceStorage.get(VERSION_KEY);
        let version = parseInt(versionString, 10);
        let forceUpdate = isNaN(version) || version < VERSION || global.__DEV__;

        if (false && forceUpdate) {
            console.log('Copying Bots');
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
            await TwilioVoIP.init();
            Auth.getUser()
                .then(user => {
                    if (Platform.OS === 'android') {
                        DefaultPreference.setName('NativeStorage');
                    }
                    const ContactsURL = `${Config.network.queueProtocol}${
                        Config.proxy.user_details_path
                    }`;
                    const ContactsBOT = SystemBot.contactsBot.botId;
                    DefaultPreference.set('SESSION', user.creds.sessionId);
                    console.log('Sourav Logging:::: Contacts URL', ContactsURL);
                    console.log(
                        'Sourav Logging:::: Session ID',
                        user.creds.sessionId
                    );
                    DefaultPreference.set('URL', ContactsURL);
                    DefaultPreference.set('CONTACTS_BOT', ContactsBOT);
                    if (user) {
                        AfterLogin.executeAfterLogin();
                        this.listenToEvents();
                        const gState = Store.getState();
                        console.log('gState ', gState);
                        const { call_state } = gState;

                        if (call_state && call_state === 'PENDING') {
                            Actions.phone({
                                type: ActionConst.REPLACE,
                                state: PhoneState.incomingcall,
                                data: gState
                            });
                            return;
                        }

                        InteractionManager.runAfterInteractions(() => {
                            synchronizePhoneBook();
                            Notification.registeronLaunch();
                        });

                        this.showMainScreen();
                    } else {
                        this.goToLoginPage();
                    }
                })
                .catch(err => {
                    console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
                    this.goToLoginPage();
                });
        } else {
            if (checkStatus && checkStatus === 'checkCode') {
                Actions.confirmationScreen({ type: ActionConst.REPLACE });
            } else {
                this.goToLoginPage();
            }
        }

        // Chain all setup stuff
        // Before login
        persist
            .runMigrations() // before login
            .catch(err => {
                console.error('>>>>>>>>>>>>Error<<<<<<<<<< : ', err);
            });
    }

    sendOnboardingBackgroundMessage = async () => {
        let message = new Message();
        message.setCreatedBy({ addedByBot: true });
        message.backgroundEventMessage('onboarding_bot_new', {});
        //BackgroundTaskProcessor.sendUnauthBackgroundMessage(message, 'onboarding-bot', undefined, true);

        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.onboardingBot
        });
        await bgBotScreen.initialize();
        bgBotScreen.next(message, {}, [], bgBotScreen.getBotContext());
    };

    configureNotifications = () => {
        if (Platform.OS === 'ios') {
            PushNotificationIOS.addEventListener(
                'notification',
                notification => {
                    // NetworkHandler.readLambda();
                    // notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            );

            PushNotificationIOS.addEventListener(
                'localNotification',
                notification => {
                    // NetworkHandler.readLambda(true);
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            );
        }
        Notification.deviceInfo()
            .then(info => {
                if (info) {
                    Notification.configure(this.handleNotification);
                }
            })
            .catch(err => {
                console.log('error from launch ', err);
            });
    };

    notificationRegistrationHandler = () => {
        console.log('Sourav Logging:::: Register for Notifcaitons');
        this.configureNotifications();
    };

    handleNotification = notification => {
        console.log('Sourav Logging:::: In handle Notifcaiton', notification);
        NetworkHandler.poll();
        Bot.grpcheartbeatCatalog();
        let conversation;
        if (!notification.foreground && notification.userInteraction) {
            const conversationId =
                Platform.OS === 'android'
                    ? notification.conversationId
                    : notification.data.conversationId;
            PushNotification.setApplicationIconBadgeNumber(0);
            Conversation.getConversation(conversationId)
                .then(conv => {
                    conversation = conv;
                    return SystemBot.get(SystemBot.imBotManifestName);
                })
                .then(imBot => {
                    if (conversation.type === IM_CHAT) {
                        if (
                            Actions.currentScene ===
                            ROUTER_SCENE_KEYS.peopleChat
                        ) {
                            if (
                                ReduxStore.getState().user
                                    .currentConversationId !==
                                conversation.conversationId
                            ) {
                                Actions.refresh({
                                    key: Math.random(),
                                    bot: imBot,
                                    conversation: conversation
                                    // onBack: this.props.onBack
                                });
                            }
                        } else {
                            Actions.peopleChat({
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                    } else {
                        if (
                            Actions.currentScene ===
                            ROUTER_SCENE_KEYS.channelChat
                        ) {
                            if (
                                ReduxStore.getState().user
                                    .currentConversationId !==
                                conversation.conversationId
                            ) {
                                Actions.refresh({
                                    key: Math.random(),
                                    bot: imBot,
                                    conversation: conversation
                                    // onBack: this.props.onBack
                                });
                            }
                        } else {
                            Actions.channelChat({
                                bot: imBot,
                                conversation: conversation
                                // onBack: this.props.onBack
                            });
                        }
                    }
                });
        }
        if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    };

    userLoggedInHandler = async () => {
        TwilioVoIP.init();
    };

    userLoggedOutHandler = async () => {
        //this.showOnboardingScreen();
        Actions.swiperScreen({
            type: ActionConst.REPLACE,
            swiperIndex: 4
        });
    };

    goToLoginPage = () => {
        Actions.swiperScreen({ type: ActionConst.REPLACE, swiperIndex: 0 });
    };

    showMainScreen = (moveToOnboarding = false) => {
        syncNoNetwork();
        Actions.replace('tabbar');
        // Actions.homeMain({
        //     type: ActionConst.REPLACE,
        //     moveToOnboarding: moveToOnboarding
        // });
        return;
    };

    listenToEvents = async () => {
        // For now the user should not be taken back
        EventEmitter.addListener(
            AuthEvents.userLoggedIn,
            this.userLoggedInHandler
        );
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
        EventEmitter.addListener(
            NotificationEvents.registeredNotifications,
            this.notificationRegistrationHandler
        );

        if (Platform.OS === 'ios') {
            this.configureNotifications();
        }
    };

    removeListeners = () => {
        EventEmitter.removeListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
        EventEmitter.removeListener(
            NotificationEvents.registeredNotifications,
            this.notificationRegistrationHandler
        );
    };

    connectToTelnet = async () => {
        var delegate = {
            commandResult: function(obj) {}
        };
        let connection = new Telnet(delegate);

        let params = {
            host: '138.68.143.237',
            port: 8080,
            timeout: 1500,
            debug: true,
            negotiationMandatory: false,
            username: 'test',
            password: 'magic:telnet:Password6767',
            shellPrompt: 'test@frustoo-home:~$ '
        };
        await connection.connect(params);
        connection.exec('date');
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    hidden={false}
                    backgroundColor="grey"
                    barStyle={
                        Platform.OS === 'ios' ? 'dark-content' : 'light-content'
                    }
                />
                <Image
                    style={styles.imageStyle}
                    source={Icon}
                    resizeMode={'contain'}
                />
                {
                    <Spinner
                        visible={this.state.loading}
                        textContent={this.state.loadingText}
                    />
                }
            </View>
        );
    }
}
