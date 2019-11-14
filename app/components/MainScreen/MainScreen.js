import React from 'react';
import {
    View,
    Alert,
    AsyncStorage,
    TouchableOpacity,
    Image,
    Text,
    NativeModules
} from 'react-native';
import BotList from './BotList';
import { SafeAreaView } from 'react-navigation';
import { MainScreenStyles } from './styles';
import images from '../../config/images';
import I18n from '../../config/i18n/i18n';
import { Actions, ActionConst } from 'react-native-router-flux';
import CenterComponent from './header/CenterComponent';
import {
    AsyncResultEventEmitter,
    NETWORK_EVENTS_CONSTANTS
} from '../../lib/network';
import EventEmitter, {
    MessageEvents,
    AuthEvents,
    CallQuotaEvents
} from '../../lib/events';
import Auth from '../../lib/capability/Auth';
import {
    PollingStrategyTypes,
    Settings,
    Network,
    Contact,
    Message,
    MessageTypeConstants,
    CallQuota
} from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import Bot from '../../lib/bot';
import SystemBot from '../../lib/bot/SystemBot';
import { Icons } from '../../config/icons';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { DataManager } from '../../lib/DataManager';
import { ContactsCache } from '../../lib/ContactsCache';
import { MessageCounter } from '../../lib/MessageCounter';
import { BackgroundImage } from '../../components/BackgroundImage';
import { TourScreen } from '../TourScreen';
import { connect } from 'react-redux';
import {
    logout,
    refreshTimeline,
    setCurrentScene
} from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import SatelliteConnectionEvents from '../../lib/events/SatelliteConnection';
import ChatStatusBar from '../ChatBotScreen/ChatStatusBar';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import UserServices from '../../api/UserServices';

const MainScreenStates = {
    notLoaded: 'notLoaded',
    authenticated: 'authenticated',
    unauthenticated: 'unauthenticated'
};

let firstTimer = false;
EventListener = [];
const UserServiceClient = NativeModules.UserServiceClient;

