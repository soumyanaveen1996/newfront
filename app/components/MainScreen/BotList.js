import React from 'react';
import { ActivityIndicator, ListView, View, Text } from 'react-native';
import { BotListStyles } from './styles';
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

class BotList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
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
            allChats.push({ key: 'conversation', bot: conversation });
        });

        bots.forEach(bot => {
            allChats.push({ key: 'bot', bot: bot });
        });
        let allChatsData = await Promise.all(
            _.map(allChats, async (conversation, index) => {
                let chatData = null;
                if (conversation.key === 'bot') {
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

        this.setState(
            {
                loaded: false,
                data: []
            },
            () => {
                this.setState({ loaded: true, data: allChatsData });
            }
        );

        // if (this.mounted) {
        //     let currentData = this.state.data
        //     const ds = new ListView.DataSource({
        //         rowHasChanged: (r1, r2) => r1 !== r2
        //     })

        //     if (currentData) {
        //         // ABOSLUTELY SHITTY HACK DUE TO A BUG IN ListView:
        //         // https://stackoverflow.com/questions/31738671/react-native-updating-list-view-datasource
        //         this.setState(
        //             {
        //                 loaded: true,
        //                 dataSource: ds.cloneWithRows([]),
        //                 data: allChatsData,
        //                 reload: false
        //             },
        //             function(err, res) {
        //                 if (!err) {
        //                     this.setState({
        //                         loaded: true,
        //                         dataSource: ds.cloneWithRows(allChatsData),
        //                         data: allChatsData,
        //                         reload: true
        //                     })
        //                 }
        //             }
        //         )
        //     } else {
        //         this.setState({
        //             loaded: true,
        //             dataSource: ds.cloneWithRows(allChatsData),
        //             data: allChatsData
        //         })
        //     }
        // }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        const { loaded } = this.state;

        if (!loaded) {
            return (
                <View style={BotListStyles.loading}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={BotListStyles.listViewStyle}>
                    <SwipeListView
                        useFlatList
                        data={this.state.data}
                        randomProp={this.state.updated}
                        renderItem={(chat, rowMap) => {
                            const { item, index, separators } = chat;
                            const rowItem =
                                item.key === 'bot' ? (
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
                        renderHiddenItem={(data, rowMap) => (
                            <View>
                                <Text>Left</Text>
                                <Text>Right</Text>
                            </View>
                        )}
                        leftOpenValue={75}
                        rightOpenValue={-75}
                    />
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
