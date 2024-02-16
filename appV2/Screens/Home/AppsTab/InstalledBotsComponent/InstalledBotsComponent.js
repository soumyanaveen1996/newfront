import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Icon } from '@rneui/themed';
import _ from 'lodash';
import Swipeout from 'react-native-swipeout';
import styles, { BotListItemStyles } from './styles';
import GlobalColors from '../../../../config/styles';
import { headerConfig } from './config';
import images from '../../../../config/images';
import Bot from '../../../../lib/bot/index';
import I18n from '../../../../config/i18n/i18n';
import dce from '../../../../lib/dce';
import SystemBot from '../../../../lib/bot/SystemBot';
import { MessageHandler } from '../../../../lib/message';
import CachedImage from '../../../../widgets/CachedImage';
import utils from '../../../../lib/utils';
import {
    Settings,
    Network,
    PollingStrategyTypes,
    DeviceStorage,
    Auth
} from '../../../../lib/capability';
import EmptyInstalledBot from './EmptyInstalledBot';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../../../lib/GoogleAnalytics';
import Store from '../../../../redux/store/configureStore';
import AuthenticationModal from '../../../../widgets/AuthenticationModal';
import UserServices from '../../../../apiV2/UserServices';
import NavigationAction from '../../../../navigation/NavigationAction';
import EventEmitter, { TimelineEvents } from '../../../../lib/events';
import TimelineBuilder from '../../../../lib/TimelineBuilder/TimelineBuilder';
import { BotInstallListItem } from '../../../../widgets';
import AlertDialog from '../../../../lib/utils/AlertDialog';

const LAST_CHECK_TIME_KEY = 'last_bot_check_time';
const subtitleNumberOfLines = 2;

