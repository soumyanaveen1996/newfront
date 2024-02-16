import React from 'react';
import { FlatList, KeyboardAvoidingView, RefreshControl } from 'react-native';
import Promise from '../../../lib/Promise';
import chatStyles from '../styles';
import ChatMessage from './ChatMessage';
import { Auth } from '../../../lib/capability';
import Config from '../config';
import Constants from '../../../config/constants';

import { HeaderBack } from '../../../widgets/Header';

import { MessageHandler } from '../../../lib/message';
var pageSize = Config.ChatMessageOptions.pageSize;
//TODO: review for optimization
export default class FavoriteMessages extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            offset: 0,
            refreshing: false
        };
        this.scrollToBottom = false;
        this.firstUnreadIndex = -1;

        this.user = null;
    }

    async componentDidMount() {
        // TODO: Remove mounted instance variable when we add some state mangement to our app.
        this.mounted = true;
        let self = this;

        try {
            if (this.props.onBack) {
                this.props.navigation.setParams({ onBack: this.props.onBack });
            }

            // 1. Get the user
            self.user = Auth.getUserData();

            // 3. Get messages for this bot / chat
            let messages = await this.loadMessages();

            if (!this.mounted) {
                return;
            }

            // 4. Update the state of the bot with the messages we have
            this.setState({ messages: messages });
        } catch (e) {
            console.error('Error occurred during componentWillMount; ', e);
            // TODO: handle errors
        }
    }

    componentWillUnmount = () => {
        this.mounted = false;
    };

    async loadMessages() {
        let messages = await MessageHandler.fetchFavoriteMessages(
            pageSize,
            this.state.offset
        );
        if (this.mounted) {
            this.setState({
                offset: this.state.offset + pageSize + 1
            });
        }
        return messages;
    }

    renderItem({ item }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            return (
                <ChatMessage
                    message={message}
                    hideFavoriteIcon={false}
                    style={{ backgroundColor: 'red' }}
                />
            );
        } else {
            return (
                <ChatMessage
                    message={message}
                    alignRight
                    hideFavoriteIcon={false}
                />
            );
        }
    }

    onChatEndReached(info) {
        if (this.scrollToBottom && info.distanceFromEnd > 0) {
            this.chatList.scrollToEnd({ animated: true });
        } else {
            if (this.firstUnreadIndex !== -1) {
                // This can throw error sometimes https://github.com/facebook/react-native/issues/14198
                try {
                    this.chatList.scrollToIndex({
                        index: this.firstUnreadIndex,
                        viewPosition: 0
                    });
                } catch (error) {
                    this.chatList.scrollToEnd({ animated: true });
                }
                this.firstUnreadIndex = -1;
            }
        }
    }

    async onRefresh() {
        this.setState({
            refreshing: true
        });
        let messages = await this.loadMessages();
        let combinedMsgs = messages.concat(this.state.messages);
        if (this.mounted) {
            this.setState({
                messages: combinedMsgs,
                refreshing: false
            });
        }
    }

    render() {
        // react-native-router-flux header seems to intefere with padding. So
        // we need a offset as per the header size
        return (
            <KeyboardAvoidingView
                style={chatStyles.container}
                behavior="padding"
                keyboardVerticalOffset={Constants.DEFAULT_HEADER_HEIGHT}
            >
                <FlatList
                    ref={(list) => {
                        this.chatList = list;
                    }}
                    inverted
                    data={this.state.messages}
                    renderItem={this.renderItem.bind(this)}
                    onEndReachedThreshold={10}
                    onEndReached={this.onChatEndReached.bind(this)}
                    refreshControl={
                        <RefreshControl
                            colors={['#9Bd35A', '#689F38']}
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                />
            </KeyboardAvoidingView>
        );
    }
}
