import React from 'react';
import {
    ActivityIndicator,
    ListView,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import { BotListStyles, MainScreenStyles } from './styles';
import BotListItem from './BotListItem';
import ConversationListItem from './ConversationListItem';
import { Conversation } from '../../lib/conversation';
import { Auth } from '../../lib/capability';
import Utils from './Utils';
import _ from 'lodash';
import { Promise } from '../../lib/capability';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import { connect } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import I18n from '../../config/i18n/i18n';
import Icon from 'react-native-vector-icons/EvilIcons';
import { setAllChatsData } from '../../redux/actions/TimeLineActions';

import { Actions, ActionConst } from 'react-native-router-flux';
import { Icons } from '../../config/icons';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
const R = require('ramda');
const isEqual = require('react-fast-compare');

const hiddenItemWidth = wp('25%');
class BotList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            data: [],
            favData: []
        };
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async componentDidMount() {
        this.mounted = true;
        this.refresh();
    }
    async componentWillMount() {
        // await RemoteBotInstall.syncronizeBots()
    }

    async refresh() {
        // TODO: In general overall performance of this is questionable. We need a better way to know what has changed and bubble that up

        const bots = this.props.bots;
        let conversations =
            (await Promise.resolve(Conversation.getLocalConversations())) || [];
        let user = await Auth.getUser();
        // All
        let allChats = [];
        conversations.forEach(conversation => {
            allChats.push({
                key: conversation.conversationId,
                type: 'conversation',
                bot: conversation
            });
        });

        bots.forEach(bot => {
            allChats.push({ key: bot.botId, type: 'bot', bot: bot });
        });
        let allChatsData = await Promise.all(
            _.map(allChats, async (conversation, index) => {
                let chatData = null;
                if (conversation.type === 'bot') {
                    chatData = await Promise.resolve(
                        Utils.getMessageDataForBot(conversation.bot)
                    );
                } else {
                    chatData = await Promise.resolve(
                        Utils.getMessageDataForConversation(
                            conversation.bot,
                            user
                        )
                    );
                }
                // QUICK FIX AS WEB CARD CRASHES UI---> DAVIDE TO CHECK LATER
                if (
                    chatData.lastMessage &&
                    chatData.lastMessage.getMessageType() === 'web_card'
                ) {
                    chatData.lastMessage = null;
                }
                conversation.chatData = chatData;

                return conversation;
            })
        ).catch(e => {
            console.error('Error getting info for timeline', e);
            return [];
        });
        // Sort with the most recent date at top
        allChatsData = _.orderBy(
            allChatsData,
            o => o.chatData.lastMessageDate,
            'desc'
        );

        const favData = allChatsData
            .filter(chat => chat.type === 'conversation')
            .filter(chat => chat.bot.favorite == 1)
            .map(chat => ({
                ...chat,
                elemType: 'favorite'
            }));
        const recentData = allChatsData
            .filter(chat => !chat.bot.favorite || chat.bot.favorite == 0)
            .map(chat => ({
                ...chat,
                elemType: 'recents'
            }));

        const AllTimelineData =
            favData.length > 0
                ? [
                    { elemType: 'search' },
                    // { elemType: 'buttons' },
                    { elemType: 'header', headerText: 'Favourites' },
                    ...favData,
                    { elemType: 'header', headerText: 'Recents' },
                    ...recentData
                ]
                : [
                    { elemType: 'search' },
                    // { elemType: 'buttons' },
                    ...favData,
                    { elemType: 'header', headerText: 'Recents' },
                    ...recentData
                ];

        const prevTimeline = this.props.timeline.allChats;
        if (!isEqual(prevTimeline, AllTimelineData)) {
            this.props.setAllChatsData(AllTimelineData);
            this.setState(
                {
                    loaded: true,
                    data: R.take(AllTimelineData.length - 1, AllTimelineData)
                },
                () => {
                    this.setState({
                        loaded: true,
                        data: AllTimelineData
                    });
                }
            );
        }
    }

    applyFilter = chats => {
        if (!chats.type) {
            return true;
        }
        if (chats.type === 'bot') {
            return chats.bot.botName
                .toLowerCase()
                .includes(this.props.searchString.toLowerCase());
        }
        if (chats.type === 'conversation') {
            return chats.chatData.chatName
                .toLowerCase()
                .includes(this.props.searchString.toLowerCase());
        }
    };
    renderSearchBar = ({ onSearch }) => {
        return (
            <View style={MainScreenStyles.searchArea}>
                <Icon
                    style={MainScreenStyles.searchIcon}
                    name="search"
                    size={24}
                    color="rgba(0, 189, 242, 1)"
                />
                <TextInput
                    style={MainScreenStyles.input}
                    placeholder={I18n.t('Search_conv')}
                    onChangeText={searchString => onSearch(searchString)}
                    underlineColorAndroid="transparent"
                />
            </View>
        );
    };
    renderButtonBar = () => {
        return (
            <View style={MainScreenStyles.buttonArea}>
                <TouchableOpacity
                    style={MainScreenStyles.buttonContainerChat}
                    onPress={() =>
                        Actions.tabBarChat({
                            type: 'push'
                        })
                    }
                >
                    <Image
                        source={require('../../images/tabbar-contacts/chat-good.png')}
                        style={{ height: hp('5.5%'), width: hp('5.5%') }}
                        resizeMode="contain"
                    />
                    {/* <View>{Icons.chatW()}</View> */}
                    {/* <Text style={MainScreenStyles.buttonText}>New Chat</Text> */}
                </TouchableOpacity>
                <TouchableOpacity
                    style={MainScreenStyles.buttonContainerCall}
                    onPress={() =>
                        Actions.tabBarCall({
                            type: 'push'
                        })
                    }
                >
                    <View>{Icons.callW()}</View>
                    {/* <Text style={MainScreenStyles.buttonText}>New Call</Text> */}
                </TouchableOpacity>
            </View>
        );
    };
    renderHeader = ({ headerText }) => {
        return <Text style={MainScreenStyles.titleText}>{headerText}</Text>;
    };
    render() {
        const { loaded, data } = this.state;
        // const allFavs = favData.filter(chats => this.applyFilter(chats))
        const allData = data.filter(chats => this.applyFilter(chats));

        if (!loaded) {
            return (
                <View style={BotListStyles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={BotListStyles.listViewStyle}>
                    {
                        <SwipeListView
                            useFlatList
                            data={allData}
                            renderItem={(chat, rowMap) => {
                                const { item = null, index, separators } = chat;
                                let rowItem = <View />;
                                // return <View />
                                if (item.elemType === 'search') {
                                    rowItem = this.renderSearchBar({
                                        onSearch: this.props.onSearch
                                    });
                                }
                                if (item.elemType === 'buttons') {
                                    rowItem = this.renderButtonBar();
                                }
                                if (item.elemType === 'header') {
                                    rowItem = this.renderHeader({
                                        headerText: item.headerText
                                    });
                                }

                                if (
                                    item.elemType === 'favorite' ||
                                    item.elemType === 'recents'
                                ) {
                                    rowItem =
                                        item.type === 'bot' ? (
                                            <BotListItem
                                                bot={item.bot}
                                                chatData={item.chatData}
                                                onBack={this.props.onBack}
                                            />
                                        ) : (
                                            <ConversationListItem
                                                conversation={item.bot}
                                                chatData={item.chatData}
                                                onBack={this.props.onBack}
                                            />
                                        );
                                }
                                return rowItem;
                            }}
                            renderHiddenItem={(hdata, rowMap) => {
                                const {
                                    item: {
                                        type = null,
                                        elemType,
                                        bot = null,
                                        chatData = null
                                    }
                                } = hdata;

                                const Favorite =
                                    type && type === 'conversation' ? (
                                        <FavoriteView
                                            conversationId={bot.conversationId}
                                            onClick={
                                                elemType === 'favorite'
                                                    ? this.props.unsetFavorite
                                                    : this.props.setFavorite
                                            }
                                            chatData={chatData}
                                            unfavorite={elemType === 'favorite'}
                                        />
                                    ) : null;
                                return Favorite;
                            }}
                            leftOpenValue={hiddenItemWidth}
                        />
                    }
                </View>
            );
        }
    }
}

const FavoriteView = ({
    conversationId,
    onClick,
    chatData,
    unfavorite = undefined
}) => (
    <TouchableOpacity
        style={BotListStyles.favItemContainer}
        onPress={() => onClick(conversationId, chatData)}
    >
        <Image
            source={require('../../images/botlist/add-remove-favorite-btn.png')}
        />
        <Text style={BotListStyles.favText}>
            {unfavorite ? 'Remove Favorite' : 'Add Favorite'}
        </Text>
    </TouchableOpacity>
);

const mapStateToProps = state => ({
    timeline: state.timeline
});

const mapDispatchToProps = dispatch => {
    return {
        setAllChatsData: data => dispatch(setAllChatsData(data))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(BotList);