export default class InstalledBotsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: true,
            botUpdateStatuses: {},
            refreshing: false,
            isAuthModalVisible: false,
            isBotAccessible: false,
            bots: props.installedBots
        };
    }

    async componentDidMount() {
        this.checkForBotUpdates();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate(
        prevProps: Readonly<P>,
        prevState: Readonly<S>,
        snapshot: SS
    ) {
        if (prevProps.isBotAccessible !== this.props.isBotAccessible) {
            if (this.props.isBotAccessible) {
                this.onBotPress(this.state.botData);
            }
        }
    }

    async updateBot(bot) {
        if (!utils.isClientSupportedByBot(bot)) {
            AlertDialog.show(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_min_version_error')
            );
            return;
        }
        try {
            const dceBot = dce.bot(bot);
            await Bot.update(dceBot);
            // this.refreshInstalledBots();
            // After bot update hide the update button in swipe options
            const { botUpdateStatuses } = this.state;
            botUpdateStatuses[bot.botId] = false;
            this.setState({ botUpdateStatuses });
            this.props.refresh();
            this.props.showToastMessage(I18n.t('Bot_updated'));
        } catch (e) {
            this.props.showToastMessage(I18n.t('Bot_update_failed'));
            throw e;
        }
    }

    checkIfClientSupportsBot(bot) {
        if (
            bot.minRequiredPlatformVersion &&
            versionCompare(
                VersionCheck.getCurrentVersion(),
                bot.minRequiredPlatformVersion
            ) > -1
        ) {
            return true;
        }
        return false;
    }

    async checkAndUpdateBots(autoUpdate) {
        const catalogData = await Bot.getCatalog();
        this.newBotManifests = {};
        catalogData.bots.forEach((bot) => {
            this.newBotManifests[bot.botId] = bot;
        });
        const bots = await Bot.getInstalledBots();
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());

        const botUpdateStatuses = {};
        bots.forEach((bot) => {
            const isSystemBot = _.find(defaultBots, { botId: bot.botId });
            const newBotData = _.find(catalogData.bots, { botId: bot.botId });
            const status = utils.checkBotStatus(bots, newBotData);
            const doesClientSupport = this.checkIfClientSupportsBot(newBotData);
            if ((isSystemBot || autoUpdate) && doesClientSupport) {
                this.updateBot(newBotData);
            } else {
                botUpdateStatuses[bot.botId] = status.update === true;
            }
        });
        this.setState({ botUpdateStatuses });
    }

    async checkForBotUpdates() {
        const pollingStrategy = await Settings.getPollingStrategy();
        const isGSM = await Network.isCellular();
        const autoUpdate =
            pollingStrategy === PollingStrategyTypes.gsm ||
            (pollingStrategy === PollingStrategyTypes.automatic && isGSM);

        if (autoUpdate) {
            this.checkAndUpdateBots(true);
        } else {
            const lastCheckTime = await DeviceStorage.get(LAST_CHECK_TIME_KEY);
            const currentTime = new Date().valueOf();
            if (lastCheckTime && currentTime - lastCheckTime < 86400000) {
                return;
            }
            this.checkAndUpdateBots(false);
        }
        this.updateLastBotCatalogTime();
    }

    updateLastBotCatalogTime() {
        DeviceStorage.save(LAST_CHECK_TIME_KEY, new Date().valueOf());
    }

    async onRefresh() {
        this.setState({ refreshing: true });
        this.checkAndUpdateBots(false);
        if (this.mounted) {
            this.setState({ refreshing: false });
        }
        this.updateLastBotCatalogTime();
    }

    onDeletePress = async (bot) => {
        AlertDialog.show(null, I18n.t('Bot_uninstall_confirmation'), [
            { text: I18n.t('Cancel') },
            { text: I18n.t('Yes'), onPress: () => this.deleteBot(bot) }
        ]);
    };

    unsubscribeFromBot(botId, user) {
        return new Promise((resolve, reject) => {
            UserServices.unsubscribeBot({ botId: botId })
                .then((res) => {
                    resolve(true);
                })
                .catch((error) => {
                    return reject({
                        error: error.code
                    });
                });
        });
    }

    deleteBot = async (bot) => {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.UNINSTALLED_BOT,
            bot.botName,
            0,
            null
        );
        const dceBot = dce.bot(bot);
        try {
            await this.unsubscribeFromBot(dceBot.botId);
        } catch (e) {
            this.props.showToastMessage('Bot unsubscribe fail');
        }
        try {
            await MessageHandler.deleteBotMessages(bot.botId);
            await Bot.delete(dceBot);
            this.props.showToastMessage(I18n.t('Bot_uninstalled'));
            EventEmitter.emit(TimelineEvents.refreshTimeline);
            this.props.refresh();
        } catch (e) {
            this.props.showToastMessage(I18n.t('Bot_uninstall_failed'));
        }
    };

    onUpdatePress = async (bot) => {
        this.updateBot(bot);
    };

    onBotPress = async (bot) => {
        NavigationAction.goToBotChat({
            screen: NavigationAction.SCREENS.bot,
            bot: bot,
            onBack: this.props.onBack,
            botName: bot?.botName,
            otherUserId: false,
            botLogoUrl: bot?.logoUrl,
            comingFromNotif: {
                notificationFor: 'bot',
                isFavorite: 0,
                botId: bot?.botId,
                userDomain: bot?.userDomain,
                onRefresh: () => TimelineBuilder.buildTiimeline()
            }
        });
    };

    headerTitle = () => (
        <Text style={styles.headerTitleStyle}>{headerConfig.headerTitle}</Text>
    );

    checkBotStatus = (botData) =>
        utils.checkBotStatus(this.props.installedBots, botData);

    getSwipeButtons = (botData) => {
        const shouldUpdate = this.state.botUpdateStatuses[botData.botId];
        const swipeBtns = [
            {
                component: (
                    <View style={styles.swipeBtnStyle}>
                        <Icon name="delete" color="white" />
                    </View>
                ),
                backgroundColor: GlobalColors.primaryButtonColor,
                onPress: () => {
                    this.onDeletePress(botData);
                }
            }
        ];
        if (shouldUpdate) {
            swipeBtns.push({
                component: (
                    <View style={styles.swipeBtnStyle}>
                        <Icon name="update" color="white" />
                    </View>
                ),
                backgroundColor: GlobalColors.darkGray,
                onPress: () => {
                    this.onUpdatePress(this.newBotManifests[botData.botId]);
                }
            });
        }
        return swipeBtns;
    };

    openBotInfo = (botInfo) => {
        const botStatus = 'installed';
        NavigationAction.push(NavigationAction.SCREENS.botInfoScreen, {
            botInfo,
            status: botStatus,
            onBack: this.props.onBack,
            onAuth: () => {
                this.props.onAuth({
                    bot: botInfo,
                    onBack: this.props.onBack,
                    botLogoUrl: botInfo?.logoUrl,
                    botName: botInfo?.botName,
                    otherUserId: false
                });
            },
            is2FaEnable: this.props.is2FaEnable
        });
    };

    onOpen = async (botData) => {
        const {
            provider: { name }
        } = Auth.getUserData();
        if (botData.authorisedAccess) {
            this.setState({ botData });
            this.props.onAuth({
                bot: botData,
                onBack: this.props.onBack,
                botLogoUrl: botData.logoUrl,
                botName: botData.botName,
                otherUserId: false
            });
        } else if (botData.authorisedAccess && name !== 'FrontM') {
            this.setState({ botData });
            this.props.onAuth({
                bot: botData,
                onBack: this.props.onBack,
                botLogoUrl: botData.logoUrl,
                botName: botData.botName,
                otherUserId: false
            });
        } else {
            this.onBotPress(botData);
        }
    };

    renderRow = (botData) => (
        <TouchableOpacity
            onPress={() => {
                this.openBotInfo(botData);
            }}
            style={BotListItemStyles.container}
        >
            <CachedImage
                imageTag="botLogo"
                source={{ uri: botData.logoUrl }}
                style={styles.image}
                borderRadius={10}
            />

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={BotListItemStyles.textContainer}>
                        <Text numberOfLines={1} style={BotListItemStyles.title}>
                            {botData.botName}
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 4
                            }}
                        >
                            <Text style={BotListItemStyles.priceText}>
                                Free
                            </Text>
                            <Text style={BotListItemStyles.developerName}>
                                {' · ' + botData.developer}
                            </Text>
                        </View>
                    </View>
                    <View style={BotListItemStyles.rightContainer}>
                        <TouchableOpacity
                            accessibilityLabel="Install Button"
                            testID="install-button"
                            style={BotListItemStyles.openButton}
                            onPress={() => this.onOpen(botData)}
                            // onPress={() => this.checkBotInstall(bot.authorisedAccess)}
                        >
                            <Text
                                allowFontScaling={false}
                                style={BotListItemStyles.openButtonText}
                            >
                                {I18n.t('OPEN')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text
                    numberOfLines={subtitleNumberOfLines}
                    style={BotListItemStyles.description}
                >
                    {botData.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    renderGridItem = ({ item }) => {
        const swipeBtns = this.getSwipeButtons(item);
        return (
            <Swipeout
                right={swipeBtns}
                backgroundColor={GlobalColors.transparent}
                autoClose
            >
                {/* <View key={item.botId} style={styles.rowContainer}> */}
                {/* <View style={{ flex: 1 }}>{this.renderRow(item)}</View> */}
                <BotInstallListItem
                    bot={item}
                    onBotClick={this.onOpen}
                    installedBots={this.props.installedBots}
                    onBotInstalled={this.props.onBotInstalled}
                    onBotInstallFailed={this.props.onBotInstallFailed}
                    onBack={this.props.onBack}
                    onAuth={this.props.onAuth}
                    isBotAccessible={this.state.isBotAccessible}
                    is2FaEnable={this.props.is2FaEnable}
                />
                {/* </View> */}
            </Swipeout>
        );
    };

    renderBotImage = (botData) => {
        if (botData.logoSlug) {
            return images[botData.logoSlug];
        }
        return (
            <CachedImage
                imageTag="botLogo"
                source={{ uri: botData.logoUrl }}
                style={styles.image}
            />
        );
    };

    createBotDict(filterFunc) {
        return _.reduce(
            this.props.installedBots,
            (result, bot) => {
                if (filterFunc === undefined || filterFunc(bot)) {
                    const firstChar = 'bots';
                    (result[firstChar] || (result[firstChar] = [])).push(bot);
                }
                return result;
            },
            {}
        );
    }

    onPullToRefresh = () => {
        this.setState({ refreshing: true }, async () => {
            try {
                this.props.refresh(() => {
                    this.setState({
                        refreshing: false
                    });
                });
            } catch (e) {
                this.setState({
                    refreshing: false
                });
            }
        });
    };
    itemSeparatorComponent = () => (
        <View
            style={{
                marginLeft: 60,
                marginRight: 12,
                height: 1,
                backgroundColor: GlobalColors.itemDevider
            }}
        />
    );

    render() {
        const { loaded } = this.state;
        const { isAuthModalVisible } = this.state;
        if (!loaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="small" />
                    <AuthenticationModal
                        isModalVisible={isAuthModalVisible}
                        setBotAccessible={(flag) => {
                            if (flag) {
                                NavigationAction.push(
                                    NavigationAction.SCREENS.botChat,
                                    this.state.dataToOpenBot
                                );
                            }
                            this.setState({
                                isBotAccessible: flag,
                                isAuthModalVisible: false
                            });
                        }}
                    />
                </View>
            );
        }
        if (this.props.installedBots && this.props.installedBots.length > 0) {
            return (
                <FlatList
                    contentContainerStyle={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.props.installedBots}
                    renderItem={this.renderGridItem}
                    extraData={this.state}
                    ItemSeparatorComponent={this.itemSeparatorComponent}
                    refreshControl={
                        Store.getState().user.network === 'full' ? (
                            <RefreshControl
                                onRefresh={this.onPullToRefresh}
                                refreshing={this.state.refreshing}
                            />
                        ) : null
                    }
                />
            );
        }
        return (
            <View
                style={{
                    flex: 1
                }}
            >
                <EmptyInstalledBot goHome={this.props.goHome} />
            </View>
        );
    }
}
