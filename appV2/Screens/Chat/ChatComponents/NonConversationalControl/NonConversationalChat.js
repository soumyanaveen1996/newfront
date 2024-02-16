import React from 'react';
import _ from 'lodash';
import {
    KeyboardAvoidingView,
    View,
    SafeAreaView,
    Platform,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import styles, { chatBarStyle } from '../../styles';
import Constants from '../../../../config/constants';
import Utils from '../../../../lib/utils';
import { BackgroundImage } from '../../../../widgets/BackgroundImage';
import images from '../../../../config/images';
import { NetworkStatusNotchBar } from '../../../../widgets/NetworkStatusBar';
import { connect } from 'react-redux';
import ChatMessage from '../ChartMessage';
import { Message } from '../../../../lib/capability';
import { HeaderBack, HeaderTitle } from '../../../../widgets/Header';
import NetworkButton from '../../../../widgets/Header/NetworkButton';
import NavigationAction from '../../../../navigation/NavigationAction';

class NonConversationalChat extends React.Component {
    componentDidMount() {
        if (this.props.navigation) {
            this.props.navigation.setParams({ bot: this.props.bot });
        }
        this.setState({forBotChatNonConBotName:this.props.bot?.botName})
    }

    onChangeText(text) {
        if (text) {
            this.setState({ text: text });
        } else {
            this.setState({ text: '' });
        }
    }

    async sendMessage() {
        const messageStr = this.state.text && this.state.text.trim();
        if (!messageStr || messageStr === '') {
            return;
        }
        if (this.props.onSend) {
            let message = new Message();
            message.setCreatedBy(this.getUserId());
            message.stringMessage(messageStr);
            // message.htmlMessage(htmlMessageTest)
            message.setRead(true);
            await this.props.sendMessage(message);
            this.setState({ text: '' });
        }
    }

    renderChatInputBar() {
        return (
            <View style={{ alignItems: 'center' }}>
                <View style={chatBarStyle(this.props.userData.network)}>
                    <TextInput
                        value={this.state.text}
                        style={styles.chatTextInput}
                        underlineColorAndroid="transparent"
                        placeholder="Aa"
                        multiline
                        onChangeText={this.onChangeText.bind(this)}
                    />
                    {this.state.text ? (
                        <TouchableOpacity
                            accessibilityLabel="Right Button Send"
                            testID="right-button-send"
                            onPress={this.sendMessage.bind(this)}
                        >
                            <Image
                                source={images.btn_send}
                                style={styles.chatBarSendButton}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            // <ChatInputBar
            //     conversational={false}
            //     accessibilityLabel="Chat Input Bar"
            //     testID="chat-input-bar"
            //     network={this.state.network}
            //     onSend={this.props.onSendMessage}
            //     botId={this.props.botId}
            // />
        );
    }

    renderItem({ item }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            return (
                <ChatMessage
                    message={message}
                    isUserChat={false}
                    shouldShowUserName={false}
                    user={this.user}
                    imageSource={{ uri: this.props.bot.logoUrl }}
                    showTime={item.showTime}
                    conversationContext={this.props.conversationContext}
                />
            );
        } else {
            return (
                <View>
                    <ChatMessage
                        showTime={item.showTime}
                        message={message}
                        // alignRight
                        conversationContext={this.props.conversationContext}
                    />
                    {this.props.messages.length == 2 ? (
                        <View style={{ height: 0 }} />
                    ) : null}
                </View>
            );
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.safeArea}>
                <NetworkStatusNotchBar />
                <BackgroundImage
                    accessibilityLabel="Messages List"
                    testID="messages-list"
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : null}
                        keyboardVerticalOffset={
                            Constants.DEFAULT_HEADER_HEIGHT +
                            (Utils.isiPhoneX() ? 24 : 0)
                        }
                        enabled
                    >
                        <View style={{ flex: 1 }}>
                            <FlatList
                                inverted
                                extraData={this.props.messages}
                                style={styles.messagesList}
                                keyboardShouldPersistTaps="handled"
                                accessibilityLabel="Messages List"
                                testID="messages-list"
                                data={this.props.messages}
                                renderItem={this.renderItem.bind(this)}
                            />
                            {this.renderChatInputBar()}
                        </View>
                    </KeyboardAvoidingView>
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userData: state.user,
        messages: state.bots.nonConvChatMessages
    };
};

export default connect(mapStateToProps)(NonConversationalChat);
