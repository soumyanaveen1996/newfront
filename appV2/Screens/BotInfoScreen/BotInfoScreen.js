import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from './styles';
import { HeaderBack, NetworkButton } from '../../widgets/Header';
import CachedImage from '../../widgets/CachedImage';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';
import dce from '../../lib/dce';
import Bot from '../../lib/bot/index';
import { Auth } from '../../lib/capability';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import GlobalColors from '../../config/styles';
import AuthenticationModal from '../../widgets/AuthenticationModal';
import UserServices from '../../apiV2/UserServices';
import eventEmitter from '../../lib/events/EventEmitter';
import { TimelineEvents } from '../../lib/events';
import NavigationAction from '../../navigation/NavigationAction';
import TimelineBuilder from '../../lib/TimelineBuilder/TimelineBuilder';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AlertDialog from '../../lib/utils/AlertDialog';
import AppFonts from '../../config/fontConfig';

const BotInstallListItemStates = {
    INSTALLING: 'installing',
    INSTALLED: 'installed',
    NOT_INSTALLED: 'not_installed',
    UPDATE: 'update'
};

export default class BotInfoScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.route.params.status,
            isAuthModalVisible: false,
            isBotAccessible: false,
            is2FaEnable: false
        };
    }

    componentDidMount() {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.VISITED_BOT,
            this.props.route.params.botInfo.botName,
            0,
            null
        );
    }

    subscribeToBot(botId) {
        return new Promise((resolve, reject) => {
            UserServices.subscribeBot({ botId: botId })
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

    async performBotInstallation(bot, update) {
        // console.log('will check', bot, update);

        if (!utils.isClientSupportedByBot(bot)) {
            AlertDialog.show(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_min_version_error')
            );
            return;
        }
        try {
            const dceBot = dce.bot(bot);
            if (update === BotInstallListItemStates.UPDATE) {
                await Bot.update(dceBot);
                eventEmitter.emit(TimelineEvents.botSyncDone);
            } else {
                //first subscribe to the bot
                await this.subscribeToBot(dceBot.botId);
                await Bot.install(dceBot);
                eventEmitter.emit(TimelineEvents.botSyncDone);
            }
        } catch (e) {
            throw e;
        }
    }

    async installBot() {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.INSTALLED_BOT,
            this.props.route.params.botInfo.botName,
            0,
            null
        );
        if (
            this.props.route.params.status === 'installed' &&
            this.props.route.params.status !== 'update'
        ) {
            return;
        }
        const isUpdate = this.props.route.params.status;

        this.setState({ status: BotInstallListItemStates.INSTALLING });
        const bot = this.props.route.params.botInfo;
        try {
            await this.performBotInstallation(bot, isUpdate);
            if (this.onBotInstalled) {
                this.onBotInstalled();
            }
            this.setState({ status: BotInstallListItemStates.INSTALLED });
        } catch (e) {
            console.log('error ', e);

            this.setState({ status: BotInstallListItemStates.NOT_INSTALLED });
            if (this.onBotInstallFailed) {
                this.onBotInstallFailed();
            }
        }
    }

    onBotInstalled = async () => {
        Toast.show({ text1: I18n.t('Bot_installed'), type: 'success' });
    };

    onBotInstallFailed = () => {
        Toast.show({ text1: I18n.t('Bot_install_failed') });
    };

    onBotClick = async (item) => {
        const {
            provider: { name }
        } = Auth.getUserData();
        if (item.authorisedAccess) {
            this.setState({ item });
            this.props.route.params.onAuth({
                bot: item,
                onBack: this.props.route.params.onBack,
                botName: item?.botName,
                otherUserId: false,
                botLogoUrl: item?.logoUrl
            });
        } else if (item.authorisedAccess && name === 'FrontM') {
            // this.setState({ item })
            this.setState({ isAuthModalVisible: true });

            // this.props.route.params.onAuth({bot:item, onBack: this.props.route.params.onBack});
        } else {
            NavigationAction.goToBotChat({
                bot: item,
                botName: item?.botName,
                otherUserId: false,
                botLogoUrl: item?.logoUrl,
                comingFromNotif: {
                    notificationFor: 'bot',
                    isFavorite: 0,
                    botId: item?.botId,
                    userDomain: item?.userDomain,
                    onRefresh: () => TimelineBuilder.buildTiimeline()
                }
            });
        }
    };

    onOpen = async () => {
        const botData = this.props.route.params.botInfo;
        const {
            provider: { name }
        } = Auth.getUserData();
        if (botData.authorisedAccess) {
            this.props.route.params.onAuth({
                bot: botData,
                onBack: this.props.route.params.onBack
            });
        } else if (botData.authorisedAccess && name !== 'FrontM') {
            this.props.route.params.onAuth({
                bot: botData,
                onBack: this.props.route.params.onBack
            });
        } else {
            this.installBot();
        }
    };

    renderRightArea = () => {
        if (
            this.state.status === BotInstallListItemStates.NOT_INSTALLED ||
            this.state.status === BotInstallListItemStates.UPDATE ||
            !this.state.status
        ) {
            const status =
                this.state.status === BotInstallListItemStates.NOT_INSTALLED ||
                !this.state.status
                    ? I18n.t('Install')
                    : I18n.t('Update_Bot');

            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        accessibilityLabel="Install Button"
                        testID="install-button"
                        style={styles.installButton}
                        // onPress={() => this.onOpen()}
                        onPress={this.installBot.bind(this)}
                    >
                        <Text
                            allowFontScaling={false}
                            style={styles.installButtonText}
                        >
                            {status}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (this.state.status === BotInstallListItemStates.INSTALLING) {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        accessibilityLabel="Open Button"
                        testID="open-button"
                        style={styles.openButton}
                        onPress={this.onBotClick.bind(
                            this,
                            this.props.route.params.botInfo
                        )}
                    >
                        <Text
                            allowFontScaling={false}
                            style={styles.openButtonText}
                        >
                            {I18n.t('OPEN')}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    render() {
        const bot = this.props.route.params.botInfo;
        const { isAuthModalVisible } = this.state;

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: GlobalColors.appBackground,
                    flexDirection: 'column'
                }}
            >
                <AuthenticationModal
                    isModalVisible={isAuthModalVisible}
                    setBotAccessible={(flag) => {
                        if (flag) {
                            NavigationAction.goToBotChat({
                                bot: this.props.route.params.onAuth
                                    .dataToOpenBot,
                                botName: bot?.botName,
                                otherUserId: false,
                                botLogoUrl: bot?.logoUrl
                            });
                        }
                        this.setState({
                            isBotAccessible: flag,
                            isAuthModalVisible: false
                        });
                    }}
                />
                <View style={styles.topContainer}>
                    <View style={styles.container}>
                        <CachedImage
                            imageTag="botLogo"
                            source={{ uri: bot.logoUrl }}
                            style={styles.image}
                        />
                        <View style={styles.textContainer}>
                            <Text numberOfLines={2} style={styles.title}>
                                {bot.botName}
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
                                        color: GlobalColors.frontmLightBlue,
                                        fontSize: 14
                                    }}
                                >
                                    Free
                                </Text>
                                <Text
                                    style={{
                                        color: 'rgba(216,216,216,1)',
                                        fontSize: 16,
                                        fontWeight: AppFonts.THIN,
                                        marginHorizontal: 4
                                    }}
                                ></Text>
                                <Text
                                    style={{
                                        color: 'rgba(102,102,102,1)',
                                        fontSize: 14
                                    }}
                                >
                                    {bot.developer}
                                </Text>
                            </View>
                            <Text numberOfLines={5} style={styles.subTitle}>
                                {bot.description}
                            </Text>
                        </View>
                        {this.renderRightArea()}
                    </View>
                </View>
                {/* <View style={styles.midContainer}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 10
                        }}
                    >
                        <Text style={styles.reviewText}>Reviews</Text>
                        <View style={styles.starsImage}>
                            <Text>star</Text>
                        </View>
                    </View>
                    <View style={styles.commentContainer}>
                        <View style={styles.reviewTitle}>
                            <Text style={styles.reviewTitleText}>
                                Comments title
                            </Text>
                            <View style={styles.reviewStars}>
                                <Text>star</Text>
                            </View>
                        </View>
                        <View>
                            <Text
                                numberOfLines={3}
                                style={styles.reviewComment}
                            >
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.reviewContainer}>
                        <Text style={styles.allReviewText}>See all Review</Text>
                    </View>
                </View> */}
                <View style={styles.bottomContainer}>
                    <View style={styles.informationHeader}>
                        <Text style={styles.headerInfoText}>Information</Text>
                    </View>
                    <View style={styles.infoTable}>
                        <View style={styles.rowView}>
                            <Text style={styles.textInfoTitle}>Version</Text>
                            <Text style={styles.textInfoTitle}>
                                {bot.version}
                            </Text>
                        </View>
                        <View style={styles.rowView}>
                            <Text style={styles.textInfoTitle}>Developer</Text>
                            <Text style={styles.textInfoTitle}>
                                {bot.developer}
                            </Text>
                        </View>
                        {/* <View style={styles.rowView}>
                            <Text style={styles.textInfoTitle}>Size</Text>
                            <Text style={styles.textInfoTitle}>4 MB</Text>
                        </View> */}
                    </View>
                </View>
            </View>
        );
    }
}
