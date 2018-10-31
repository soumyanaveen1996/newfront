import React from 'react';
import {
    ActivityIndicator,
    View,
    BackHandler,
    Alert,
    StatusBar,
    AsyncStorage,
    SafeAreaView,
    Platform
} from 'react-native';
import BotList from './BotList';
import FloatingButton from '../FloatingButton';
import { MainScreenStyles } from './styles';
import images from '../../config/images';
import I18n from '../../config/i18n/i18n';
import { Actions, ActionConst } from 'react-native-router-flux';
import CenterComponent from './header/CenterComponent';
import { HeaderLeftIcon } from '../Header';
import Config from './config';
import appConfig from '../../config/config';
import {
    AsyncResultEventEmitter,
    NETWORK_EVENTS_CONSTANTS,
    NetworkHandler
} from '../../lib/network';
import EventEmitter, {
    MessageEvents,
    AuthEvents,
    TwilioEvents
} from '../../lib/events';
import Auth from '../../lib/capability/Auth';
import { PollingStrategyTypes, Settings } from '../../lib/capability';
import Bot from '../../lib/bot';
import SystemBot from '../../lib/bot/SystemBot';
import { HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import AfterLogin from '../../services/afterLogin';
import { DataManager } from '../../lib/DataManager';
import { ContactsCache } from '../../lib/ContactsCache';
import { MessageCounter } from '../../lib/MessageCounter';
import { BackgroundImage } from '../../components/BackgroundImage';
import { TourScreen } from '../TourScreen';
import { TwilioVoIP } from '../../lib/twilio';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/UserActions';

const MainScreenStates = {
    notLoaded: 'notLoaded',
    authenticated: 'authenticated',
    unauthenticated: 'unauthenticated'
};

let firstTimer = false;

class MainScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let ret = {
            headerTitle: <CenterComponent />
        };
        if (appConfig.app.hideFilter !== true) {
            ret.headerLeft = (
                <HeaderLeftIcon
                    config={Config.filterButtonConfig}
                    onPress={state.params.openBotFilter}
                />
            );
        }

        if (state.params.button) {
            if (state.params.button === 'manual') {
                ret.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                ret.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                ret.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                ret.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return ret;
    }

    constructor(props) {
        super(props);
        // Susbscribe to async result handler
        this.eventSubscription = null;
        this.state = {
            loginState: false,
            screenState: MainScreenStates.notLoaded,
            firstTimer: false
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    showConnectionMessage(connectionType) {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    }

    async componentDidMount() {
        const getFirstTime = await AsyncStorage.getItem('firstTimeUser');
        if (getFirstTime) {
            this.setState({ firstTimer: false }, () => {
                firstTimer = this.state.firstTimer;
            });
        } else {
            this.setState({ firstTimer: true }, () => {
                firstTimer = this.state.firstTimer;
            });
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

        TwilioVoIP.init();
    }

    async componentWillMount() {
        AfterLogin.executeAfterLogin();
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
        if (this.props.moveToOnboarding) {
            this.openOnboaringBot();
        }
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler
        );
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.remoteBotsInstalled !==
            this.props.appState.remoteBotsInstalled
        ) {
            if (__DEV__) {
                console.tron('Update Screen');
            }

            this.update();
        }
    }

    handleBackButtonClick() {
        if (Actions.currentScene === 'timeline') {
            BackHandler.exitApp();
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

        // Actions.launch({
        //     type: ActionConst.REPLACE,
        //     logout: true
        // })
    };

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

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

    update = async () => {
        const userLoggedIn = await Auth.isUserLoggedIn();
        const botsList = userLoggedIn
            ? await Bot.getInstalledBots()
            : await Promise.resolve(SystemBot.getDefaultBots());
        const authStatus = userLoggedIn
            ? MainScreenStates.authenticated
            : MainScreenStates.unauthenticated;
        this.setState({ screenState: authStatus, bots: botsList });
        this.refs.botList.refresh();
        this.checkPollingStrategy();
    };

    componentWillUnmount = () => {
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
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
        this.update();
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
                Actions.onboarding({
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

    renderFloatingButton() {
        if (this.state.screenState === MainScreenStates.authenticated) {
            return (
                <FloatingButton
                    ref={button => {
                        this.floatingButton = button;
                    }}
                    style={MainScreenStyles.floatingButton}
                >
                    {/* <FloatingButton.Item title={I18n.t('Favorites')} image={images.icn_fav} onPress={() => console.log('Favorites tapped!')} /> */}
                    <FloatingButton.Item
                        title={I18n.t('Contacts')}
                        image={images.icn_contact}
                        onPress={this.openContacts.bind(this)}
                    />
                    <FloatingButton.Item
                        title={I18n.t('Channels')}
                        image={images.icn_channel}
                        onPress={this.openChannels.bind(this)}
                    />
                    <FloatingButton.Item
                        title={I18n.t('Discover')}
                        image={images.icn_chatbot}
                        onPress={this.openBotStore.bind(this)}
                    />
                    <FloatingButton.Item
                        title={I18n.t('Configure')}
                        image={images.icn_configure}
                        onPress={this.openConfigure.bind(this)}
                    />
                </FloatingButton>
            );
        }
    }

    renderMain() {
        if (this.state.screenState === MainScreenStates.notLoaded) {
            return (
                <ActivityIndicator
                    size="small"
                    style={MainScreenStyles.activityIndicator}
                />
            );
        } else {
            return (
                <View style={MainScreenStyles.botListContainer}>
                    <BotList
                        ref="botList"
                        onBack={this.onBack.bind(this)}
                        bots={this.state.bots}
                    />
                </View>
            );
        }
    }

    displayButton() {
        firstTimer = false;
        console.log('this is being called', firstTimer);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <BackgroundImage>
                    {this.state.firstTimer && (
                        <TourScreen
                            showNetwork={this.displayButton.bind(this)}
                        />
                    )}
                    <StatusBar
                        hidden={false}
                        backgroundColor="grey"
                        barStyle={
                            Platform.OS === 'ios'
                                ? 'dark-content'
                                : 'light-content'
                        }
                    />
                    {this.renderMain()}
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
    mapDispatchToProps
)(MainScreen);
