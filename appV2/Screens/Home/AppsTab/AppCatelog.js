import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import _ from 'lodash';
import I18n from '../../../config/i18n/i18n';
import { Auth, DeviceStorage } from '../../../lib/capability';
import Bot from '../../../lib/bot';
import configToUse from '../../../config/config';
import EventEmitter, { AuthEvents, TimelineEvents } from '../../../lib/events';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsActions,
    GoogleAnalyticsEventsCategories
} from '../../../lib/GoogleAnalytics';
import Loader from '../../../widgets/Loader';
import AuthenticationModal from '../../../widgets/AuthenticationModal';
import styles from './styles';
import { connect } from 'react-redux';

import GlobalColors from '../../../config/styles';
import InstalledBotsScreen from './InstalledBotsComponent/InstalledBotsComponent';
import FeaturedTab from './FeaturedTab/FeaturedTab';
import { tabConfig } from './config';
import ReactNativeSegmentedControlTab from 'react-native-segmented-control-tab';
import { NetworkStatusNotchBar } from '../../../widgets/NetworkStatusBar';
import Store from '../../../redux/store/configureStore';
import SystemBot from '../../../lib/bot/SystemBot';
import Connection from '../../../lib/events/Connection';
import NavigationAction from '../../../navigation/NavigationAction';
import DomainEvents from '../../../lib/events/DomainEvents';
import SearchBar from '../../../widgets/SearchBar';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import UserDomainsManager from '../../../lib/UserDomainsManager/UserDomainsManager';
import {
    setNetwork,
    setNetworkMsgUI
} from '../../../redux/actions/UserActions';
class AppCatelog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is2FaEnable: false,
            loading: true,
            catalogLoaded: false,
            installedBots: [],
            catalogData: null,
            selectedIndex: 0,
            qrCodeData: '',
            showNetworkStatusBar: true
        };
    }

    componentDidMount() {
        const {
            info: { softwareMfaEnabled }
        } = Auth.getUserData();
        this.setState({ is2FaEnable: softwareMfaEnabled });

        this.updateCatalog();
        this.networkSubscriber = EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleConnectionChange
        );
        this.botSyncSubscriber = EventEmitter.addListener(
            TimelineEvents.botSyncDone,
            this.loadLatestCatelog.bind(this)
        );
        this.refreshTimelineListener = EventEmitter.addListener(
            TimelineEvents.refreshTimeline,
            this.loadLatestCatelog.bind(this)
        );
        this.domainEventLister = EventEmitter.addListener(
            DomainEvents.domainChanged,
            this.handleDomainChange.bind(this)
        );
    }

    handleDomainChange() {
        this.setState(
            {
                catalogData: [],
                installedBots: [],
                selectedIndex: 0,
                catalogLoaded: false,
                loading: true,
                qrCodeData: ''
            },
            () => {
                console.log('This This this : ', this.state);
                this.loadLatestCatelog();
            }
        );
    }

    handleConnectionChange = (connection) => {
        if (connection.type === 'none' || connection.isConnected === false) {
            console.log('no internet');
        } else {
            if (this.state.catalogData === null) {
                this.updateCatalog();
            }
        }
    };

    componentWillUnmount() {
        this.networkSubscriber?.remove();
        this.botSyncSubscriber?.remove();
        this.domainEventLister?.remove();
        this.refreshTimelineListener?.remove();
    }

    updateCatalog = async (callback = null) => {
        console.log('updateCatalog');
        const catalogCache = await DeviceStorage.get('catalog');
        if (catalogCache) {
            const { catalog, installedBots } = catalogCache;
            console.log('Loaded Catalog from caache', installedBots);
            this.setState(
                {
                    selectedIndex: this.state.selectedIndex || 0,
                    catalogData: catalog,
                    catalogLoaded: true,
                    networkError: false,
                    loading: false,
                    installedBots: installedBots || []
                },
                () => {
                    console.log(
                        'catelog - Installed bot from cache:' +
                            this.state.installedBots.length
                    );
                }
            );
        }
        this.loadLatestCatelog(callback);
    };

    loadLatestCatelog = async (callback = null) => {
        try {
            const bots = await Bot.getInstalledBots();

            const defaultBots = await SystemBot.getDefaultBots();

            const installedBots = _.reject(bots, (bot) =>
                _.find(defaultBots, { botId: bot.botId })
            );

            console.log('BOTSTORE: llocal bots loaded', installedBots);
            Bot.getCatalog()
                .then((catalog) => {
                    if (catalog.bots) {
                        catalog.bots = catalog.bots.filter(
                            (bot) =>
                                !bot.systemBot &&
                                bot.userDomain !==
                                    configToUse.app.domaintoFilterOut
                        );
                    }

                    DeviceStorage.save('catalog', {
                        catalog,
                        installedBots
                    })
                        .then(() => {
                            console.log(
                                'BOTSTORE: Saved Catalog to cache',
                                catalog
                            );
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    callback?.();
                    this.setState(
                        {
                            selectedIndex: this.state.selectedIndex || 0,
                            catalogData: catalog,
                            catalogLoaded: true,
                            loading: false,
                            installedBots: installedBots || []
                        },
                        () => {
                            console.log(
                                'catelog - catalogData bot fafter catelog update:',
                                this.state.catalogData
                            );
                        }
                    );
                })
                .catch((error) => {
                    DeviceStorage.save('catalog', {
                        catalog: this.state.catalogData,
                        installedBots
                    });
                    console.log('BOTSTORE: Botstore api error', error);
                    callback?.();
                    this.setState(
                        {
                            catalogLoaded: true,
                            networkError: true,
                            loading: false,
                            installedBots: installedBots || [],
                            selectedIndex: this.state.selectedIndex || 0
                        },
                        () => {
                            console.log(
                                'catelog - Installed bot from catelog error:' +
                                    this.state.installedBots.length
                            );
                        }
                    );
                });
        } catch (error) {
            console.log('BOTSTORE: Botstore error', error);
            callback?.();
            this.setState({
                catalogLoaded: true,
                networkError: true,
                loading: false
            });
        }
    };
    static onExit() {
        Store.dispatch(setCurrentScene('none'));
    }

    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Bot_Store'));
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.OPENED_MARKETPLACE,
            null,
            0,
            null
        );
    }

    onChatStatusBarClose = () => {
        // this.setState({showNetworkStatusBar:false});
        Store.dispatch(setNetworkMsgUI(false));
    };

    onBotInstalled = async () => {
        const bots = await Bot.getInstalledBots();
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());
        const installedBots = _.reject(bots, (bot) =>
            _.find(defaultBots, { botId: bot.botId })
        );
        this.setState({ installedBots: installedBots });
        EventEmitter.emit(TimelineEvents.refreshTimeline);
        this.showToastMessage(I18n.t('Bot_installed'));
    };
    onBotInstallFailed = () => {
        this.showToastMessage(I18n.t('Bot_install_failed'));
    };
    showToastMessage = (message) => {
        Toast.show({ text1: message, type: 'success' });
    };

    onIndexChange = (index) => {
        this.setState({ selectedIndex: index });
    };

    qrCodeSubmit = () => {
        this.setState({ qrCodeData: code });
    };

    onSubmit = (newDomains) => {
        UserDomainsManager.updateDomains(newDomains);
        this.updateCatalog();
    };

    searchBots = (text) => {
        NavigationAction.push(NavigationAction.SCREENS.botListScreen, {
            data: this.state.catalogData.bots,
            title: 'Marketplace',
            searchMode: true,
            searchText: this.state.searchString,
            installedBots: this.state.installedBots,
            onBotInstalled: this.onBotInstalled,
            onBotInstallFailed: this.onBotInstallFailed
        });
    };

    renderBotList = () => {
        const {
            selectedIndex,
            installedBots,
            catalogData,
            networkError,
            isBotAccessible,
            is2FaEnable
        } = this.state;
        if (selectedIndex === 0) {
            return (
                <InstalledBotsScreen
                    goHome={() => {
                        this.onIndexChange(1);
                    }}
                    refresh={this.updateCatalog}
                    showToastMessage={this.showToastMessage}
                    installedBots={installedBots}
                    onBack={this.props.onBack}
                    onAuth={(dataToOpenBot) => {
                        this.setState({
                            isAuthModalVisible: true,
                            dataToOpenBot: dataToOpenBot
                        });
                    }}
                    isBotAccessible={isBotAccessible}
                    is2FaEnable={is2FaEnable}
                />
            );
        }
        if (selectedIndex === 1) {
            return (
                <FeaturedTab
                    style={{ flex: 1 }}
                    featuredBots={catalogData?.bots}
                    networkError={networkError}
                    refresh={this.updateCatalog}
                    showToastMessage={this.showToastMessage}
                    installedBots={installedBots}
                    onBotInstalled={this.onBotInstalled}
                    onBotInstallFailed={this.onBotInstallFailed}
                    onBack={this.props.onBack}
                    onAuth={(dataToOpenBot) => {
                        this.setState({
                            isAuthModalVisible: true,
                            dataToOpenBot: dataToOpenBot
                        });
                    }}
                    isBotAccessible={isBotAccessible}
                    is2FaEnable={is2FaEnable}
                />
            );
        }
    };

    segmentedControlTab() {
        return (
            <View>
                <ReactNativeSegmentedControlTab
                    tabsContainerStyle={styles.tabsContainerStyle}
                    borderRadius={0}
                    firstTabStyle={styles.tabsContainerStyle}
                    tabStyle={styles.tabsContainerStyle}
                    tabTextStyle={styles.tabTextStyle}
                    activeTabStyle={styles.activeTabStyle}
                    tabBadgeContainerStyle={styles.badgeContainer}
                    activeTabTextStyle={styles.activeTabTextStyle}
                    activeTabBadgeContainerStyle={
                        styles.activeTabBadgeContainer
                    }
                    values={tabConfig.tabNames}
                    selectedIndex={this.state.selectedIndex}
                    onTabPress={this.onIndexChange}
                />
            </View>
        );
    }

    renderSearchBar = () => {
        return (
            <View style={styles.searchBar}>
                <SearchBar
                    placeholder="Search the marketplace"
                    value={this.state.searchString}
                    onChangeText={(searchString) => {
                        this.setState({ searchString });
                    }}
                    onSubmitEditing={() => {
                        this.searchBots();
                    }}
                />
            </View>
        );
    };

    render() {
        const {
            catalogLoaded,
            loading,
            isAuthModalVisible,
            dataToOpenBot,
            searchString,
            qrCodeData
        } = this.state;

        if (!catalogLoaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                {loading && <Loader />}
                {this.segmentedControlTab()}
                {this.props.appState.networkMsgUI && (
                    <NetworkStatusNotchBar
                        onChatStatusBarClose={this.onChatStatusBarClose}
                    />
                )}
                {this.renderSearchBar()}
                <AuthenticationModal
                    isModalVisible={isAuthModalVisible}
                    botId={dataToOpenBot?.bot?.botId}
                    setBotAccessible={(flag) => {
                        if (flag) {
                            NavigationAction.push(
                                NavigationAction.SCREENS.bot,
                                dataToOpenBot
                            );
                        }
                        this.setState({
                            isBotAccessible: flag,
                            isAuthModalVisible: false
                        });
                    }}
                />

                {this.renderBotList()}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AppCatelog);
