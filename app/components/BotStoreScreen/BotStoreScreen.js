import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    Platform,
    Image,
    TextInput,
    Alert,
    TouchableOpacity
} from 'react-native';

import { Icons } from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'react-native-elements';

import { headerConfig, tabConfig } from './config';
import styles from './styles';
import DeveloperTab from './DeveloperTab/DeveloperTab';
import { InstalledBotsScreen } from '../InstalledBotsScreen';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Bot from '../../lib/bot/index';
import CategoriesTab from './CategoriesTab/CategoriesTab';
import FeaturedTab from './FeaturedTab/FeaturedTab';
import { HeaderRightIcon } from '../Header';
import { ErrorMessage } from '../Error';
import { NetworkError, NetworkHandler } from '../../lib/network';
import { EventEmitter, AuthEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { Auth, Settings, PollingStrategyTypes } from '../../lib/capability';
import images from '../../images';

import { BackgroundImage } from '../BackgroundImage';
import { connect } from 'react-redux';
import Store from '../../redux/store/configureStore';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { completeCatalogLoad } from '../../redux/actions/UserActions';
import { NewProviderPopup } from './NewProviderPopup';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Loader from '../Loader/Loader';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import EmptyInstalledBot from './EmptyInstalledBot';

import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import NetworkButton from '../Header/NetworkButton';
import Toast, { DURATION } from 'react-native-easy-toast';

class BotStoreScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let headerLeft = null;

        headerLeft = (
            <View style={{ marginHorizontal: 17 }}>
                <NetworkButton
                    manualAction={() => {
                        state.params.refresh();
                    }}
                />
            </View>
        );

        const headerRight = (
            <TouchableOpacity
                style={styles.headerRight}
                onPress={state.params.newChannel}
            >
                <Image
                    source={require('../../images/channels/plus-white-good.png')}
                    style={{ width: 15, height: 15 }}
                />
            </TouchableOpacity>
        );

        const headerTitle = (
            <Text
                style={
                    Platform.OS === 'android'
                        ? { marginLeft: wp('20%'), fontSize: 18 }
                        : { fontSize: 18 }
                }
            >
                {headerConfig.headerTitle}
            </Text>
        );

        return {
            headerTitle,
            headerLeft,
            headerRight
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            searchString: '',
            countResults: 0,
            catalogData: Bot.getDefaultCatalog(),
            catalogLoaded: false,
            networkError: false,
            showNewProvider: false,
            qrCodeData: '',
            searching: false,
            installedBots: []
        };
    }

    async componentWillUnmount() {
        this.mounted = false;
        EventEmitter.removeListener(
            AuthEvents.userChanged,
            this.userChangedHandler.bind(this)
        );
    }

    async componentDidMount() {
        if (Actions.prevScene === ROUTER_SCENE_KEYS.barCodeScanner) {
            this.setState({ showNewProvider: true });
        }

        this.props.navigation.setParams({
            refresh: this.updateCatalog.bind(this)
        });
        setTimeout(() => this.updateCatalog(), 200);
        this.mounted = true;
        EventEmitter.addListener(
            AuthEvents.userChanged,
            this.userChangedHandler.bind(this)
        );
    }

    // componentDidUpdate(prevProps) {
    //     if (
    //         prevProps.appState.catalogLoaded !==
    //         this.props.appState.catalogLoaded
    //     ) {
    //         this.updateCatalog();
    //     }
    // }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.appState.currentScene === I18n.t('Bot_Store') ||
            this.state !== nextState
        );
    }

    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Bot_Store'));
        // Store.dispatch(completeCatalogLoad(true));
        if (this.mounted) {
            this.updateCatalog();
        }
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.OPENED_MARKETPLACE,
            null,
            0,
            null
        );
    }

    static onExit() {
        // RemoteBotInstall.syncronizeBots();
        Store.dispatch(setCurrentScene('none'));
        // Store.dispatch(completeCatalogLoad(false));
    }

    async updateCatalog() {
        console.log('>>>>>>>>UPDATE');
        try {
            const installedBots = await Bot.getTimeLineBots();
            let catalog = await Bot.getCatalog();
            if (catalog.bots) {
                catalog.bots.filter(bot => {
                    return !bot.systemBot;
                });
            }
            // catalog = { ...catalog, ...{ bots: user_bots } };
            this.setState({
                selectedIndex: this.state.selectedIndex || 0,
                catalogData: catalog,
                catalogLoaded: true,
                networkError: false,
                loading: false,
                installedBots: installedBots || []
            });
        } catch (error) {
            this.refs.toast.show(error.message, DURATION.LENGTH_SHORT);
            this.setState({
                catalogLoaded: true,
                networkError: true,
                loading: false
            });
        }
    }

    onBotInstalled = async () => {
        Bot.getTimeLineBots().then(bots => {
            this.setState({ installedBots: bots });
            this.showToastMessage(I18n.t('Bot_installed'));
        });
    };

    onBotInstallFailed = () => {
        this.showToastMessage(I18n.t('Bot_install_failed'));
    };

    async userChangedHandler() {
        this.updateCatalog();
    }

    onIndexChange(index) {
        this.setState({ selectedIndex: index });
    }

    changeHandler = value => {
        this.setState({
            showNewProvider: value
        });
    };

    handleCancelNewProvider = value => {
        this.setState({
            showNewProvider: value
        });
    };

    onSubmit = () => {
        this.updateCatalog();
        this.setState({ selectedIndex: 2 });
    };

    qrCodeSubmit = code => {
        this.setState({ qrCodeData: code });
    };

    showToastMessage(message) {
        this.refs.toast.show(message, DURATION.LENGTH_SHORT);
    }

    botStoreList() {
        if (this.state.selectedIndex === 2) {
            return (
                <DeveloperTab
                    style={{ flex: 1 }}
                    developerData={this.state.catalogData.developer}
                    botsData={this.state.catalogData.bots}
                    onChange={this.changeHandler}
                    refresh={this.updateCatalog.bind(this)}
                    showToastMessage={this.showToastMessage.bind(this)}
                    installedBots={this.state.installedBots}
                    onBotInstalled={this.onBotInstalled.bind(this)}
                    onBotInstallFailed={this.onBotInstallFailed.bind(this)}
                />
            );
        }
        if (this.state.selectedIndex === 1) {
            return (
                <CategoriesTab
                    style={{ flex: 1 }}
                    categoriesData={this.state.catalogData.categories}
                    botsData={this.state.catalogData.bots}
                    refresh={this.updateCatalog.bind(this)}
                    showToastMessage={this.showToastMessage.bind(this)}
                    installedBots={this.state.installedBots}
                    onBotInstalled={this.onBotInstalled.bind(this)}
                    onBotInstallFailed={this.onBotInstallFailed.bind(this)}
                />
            );
        }
        if (this.state.selectedIndex === 0) {
            let featuredBots = this.state.catalogData.bots.filter(bot => {
                return this.state.catalogData.featured.indexOf(bot.botId) >= 0;
            });
            return (
                <FeaturedTab
                    style={{ flex: 1 }}
                    featuredBots={featuredBots}
                    refresh={this.updateCatalog.bind(this)}
                    showToastMessage={this.showToastMessage.bind(this)}
                    installedBots={this.state.installedBots}
                    onBotInstalled={this.onBotInstalled.bind(this)}
                    onBotInstallFailed={this.onBotInstallFailed.bind(this)}
                />
            );
        }
        if (this.state.selectedIndex === 3) {
            return (
                <InstalledBotsScreen
                    goHome={() => {
                        this.onIndexChange(0);
                    }}
                    refresh={this.updateCatalog.bind(this)}
                    showToastMessage={this.showToastMessage.bind(this)}
                    installedBots={this.state.installedBots}
                />
            );
        }
    }

    segmentedControlTab() {
        return (
            <View style={styles.segmentedControlTab}>
                <SegmentedControlTab
                    tabsContainerStyle={styles.tabsContainerStyle}
                    borderRadius={0}
                    tabStyle={styles.tabStyle}
                    tabTextStyle={styles.tabTextStyle}
                    activeTabStyle={styles.activeTabStyle}
                    badges={['.', '.', '.', '.']}
                    tabBadgeContainerStyle={styles.badgeContainer}
                    activeTabTextStyle={styles.activeTabTextStyle}
                    activeTabBadgeContainerStyle={
                        styles.activeTabBadgeContainer
                    }
                    values={tabConfig.tabNames}
                    selectedIndex={this.state.selectedIndex}
                    onTabPress={this.onIndexChange.bind(this)}
                />
            </View>
        );
    }

    searchBots() {
        Actions.botListScreen({
            data: this.state.catalogData.bots,
            title: 'Marketplace',
            searchMode: true,
            searchText: this.state.searchString,
            installedBots: this.state.installedBots,
            onBotInstalled: this.onBotInstalled.bind(this),
            onBotInstallFailed: this.onBotInstallFailed.bind(this)
        });
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        if (this.props.appState.network !== 'full') {
            return <EmptyInstalledBot noNetwork={true} />;
        }
        if (this.state.networkError) {
            return (
                <ErrorMessage
                    onPress={() => {
                        Actions.pop();
                        Actions.botStore();
                    }}
                />
            );
        }
        if (!this.state.catalogLoaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        return (
            <BackgroundImage style={{ flex: 1 }}>
                <Loader loading={this.state.loading} />
                <View style={styles.searchSection}>
                    {this.state.searching ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <Icon
                            style={styles.searchIcon}
                            name="search"
                            size={24}
                            color="rgba(0, 189, 242, 1)"
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Search apps"
                        value={this.state.searchString}
                        onChangeText={searchString => {
                            this.setState({ searchString });
                        }}
                        underlineColorAndroid="transparent"
                        onSubmitEditing={() => this.searchBots()}
                    />
                </View>
                {this.state.showNewProvider && (
                    <NewProviderPopup
                        cancelNewProvider={this.handleCancelNewProvider}
                        onSubmittingCode={this.qrCodeSubmit}
                        onSubmit={this.onSubmit}
                        qrCode={this.state.qrCodeData}
                    />
                )}
                {this.segmentedControlTab()}
                {this.botStoreList()}
                {this.renderToast()}
            </BackgroundImage>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {
        completeCatalogLoad: loaded => dispatch(completeCatalogLoad(loaded))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BotStoreScreen);