class MainScreen extends React.Component {
    static navigationOptions({ navigation }) {
        let ret = {
            headerTitle: (
                <CenterComponent
                    accessibilityLabel="FrontM Logo"
                    testID="frontm-logo"
                />
            )
        };
        // if (appConfig.app.hideFilter !== true) {
        //     ret.headerRight = (
        //         <HeaderLeftIcon
        //             config={Config.filterButtonConfig}
        //             onPress={state.params.openBotFilter}
        //         />
        //     );
        // }

        ret.headerLeft = (
            <TouchableOpacity
                onPress={navigation.state.params.openFrontMAssistant}
                accessibilityLabel="FrontM Assistant"
                testID="frontm-assistant"
            >
                <Image
                    accessibilityLabel="FrontM Assistant"
                    testID="frontm-assistant"
                    style={{
                        height: 35,
                        aspectRatio: 1,
                        marginHorizontal: 17,
                        resizeMode: 'contain'
                    }}
                    source={images.header_assistant_icon}
                />
            </TouchableOpacity>
        );

        ret.headerRight = (
            <TouchableOpacity
                style={MainScreenStyles.headerRightCall}
                accessibilityLabel="Call Icon"
                testID="call-icon"
                accessibilityLabel="Call Button"
                testID="call-button"
                onPress={() =>
                    Actions.tabBarCall({
                        type: 'push'
                    })
                }
            >
                {Icons.greenCall({ size: 25 })}
            </TouchableOpacity>
        );

        return ret;
    }

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
            updatingCallQuota: true
        };
    }

    componentDidCatch(error, errorInfo) {
        console.log('Caught Error');
    }

    showConnectionMessage(connectionType) {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Automatic_Network'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    }

    async componentDidMount() {
        this.props.navigation.setParams({
            openFrontMAssistant: () => {
                this.openOnboaringBot();
            }
        });
        await AsyncStorage.setItem('signupStage', 'done');
        await AsyncStorage.setItem('userEmail', '');
        let existingUser = await AsyncStorage.getItem('existingUser');
        console.log('get the first time user details ', existingUser);

        if (existingUser) {
            this.setState({ firstTimer: false }, () => {
                firstTimer = this.state.firstTimer;
            });
        } else {
            this.setState({ firstTimer: true }, () => {
                firstTimer = this.state.firstTimer;
            });
            AsyncStorage.setItem('existingUser', 'true');
        }

        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (!isUserLoggedIn) {
            this.userLoggedOutHandler();
        }
        if (this.props.navigation) {
            this.props.navigation.setParams({
                openBotFilter: this.openBotFilter.bind(this)
            });
        }
        this.eventSubscription = AsyncResultEventEmitter.addListener(
            NETWORK_EVENTS_CONSTANTS.result,
            this.handleAsyncMessageResult.bind(this)
        );
        this.update();
        this.props.navigation.setParams({
            refresh: this.readLambdaQueue.bind(this),
            showConnectionMessage: this.showConnectionMessage.bind(this)
        });
        this.messageListener = EventEmitter.addListener(
            MessageEvents.messagePersisted,
            this.handleAsyncMessageResult.bind(this)
        );

        // TwilioVoIP.init();

        Network.addConnectionChangeEventListener(this.handleConnectionChange);
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
        this.getBalance();
    }

    getBalance() {
        this.setState({ updatingCallQuota: true }, async () => {
            try {
                const newBalance = await UserServices.getUserBalance();
                this.setState({
                    callQuota: newBalance,
                    updatingCallQuota: false,
                    callQuotaUpdateError: false
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

    handleCallQuotaUpdateSuccess = callQuota => {
        this.setState({
            callQuota,
            updatingCallQuota: false,
            callQuotaUpdateError: false
        });
    };

    handleCallQuotaUpdateFailure = error => {
        this.setState({
            updatingCallQuota: false,
            callQuotaUpdateError: true
        });
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Home');
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.remoteBotsInstalled !==
            this.props.appState.remoteBotsInstalled
        ) {
            this.update();
        }

        if (
            prevProps.appState.allConversationsLoaded !==
            this.props.appState.allConversationsLoaded
        ) {
            this.update();
        }
        if (
            prevProps.appState.refreshTimeline !==
            this.props.appState.refreshTimeline
        ) {
            this.update();
        }
    }

    static onEnter() {
        Store.dispatch(setCurrentScene('Home'));
        Store.dispatch(refreshTimeline(true));
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Home'));
        console.log('coming back from other page');
    }

    static onExit() {
        // if (Actions.refs.timeline) {
        //     Actions.refs.timeline
        //         .getWrappedInstance()
        //         .keyboardDidShowListener.remove()
        // }
        Store.dispatch(refreshTimeline(false));
        Store.dispatch(setCurrentScene('none'));
        if (!Store.getState().user.allConversationsLoaded) {
            // Conversation.downloadRemoteConversations();
        }
        if (!Store.getState().user.remoteBotsInstalled) {
            // RemoteBotInstall.syncronizeBots();
        }
    }

    userLoggedOutHandler = async () => {
        await DataManager.init();
        await ContactsCache.init();
        await MessageCounter.init();
        this.props.logout();

        Actions.swiperScreen({
            type: ActionConst.REPLACE,
            swiperIndex: 4
        });
    };

    readLambdaQueue() {
        // NetworkHandler.readLambda();
    }

    setNoChats = value => this.setState({ noChats: value });
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

    async checkPollingStrategy() {
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    }

    update = async () =>
        new Promise(async resolve => {
            const userLoggedIn = await Auth.isUserLoggedIn();
            const botsList = userLoggedIn
                ? await Bot.getInstalledBots()
                : await Promise.resolve(SystemBot.getDefaultBots());
            const authStatus = userLoggedIn
                ? MainScreenStates.authenticated
                : MainScreenStates.unauthenticated;
            this.setState({ screenState: authStatus, bots: botsList });
            if (this.botList) {
                await this.botList.refresh();
            }
            this.checkPollingStrategy();
            resolve();
        });

    componentWillUnmount = () => {
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.messageListener) {
            this.messageListener.remove();
            this.messageListener = null;
            // EventEmitter.removeEventListener(MessageEvents.messagePersisted, this.handleAsyncMessageResult.bind(this))
        }
    };

    openContacts() {
        this.floatingButton.reset(true);
        Actions.addContacts({ onBack: this.onBack.bind(this) });
    }

    async onBack() {
        // this.update()
    }

    // Use this when favorites is ready
    openFavorites() {
        this.floatingButton.reset(true);
        Actions.favoriteMessage({ onBack: this.onBack.bind(this) });
    }

    handleAsyncMessageResult(event) {
        if (event && Actions.currentScene === ROUTER_SCENE_KEYS.timeline) {
            this.update();
            // this.refs.botList.refresh();
        }
    }

    openBotStore() {
        this.floatingButton.reset(true);
        Actions.botStore({ onBack: this.onBack.bind(this) });
    }

    openConversations() {
        this.floatingButton.reset(true);
        Actions.conversations();
    }

    openChannels() {
        this.floatingButton.reset(true);
        Actions.channelsList({ onBack: this.onBack.bind(this) });
    }

    openBotFilter() {
        Actions.botFilter();
    }

    openOnboaringBot() {
        SystemBot.get(SystemBot.onboardingBotManifestName).then(
            onboardingBot => {
                Actions.botChat({
                    bot: onboardingBot,
                    onBack: this.onBack.bind(this)
                });
            }
        );
    }

    openConfigure() {
        this.floatingButton.reset(true);
        this.openOnboaringBot();
    }

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

    handleConnectionChange = connection => {
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else {
            if (this.state.network === 'none') {
                this.setState({
                    showNetworkStatusBar: false,
                    network: 'connected'
                });
            }
        }
    };

    onChatStatusBarClose = () => {
        this.setState({
            showNetworkStatusBar: false
        });
    };

    setConversationFavorite = (
        conversation,
        chatData = undefined,
        type,
        otherUserId
    ) => {
        console.log('Setting favorite..', conversation, type, chatData);

        let data;

        if (type === 'conversation') {
            data = {
                type: type,
                conversationId: conversation,
                action: 'add',
                userDomain: 'frontmai'
            };
        } else if (type === 'channel') {
            data = {
                type: type,
                channelConvId: conversation,
                channelName: chatData.channel.channelName,
                action: 'add',
                userDomain: chatData.channel.userDomain
            };
        } else {
            data = {
                type: type,
                botId: conversation,
                action: 'add',
                userDomain: 'frontmai'
            };
        }

        Conversation.setFavorite(data)
            .then(() => {
                console.log('Conversation Set as favorite');
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.map(elem => {
                        if (elem.userId === otherUserId) {
                            elem.isFavourite = true;
                        }

                        return elem;
                    });
                    Contact.saveContacts(updateContacts);
                });
                this.update();
            })
            .catch(err => console.log('Cannot set favorite', err));
    };

    setConversationUnFavorite = (
        conversation,
        chatData = undefined,
        type,
        otherUserId
    ) => {
        console.log('Setting unfavorite..', conversation, type, chatData);

        let data;

        if (type === 'conversation') {
            data = {
                type: type,
                conversationId: conversation,
                action: 'remove',
                userDomain: 'frontmai'
            };
        } else if (type === 'channel') {
            data = {
                type: type,
                channelConvId: conversation,
                channelName: chatData.channel.channelName,
                action: 'remove',
                userDomain: chatData.channel.userDomain
            };
        } else {
            data = {
                type: type,
                botId: conversation,
                action: 'remove',
                userDomain: 'frontmai'
            };
        }
        Conversation.setFavorite(data)
            .then(() => {
                console.log('Conversation Set as unfavorite');
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.map(elem => {
                        if (elem.userId === otherUserId) {
                            elem.isFavourite = false;
                        }

                        return elem;
                    });
                    Contact.saveContacts(updateContacts);
                });
                this.update();
            })
            .catch(err => console.log('Cannot set un favorite', err));
    };

    renderNetworkStatusBar = () => {
        const { network, showNetworkStatusBar } = this.state;
        if (
            showNetworkStatusBar &&
            (network === 'none' || network === 'satellite')
        ) {
            return (
                <ChatStatusBar
                    network={this.state.network}
                    onChatStatusBarClose={this.onChatStatusBarClose}
                />
            );
        }
    };

    contentLoading = () => {
        const {
            allConversationsLoaded,
            remoteBotsInstalled
        } = this.props.appState;

        return false;
        return !(allConversationsLoaded && remoteBotsInstalled);
    };

    onSearch = searchString => this.setState({ searchString });

    renderMain() {
        return (
            <BotList
                ref={connectedBot => {
                    this.botList = connectedBot
                        ? connectedBot.getWrappedInstance()
                        : null;
                }}
                onBack={this.onBack.bind(this)}
                bots={this.state.bots}
                setFavorite={this.setConversationFavorite}
                unsetFavorite={this.setConversationUnFavorite}
                searchString={this.state.searchString}
                onSearch={this.onSearch}
                setNoChats={this.setNoChats}
                updateTimeline={this.update}
            />
        );
    }

    displayButton() {
        firstTimer = false;

        console.log('this is being called', firstTimer);
    }

    renderCreditBar() {
        return (
            <View style={MainScreenStyles.creditBar}>
                <Text style={MainScreenStyles.creditBarText}>
                    Current balance:
                    <Text style={MainScreenStyles.creditText}>
                        {' $' +
                            (this.state.updatingCallQuota ||
                            this.state.callQuotaUpdateError
                                ? '...'
                                : this.state.callQuota.toFixed(2))}
                    </Text>
                </Text>
                <Text
                    onPress={() => {
                        if (!this.state.updatingCallQuota) {
                            Actions.getCredit({
                                currentBalance: this.state.callQuota,
                                updateCallBack: newBalance =>
                                    this.setState({ callQuota: newBalance })
                            });
                        }
                    }}
                    style={
                        this.state.updatingCallQuota
                            ? MainScreenStyles.getCreditDisabled
                            : MainScreenStyles.getCredit
                    }
                >
                    Get credit
                </Text>
            </View>
        );
    }

    render() {
        // console.log('first timer ', this.state.firstTimer);

        return (
            <SafeAreaView style={{ flex: 1 }}>
                {this.renderCreditBar()}
                <BackgroundImage
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {this.state.noChats && this.state.firstTimer && (
                        <TourScreen
                            showNetwork={this.displayButton.bind(this)}
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
                        <NetworkStatusNotchBar />
                    </View>
                    <View>{this.renderMain()}</View>
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(logout())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(MainScreen);
