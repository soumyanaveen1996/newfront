import React from 'react';
import _ from 'lodash';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    RefreshControl,
    View,
    TouchableHighlight,
    Text
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import Promise from '../../lib/Promise';
import chatStyles from './styles';
import ChatInputBar from './ChatInputBar';
import ChatMessage from './ChatMessage';
import Slider from '../Slider/Slider';
import { Message, Contact, MessageTypeConstants, Auth } from '../../lib/capability';
import dce from '../../lib/dce';
import images from '../../config/images';
import I18n from '../../config/i18n/i18n';
import Config from './config';
import Constants from '../../config/constants';
import PathParse from 'path-parse';

import { HeaderBack } from '../Header';

import { MessageHandler } from '../../lib/message';
import { AsyncResultEventEmitter, NETWORK_EVENTS_CONSTANTS, Queue } from '../../lib/network';
var pageSize = Config.ChatMessageOptions.pageSize;

export default class FavoriteMessages extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerLeft: <HeaderBack onPress={state.params.onBack ? () => { Actions.pop(); state.params.onBack() } : Actions.pop} />
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            offset: 0,
            refreshing: false,
        };
        this.scrollToBottom = false
        this.firstUnreadIndex = -1

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
            self.user = await Promise.resolve(Auth.getUser());

            // 3. Get messages for this bot / chat
            let messages = await this.loadMessages();

            if (!this.mounted) { return; }

            // 4. Update the state of the bot with the messages we have
            this.setState({ messages: messages });
        } catch (e) {
            console.log('Error occurred during componentWillMount; ', e);
            // TODO: handle errors
        }
    }

    componentWillUnmount = () => {
        this.mounted = false;
    }

    async loadMessages() {
        let messages = await MessageHandler.fetchFavoriteMessages(pageSize, this.state.offset)
        if (this.mounted) {
            this.setState({
                offset: this.state.offset + pageSize + 1
            })
        }
        return messages;
    }

    renderItem({ item }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            return (
                <ChatMessage message={message} hideFavoriteIcon={false}
                    style={{ backgroundColor: 'red' }} />
            )
        } else {
            return (
                <ChatMessage message={message} alignRight hideFavoriteIcon={false} />
            )
        }
    }

    onChatEndReached(info) {
        if (this.scrollToBottom && info.distanceFromEnd > 0) {
            this.chatList.scrollToEnd({ animated: true });
        } else {
            if (this.firstUnreadIndex !== -1) {
                // This can throw error sometimes https://github.com/facebook/react-native/issues/14198
                try {
                    this.chatList.scrollToIndex({ index: this.firstUnreadIndex, viewPosition: 0 });
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
        })
        let messages = await this.loadMessages()
        let combinedMsgs = messages.concat(this.state.messages)
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
            <KeyboardAvoidingView style={chatStyles.container} behavior="padding" keyboardVerticalOffset={Constants.DEFAULT_HEADER_HEIGHT}>
                <FlatList ref={(list) => this.chatList = list}
                    inverted
                    data={this.state.messages}
                    renderItem={this.renderItem.bind(this)}
                    onEndReachedThreshold={10}
                    onEndReached={this.onChatEndReached.bind(this)}
                    refreshControl={
                        <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
                    }
                />
            </KeyboardAvoidingView>
        );
    }
}
