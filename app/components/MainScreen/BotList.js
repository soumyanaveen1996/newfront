import React from 'react';
import {
    ActivityIndicator,
    ListView,
    View,
    Text,
    TouchableOpacity,
    Image
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

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
            .filter(chat => chat.bot.favorite == 1);
        const recentData = allChatsData.filter(
            chat => !chat.bot.favorite || chat.bot.favorite == 0
        );

        this.setState(
            {
                loaded: false,
                data: [],
                favData: []
            },
            () => {
                this.setState({
                    loaded: true,
                    data: recentData,
                    favData: favData
                });
            }
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    applyFilter = chats => {
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
    render() {
        const { loaded, data, favData } = this.state;
        const allFavs = favData.filter(chats => this.applyFilter(chats));
        const allRecents = data.filter(chats => this.applyFilter(chats));

        if (!loaded) {
            return (
                <View style={BotListStyles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={BotListStyles.listViewStyle}>
                    {allFavs.length > 0 ? (
                        <View style={MainScreenStyles.favArea}>
                            <Text style={MainScreenStyles.titleText}>
                                Favorites
                            </Text>
                            <SwipeListView
                                useFlatList
                                data={allFavs}
                                renderItem={(chat, rowMap) => {
                                    const { item, index, separators } = chat;
                                    const rowItem =
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
                                    return rowItem;
                                }}
                                renderHiddenItem={(hdata, rowMap) => {
                                    const {
                                        item: { type, bot, chatData }
                                    } = hdata;
                                    const Favorite =
                                        type === 'conversation' ? (
                                            <FavoriteView
                                                conversationId={
                                                    bot.conversationId
                                                }
                                                onClick={
                                                    this.props.unsetFavorite
                                                }
                                                chatData={chatData}
                                                unfavorite
                                            />
                                        ) : null;
                                    return Favorite;
                                }}
                                leftOpenValue={hiddenItemWidth}
                            />
                        </View>
                    ) : null}
                    <View
                        style={
                            allFavs.length > 0
                                ? MainScreenStyles.chatArea
                                : MainScreenStyles.chatAreaNoFav
                        }
                    >
                        <Text style={MainScreenStyles.titleText}>Recents</Text>
                        <SwipeListView
                            useFlatList
                            data={allRecents}
                            renderItem={(chat, rowMap) => {
                                const { item, index, separators } = chat;
                                let last = false;
                                if (allRecents.length - 1 === index) {
                                    last = true;
                                }
                                const rowItem =
                                    item.type === 'bot' ? (
                                        <BotListItem
                                            bot={item.bot}
                                            chatData={item.chatData}
                                            onBack={this.props.onBack}
                                            last={last}
                                        />
                                    ) : (
                                        <ConversationListItem
                                            conversation={item.bot}
                                            chatData={item.chatData}
                                            onBack={this.props.onBack}
                                            last={last}
                                        />
                                    );
                                return rowItem;
                            }}
                            renderHiddenItem={(hdata, rowMap) => {
                                const {
                                    item: { type, bot, chatData }
                                } = hdata;
                                const Favorite =
                                    type === 'conversation' ? (
                                        <FavoriteView
                                            conversationId={bot.conversationId}
                                            onClick={this.props.setFavorite}
                                            chatData={chatData}
                                        />
                                    ) : null;
                                return Favorite;
                            }}
                            leftOpenValue={hiddenItemWidth}
                            // rightOpenValue={-75}
                        />
                    </View>
                </View>
                // <ListView
                //     containerStyles={BotListStyles.container}
                //     style={BotListStyles.listViewStyle}
                //     dataSource={this.state.dataSource}
                //     renderRow={chat =>
                //         chat.key === 'bot' ? (
                //             <BotListItem
                //                 bot={chat.bot}
                //                 chatData={chat.chatData}
                //                 onBack={this.props.onBack}
                //             />
                //         ) : (
                //             <ConversationListItem
                //                 conversation={chat.bot}
                //                 chatData={chat.chatData}
                //                 onBack={this.props.onBack}
                //             />
                //         )
                //     }
                //     renderSeparator={(sectionId, rowId) => (
                //         <View key={rowId} style={BotListStyles.separator} />
                //     )}
                //     enableEmptySections={true}
                // />
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
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(BotList);
