import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import styles from './styles';
import Bot from '../../lib/bot/index';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import CachedImage from '../CachedImage';
import utils from '../../lib/utils';
import { Auth, Network } from '../../lib/capability';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import GlobalColors from '../../config/styles';
import UserServices from '../../apiV2/UserServices';
import NavigationAction from '../../navigation/NavigationAction';
import AlertDialog from '../../lib/utils/AlertDialog';
import AppFonts from '../../config/fontConfig';

const subtitleNumberOfLines = 2;

const BotInstallListItemStates = {
    INSTALLING: 'installing',
    INSTALLED: 'installed',
    NOT_INSTALLED: 'not_installed',
    UPDATE: 'update',
    NONE: 'none'
};

export default class BotInstallListItem extends React.Component {
    constructor(props) {
        super(props);
        let botStatus = BotInstallListItemStates.NONE;
        this.state = {
            status: botStatus.installed
                ? botStatus.update
                    ? BotInstallListItemStates.UPDATE
                    : BotInstallListItemStates.INSTALLED
                : BotInstallListItemStates.NOT_INSTALLED
        };
    }

    componentDidMount() {
        let botStatus = utils.checkBotStatus(
            this.props.installedBots,
            this.props.bot
        );
        botStatus.installed
            ? botStatus.update
                ? this.setState({ status: BotInstallListItemStates.UPDATE })
                : this.setState({
                      status: BotInstallListItemStates.INSTALLED
                  })
            : this.setState({
                  status: BotInstallListItemStates.NOT_INSTALLED
              });
    }

    componentDidUpdate(prevProps) {
        if (
            JSON.stringify(prevProps.installedBots) !==
            JSON.stringify(this.props.installedBots)
        ) {
            let botStatus = utils.checkBotStatus(
                this.props.installedBots,
                this.props.bot
            );
            botStatus.installed
                ? botStatus.update
                    ? this.setState({ status: BotInstallListItemStates.UPDATE })
                    : this.setState({
                          status: BotInstallListItemStates.INSTALLED
                      })
                : this.setState({
                      status: BotInstallListItemStates.NOT_INSTALLED
                  });
        }

        // if (prevProps.isBotAccessible !== this.props.isBotAccessible) {
        //     if(this.props.isBotAccessible) {
        //         console.log('*******************************************')
        //         // this.installBot();
        //     }
        // }
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
        if (!utils.isClientSupportedByBot(bot)) {
            AlertDialog.show(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_min_version_error')
            );
            return;
        }
        try {
            const dceBot = dce.bot(bot);
            console.log('bot listing', dceBot, update);
            if (update) {
                await Bot.update(dceBot);
            } else {
                //first subscribe to the bot
                await this.subscribeToBot(dceBot.botId);
                await Bot.install(dceBot);
            }
        } catch (e) {
            console.error('bot not installed ', e);

            throw e;
        }
    }

    async installBot() {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.STORE,
            GoogleAnalyticsEventsActions.INSTALLED_BOT,
            this.props.bot.botName,
            0,
            null
        );
        let botStatus = utils.checkBotStatus(
            this.props.installedBots,
            this.props.bot
        );
        if (botStatus.installed && !botStatus.update) {
            return;
        }
        this.setState({ status: BotInstallListItemStates.INSTALLING });
        const bot = this.props.bot;
        try {
            await this.performBotInstallation(bot, botStatus.update);
            if (this.props.onBotInstalled) {
                this.props.onBotInstalled();
            }
            this.setState({ status: BotInstallListItemStates.INSTALLED });
        } catch (e) {
            this.setState({ status: BotInstallListItemStates.NOT_INSTALLED });
            if (this.props.onBotInstallFailed) {
                this.props.onBotInstallFailed();
            }
        }
    }

    checkBotInstall = async (authorisedAccess) => {
        const botInfo = this.props.bot;
        const {
            provider: { name }
        } = Auth.getUserData();
        if (authorisedAccess) {
            this.props.onAuth({
                bot: botInfo,
                onBack: this.props.onBack,
                botName: botInfo?.botName,
                otherUserId: false,
                botLogoUrl: botInfo?.logoUrl
            });
        } else if (authorisedAccess && name !== 'FrontM') {
            this.props.onAuth({
                bot: botInfo,
                onBack: this.props.onBack,
                botName: botInfo?.botName,
                otherUserId: false,
                botLogoUrl: botInfo?.logoUrl
            });
        } else {
            this.installBot();
        }
    };

    renderRightArea() {
        const bot = this.props.bot;

        if (
            this.state.status === BotInstallListItemStates.NOT_INSTALLED ||
            this.state.status === BotInstallListItemStates.UPDATE
        ) {
            const status =
                this.state.status === BotInstallListItemStates.NOT_INSTALLED
                    ? I18n.t('Install')
                    : I18n.t('Update_Bot');

            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        accessibilityLabel="Install Button"
                        testID="install-button"
                        style={styles.installButton}
                        onPress={this.installBot.bind(this)}
                        // onPress={() => this.checkBotInstall(bot.authorisedAccess)}
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
        } else if (
            this.state.status === BotInstallListItemStates.INSTALLING ||
            this.state.status === BotInstallListItemStates.NONE
        ) {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else if (this.state.status === BotInstallListItemStates.INSTALLED) {
            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        accessibilityLabel="Open Button"
                        testID="open-button"
                        style={styles.openButton}
                        onPress={this.props.onBotClick.bind(
                            this,
                            this.props.bot
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
        } else {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        }
    }
    openBotInfo = (botInfo) => {
        const botStatus = this.state.status;
        // console.log(botStatus);

        NavigationAction.push(NavigationAction.SCREENS.botInfoScreen, {
            botInfo: botInfo,
            status: botStatus,
            onBack: this.onBack,
            onAuth: () => {
                this.props.onAuth({
                    bot: botInfo,
                    onBack: this.onBack,
                    botName: botInfo?.botName,
                    otherUserId: false,
                    botLogoUrl: botInfo?.logoUrl
                });
            },
            is2FaEnable: this.props.is2FaEnable
        });
    };

    render() {
        const bot = this.props.bot;
        return (
            <TouchableOpacity
                onPress={() => {
                    this.openBotInfo(bot);
                }}
                key={bot.botId}
                style={styles.container}
            >
                <CachedImage
                    imageTag="botLogo"
                    source={{ uri: bot.logoUrl }}
                    style={styles.image}
                    borderRadius={10}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.textContainer}>
                            <Text numberOfLines={1} style={styles.title}>
                                {bot.botName}
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 4
                                }}
                            >
                                <Text
                                    style={{
                                        color: GlobalColors.primaryButtonColor,
                                        fontSize: 12
                                    }}
                                >
                                    Free
                                </Text>
                                <Text
                                    style={{
                                        color: GlobalColors.chatSubTitle,
                                        fontWeight: AppFonts.SEMIBOLD,
                                        fontSize: 12,
                                        marginHorizontal: 4
                                    }}
                                >
                                    ·
                                </Text>
                                <Text
                                    style={{
                                        color: GlobalColors.descriptionText,
                                        fontWeight: AppFonts.SEMIBOLD,
                                        fontSize: 12
                                    }}
                                >
                                    {bot.developer}
                                </Text>
                            </View>
                        </View>
                        {this.renderRightArea()}
                    </View>
                    <Text
                        numberOfLines={subtitleNumberOfLines}
                        style={styles.description}
                    >
                        {bot.description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}
