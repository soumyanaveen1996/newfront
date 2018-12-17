import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Header, Icon } from 'react-native-elements';
import { GlobalColors } from '../../config/styles';
import { rightIconConfig, headerConfig, tabConfig } from './config';
import styles from './styles';
import DeveloperTab from './DeveloperTab/DeveloperTab';
import { InstalledBotsScreen } from '../InstalledBotsScreen';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Bot from '../../lib/bot/index';
import CategoriesTab from './CategoriesTab/CategoriesTab';
import FeaturedTab from './FeaturedTab/FeaturedTab';
import { HeaderBack } from '../Header';
import { ErrorMessage } from '../Error';
import { NetworkError } from '../../lib/network';
import {
    EventEmitter,
    SatelliteConnectionEvents,
    AuthEvents
} from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import { Auth } from '../../lib/capability';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import { BackgroundImage } from '../BackgroundImage';
import { connect } from 'react-redux';
import Store from '../../redux/store/configureStore';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { completeCatalogLoad } from '../../redux/actions/UserActions';
import { NewProviderPopup } from './NewProviderPopup';

class BotStoreScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            header: BotStoreScreen.renderHeader(state)
        };
    }

    static renderHeaderTitle() {
        return (
            <Text style={styles.headerTitleStyle}>
                {headerConfig.headerTitle}
            </Text>
        );
    }

    static renderLeftIcon(state) {
        return (
            <HeaderBack
                onPress={
                    state.params.onBack
                        ? () => {
                            Actions.pop();
                            state.params.onBack();
                        }
                        : Actions.pop
                }
            />
        );
    }

    static renderRightIcon(state) {
        if (state.params.selectedIndex === 2) {
            return (
                <Icon
                    type={rightIconConfig.type}
                    name={rightIconConfig.name}
                    size={rightIconConfig.size}
                    underlayColor={rightIconConfig.underlayColor}
                    color={rightIconConfig.color}
                    fontWeight={rightIconConfig.fontWeight}
                    onPress={state.params.handleSearchClick}
                />
            );
        }
    }

    static renderHeader(state) {
        if (state.params.showSearchBar) {
            return (
                <Header
                    innerContainerStyles={styles.headerInnerContainerForSearch}
                    outerContainerStyles={styles.headerOuterContainerStyles}
                    backgroundColor={GlobalColors.white}
                >
                    {/* <SearchBar
                    lightTheme
                    ref={search => { this.search = search }}
                    onSubmitEditing={state.params.handleSearchSubmit}
                    inputStyle={{backgroundColor: GlobalColors.white }}
                    containerStyle={styles.searchBar}
                /> */}
                </Header>
            );
        } else {
            return (
                <Header
                    innerContainerStyles={styles.headerInnerContainerStyles}
                    outerContainerStyles={styles.headerOuterContainerStyles}
                    backgroundColor={GlobalColors.white}
                    centerComponent={BotStoreScreen.renderHeaderTitle()}
                    // leftComponent={BotStoreScreen.renderLeftIcon(state)}
                />
            );
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            showSearchBar: false,
            selectedIndex: 0,
            searchString: '',
            catalogData: Bot.getDefaultCatalog(),
            catalogLoaded: false,
            networkError: false
        };
    }

    async updateCatalog() {
        let catalog = await Bot.getCatalog();
        if (__DEV__) {
            console.tron('CATALOG STORE LOADED');
        }

        this.setState({
            showNewProvider: false,
            showSearchBar: false,
            selectedIndex: this.state.selectedIndex || 0,
            catalogData: catalog,
            catalogLoaded: true,
            networkError: false
        });
    }

    async componentWillUnmount() {
        EventEmitter.removeListener(
            AuthEvents.userChanged,
            this.userChangedHandler.bind(this)
        );
    }

    async componentWillMount() {
        // await RemoteBotInstall.syncronizeBots()
    }

    async componentDidMount() {
        try {
            setTimeout(() => this.updateCatalog(), 1000);

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
        // Store.dispatch(completeCatalogLoad(true))
    }

    static onExit() {
        // RemoteBotInstall.syncronizeBots();
        Store.dispatch(setCurrentScene('none'));
        // Store.dispatch(completeCatalogLoad(false))
    }

    async refresh() {
        const isUserLoggedIn = await Auth.isUserLoggedIn();
        if (this.state && isUserLoggedIn) {
            this.updateCatalog();
        }
    }

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

    botStoreList() {
        if (this.state.selectedIndex === 2) {
            return (
                <DeveloperTab
                    style={{ flex: 1 }}
                    developerData={this.state.catalogData.developer}
                    botsData={this.state.catalogData.bots}
                    onBack={this.onBack.bind(this)}
                    onChange={this.changeHandler}
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
                />
            );
        }
        if (this.state.selectedIndex === 3) {
            return <InstalledBotsScreen />;
        }
    }

    segmentedControlTab() {
        return (
            <View style={styles.segmentedControlTab}>
                <SegmentedControlTab
                    tabsContainerStyle={styles.tabsContainerStyle}
                    tabStyle={styles.tabStyle}
                    tabTextStyle={styles.tabTextStyle}
                    activeTabStyle={styles.activeTabStyle}
                    activeTabTextStyle={styles.activeTabTextStyle}
                    values={tabConfig.tabNames}
                    selectedIndex={this.state.selectedIndex}
                    onTabPress={this.onIndexChange.bind(this)}
                />
            </View>
        );
    }

    onTileCilcked = title => {
        Actions.botList({
            data: this.state.catalogData.bots,
            title: title,
            typeScreen: 'search'
        });
    };

    render() {
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
                <TouchableOpacity
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
                </TouchableOpacity>
                {this.state.showNewProvider && (
                    <NewProviderPopup
                        canelNewProvider={this.handleCancelNewProvider}
                    />
                )}
                <StatusBar backgroundColor="grey" barStyle="light-content" />
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
