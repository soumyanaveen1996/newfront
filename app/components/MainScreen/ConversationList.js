import React from 'react';
import { View, ListView, ActivityIndicator } from 'react-native';
import { Conversation } from '../../lib/conversation';
import { BotListStyles } from './styles';
import ConversationListItem from './ConversationListItem';
import { MainScreenStyles } from './styles';
import Utils from './Utils';
import _ from 'lodash';
import { Promise } from '../../lib/capability';

export default class ConversationList extends React.Component {

    constructor(props) {
        super(props);
        this.conversationsLoaded = false;

        this.state = {
            conversations: []
        }
    }

    async componentDidMount() {
        let conversations = await  Promise.resolve(Conversation.getAllIMConversations());
        conversations = conversations || [];

        let allChatsData = await Promise.all(_.map(conversations, async (conversation) => {
            let chatData = await Promise.resolve(Utils.getMessageDataForConversation(conversation));
            return { conversation, chatData };
        })).catch((e) => {
            console.log('Error getting info for conversations', e);
            return [];
        });

        // Sort with the most recent date at top
        allChatsData = _.orderBy(allChatsData, (o) => o.chatData.lastMessageDate, 'desc');

        let self = this;
        self.conversationsLoaded = true;
        this.setState({ conversations: allChatsData }, function (err, res) {
            if (!err) {
                self.conversationsLoaded = true;
            }
        });
    }

    render() {
        if (!this.conversationsLoaded) {
            return (
                <View>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        if (this.state.conversations.length < 1 ) {
            return (
                <View />
            );
        }

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
        const dataSource = ds.cloneWithRows(this.state.conversations);
        return (
            <View style={MainScreenStyles.container}>
                <View style={{ flex: 1 }}>
                    <ListView containerStyles={BotListStyles.container}
                        style={BotListStyles.listViewStyle}
                        dataSource={dataSource}
                        renderRow={(conversation) => <ConversationListItem conversation={conversation.conversation} chatData={conversation.chatData} />}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={BotListStyles.separator} />}
                    />
                </View>
            </View>
        );
    }
}


