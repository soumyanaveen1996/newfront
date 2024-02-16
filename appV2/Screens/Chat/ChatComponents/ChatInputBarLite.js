import React from 'react';
import { TouchableOpacity, View, TextInput } from 'react-native';

import styles, { chatBarStyle } from '../styles';
import { ChatInputBarState } from '../config';
// import { MessageCounter } from '../../../lib/MessageCounter';
import GlobalColors from '../../../config/styles';
import { Icon } from '@rneui/themed';

//TODO: review for optimization
class ChatInputBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recordedTimeInSeconds: 0,
            text: '',
            chatState: ChatInputBarState.READY_FOR_SPEECH,
            showSwipe: false
        };
        this.chatListHeight = 100;
    }

    async componentWillUnmount() {
        console.log('the data is componentWillUnmount');
        // Stop recording when the user closes the app
        // await this.cancelRecording();
    }

    setInitialState = () => {
        this.setState({
            recordedTimeInSeconds: 0,
            text: '',
            chatState: ChatInputBarState.READY_FOR_SPEECH
        });
    };

    onChangeText = (text) => {
        if (text) {
            this.setState({ text, chatState: ChatInputBarState.TYPING });
        } else {
            this.setInitialState();
        }
    };

    sendMessage = () => {
        const { botId } = this.props;
        // if (botId) {
        //     if (MessageCounter.getAvailableBotMessageQuota(botId) <= 0) {
        //         this.showQuotaAlert();
        //         return;
        //     }
        // }

        const message = this.state.text && this.state.text.trim();
        if (!message || message === '') {
            return;
        }
        if (this.props.onSend) {
            this.props.onSend(message);
        }
        this.setInitialState();
    };

    render() {
        return (
            <View
                style={{
                    alignItems: 'center'
                }}
            >
                <View style={[chatBarStyle(), { alignItems: 'flex-end' }]}>
                    <TextInput
                        // onContentSizeChange={this.onChatListLayout}
                        value={this.state.text}
                        style={styles.chatTextInput}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                        underlineColorAndroid="transparent"
                        placeholder="Your message here…"
                        multiline
                        onChangeText={(text) => {
                            this.onChangeText(text);
                        }}
                    />
                    <View
                        style={{
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            alignSelf: 'center'
                        }}
                    >
                        <View>
                            <TouchableOpacity
                                accessibilityLabel="Right Button Send"
                                testID="right-button-send"
                                onPress={this.sendMessage}
                            >
                                <View
                                    style={[
                                        styles.micContainer,
                                        {
                                            backgroundColor:
                                                GlobalColors.toggleOnColor
                                        }
                                    ]}
                                >
                                    <Icon
                                        name={'send'}
                                        // type
                                        size={22}
                                        color={GlobalColors.white}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

export default ChatInputBar;
