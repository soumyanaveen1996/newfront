import React from 'react';
import {
    View,
    SafeAreaView,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    RefreshControl,
    Platform
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import GlobalColors from '../../../config/styles';
import images from '../../../images';
import configToUse from '../../../config/config';
import { Card, ProgressBar } from 'react-native-paper';
import { CachedImage } from '../../../widgets';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationAction from '../../../navigation/NavigationAction';
import SystemBot from '../../../lib/bot/SystemBot';
import { DeviceStorage } from '../../../lib/capability';
import Bot from '../../../lib/bot';
import { synchronizeUserData } from '../../../lib/UserData/SyncData';
import moment from 'moment';
import VideoCallsAndroid from '../../../lib/calls/VideoCallsAndroid';
import AppFonts from '../../../config/fontConfig';

const FIRST_BOT_ID = 'xwKsLXjhasJG25ATMTfibk';
class CustomHome extends React.Component {
    constructor(props) {
        super(props);
        const links = configToUse.homeBannerlinks; //Temporary till we have API. supports dev and prod config.
        const list = props.domain ? links[props.domain] || [] : [];
        this.state = {
            botList: list,
            loading: true,
            refreshing: false
        };
        this.updateCatalog();
        this.showPermission();
    }

    updateCatalog = async () => {
        this.setState({ refreshing: true });
        const catalogCache = await DeviceStorage.get('catalog');
        if (catalogCache) {
            const { catalog } = catalogCache;
            this.setState({
                botList: this.getSortedBotList(catalog.bots),
                loading: false,
                refreshing: false
            });
        }
        this.loadLatestCatelog();
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.domain != this.props.domain) {
            console.log(
                'home-> Load Catalog for domina change - ' + nextProps.domain
            );
            this.updateCatalog();
        }
        return true;
    }

    getSortedBotList = (bots) => {
        const links = configToUse.homeBannerlinks;
        const list = this.props.domain ? links[this.props.domain] || [] : [];
        const firstBot = bots?.find((bot) => bot.botId === FIRST_BOT_ID);
        let odrderedBots = [];
        if (firstBot) {
            odrderedBots.push(firstBot);
            const rest = bots?.filter((bot) => bot.botId !== FIRST_BOT_ID);
            if (rest.length > 0) odrderedBots = odrderedBots.concat(rest);
        } else {
            odrderedBots = bots;
        }
        if (list.length > 0) odrderedBots = odrderedBots.concat(list);
        return odrderedBots;
    };

    loadLatestCatelog = async () => {
        try {
            const bots = await Bot.getInstalledBots();
            const defaultBots = await SystemBot.getDefaultBots();
            const installedBots = _.reject(bots, (bot) =>
                _.find(defaultBots, { botId: bot.botId })
            );
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
                    });

                    this.setState({
                        botList: this.getSortedBotList(catalog.bots),
                        loading: false,
                        refreshing: false
                    });
                })
                .catch((error) => {});
        } catch (error) {
            console.log('BOTSTORE: Botstore error', error);
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    };

    handleBannerClicks = (item) => {
        if (item.botId) {
            NavigationAction.goToBotChat({
                bot: item,
                botName: item.botName,
                otherUserId: false,
                botLogoUrl: item.logoUrl,
                hideLogo: true
            });
        } else {
            if (item.type === 'screen') {
                NavigationAction.push(item.data);
            }
        }
    };
    componentDidMount() {
        this.props.navigation.setParams({
            domain: this.props.appState.currentDomain
        });
        if (Platform.OS === 'android') {
            const { initialProps } = this.props.route.params || {};
            VideoCallsAndroid.handleInitialCalls(initialProps);
        }
    }

    showPermission = () => {
        AsyncStorage.getItem('newLogin').then((newLogin) => {
            if (newLogin === 'yes') {
                AsyncStorage.setItem('newLogin', 'no');
                NavigationAction.push(
                    NavigationAction.SCREENS.PermissionRequest
                );
            }
        });
    };

    async updateData() {
        await synchronizeUserData();
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.currentDomain !=
            this.props.appState.currentDomain
        ) {
            this.props.navigation.setParams({
                domain: this.props.appState.currentDomain
            });
            this.props.navigation.setParams({
                domain: this.props.appState.currentDomain
            });
            this.updateData();
        }
    }

    showLoader = () => {
        const { appState, downloadingInitialBot } = this.props;
        if (downloadingInitialBot) return true;
        global.timelineLoaded =
            appState.userDataSynchronized &&
            !appState.activeInstalls?.length > 0;
        return !appState.allConversationsLoaded;
    };

    getBotImage = (domain, botId) => {
        return `https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/${domain}/${botId}.png`;
    };

    renderItem = ({ item }) => {
        if (item.botId)
            return (
                <Card
                    key={item.botId}
                    style={{
                        backgroundColor: GlobalColors.contentBackgroundColor,
                        borderRadius: 10,
                        overflow: 'hidden'
                    }}
                >
                    <CachedImage
                        imageTag={item.logoUrl}
                        source={{
                            uri: this.getBotImage(item.userDomain, item.botId)
                        }}
                        style={{ width: '100%', height: 100 }}
                        resizeMode="cover"
                        borderRadius={10}
                        placeholderSource={images.homeBanner_placeholder}
                    />
                    <View
                        style={{
                            paddingHorizontal: 24,
                            marginTop: 20,
                            marginBottom: 24
                        }}
                    >
                        {item.description && (
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: GlobalColors.primaryTextColor,
                                    textAlign: 'center'
                                }}
                            >
                                {item.description}
                            </Text>
                        )}
                        {item.botName && (
                            <TouchableOpacity
                                style={{
                                    height: 40,
                                    marginTop: 20,
                                    paddingHorizontal: 20,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    backgroundColor:
                                        GlobalColors.primaryButtonColor
                                }}
                                onPress={() => {
                                    this.handleBannerClicks(item);
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: AppFonts.BOLD,
                                        textAlign: 'center',
                                        color: GlobalColors.primaryButtonText
                                    }}
                                >
                                    {item.botName}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>
            );
        else {
            return (
                <Card
                    key={item.image}
                    style={{
                        backgroundColor: GlobalColors.contentBackgroundColor,
                        borderRadius: 10,
                        overflow: 'hidden'
                    }}
                >
                    <CachedImage
                        imageTag={item.image}
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: 100 }}
                        resizeMode="cover"
                        borderRadius={10}
                        placeholderSource={images.homeBanner_placeholder}
                    />
                    <View
                        style={{
                            paddingHorizontal: 24,
                            marginTop: 20,
                            marginBottom: 24
                        }}
                    >
                        {item.info && (
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: GlobalColors.primaryTextColor
                                }}
                            >
                                {item.info}
                            </Text>
                        )}
                        {item.title && (
                            <TouchableOpacity
                                style={{
                                    height: 40,
                                    marginTop: 20,
                                    paddingHorizontal: 20,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    backgroundColor:
                                        GlobalColors.primaryButtonColor
                                }}
                                onPress={() => {
                                    this.handleBannerClicks(item);
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: AppFonts.BOLD,
                                        textAlign: 'center',
                                        color: GlobalColors.primaryButtonText
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>
            );
        }
    };

    render() {
        if (this.showLoader()) {
            return (
                <View
                    style={{
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: GlobalColors.appBackground
                    }}
                >
                    <View style={{ width: '100%', padding: 32 }}>
                        <Image
                            style={{
                                alignSelf: 'center',
                                marginBottom: 32,
                                height: 48,
                                width: 48
                            }}
                            source={images.rontm_home_logo}
                            resizeMode="contain"
                        />
                        <ProgressBar
                            indeterminate
                            color={GlobalColors.frontmLightBlue}
                        />
                        <Text
                            style={{
                                alignSelf: 'center',
                                marginTop: 12,
                                fontSize: 12,
                                fontWeight: AppFonts.BOLD,
                                color: GlobalColors.chatTitle
                            }}
                        >
                            Downloading...
                        </Text>
                    </View>
                </View>
            );
        }
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    style={{ paddingHorizontal: 24 }}
                    data={this.state.botList}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 20 }} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => {
                                this.setState({ refreshing: true });
                                this.updateCatalog();
                            }}
                        />
                    }
                    ListFooterComponent={() => (
                        <TouchableOpacity
                            style={{ alignSelf: 'center', margin: 24 }}
                            onPress={() => {
                                NavigationAction.pushNew(
                                    NavigationAction.SCREENS.webview,
                                    { url: 'http://www.frontm.com/' }
                                );
                            }}
                        >
                            <Image source={images.poweredBy} />
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    domain: state.user.currentDomain,
    domains: state.user.userDomains,
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(CustomHome);
