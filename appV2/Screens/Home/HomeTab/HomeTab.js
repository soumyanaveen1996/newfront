import React from 'react';
import {
    View,
    StatusBar,
    Text,
    Platform,
    NativeModules,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Notifications } from 'react-native-notifications';
import { connect } from 'react-redux';
import * as RNLocalize from 'react-native-localize';
import RNCallKeep, { Events } from 'react-native-callkeep';
import { MainScreenStyles } from './styles';
import I18n from '../../../config/i18n/i18n';
import {
    AsyncResultEventEmitter,
    NETWORK_EVENTS_CONSTANTS
} from '../../../lib/network';
import EventEmitter, {
    MessageEvents,
    AuthEvents,
    CallQuotaEvents
} from '../../../lib/events';
import Auth from '../../../lib/capability/Auth';
import Notification from '../../../lib/capability/Notification';
import {
    PollingStrategyTypes,
    Settings,
    Contact,
    CallQuota,
    DeviceStorage,
    Message,
    Utils
} from '../../../lib/capability';
import { Conversation } from '../../../lib/conversation';

import Bot from '../../../lib/bot';
import { DataManager } from '../../../lib/DataManager';
import { ContactsCache } from '../../../lib/ContactsCache';
// import { MessageCounter } from '../../../lib/MessageCounter';
import { BackgroundImage } from '../../../widgets/BackgroundImage';
import TourScreen from './TourScreen/TourScreen';
import {
    logout,
    refreshTimeline,
    setCurrentScene,
    setNetwork,
    setNetworkMsgUI
} from '../../../redux/actions/UserActions';
import Store from '../../../redux/store/configureStore';
import { NetworkStatusNotchBar } from '../../../widgets/NetworkStatusBar';
import SatelliteConnectionEvents from '../../../lib/events/SatelliteConnection';
import UserServices from '../../../apiV2/UserServices';
import { Twilio } from '../../../lib/twilio';
import BotList from './BotList';
import TimelineEvents from '../../../lib/events/TimelineEvents';
import GlobalColors from '../../../config/styles';
import RemoteBotInstall from '../../../lib/RemoteBotInstall';

import { Connection } from '../../../lib/events/Connection';
import BackgroundMessageSender from '../../../lib/BackgroundTask/BackgroundMessageSender';
import { VideoCalls } from '../../../lib/calls';
import { ChatStatusBar } from '../../../widgets';
import NavigationAction from '../../../navigation/NavigationAction';

const { FrontMUtils } = NativeModules;
import _ from 'lodash';
import DomainEvents from '../../../lib/events/DomainEvents';
import { synchronizeUserData } from '../../../lib/UserData/SyncData';
import configToUse from '../../../config/config';
import WebsocketQueueClient from '../../../lib/network/WebsocketQueueClient';
import { BotChat } from '../../Chat';
import dce from '../../../lib/dce';
import logtail from '../../../lib/utils/Logging';
import AlertDialog from '../../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import VideoCallsAndroid from '../../../lib/calls/VideoCallsAndroid';

const HANDLED_MEDIA_SESSIONS = {};
let PENDING_NOTIFICATION = true;

const MainScreenStates = {
    notLoaded: 'notLoaded',
    authenticated: 'authenticated',
    unauthenticated: 'unauthenticated'
};

let firstTimer = false;
EventListener = [];

class HomeTab extends React.Component {
    constructor(props) {
        super(props);
        // Susbscribe to async result handler
        this.eventSubscription = null;
        this.state = {
            loginState: false,
            screenState: MainScreenStates.notLoaded,
            firstTimer: false,
            noChats: false,
            showNetworkStatusBar: false,
            network: null,
            searchString: '',
            callQuota: 0,
            callQuotaUpdateError: false,
            updatingCallQuota: true,
            firstCheckDone: false,
            downloadingInitialBot: false
        };
        this.toastRef = React.createRef();
        console.log('### new login prop ', this.props.route.params?.newlogin);
        AsyncStorage.getItem('existingUser').then((existingUser) => {
            console.log('### get the first time user details ', existingUser);
            if (existingUser) {
                this.setState({ firstTimer: false }, () => {
                    firstTimer = this.state.firstTimer;
                    this.showPermission();
                });
            } else {
                this.setState({ firstTimer: true }, () => {
                    firstTimer = this.state.firstTimer;
                });
                AsyncStorage.setItem('existingUser', 'true');
            }
        });
    }

