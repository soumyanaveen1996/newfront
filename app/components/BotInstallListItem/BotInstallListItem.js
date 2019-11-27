import React from 'react';
import {
    ActivityIndicator,
    TouchableOpacity,
    View,
    Text,
    Alert
} from 'react-native';
import styles from './styles';
import Bot from '../../lib/bot/index';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import CachedImage from '../CachedImage';
import utils from '../../lib/utils';
import { Auth, Network } from '../../lib/capability';
import config from '../../config/config';
import { Actions } from 'react-native-router-flux';
import { NativeModules, NativeEventEmitter } from 'react-native';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';

const UserServiceClient = NativeModules.UserServiceClient;

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
    }

    subscribeToBot(botId, user) {
        return new Promise((resolve, reject) => {
            UserServiceClient.subscribeBot(
                user.creds.sessionId,
                { botId: botId },
                (error, result) => {
                    console.log('GRPC:::subscribe bot : ', error, result);
                    if (error) {
                        console.log('error on installing bot ', error);
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

    async performBotInstallation(bot, update) {
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
            console.log('bot listing', dceBot, update);
            if (update) {
                await Bot.update(dceBot);
            } else {
                //first subscribe to the bot
                const user = await Promise.resolve(Auth.getUser());
                await this.subscribeToBot(dceBot.botId, user);
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

    renderRightArea() {
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
    openBotInfo = botInfo => {
        const botStatus = this.state.status;
        // console.log(botStatus);

        Actions.botInfoScreen({
            botInfo: botInfo,
            status: botStatus,
            onBack: this.onBack
        });
    };

    render() {
        const bot = this.props.bot;

        // console.log('bot name : ', bot);
        // console.log('bot status :', this.state.status);
        // console.log('installed bot :', this.props.installedBots);

        return (
            <TouchableOpacity
                onPress={() => {
                    this.openBotInfo(bot);
                }}
                style={styles.container}
            >
                <CachedImage
                    imageTag="botLogo"
                    source={{ uri: bot.logoUrl }}
                    style={styles.image}
                />
                <View style={styles.textContainer}>
                    <Text numberOfLines={1} style={styles.title}>
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
                            style={{ color: 'rgba(0,189,242,1)', fontSize: 14 }}
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
                            {bot.developer}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={subtitleNumberOfLines}
                        style={styles.subTitle}
                    >
                        {bot.description}
                    </Text>
                </View>
                {this.renderRightArea()}
            </TouchableOpacity>
        );
    }
}
