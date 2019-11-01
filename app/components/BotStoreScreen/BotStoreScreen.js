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
                    gsmAction={() => {
                        state.params.showConnectionMessage('gsm');
                    }}
                    satelliteAction={() => {
                        state.params.showConnectionMessage('satellite');
                    }}
                    disconnectedAction={() => {}}
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
            showSearchBar: false,
            selectedIndex: 0,
            searchString: '',
            countResults: 0,
            catalogData: Bot.getDefaultCatalog(),
            catalogLoaded: false,
            networkError: false,
            showNewProvider: false,
            qrCodeData: ''
        };
    }

    async updateCatalog() {
        let catalog = await Bot.getCatalog();
        if (catalog.bots) {
            catalog.bots.filter(bot => {
                return !bot.systemBot;
            });
        }
        // catalog = { ...catalog, ...{ bots: user_bots } };
        this.setState({
            showSearchBar: false,
            selectedIndex: this.state.selectedIndex || 0,
            catalogData: catalog,
            catalogLoaded: true,
            networkError: false,
            loading: false
        });
    }

    async componentWillUnmount() {
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
            refresh: NetworkHandler.readLambda,
            showConnectionMessage: this.showConnectionMessage
        });
        try {
            setTimeout(() => this.updateCatalog(), 200);

            EventEmitter.addListener(
                AuthEvents.userChanged,
                this.userChangedHandler.bind(this)
            );
            // await this.updateCatalog()
            if (this.props.navigation) {
                this.props.navigation.setParams({
                    handleSearchClick: this.handleSearchClick.bind(this),
                    handleSearchSubmit: this.handleSearchSubmit.bind(this)
                });
            }
        } catch (error) {
            console.error(
                'Error occurred during componentWillMount getting catalogData; ',
                error
            );
            if (error instanceof NetworkError) {
                this.setState({
                    showSearchBar: false,
                    selectedIndex: 0,
                    catalogLoaded: false,
                    networkError: true
                });
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.catalogLoaded !==
            this.props.appState.catalogLoaded
        ) {
            this.updateCatalog();
            this.checkPollingStrategy();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.appState.currentScene === I18n.t('Bot_Store') ||
            this.state !== nextState
        );
    }

    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Bot_Store'));
        Store.dispatch(completeCatalogLoad(true));
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
        Store.dispatch(completeCatalogLoad(false));
    }

    async refresh() {
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (this.state && isUserLoggedIn) {
            await this.updateCatalog();
        }
    }

    checkPollingStrategy = async () => {
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    };

    showConnectionMessage = connectionType => {
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
    };

    showButton = pollingStrategy => {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    };

    async userChangedHandler() {
        this.refresh();
    }

    onBack() {
        this.refresh();
    }

    handleSearchClick() {
        this.setState({ showSearchBar: true });
        if (this.props.navigation) {
            this.props.navigation.setParams({ showSearchBar: true });
        }
    }

    handleSearchSubmit() {
        this.setState({ showSearchBar: false });
        if (this.props.navigation) {
            this.props.navigation.setParams({ showSearchBar: false });
        }
    }

    onIndexChange(index) {
        this.setState({ selectedIndex: index });
        if (this.props.navigation) {
            this.props.navigation.setParams({ selectedIndex: index });
        }
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
        // this.updateCatalog();
        this.setState({ selectedIndex: 2 });
        this.refresh();

        // setTimeout(() => {
        //     this.setState({ selectedIndex: 2 });
        //     this.refresh();
        //     Actions.refresh({
        //         key: Math.random()
        //     });
        // }, 2000);
    };

    qrCodeSubmit = code => {
        this.setState({ qrCodeData: code });
    };

    botStoreList() {
        if (this.state.selectedIndex === 2) {
            return (
                <DeveloperTab
                    style={{ flex: 1 }}
                    developerData={this.state.catalogData.developer}
                    botsData={this.state.catalogData.bots}
                    onBack={this.onBack.bind(this)}
                    onChange={this.changeHandler}
                    refresh={this.refresh.bind(this)}
                />
            );
        }
        if (this.state.selectedIndex === 1) {
            return (
                <CategoriesTab
                    style={{ flex: 1 }}
                    categoriesData={this.state.catalogData.categories}
                    botsData={this.state.catalogData.bots}
                    onBack={this.onBack.bind(this)}
                    refresh={this.refresh.bind(this)}
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
                    onBack={this.onBack.bind(this)}
                    refresh={this.refresh.bind(this)}
                />
            );
        }
        if (this.state.selectedIndex === 3) {
            return (
                <InstalledBotsScreen
                    goHome={() => {
                        this.onIndexChange(0);
                    }}
                    refresh={this.refresh.bind(this)}
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

    // onTileCilcked = title => {
    //     Actions.botListScreen({
    //         data: this.state.catalogData.bots,
    //         title: title,
    //         typeScreen: 'search'
    //     });
    // };

    async updateText() {
        const searchBot = await Bot.searchBots(this.state.searchString.trim());

        const filteredSearchBot = [];

        for (var arr in this.state.catalogData.bots) {
            for (var filter in searchBot) {
                if (
                    this.state.catalogData.bots[arr].botId ===
                    searchBot[filter].botId
                ) {
                    filteredSearchBot.push(this.state.catalogData.bots[arr]);
                }
            }
        }

        this.setState(() => {
            return {
                botsData: [...filteredSearchBot],
                countResults: searchBot.length
            };
        });

        Actions.botListScreen({
            data: this.state.botsData,
            allBotsData: this.state.catalogData.bots,
            title: 'Marketplace',
            typeScreen: 'search',
            searchText: this.state.searchString
        });

        this.setState({ searchString: '' });
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
                {/* <TouchableOpacity
                    style={styles.searchSection}
                    onPress={() => this.onTileCilcked('Marketplace')}
                >
                    <Icon
                        style={styles.searchIcon}
                        name="search"
                        size={24}
                        color="rgba(0, 189, 242, 1)"
                    />
                    <View style={styles.input}>
                        <Text
                            style={{
                                color: 'rgba(155, 155, 155, 1)',
                                fontSize: 16,
                                fontFamily: 'SF Pro Text'
                            }}
                        >
                            {' '}
                            Search apps{' '}
                        </Text>
                    </View>
                </TouchableOpacity> */}
                <View style={styles.searchSection}>
                    <Icon
                        style={styles.searchIcon}
                        name="search"
                        size={24}
                        color="rgba(0, 189, 242, 1)"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Search apps"
                        value={this.state.searchString}
                        onChangeText={searchString => {
                            this.setState({ searchString });
                        }}
                        underlineColorAndroid="transparent"
                        onSubmitEditing={() => this.updateText()}
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
                {/* <StatusBar
                    hidden={false}
                    backgroundColor="grey"
                    barStyle={
                        Platform.OS === 'ios' ? 'dark-content' : 'light-content'
                    }
                /> */}
                {this.segmentedControlTab()}
                {this.botStoreList()}
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