    componentDidCatch = (error, errorInfo) => {
        console.log('Caught Error');
    };

    showConnectionMessage = (connectionType) => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        AlertDialog.show(I18n.t('Automatic_Network'), message);
    };

    updateInstalledBot = () => {
        console.log('updateInstalledBot1');
        AsyncStorage.getItem('BOT_UPDATE_TIMELINE').then(async (time) => {
            console.log('updateInstalledBot2');
            if (time != null) {
                const now = new Date().getTime();
                const hours = Math.abs(now - parseInt(time)) / 36e5;
                if (hours > 24) {
                    console.log('updateInstalledBot');
                    await RemoteBotInstall.syncronizeBots(true);
                    await this.update(false, 'updateInstalledBot');
                }
            } else {
                AsyncStorage.setItem(
                    'BOT_UPDATE_TIMELINE',
                    new Date().getTime().toString()
                );
            }
        });
    };

    async fetchTimeline() {
        this.updateInstalledBot();
        this.update(false, 'fetchTimeline');
        Auth.isPostPaidUser().then(
            (isPostPaidUser) => {
                this.setState({ prepaidUser: !isPostPaidUser });
            },
            () => {
                Twilio.isPostpaidUser(user)
                    .then((isPostpaidUser) => {
                        this.setState({ prepaidUser: !isPostpaidUser });
                        Auth.setPostPaidUser(isPostpaidUser);
                    })
                    .catch((e) => {
                        this.setState({ prepaidUser: true });
                    });
            }
        );
        this.getBalance();
    }

    async updateTimeline() {
        await DeviceStorage.deleteItems(['timeline', 'timeline_data']);
        await synchronizeUserData();
        this.update(true, 'fromUpdateTimeline');
    }

    async componentDidMount() {
        if (Platform.OS === 'android') {
            const { initialProps } = this.props.route.params || {};
            VideoCallsAndroid.handleInitialCalls(initialProps);
        }
        this.props.navigation.setParams({
            domain: this.props.appState.currentDomain
        });
        if (Platform.OS === 'ios') {
            RNCallKeep.getInitialEvents().then((events) => {
                console.log('CallKeep events: ', events);
                if (events.length > 0) {
                    const display = events.find(
                        (event) =>
                            event.name === 'RNCallKeepDidDisplayIncomingCall'
                    );
                    const answer = events.find(
                        (event) =>
                            event.name === 'RNCallKeepPerformAnswerCallAction'
                    );
                    if (answer) {
                        VideoCalls.handleAnswerCall(
                            answer.data,
                            true,
                            display?.data
                        );
                    } else {
                    }
                }
            });
        }
        this.fetchTimeline();
        // this.updateInstalledBot();

        const { user } = this.props;
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (!isUserLoggedIn) {
            return this.userLoggedOutHandler();
        }
        this.launchInitialBotIfRequired();
        this.setState({ screenState: MainScreenStates.authenticated });
        console.log('+++Run later...');
        AsyncStorage.setItem('signupStage', 'done');
        AsyncStorage.setItem('userEmail', '');

        if (this.props.navigation) {
            this.props.navigation.setParams({
                openBotFilter: this.openBotFilter
            });
        }
        this.domainEventLister = EventEmitter.addListener(
            DomainEvents.domainChanged,
            async () => {
                this.onSearch('');
            }
        );
        this.eventSubscription = AsyncResultEventEmitter.addListener(
            NETWORK_EVENTS_CONSTANTS.result,
            this.handleAsyncMessageResult
        );
        this.props.navigation.setParams({
            refresh: this.readLambdaQueue,
            showConnectionMessage: this.showConnectionMessage
        });
        this.messageListener = EventEmitter.addListener(
            MessageEvents.messagePersisted,
            this.handleAsyncMessageResult
        );

        // this.removeEventListener = Network.addConnectionChangeEventListener(
        //     this.handleConnectionChange.bind(this)
        // );
        this.networkListener = EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleConnectionChange
        );
        EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
        EventEmitter.addListener(
            CallQuotaEvents.UPDATED_QUOTA,
            this.handleCallQuotaUpdateSuccess
        );
        EventEmitter.addListener(
            CallQuotaEvents.UPD_QUOTA_ERROR,
            this.handleCallQuotaUpdateFailure
        );

        this.refreshTimelineListener = EventEmitter.addListener(
            TimelineEvents.refreshTimeline,
            this.refreshTheTimeline
        );

        this.updateTimelineListener = EventEmitter.addListener(
            TimelineEvents.updateTimelineView,
            this.updateTimelineView
        );

        const notification = await Notifications.getInitialNotification();
        console.log('Initial notification : ', notification);
        if (notification && PENDING_NOTIFICATION) {
            console.log('+++++++ pendingNotification, calling handle again');
            PENDING_NOTIFICATION = false;
            Notification.handleNotification(notification);
        }
        // for checking and setting timezone automatic
        this.localizeListener = RNLocalize.addEventListener(
            'change',
            this.handleLocalizationChange
        );
        this.handleLocalizationChange();
        if (this.props.appState.networkMsgUI) {
            this.setState({ showNetworkStatusBar: true, network: 'none' });
        }
    }

    handleLocalizationChange = () => {
        AsyncStorage.getItem('@TIME_ZONE_SETTINGS')
            .then(async (res) => {
                if (res) {
                    let timeZoneSettings = JSON.parse(res);
                    if (timeZoneSettings.settingsTimezone) {
                        const user = Auth.getUserData();
                        let newTimeZone = await RNLocalize.getTimeZone();
                        if (
                            user?.info?.userTimezone &&
                            newTimeZone !== user.info.userTimezone
                        ) {
                            Auth.updateUserDetailsForTimeZone(newTimeZone)
                                .then((res) => {
                                    Auth.saveAndUpdateProfile(
                                        'userSession',
                                        res
                                    )
                                        .then(async (res2) => {
                                            await AsyncStorage.setItem(
                                                '@TIME_ZONE_SETTINGS',
                                                JSON.stringify({
                                                    settingsTimezone: true,
                                                    timeZone: newTimeZone
                                                })
                                            );
                                        })
                                        .catch((err1) => {
                                            console.log(
                                                'the errr-timezone--3333',
                                                err1
                                            );
                                        });
                                })
                                .catch((err2) => {
                                    console.log('the errr--timezone-444', err2);
                                });
                        }
                    }
                }
            })
            .catch((err) => {
                console.log('the errr--timezone-555', err2);
            });
    };

    launchInitialBotIfRequired = () => {
        if (configToUse.app.landingBot) {
            const selectedDomainData = this.props.domains.find(
                (dom) => dom.userDomain === this.props.domain
            );
            if (selectedDomainData && selectedDomainData.landingBotId) {
                if (WebsocketQueueClient.isConnected()) {
                    this.openLandingBot(selectedDomainData);
                } else {
                    const socketListener = EventEmitter.addListener(
                        TimelineEvents.socketConnected,
                        () => {
                            this.openLandingBot(selectedDomainData);
                            socketListener.remove();
                        }
                    );
                    console.log(
                        'Launching:::: socket not ready launch bot wait'
                    );
                }
            } else {
                console.log('Launching:::: no launch bot');
            }
        }
    };

    openBot = (targetBot) => {
        this.setState({
            showbot: true,
            targetBot: targetBot,
            downloadingInitialBot: false
        });
        this.props.navigation.setParams({
            title: targetBot.botName
        });
    };

    openLandingBot = (selectedDomainData) => {
        this.setState({ downloadingInitialBot: true });
        if (this.props.appState.remoteBotsInstalled) {
            Bot.getInstalledBots().then((bots) => {
                const targetBot = bots.find(
                    (bot) => bot.botId === selectedDomainData.landingBotId
                );

                if (targetBot) {
                    this.openBot(targetBot);
                } else {
                    const dceBot = dce.bot({
                        botId: selectedDomainData.landingBotId
                    });
                    Bot.install(dceBot).then(() => {
                        Bot.getInstalledBots().then((bots2) => {
                            const targetBot2 = bots2.find(
                                (bot) =>
                                    bot.botId ===
                                    selectedDomainData.landingBotId
                            );
                            this.openBot(targetBot2);
                        });
                    });
                }
            });
        } else {
            const botsynchListener = EventEmitter.addListener(
                TimelineEvents.botSyncDone,
                () => {
                    Bot.getInstalledBots().then((bots) => {
                        const targetBot = bots.find(
                            (bot) =>
                                bot.botId === selectedDomainData.landingBotId
                        );

                        if (targetBot) {
                            this.openBot(targetBot);
                        }
                    });
                    botsynchListener.remove();
                }
            );
        }
    };

    onTourClose = () => {
        this.showPermission();
    };

    showPermission = () => {
        AsyncStorage.getItem('newLogin').then((newLogin) => {
            if (newLogin === 'yes') {
                AsyncStorage.setItem('newLogin', 'no');
                NavigationAction.push(
                    NavigationAction.SCREENS.PermissionRequest
                );
            }
        });
        this.setState({ firstCheckDone: true }, () => {});
    };

    refreshTheTimeline = (data) => {
        this.update(false, 'fromRefreshTimeline');
    };

    updateTimelineView = () => {
        this.update();
    };

    getBalance() {
        this.setState({ updatingCallQuota: true }, async () => {
            try {
                UserServices.getUserBalance().then(({ callQuota, error }) => {
                    this.setState({
                        callQuota: callQuota,
                        updatingCallQuota: false,
                        callQuotaUpdateError: false
                    });
                    if (error === 0) {
                        DeviceStorage.save(
                            CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                            callQuota
                        );
                    }
                });
            } catch (error) {
                try {
                    const newBalance = await CallQuota.getBalanceLocal();
                    this.setState({
                        callQuota: newBalance,
                        updatingCallQuota: false,
                        callQuotaUpdateError: false
                    });
                } catch (e) {
                    this.setState({
                        updatingCallQuota: false,
                        callQuotaUpdateError: true
                    });
                }
            }
        });
    }

    handleCallQuotaUpdateSuccess = (callQuota) => {
        this.setState({
            callQuota,
            updatingCallQuota: false,
            callQuotaUpdateError: false
        });
    };

    handleCallQuotaUpdateFailure = (error) => {
        this.setState({
            updatingCallQuota: false,
            callQuotaUpdateError: true
        });
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Home');
    }

    componentDidUpdate(prevProps) {
        // if (
        //     prevProps.appState.timelineBuild !==
        //         this.props.appState.timelineBuild &&
        //     !this.props.appState.timelineBuild
        // ) {
        //     console.log(
        //         'TImeline has been Rebuild ... RERESH',
        //         this.props.appState.timelineBuild,
        //         prevProps.appState.timelineBuild
        //     );
        //     return this.update(false, 'componentDidUpdate--timelineBuild');
        // }

        if (
            prevProps.appState.currentDomain !=
            this.props.appState.currentDomain
        ) {
            this.props.navigation.setParams({
                domain: this.props.appState.currentDomain
            });
            this.updateTimeline();
        }

        if (
            prevProps.appState.remoteBotsInstalled !==
            this.props.appState.remoteBotsInstalled
        ) {
            console.log('Refreshing remoteBotsInstalled to this.update');
            return this.update(
                false,
                'componentDidUpdate--remoteBotsInstalled'
            );
        }

        if (
            prevProps.appState.allConversationsLoaded !==
            this.props.appState.allConversationsLoaded
        ) {
            console.log('Refreshing allConversationsLoaded to this.update');
            return this.update(
                false,
                'componentDidUpdate--allConversationsLoaded'
            );
        }
        if (
            prevProps.appState.refreshTimeline !==
            this.props.appState.refreshTimeline
        ) {
            console.log('Refreshing timeline to this.update');
            return this.update(false, 'componentDidUpdate--refreshTimeline');
        }
    }

    static async onEnter() {
        Store.dispatch(setCurrentScene('Home'));
        Store.dispatch(refreshTimeline(true));
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Home'));
        console.log('coming back from other page on enter');
        await Contact.refreshContacts();
    }

    static onExit() {
        // if (Actions.refs.timeline) {
        //     Actions.refs.timeline
        //         .getWrappedInstance()
        //         .keyboardDidShowListener.remove()
        // }
        Store.dispatch(refreshTimeline(false));
        Store.dispatch(setCurrentScene('none'));
    }

    userLoggedOutHandler = async () => {
        await DataManager.init();
        await ContactsCache.init();
        // await MessageCounter.init();
        DeviceStorage.deleteItems(['timeline', 'timeline_data']);
        DeviceStorage.delete('channels');
        DeviceStorage.delete('catalog');
        const networkState = this.props.appState.network;
        this.props.logout();
        this.props.setNetowrk(networkState);

        //TODO: implemet this
        // Actions.main({
        //     type: ActionConst.RESET,
        //     swiperIndex: 4
        // });
    };

    readLambdaQueue = () => {
        // NetworkHandler.readLambda();
    };

    setNoChats = (value) => this.setState({ noChats: value });

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

    checkPollingStrategy = () => {
        Settings.getPollingStrategy().then((pollingStrategy) =>
            this.showButton(pollingStrategy)
        );
    };

    update = async (force = false, from = 'godknows') => {
        const bots = await Bot.getInstalledBots();
        this.setState({ bots }, () => {
            if (this.botList) {
                this.botList.refresh(force, from);
            }
        });
        this.checkPollingStrategy();
    };

    componentWillUnmount = () => {
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        this.domainEventLister?.remove();
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.messageListener) {
            this.messageListener.remove();
            this.messageListener = null;
        }
        if (this.removeEventListener) this.removeEventListener();

        if (this.refreshTimelineListener) {
            this.refreshTimelineListener.remove();
            this.refreshTimelineListener = null;
        }
        this.updateTimelineListener?.remove();
        this.updateTimelineListener = null;
        this.networkListener?.remove();
        this.localizeListener?.remove();
    };

    openContacts = () => {
        this.floatingButton.reset(true);
        NavigationAction.push(NavigationAction.SCREENS.addContacts);
    };

    // Use this when favorites is ready
    openFavorites = () => {
        this.floatingButton.reset(true);
        NavigationAction.push(NavigationAction.SCREENS.favoriteMessage);
    };

    handleAsyncMessageResult = (event) => {
        if (
            event &&
            NavigationAction.currentScreen === NavigationAction.SCREENS.home
        ) {
        }
    };

    openBotStore = () => {
        this.floatingButton.reset(true);
        NavigationAction.push(NavigationAction.SCREENS.catelog);
    };

    openBotFilter = () => {
        NavigationAction.push(NavigationAction.SCREENS.botFilter);
    };

    openOnboaringBot = () => {
        // SystemBot.get(SystemBot.assistant).then(
        //     onboardingBot => {
        //         Actions.bot({
        //             bot: onboardingBot,
        //             onBack: this.onBack.bind(this)
        //         });
        //     }
        // );
        NavigationAction.push(NavigationAction.SCREENS.settings);
    };

    openConfigure = () => {
        this.floatingButton.reset(true);
        this.openOnboaringBot();
    };

    satelliteConnectionHandler = () => {
        if (this.state.network !== 'satellite') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'satellite'
            });
        }
    };

    satelliteDisconnectHandler = () => {
        if (this.state.network === 'satellite') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    handleConnectionChange = (connection) => {
        console.log('handleConnectionChange main', connection);
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else if (this.state.network === 'none') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    onChatStatusBarClose = () => {
        this.setState({
            showNetworkStatusBar: false
        });
        Store.dispatch(setNetworkMsgUI(false));
    };

    setConversationFavorite = (
        conversation,
        chatData = undefined,
        type,
        otherUserId,
        domain
    ) => {
        console.log('Setting favorite..', conversation, type, chatData);

        let data;

        if (type === 'conversation') {
            data = {
                type,
                conversationId: conversation,
                action: 'add',
                userDomain: domain ? domain : 'frontmai'
            };
        } else if (type === 'channel') {
            data = {
                type,
                channelConvId: conversation,
                channelName: chatData.channel.channelName,
                action: 'add',
                userDomain: chatData.channel.userDomain
            };
        } else {
            data = {
                type,
                botId: conversation,
                action: 'add',
                userDomain: domain ? domain : 'frontmai'
            };
        }
        this.performSetFavAction(data, otherUserId);
    };

    performSetFavAction = (data, otherUserId) => {
        Conversation.setFavorite(data, this.update)
            .then(() => {
                console.log('Conversation Set as favorite');
                Contact.getAddedContacts().then((contactsData) => {
                    const updateContacts = contactsData.map((elem) => {
                        if (elem.userId === otherUserId) {
                            elem.isFavourite = true;
                        }

                        return elem;
                    });
                    Contact.saveContacts(updateContacts);
                });
            })
            .catch((err) => {
                console.log('Cannot set un favorite', err);
                if (data.action === 'remove') data.action = 'add';
                else data.action = 'remove';
                Conversation.setFavorite(data, this.update, true);
                Toast.show({
                    text1: 'Something went wrong. Please try again later.'
                });
            });
    };
    setConversationUnFavorite = (
        conversation,
        chatData = undefined,
        type,
        otherUserId,
        domain
    ) => {
        console.log('Setting unfavorite..', conversation, type, chatData);

        let data;

        if (type === 'conversation') {
            data = {
                type,
                conversationId: conversation,
                action: 'remove',
                userDomain: domain ? domain : 'frontmai'
            };
        } else if (type === 'channel') {
            data = {
                type,
                channelConvId: conversation,
                channelName: chatData.channel.channelName,
                action: 'remove',
                userDomain: chatData.channel.userDomain
            };
        } else {
            data = {
                type,
                botId: conversation,
                action: 'remove',
                userDomain: domain ? domain : 'frontmai'
            };
        }
        this.performSetFavAction(data, otherUserId);
    };

    contentLoading = () => {
        const { allConversationsLoaded, remoteBotsInstalled } =
            this.props.appState;

        return false;
    };

    onSearch = (searchString) => this.setState({ searchString });

    renderMain() {
        const { firstCheckDone } = this.state;

        if (this.state.showbot) {
            return (
                <View style={{ height: '100%' }}>
                    <BotChat
                        route={{
                            params: {
                                bot: this.state.targetBot,
                                hideBack: true
                            }
                        }}
                    />
                </View>
            );
        }
        return (
            <BotList
                ref={(connectedBot) => {
                    this.botList = connectedBot;
                }}
                canShowLoader={this.state.firstCheckDone}
                bots={this.state.bots}
                setFavorite={this.setConversationFavorite}
                unsetFavorite={this.setConversationUnFavorite}
                searchString={this.state.searchString}
                onSearch={this.onSearch}
                setNoChats={this.setNoChats}
                updateTimeline={this.update}
                downloadingInitialBot={this.state.downloadingInitialBot}
            />
        );
    }

    displayButton = () => {
        firstTimer = false;

        console.log('this is being called', firstTimer);
    };

    renderCreditBar() {
        return (
            <View style={MainScreenStyles.creditBar}>
                <Text style={MainScreenStyles.creditText}>
                    {`Balance: $${
                        this.state.updatingCallQuota ||
                        this.state.callQuotaUpdateError
                            ? '...'
                            : this.state.callQuota.toFixed(2)
                    }`}
                </Text>
                {this.state.updatingCallQuota ? null : (
                    <Text
                        onPress={() => {
                            if (!this.state.updatingCallQuota) {
                                NavigationAction.push(
                                    NavigationAction.SCREENS.getCredit,
                                    {
                                        currentBalance: this.state.callQuota,
                                        updateCallBack: (newBalance) =>
                                            this.setState({
                                                callQuota: newBalance
                                            })
                                    }
                                );
                            }
                        }}
                        style={MainScreenStyles.getCredit}
                    >
                        {I18n.t('Top_Up')}
                    </Text>
                )}
            </View>
        );
    }

    render() {
        // console.log('first timer ', this.state.firstTimer);
        // console.log('In Rendering Main Screen');

        return (
            <SafeAreaView style={{ flex: 1 }}>
                {/*{this.state.prepaidUser*/}
                {/*    && config.showTopUp*/}
                {/*    && this.renderCreditBar()}*/}
                <StatusBar
                    animated
                    backgroundColor={GlobalColors.appBackground}
                    barStyle="dark-content"
                />
                <BackgroundImage
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {this.state.firstTimer && (
                        <TourScreen
                            showNetwork={this.displayButton}
                            onClose={this.onTourClose}
                        />
                    )}
                    {/* <StatusBar
                        hidden={false}
                        backgroundColor="grey"
                        barStyle={
                            Platform.OS === 'ios'
                                ? 'dark-content'
                                : 'light-content'
                        }
                    /> */}

                    <View>
                        {this.state.showNetworkStatusBar && (
                            <NetworkStatusNotchBar
                                onChatStatusBarClose={this.onChatStatusBarClose}
                            />
                        )}
                    </View>
                    <View>{this.renderMain()}</View>
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    appState: state.user,
    user: state.session.user,
    domain: state.user.currentDomain,
    domains: state.user.userDomains
});

const mapDispatchToProps = (dispatch) => ({
    logout: () => dispatch(logout()),
    setNetowrk: (network) => dispatch(setNetwork(network))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(HomeTab);
