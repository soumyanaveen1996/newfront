import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { ProgressBar } from 'react-native-paper';
import { BotListStyles, MainScreenStyles } from './styles';
import BotListItem from './BotListItem';
import ConversationListItem from './ConversationListItem';
import { Conversation } from '../../../lib/conversation';
import { Auth, Channel } from '../../../lib/capability';
import RemoteBotInstall from '../../../lib/RemoteBotInstall';
import I18n from '../../../config/i18n/i18n';
import { setAllChatsData } from '../../../redux/actions/TimeLineActions';

import { Icons } from '../../../config/icons';
import GlobalColors from '../../../config/styles';
import CustomPlaceholder from './CustomPlaceholder';
import images from '../../../config/images';

import config from '../../../config/config';
import { Icon } from '@rneui/themed';
import Store from '../../../redux/store/configureStore';
import { AuthenticationModal } from '../../../widgets';
import NavigationAction from '../../../navigation/NavigationAction';
import { reInitUserData } from '../../../redux/actions/UserActions';
import { NetworkHandler, NetworkPoller } from '../../../lib/network';
import TimelineBuilder from '../../../lib/TimelineBuilder/TimelineBuilder';
import EventEmitter, { TimelineEvents } from '../../../lib/events';
import configToUse from '../../../config/config';
import HomeLinks from './HomeLinks';
import SearchBar from '../../../widgets/SearchBar';
import AppFonts from '../../../config/fontConfig';

const R = require('ramda');

const hiddenItemWidth = 80;

