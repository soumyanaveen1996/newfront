import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform
} from 'react-native';
import styles from './styles';
import { HeaderBack, HeaderRightIcon } from '../../Header';
import Icons from '../../../config/icons';
import CachedImage from '../../CachedImage';
import I18n from '../../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
import { DURATION } from 'react-native-easy-toast';
import utils from '../../../lib/utils';
import dce from '../../../lib/dce';
import Bot from '../../../lib/bot/index';
import config from '../../../config/config';
import { Auth, Network } from '../../../lib/capability';
import { NativeModules, NativeEventEmitter } from 'react-native';
import NetworkButton from '../../Header/NetworkButton';
const UserServiceClient = NativeModules.UserServiceClient;
const timeout = Platform.OS === 'android' ? 1000 : 400;

var backTimer = null;

const BotInstallListItemStates = {
    INSTALLING: 'installing',
    INSTALLED: 'installed',
    NOT_INSTALLED: 'not_installed',
    UPDATE: 'update'
};

export default class BotInfoScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={async () => {
                        clearTimeout(backTimer);
                        backTimer = setTimeout(() => {
                            Actions.pop();
                            Actions.refresh({
                                key: Math.random()
                            });
                        }, timeout);
                    }}
                />
            );
        }
        navigationOptions.headerRight = (
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

        return navigationOptions;
    }
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.status
        };
    }

    subscribeToBot(botId, user) {
        return new Promise((resolve, reject) => {
            UserServiceClient.subscribeBot(
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

    async performBotInstallation(bot, update) {
        // console.log('will check', bot, update);

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
            if (update === BotInstallListItemStates.UPDATE) {
                await Bot.update(dceBot);
            } else {
                //first subscribe to the bot
                const user = await Promise.resolve(Auth.getUser());
                await this.subscribeToBot(dceBot.botId, user);
                await Bot.install(dceBot);
            }
        } catch (e) {
            throw e;
        }
    }

    async installBot() {
        if (
            this.props.status === 'installed' &&
            this.props.status !== 'update'
        ) {
            return;
        }
        const isUpdate = this.props.status;

        this.setState({ status: BotInstallListItemStates.INSTALLING });
        const bot = this.props.botInfo;
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
        this.refs.toast.show(I18n.t('Bot_installed'), DURATION.LENGTH_SHORT);
    };

    onBotInstallFailed = () => {
        this.refs.toast.show(
            I18n.t('Bot_install_failed'),
            DURATION.LENGTH_SHORT
        );
    };

    onBotClick(item) {
        Actions.botChat({ bot: item });
    }
    renderRightArea = () => {
        console.log('render status ', this.state.status);

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
                        onPress={this.onBotClick.bind(this, this.props.botInfo)}
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
        const bot = this.props.botInfo;

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    flexDirection: 'column'
                }}
            >
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
