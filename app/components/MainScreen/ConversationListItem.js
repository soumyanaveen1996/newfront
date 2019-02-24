import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { BotListItemStyles } from './styles';
import { Icons } from '../../config/icons';
import images from '../../config/images';
import ProfileImage from '../ProfileImage';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import { MessageTypeConstants } from '../../lib/capability';
import SystemBot from '../../lib/bot/SystemBot';
import { IM_CHAT } from '../../lib/conversation/Conversation';
import Utils from '../../lib/utils';
import { CachedImage } from '../CachedImage';

export default class ConversationListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subTitle: '',
            date: '',
            count: 0,
            message: null,
            chatName: SystemBot.imBot.name
        };
        this.conversation = this.props.conversation;
    }

    handleBotSelection() {
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            if (this.conversation.type === IM_CHAT) {
                Actions.peopleChat({
                    bot: imBot,
                    conversation: this.conversation,
                    onBack: this.props.onBack
                });
            } else {
                Actions.channelChat({
                    bot: imBot,
                    conversation: this.conversation,
                    onBack: this.props.onBack
                });
            }
        });
    }

    async componentDidMount() {
        let stateObj = {};

        if (this.props.chatData && this.props.chatData.lastMessage) {
            let message = this.props.chatData.lastMessage;
            stateObj = {
                message: message,
                subTitle: message.getDisplayMessage(),
                date: this.props.chatData.lastMessageDate
            };
        } else {
            stateObj = {
                subTitle: SystemBot.imBot.desc
            };
        }
        stateObj.chatName = this.props.chatData.chatName;
        stateObj.otherUserId = this.props.chatData.otherUserId;

        if (this.props.chatData.totalUnread > 0) {
            stateObj.count = this.props.chatData.totalUnread;
        }
        this.setState(stateObj);
    }

    renderSubview() {
        let message = null;
        let subTitle = null;
        let date = null;
        if (this.props.chatData && this.props.chatData.lastMessage) {
            message = this.props.chatData.lastMessage;
            subTitle = message.getDisplayMessage();
            date = this.props.chatData.lastMessageDate;
        } else {
            subTitle = SystemBot.imBot.desc;
        }
        if (
            message &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return (
                // <Image
                //     style={BotListItemStyles.chatImage}
                //     source={{uri: message.getMessage()}}
                // />

                <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                    Image Message
                </Text>
            );
        } else {
            return (
                <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                    {subTitle}
                </Text>
            );
        }
    }
    renderProfileimage() {
        if (this.conversation.type === IM_CHAT) {
            return (
                <ProfileImage
                    uuid={this.state.otherUserId}
                    placeholder={images.user_image}
                    style={BotListItemStyles.conversationImage}
                    placeholderStyle={BotListItemStyles.conversationImage}
                    resizeMode="cover"
                />
            );
        } else {
            if (this.props.chatData.channel) {
                return (
                    <CachedImage
                        imageTag="channelLogo"
                        source={{
                            uri: Utils.channelLogoUrl(
                                this.props.chatData.channel.logo
                            )
                        }}
                        style={BotListItemStyles.conversationImage}
                        resizeMode="contain"
                    />
                );
            } else {
                return <View />;
            }
        }
    }

    render() {
        return (
            <TouchableOpacity
                style={
                    this.props.last
                        ? BotListItemStyles.containerLast
                        : BotListItemStyles.container
                }
                activeOpacity={1}
                onPress={this.handleBotSelection.bind(this)}
            >
                {this.renderProfileimage()}
                <View style={BotListItemStyles.textContainer}>
                    <Text style={BotListItemStyles.title}>
                        {this.props.chatData.chatName}
                    </Text>
                    {this.renderSubview()}
                </View>
                <View style={BotListItemStyles.rightContainer}>
                    {/* {Icons.listRightArrow()} */}
                    <Image source={images.home_gray_arrow} />
                    <Text
                        allowFontScaling={false}
                        style={
                            this.props.chatData.totalUnread > 0
                                ? BotListItemStyles.count
                                : BotListItemStyles.hidden
                        }
                    >
                        {this.props.chatData.totalUnread}
                    </Text>
                </View>
                <Text style={BotListItemStyles.time}>
                    {utils.formattedDate(
                        this.props.chatData.lastMessageDate
                            ? this.props.chatData.lastMessageDate
                            : ''
                    )}
                </Text>
            </TouchableOpacity>
        );
    }
}