export const FAVOURITE_BOTS = 'favourite_bots';
class BotList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            data: [],
            favData: [],
            rowMap: null,
            rowKey: null,
            stopFaker: false,
            refreshing: false,
            emptyScreen: false,
            isAuthModalVisible: false,
            isBotAccessible: false,
            is2FaEnable: false,
            searchingText: false
        };
        this.swiperListRef = React.createRef();
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.timelineEventListener) this.timelineEventListener.remove();
    }

    async componentDidMount() {
        this.mounted = true;
        this.refresh();
        const {
            info: { softwareMfaEnabled }
        } = Auth.getUserData();
        this.setState({ is2FaEnable: softwareMfaEnabled });

        this.timelineEventListener = EventEmitter.addListener(
            TimelineEvents.timelineChanged,
            (data) => {
                this.refreshTimeline(data);
            }
        );
        this.timelineEventListener = EventEmitter.addListener(
            TimelineEvents.reloadTimeline,
            (data) => {
                this.forceUpdate();
            }
        );
    }

    refreshTimeline(timeline, force = false) {
        const chatCount = timeline.favData.length + timeline.recentData.length;
        if (
            this.props.user.remoteBotsInstalled &&
            this.props.user.allConversationsLoaded &&
            chatCount === 0
        ) {
            this.props.setNoChats(true);
        }

        const recentData = timeline.recentData;
        let newRecentData = [];
        if (this.props.user.firstLogin) {
            const onboardingIndex = recentData.findIndex(
                (data) => data.key === 'onboarding-bot'
            );
            if (onboardingIndex >= 0) {
                const head = recentData.slice(0, onboardingIndex);
                const tail = recentData.slice(
                    onboardingIndex + 1,
                    recentData.length
                );
                newRecentData = [recentData[onboardingIndex], ...head, ...tail];
            } else {
                newRecentData = recentData;
            }
        } else {
            newRecentData = recentData;
        }
        const allTimelineData = [];

        if (timeline.favData.length > 0) {
            allTimelineData.push(...timeline.favData);
        }
        if (newRecentData.length > 0) {
            allTimelineData.push(...newRecentData);
        }

        this.setState(
            {
                data: allTimelineData,
                emptyScreen: !(allTimelineData.length > 1),
                stopFaker: true,
                refreshing: false
            },
            () => {
                if (force) {
                    setTimeout(() => {
                        // NetworkPoller.startPolling();
                        NetworkHandler.readLambda();
                    }, 1000);
                }
            }
        );
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.user.network !== this.props.user.network &&
            this.props.user.network === 'full'
        ) {
            this.setState({ refreshing: false });
        }
    }

    async refresh(force, from) {
        this.makeTimeLine(force, from);
    }

    async makeTimeLine(force, from) {
        // TODO: In general overall performance of this is questionable. We need a better way to know what has changed and bubble that up
        // TEMP TEST ONLY ---- REMOVE
        if (force) {
            this.setState({ refreshing: true, stopFaker: false, data: [] });
            Store.dispatch(reInitUserData());
        }
        const timeline = await TimelineBuilder.buildTiimeline(false);
        if (timeline) {
            console.log('timeline from makeTimeline : ', timeline);
            this.refreshTimeline(timeline, true);
        }
    }

    applyFilter = (chats) => {
        if (!chats) {
            return true;
        }
        if (!chats.type) {
            return true;
        }
        if (chats.type === 'bot') {
            return (
                chats.bot.botName &&
                chats.bot.botName
                    .toLowerCase()
                    .includes(this.props.searchString.toLowerCase())
            );
        }
        if (chats.type === 'conversation') {
            return (
                chats.chatData.chatName &&
                chats.chatData.chatName
                    .toLowerCase()
                    .includes(this.props.searchString.toLowerCase())
            );
        }
    };

    renderSearchBar = () => (
        <View style={MainScreenStyles.searchArea}>
            <View style={MainScreenStyles.iosSearchArea}>
                <SearchBar
                    placeholder="Search conversation"
                    value={this.props.searchString}
                    onChangeText={(searchString) =>
                        this.props.onSearch(searchString)
                    }
                />
            </View>
        </View>
    );

    renderButtonBar = () => (
        <View style={MainScreenStyles.buttonArea}>
            <TouchableOpacity
                style={MainScreenStyles.buttonContainerChat}
                onPress={() => {
                    // Actions.tabBarChat({
                    //     type: 'push'
                    // });
                }}
            >
                <Image
                    source={images.chatIcon}
                    style={{ height: hp('5.5%'), width: hp('5.5%') }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={MainScreenStyles.buttonContainerCall}
                onPress={() => {
                    // Actions.tabBarCall({
                    //     type: 'push'
                    // });
                }}
            >
                <View>{Icons.callW()}</View>
            </TouchableOpacity>
        </View>
    );

    setFavorite = (
        key,
        rowMap,
        conversationId,
        botId,
        chatData,
        type,
        domain
    ) => {
        let setType = type;
        let favId = conversationId;

        if (type === 'conversation') {
            if (chatData.channel) {
                setType = 'channel';
            }
        }

        if (type === 'bot') {
            favId = botId;
        }
        this.props.setFavorite(
            favId,
            chatData,
            setType,
            chatData.otherUserId,
            domain
        );
        if (rowMap && rowMap[key]) {
            rowMap[key].closeRow();
        }
    };

    unsetFavorite = (
        key,
        rowMap,
        conversationId,
        botId,
        chatData,
        type,
        domain
    ) => {
        let setType = type;
        let favId = conversationId;
        if (type === 'conversation') {
            if (chatData.channel) {
                setType = 'channel';
            }
        }
        if (type === 'bot') {
            favId = botId;
        }

        this.props.unsetFavorite(
            favId,
            chatData,
            setType,
            chatData.otherUserId,
            domain
        );
        if (rowMap && rowMap[key]) {
            rowMap[key].closeRow();
        }
    };

    keyExtractor = (item, index) => {
        if (item.elemType == 'recents' || item.elemType === 'favorite') {
            return item.key;
        } else if (item.elemType == 'search') {
            return `search-${index}`;
        } else if (item.elemType == 'header') {
            return `header-${index}`;
        } else if (item.elemType == 'buttons') {
            return `buttons-${index}`;
        }
    };

    renderItem(chat, rowMap) {
        const { item = null } = chat;

        let rowItem = <View />;
        if (
            item.elemType === 'recents' &&
            chat.chatData?.awaitingForConfirmation === true
        )
            return rowItem;
        // if (item.elemType === 'search') {
        //     rowItem = this.renderSearchBar({
        //         onSearch: this.props.onSearch
        //     });
        // }
        if (item.elemType === 'buttons') {
            rowItem = this.renderButtonBar();
        }

        if (item.elemType === 'favorite' || item.elemType === 'recents') {
            rowItem =
                item.type === 'bot' ? (
                    <BotListItem
                        bot={item.bot}
                        chatData={item.chatData}
                        onBack={this.props.onBack}
                        onAuth={(dataToOpenBot) => {
                            this.setState({
                                isAuthModalVisible: true,
                                dataToOpenBot: dataToOpenBot
                            });
                        }}
                        isBotAccessible={this.state.isBotAccessible}
                        is2FaEnable={this.state.is2FaEnable}
                        botName={item.bot.botName}
                        isFavorite={item.bot.favorite}
                        allConvData={item}
                        onRefresh={this.onRefresh}
                    />
                ) : (
                    <ConversationListItem
                        conversation={item.bot}
                        chatData={item.chatData}
                        otherUserId={item.chatData.otherUserId}
                        channelId={item.chatData?.channel?.channelId}
                        onBack={this.props.onBack}
                        isFavorite={item.bot.favorite}
                        allConvData={item}
                        onRefresh={this.onRefresh}
                    />
                );
        }
        return rowItem;
    }

    onToggleFav = (selectedItem) => {
        const { chatData, key, elemType, type, bot } = selectedItem;
        if (elemType === 'favorite')
            this.unsetFavorite(
                key,
                null,
                bot.conversationId,
                bot.botId,
                chatData,
                type,
                bot.userDomain
            );
        else
            this.setFavorite(
                key,
                null,
                bot.conversationId,
                bot.botId,
                chatData,
                type,
                bot.userDomain
            );
    };

    renderHiddenItem(hdata, rowMap) {
        const {
            item: { type = null, elemType, bot = null, chatData = null, key }
        } = hdata;

        if (
            elemType === 'recents' &&
            chatData?.awaitingForConfirmation === true
        )
            return null;
        const Favorite =
            type && (type === 'conversation' || type === 'bot') ? (
                <FavoriteView
                    conversationId={bot.conversationId}
                    botId={bot.botId}
                    onClick={
                        elemType === 'favorite'
                            ? (conversationId, botId, chatData) =>
                                  this.unsetFavorite(
                                      key,
                                      rowMap,
                                      conversationId,
                                      botId,
                                      chatData,
                                      type,
                                      bot?.userDomain
                                  )
                            : (conversationId, botId, chatData) =>
                                  this.setFavorite(
                                      key,
                                      rowMap,
                                      conversationId,
                                      botId,
                                      chatData,
                                      type,
                                      bot?.userDomain
                                  )
                    }
                    chatData={chatData}
                    chatType={type}
                    unfavorite={elemType === 'favorite'}
                />
            ) : null;
        return Favorite;
    }

    showLoader = () => {
        const { user, downloadingInitialBot } = this.props;
        if (downloadingInitialBot) return true;
        global.timelineLoaded =
            user.userDataSynchronized && !user.activeInstalls?.length > 0;
        return !user.allConversationsLoaded;
    };

    onRefresh = () => {
        this.setState({ refreshing: true }, async () => {
            try {
                this.renderCount = 0;
                await Channel.refreshChannels();
                await Conversation.downloadRemoteConversations(false);
                await RemoteBotInstall.syncronizeBots(true);
                await this.props.updateTimeline();
                this.setState(
                    {
                        refreshing: false
                    },
                    () => {
                        this.renderCount = 0;
                    }
                );
            } catch (error) {
                this.setState({
                    refreshing: false
                });
            }
        });
    };

    itemSeparatorComponent = () => <View style={BotListStyles.itemSelerator} />;

    renderEmtyScreen = () => {
        return (
            <View
                style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Image source={images.empty_contact} />
                <Text
                    style={{
                        marginTop: 35,
                        color: GlobalColors.chatTitle
                    }}
                >
                    Use the buttons below to add contacts,
                </Text>
                <Text style={{ color: GlobalColors.chatTitle }}>
                    {I18n.t('SubscribeAndInstalApps')}
                </Text>
            </View>
        );
    };

    render() {
        const { loaded, data, stopFaker } = this.state;
        const clipped = Platform.OS !== 'ios';
        const { isAuthModalVisible } = this.state;
        // const allFavs = favData.filter(chats => this.applyFilter(chats))
        const allData = data.filter((chats) => this.applyFilter(chats));
        if (this.showLoader()) {
            return (
                <View
                    style={{
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center'
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
        if (configToUse.app.landingBot) {
            return (
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: 32,
                        justifyContent: 'center'
                    }}
                >
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
                </View>
            );
        }

        return (
            <View
                style={{
                    height: '100%',
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                <CustomPlaceholder
                    onReady={this.state.stopFaker}
                    animate="fade"
                >
                    <SwipeListView
                        ref={this.swiperListRef}
                        refreshControl={
                            this.props.user.network === 'full' && (
                                <RefreshControl
                                    onRefresh={this.onRefresh}
                                    refreshing={this.state.refreshing}
                                />
                            )
                        }
                        ListHeaderComponent={
                            <View>
                                {configToUse.showHomeBanners && <HomeLinks />}
                                {!config.app.hideSearchBar &&
                                    this.renderSearchBar()}
                            </View>
                        }
                        data={allData}
                        keyExtractor={this.keyExtractor}
                        closeOnScroll
                        closeOnRowPress
                        closeOnRowBeginSwipe
                        recalculateHiddenLayout
                        renderItem={this.renderItem.bind(this)}
                        renderHiddenItem={this.renderHiddenItem.bind(this)}
                        leftOpenValue={hiddenItemWidth}
                        previewRowKey="0"
                        previewOpenValue={-40}
                        previewOpenDelay={3000}
                        disableLeftSwipe
                        // Performance settings
                        removeClippedSubviews={clipped} // Unmount components when outside of window
                        initialNumToRender={8} // Reduce initial render amount
                        maxToRenderPerBatch={15} // Increase time between renders
                        windowSize={4} // Reduce the window size
                        leftActivationValue={200}
                        rightActivationValue={-200}
                        onLeftActionStatusChange={(res) => {
                            if (res.isActivated) {
                                const selectedItem = allData.find(
                                    (item) => item.key === res.key
                                );
                                console.log('res3, res', selectedItem);
                                this.swiperListRef.current.closeAllOpenRows();
                                this.onToggleFav(selectedItem);
                            }
                        }}
                        ListEmptyComponent={this.renderEmtyScreen}
                        ItemSeparatorComponent={this.itemSeparatorComponent}
                    />
                </CustomPlaceholder>
                <AuthenticationModal
                    isModalVisible={isAuthModalVisible}
                    is2FaEnable={this.state.is2FaEnable}
                    botId={this.state.dataToOpenBot?.bot?.botId}
                    setBotAccessible={(flag) => {
                        if (flag) {
                            NavigationAction.goToBotChat(
                                this.state.dataToOpenBot
                            );
                        }
                        this.setState({
                            isAuthModalVisible: false,
                            authModalAction: null
                        });
                    }}
                />
            </View>
        );
    }
}

const FavoriteView = ({
    conversationId,
    botId,
    onClick,
    chatData,
    unfavorite = undefined,
    chatType
}) => (
    <TouchableOpacity
        style={BotListStyles.favItemContainer}
        onPress={() => onClick(conversationId, botId, chatData, chatType)}
    >
        <View style={BotListStyles.favItemView}>
            {unfavorite ? (
                <Icon
                    containerStyle={BotListStyles.favIcon}
                    color={'#ffffff'}
                    name={'star-outline'}
                />
            ) : (
                <Icon
                    containerStyle={BotListStyles.favIcon}
                    color={'#ffffff'}
                    name={'star'}
                />
            )}
            <Text style={BotListStyles.favText}>
                {unfavorite ? 'Remove' : 'Favourite'}
            </Text>
        </View>
    </TouchableOpacity>
);

const mapStateToProps = (state) => ({
    timeline: state.timeline,
    user: state.user
});

const mapDispatchToProps = (dispatch) => ({
    setAllChatsData: (data) => dispatch(setAllChatsData(data))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(BotList);
