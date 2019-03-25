import React from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl
} from 'react-native';
import styles, { BotListItemStyles } from './styles';
import { Icon } from 'react-native-elements';
import { GlobalColors } from '../../config/styles';
import { headerConfig, searchBarConfig, rightIconConfig } from './config';
import images from '../../config/images';
import { Actions } from 'react-native-router-flux';
import Bot from '../../lib/bot/index';
import { HeaderRightIcon, HeaderBack } from '../Header';
import _ from 'lodash';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import dce from '../../lib/dce';
import SystemBot from '../../lib/bot/SystemBot';
import { MessageHandler } from '../../lib/message';
import CachedImage from '../CachedImage';
import Swipeout from 'react-native-swipeout';
import utils from '../../lib/utils';
import {
    Settings,
    Network,
    PollingStrategyTypes,
    DeviceStorage,
    Auth
} from '../../lib/capability';
import config from '../../config/config';
import { Icons } from '../../config/icons';
import { EmptyInstalledBot } from '../BotStoreScreen';
import { NativeModules } from 'react-native';
const UserServiceClient = NativeModules.UserServiceClient;

const LAST_CHECK_TIME_KEY = 'last_bot_check_time';
const subtitleNumberOfLines = 2;

export default class InstalledBotsScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerRight: (
                <HeaderRightIcon
                    config={rightIconConfig}
                    onPress={state.params.fireBotSore}
                />
            ),
            headerLeft: (
                <HeaderBack
                    onPress={
                        state.params.onBack
                            ? () => {
                                Actions.pop();
                                state.params.onBack();
                            }
                            : Actions.pop
                    }
                    refresh={true}
                />
            )
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            botUpdateStatuses: {},
            refreshing: false
        };
    }

    async componentDidMount() {
        //this.props.navigation.setParams({ fireBotSore: this.onAddClicked.bind(this) });
        this.refreshData();
        this.checkForBotUpdates();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async updateBot(bot) {
        if (!utils.isClientSupportedByBot(bot)) {
            Alert.alert(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_min_version_error'),
                [{ text: 'OK' }],
                { cancelable: true }
            );
            return;
        }
        try {
            const dceBot = dce.bot(bot);
            await Bot.update(dceBot);
            this.refreshInstalledBots();
            // After bot update hide the update button in swipe options
            let botUpdateStatuses = this.state.botUpdateStatuses;
            botUpdateStatuses[bot.botId] = false;
            this.setState({ botUpdateStatuses: botUpdateStatuses });
            this.refs.toast.show(I18n.t('Bot_updated'), DURATION.LENGTH_SHORT);
        } catch (e) {
            this.refs.toast.show(
                I18n.t('Bot_update_failed'),
                DURATION.LENGTH_SHORT
            );
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
        catalogData.bots.forEach(bot => {
            this.newBotManifests[bot.botId] = bot;
        });
        const bots = await Bot.getInstalledBots();
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());

        const botUpdateStatuses = {};
        bots.forEach(bot => {
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
        this.setState({ botUpdateStatuses: botUpdateStatuses });
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
                // && !global.__DEV__
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

    async refreshInstalledBots() {
        const bots = await Bot.getInstalledBots();
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());
        this.bots = _.reject(bots, bot =>
            _.find(defaultBots, { botId: bot.botId })
        );
        if (this.queryText && this.queryText.length > 0) {
            this.onSearchQueryChange(this.queryText);
            this.setstate({ loaded: true });
        } else {
            this.setState({ bots: this.bots, loaded: true });
        }
    }

    async refreshData() {
        await this.refreshInstalledBots();
    }

    onAddClicked = () => {
        Actions.botStore({ onBack: this.refreshData.bind(this) });
    };

    onDeletePress = async bot => {
        Alert.alert(
            null,
            I18n.t('Bot_uninstall_confirmation'),
            [
                { text: I18n.t('Yes'), onPress: () => this.deleteBot(bot) },
                { text: I18n.t('Cancel'), style: 'cancel' }
            ],
            { cancelable: false }
        );
    };

    unsubscribeFromBot(botId, user) {
        return new Promise((resolve, reject) => {
            UserServiceClient.unsubscribeBot(
                user.creds.sessionId,
                { botId: botId },
                (error, result) => {
                    console.log('GRPC:::subscribe bot : ', error, result);
                    if (error) {
                        return reject({
                            type: 'error',
                            error: error.code
                        });
                    }
                    resolve(true);
                }
            );
        });
    }

    deleteBot = async bot => {
        try {
            await MessageHandler.deleteBotMessages(bot.botId);
            const dceBot = dce.bot(bot);
            const user = await Promise.resolve(Auth.getUser());
            await this.unsubscribeFromBot(dceBot.botId, user);
            await Bot.delete(dceBot);
            this.refreshInstalledBots();
            this.refs.toast.show(
                I18n.t('Bot_uninstalled'),
                DURATION.LENGTH_SHORT
            );
        } catch (e) {
            this.refs.toast.show(
                I18n.t('Bot_uninstall_failed'),
                DURATION.LENGTH_SHORT
            );
            throw e;
        }
    };

    onUpdatePress = async bot => {
        this.updateBot(bot);
    };

    onBotPress = async bot => {
        Actions.botChat({ bot: bot });
    };

    headerTitle = () => (
        <Text style={styles.headerTitleStyle}>{headerConfig.headerTitle}</Text>
    );

    checkBotStatus = botData => {
        return utils.checkBotStatus(this.state.bots, botData);
    };

    getSwipeButtons = botData => {
        const shouldUpdate = this.state.botUpdateStatuses[botData.botId];
        let swipeBtns = [
            {
                component: (
                    <View style={styles.swipeBtnStyle}>
                        <Icon name="delete" color="white" />
                    </View>
                ),
                backgroundColor: GlobalColors.sideButtons,
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

    openBotInfo = botInfo => {
        const botStatus = 'installed';

        Actions.botInfoScreen({
            botInfo: botInfo,
            status: botStatus,
            onBack: this.onBack
        });
    };

    renderRow = botData => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.openBotInfo(botData);
                }}
            >
                <View style={BotListItemStyles.container}>
                    <CachedImage
                        imageTag="botLogo"
                        source={{ uri: botData.logoUrl }}
                        style={BotListItemStyles.image}
                    />
                    <View style={BotListItemStyles.textContainer}>
                        <Text style={BotListItemStyles.title} numberOfLines={1}>
                            {botData.botName}{' '}
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                height: 20,
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    color: 'rgba(0,189,242,1)',
                                    fontSize: 14
                                }}
                            >
                                Free
                            </Text>
                            <Text
                                style={{
                                    color: 'rgba(216,216,216,1)',
                                    fontSize: 16,
                                    fontWeight: '100',
                                    marginHorizontal: 4
                                }}
                            >
                                |
                            </Text>
                            <Text
                                style={{
                                    color: 'rgba(102,102,102,1)',
                                    fontSize: 14
                                }}
                            >
                                {botData.developer}
                            </Text>
                        </View>
                        <Text
                            numberOfLines={subtitleNumberOfLines}
                            style={BotListItemStyles.subTitle}
                        >
                            {botData.description}
                        </Text>
                    </View>
                    <View style={BotListItemStyles.rightContainer}>
                        <TouchableOpacity
                            style={BotListItemStyles.openButton}
                            onPress={this.onBotPress.bind(this, botData)}
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
            </TouchableOpacity>
        );
    };

    renderGridItem = ({ item }) => {
        let swipeBtns = this.getSwipeButtons(item);
        return (
            <Swipeout
                right={swipeBtns}
                style={{ flex: 1 }}
                backgroundColor={GlobalColors.transparent}
                autoClose={true}
            >
                <View key={item.botId} style={styles.rowContainer}>
                    <View style={{ flex: 1 }}>{this.renderRow(item)}</View>
                </View>
            </Swipeout>
        );
    };

    renderBotImage = botData => {
        if (botData.logoSlug) {
            return images[botData.logoSlug];
        } else {
            return (
                <CachedImage
                    imageTag="botLogo"
                    source={{ uri: botData.logoUrl }}
                    style={styles.image}
                />
            );
        }
    };

    onSearchQueryChange(text) {
        text = _.trim(text);
        this.queryText = text;
        if (text === '') {
            this.setState({ bots: this.bots });
        } else {
            let filteredBots = this.getFilteredData(text).bots;
            this.setState({ bots: filteredBots });
        }
    }

    getFilteredData(text) {
        if (this.state.bots.length === 0) {
            return [];
        }
        text = text.toLowerCase();
        let filterFunc = bot => bot.botName.toLowerCase().indexOf(text) !== -1;
        return this.createBotDict(filterFunc);
    }

    createBotDict(filterFunc) {
        return _.reduce(
            this.state.bots,
            (result, bot) => {
                if (filterFunc === undefined || filterFunc(bot)) {
                    let firstChar = 'bots';
                    (result[firstChar] || (result[firstChar] = [])).push(bot);
                }
                return result;
            },
            {}
        );
    }

    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search"
                    selectionColor={GlobalColors.white}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={this.onSearchQueryChange.bind(this)}
                />
            </View>
        );
    }

    render() {
        const { loaded } = this.state;
        if (!loaded) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            if (this.state.bots && this.state.bots.length > 0) {
                return (
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <FlatList
                                style={styles.flatList}
                                keyExtractor={(item, index) => item.botId}
                                data={this.state.bots}
                                renderItem={this.renderGridItem.bind(this)}
                                extraData={this.state}
                                ItemSeparatorComponent={() => (
                                    <View style={[styles.separator]} />
                                )}
                                refreshControl={
                                    <RefreshControl
                                        colors={['#9Bd35A', '#689F38']}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.onRefresh.bind(this)}
                                    />
                                }
                            />
                            <Toast ref="toast" positionValue={250} />
                        </View>
                    </ScrollView>
                );
            } else {
                return <EmptyInstalledBot />;
            }
        }
    }
}
