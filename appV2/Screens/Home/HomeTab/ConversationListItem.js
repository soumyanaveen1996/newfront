import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BotListItemColors, BotListItemStyles } from './styles';
import { MessageTypeConstants } from '../../../lib/capability';
import SystemBot from '../../../lib/bot/SystemBot';
import { IM_CHAT } from '../../../lib/conversation/Conversation';
import Utils from '../../../lib/utils';
import { CachedImage } from '../../../widgets/CachedImage';
import NavigationAction from '../../../navigation/NavigationAction';
import { ChatImageType } from '../../../lib/utils/ChatUtils';
import withPreventDoubleClick from '../../../widgets/WithPreventDoubleClick';
import RenderHTML from 'react-native-render-html';
import utils from '../../../lib/utils';

const PreventDoubleClick = withPreventDoubleClick(TouchableOpacity);
export default class ConversationListItem extends React.PureComponent {
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
        SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
            if (this.conversation.type === IM_CHAT) {
                NavigationAction.goToUsersChat({
                    bot: imBot,
                    conversation: this.conversation,
                    onBack: this.props.onBack,
                    otherUserId: this.props.chatData.otherUserId,
                    otherUserName: this.props.chatData.chatName,
                    isFavorite: this.props.isFavorite,
                    allConvData: this.props.allConvData,
                    onRefresh: this.props.onRefresh
                });
            } else {
                NavigationAction.goToChannelChat({
                    bot: imBot,
                    conversation: this.conversation,
                    onBack: this.props.onBack,
                    chatName: this.props.chatData.chatName,
                    otherUserId: false,
                    channelId: this.props.channelId,
                    isFavorite: this.props.isFavorite,
                    allConvData: this.props.allConvData,
                    onRefresh: this.props.onRefresh
                });
            }
        });
    }

    async componentDidMount() {
        let stateObj = {};

        if (this.props.chatData && this.props.chatData.lastMessage) {
            const message = this.props.chatData.lastMessage;
            stateObj = {
                message,
                subTitle: this.props.chatData.display_message,
                date: this.props.chatData.lastMessageDate
            };
        } else {
            stateObj = {
                subTitle: SystemBot.imBot.desc
            };
        }
        stateObj.chatName = this.props.chatData.chatName;

        if (this.props.chatData.totalUnread > 0) {
            stateObj.count = this.props.chatData.totalUnread;
        }
        this.setState(stateObj);
    }

    renderSubview() {
        let message = null;
        let subTitle = 'Open to see the latest messages';
        let date = null;
        if (this.props.chatData && this.props.chatData.lastMessage) {
            message = this.props.chatData.lastMessage;
            subTitle = this.props.chatData.display_message;
            date = this.props.chatData.lastMessageDate;
        }
        // console.log("Display Message", this.props.chatData.display_message);
        if (
            message &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return (
                <Text numberOfLines={1} style={BotListItemStyles.subTitle}>
                    <Icon
                        name="image"
                        size={10}
                        color="rgba(153, 153, 153, 1)"
                    />
                    {message.getMessageOptions()
                        ? message.getMessageOptions().fileName
                        : 'Image'}
                </Text>
            );
        }
        if (
            message &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO
        ) {
            return (
                <Text numberOfLines={1} style={BotListItemStyles.subTitle}>
                    <Icon
                        name="videocam"
                        size={10}
                        color="rgba(153, 153, 153, 1)"
                    />
                    {message.getMessageOptions()
                        ? message.getMessageOptions().fileName
                        : 'Video'}
                </Text>
            );
        }
        if (
            message &&
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CONTACT_CARD
        ) {
            return (
                <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                    Contact
                </Text>
            );
        }

        if (utils.isHTML(subTitle)) {
            return (
                <View style={{ height: 30, overflow: 'hidden' }}>
                    <RenderHTML
                        style={{ height: 30, backgroundColor: 'red' }}
                        systemFonts={['Figtree-Regular']}
                        baseStyle={[
                            {
                                fontFamily: 'Figtree-Regular',
                                fontSize: 12,
                                color: BotListItemColors.subTitleColor
                            }
                        ]}
                        tagsStyles={{
                            html: {
                                color: BotListItemColors.subTitleColor,
                                fontFamily: 'Figtree-Regular',
                                position: 'relative'
                            },
                            body: {
                                color: BotListItemColors.subTitleColor,
                                fontFamily: 'Figtree-Regular',
                                position: 'relative',
                                fontSize: 12
                            },
                            p: {
                                color: BotListItemColors.subTitleColor,
                                fontFamily: 'Figtree-Regular',
                                position: 'relative',
                                fontSize: 12,
                                padding: 0,
                                margin: 0
                            },
                            a: {
                                flexWrap: 'wrap'
                            },
                            code: {
                                color: 'pink'
                            }
                        }}
                        source={{
                            html: `<html><body>${subTitle}</body></html>`
                        }}
                    />
                </View>
            );
        } else {
            return (
                <Text numberOfLines={1} style={[BotListItemStyles.subTitle]}>
                    {subTitle}
                </Text>
            );
        }
    }

    renderProfileimage() {
        if (this.conversation.type === IM_CHAT) {
            return ChatImageType(
                this.props.chatData.otherUserId,
                false,
                false,
                this.props.isFavorite,
                this.props.chatData.chatName
            ); /// for profile image 1st arg userid, for chennel image second arg chennalId
        }
        if (this.props.chatData.channel) {
            const uri = Utils.userUploadedChannelLogoUrl(
                this.props.chatData.channel.channelId
            );

            return ChatImageType(
                false,
                uri,
                false,
                this.props.isFavorite,
                null
            );
        }
        return <View />;
    }

    render() {
        return (
            <PreventDoubleClick
                style={BotListItemStyles.container}
                activeOpacity={1}
                onPress={this.handleBotSelection.bind(this)}
            >
                <View style={BotListItemStyles.innerContainer}>
                    {this.renderProfileimage()}
                    <View style={BotListItemStyles.borderBottomContainer}>
                        <View style={BotListItemStyles.textContainer}>
                            <Text style={BotListItemStyles.title}>
                                {this.props.chatData.chatName}
                            </Text>
                            {this.renderSubview()}
                        </View>
                        <View
                            style={[
                                BotListItemStyles.rightContainer,
                                this.props.chatData.totalUnread > 0
                                    ? {
                                          justifyContent: 'space-between'
                                      }
                                    : {
                                          justifyContent: 'flex-start'
                                      }
                            ]}
                        >
                            <Text style={BotListItemStyles.time}>
                                {Utils.formattedDateChatList(
                                    this.props.chatData.lastMessageDate
                                        ? this.props.chatData.lastMessageDate
                                        : this.props.conversation.createdOn
                                )}
                            </Text>
                            <View
                                style={
                                    this.props.chatData.totalUnread > 0
                                        ? BotListItemStyles.tabBadge
                                        : BotListItemStyles.hidden
                                }
                            >
                                <Text
                                    allowFontScaling={false}
                                    style={BotListItemStyles.tabBadgeText}
                                >
                                    {this.props.chatData.totalUnread}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </PreventDoubleClick>
        );
    }
}
