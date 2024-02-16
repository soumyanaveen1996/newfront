import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { BotListItemStyles } from './styles';
import { MessageTypeConstants, Auth } from '../../../lib/capability';
import { CachedImage } from '../../../widgets/CachedImage';
import SystemBot, { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import Utils, { botLogoUrl, formattedDateChatList } from '../../../lib/utils';
import withPreventDoubleClick from '../../../widgets/WithPreventDoubleClick';

const PreventDoubleClick = withPreventDoubleClick(TouchableOpacity);

import I18 from '../../../config/i18n/i18n';
import NavigationAction from '../../../navigation/NavigationAction';
import images from '../../../images';

export default class BotListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subTitle: '',
            date: '',
            count: 0,
            message: null,
            name: ''
        };
    }

    async handleBotSelection() {
        const { bot, is2FaEnable } = this.props;
        const {
            provider: { name }
        } = Auth.getUserData();
        // console.log("the botlistitem--09",bot.authorisedAccess,name);
        if (bot.authorisedAccess) {
            this.props.onAuth({
                bot: this.props.bot,
                onBack: this.props.onBack,
                botLogoUrl: this.props.bot?.logoUrl,
                botName: this.props.botName
                    ? this.props.botName
                    : this.props.bot?.botName
            });
        } else if (bot.authorisedAccess && name !== 'FrontM') {
            //TODO Social login
            this.props.onAuth({
                bot: this.props.bot,
                onBack: this.props.onBack,
                botLogoUrl: this.props.bot?.logoUrl,
                botName: this.props.botName
                    ? this.props.botName
                    : this.props.bot?.botName
            });
        } else {
            NavigationAction.goToBotChat({
                bot: this.props.bot,
                onBack: this.props.onBack,
                botName: this.props.botName,
                otherUserId: false,
                botLogoUrl: this.props.bot.logoUrl,
                isFavorite: this.props.isFavorite,
                allConvData: this.props.allConvData,
                onRefresh: this.props.onRefresh
            });
        }
    }

    // componentDidUpdate(
    //     prevProps: Readonly<P>,
    //     prevState: Readonly<S>,
    //     snapshot: SS
    // ) {
    //     if (prevProps.isBotAccessible !== this.props.isBotAccessible) {
    //         if (this.props.isBotAccessible) {
    //             Actions.bot({ bot: this.props.bot, onBack: this.props.onBack });
    //         }
    //     }
    // }

    componentDidMount = async () => {
        let stateObj = {};

        const user = Auth.getUserData();
        // pass and update user name from here for ChatMesssage
        const { userName } = user.info;
        if (this.props.chatData && this.props.chatData.lastMessage) {
            const message = this.props.chatData.lastMessage;
            stateObj = {
                message,
                subTitle: this.props.chatData.display_message,
                date: this.props.chatData.lastMessageDate
            };
        } else {
            stateObj = {
                subTitle: this.props.bot.description
            };
        }
        if (this.props.chatData.totalUnread > 0) {
            stateObj.count = this.props.chatData.totalUnread;
        }
        // Special Handling Onboarding Bot
        stateObj.name = userName;
        this.setState(stateObj);
    };

    renderSubview() {
        let message = null;
        let subTitle = null;
        let date = null;
        if (this.props.chatData && this.props.chatData.lastMessage) {
            message = this.props.chatData.lastMessage;
            subTitle = this.props.chatData.display_message;
            date = this.props.chatData.lastMessageDate;
        } else {
            subTitle = SystemBot.imBot.desc;
        }

        if (
            this.props.bot.botId ===
                SYSTEM_BOT_MANIFEST[SystemBot.assistant]?.botId &&
            this.props.chatData.lastMessage === null
        ) {
            subTitle = I18.t('OpenToStartUsingApp', { name: this.state.name });
            date = Date.now();
        }

        if (
            message &&
            message.messageType === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return (
                <Image
                    style={BotListItemStyles.chatImage}
                    source={{ uri: message.getMessage() }}
                />
            );
        }
        return (
            <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                {subTitle}
            </Text>
        );
    }

    render() {
        const { bot } = this.props;
        // let totalUnread = this.props.chatData.totalUnread;
        let totalUnread = 0;
        if (
            this.props.bot.botId === 'onboarding-bot' &&
            this.props.chatData.lastMessage === null
        ) {
            totalUnread = 1;
        }

        return (
            <PreventDoubleClick
                style={BotListItemStyles.container}
                activeOpacity={1}
                onPress={this.handleBotSelection.bind(this)}
            >
                <View style={BotListItemStyles.innerContainer}>
                    <View>
                        <CachedImage
                            imageTag="botLogo"
                            source={{ uri: bot.logoUrl }}
                            style={BotListItemStyles.image}
                            placeholderStyle={BotListItemStyles.image}
                            borderRadius={10}
                        />
                        {this.props.isFavorite && (
                            <Image
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    marginBottom: 5,
                                    marginRight: -6
                                }}
                                source={images.timeline_fav}
                            />
                        )}
                    </View>
                    <View style={BotListItemStyles.borderBottomContainer}>
                        <View style={BotListItemStyles.textContainer}>
                            <Text style={BotListItemStyles.title}>
                                {bot.botName}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={BotListItemStyles.subTitle}
                            >
                                {bot.description}
                            </Text>
                        </View>
                        <View
                            accessibilityLabel="List Element Right Arrow"
                            testID="list-element-right-arrow"
                            style={[
                                BotListItemStyles.rightContainer,
                                totalUnread > 0
                                    ? {
                                          justifyContent: 'space-between'
                                      }
                                    : { justifyContent: 'flex-start' }
                            ]}
                        >
                            <Text style={BotListItemStyles.time}>
                                {Utils.formattedDateChatList(
                                    this.props.chatData.lastMessageDate
                                        ? this.props.chatData.lastMessageDate
                                        : this.props.bot.createdOn
                                )}
                            </Text>
                            <View
                                style={
                                    totalUnread > 0
                                        ? [
                                              BotListItemStyles.tabBadge,
                                              { marginTop: 4 }
                                          ]
                                        : BotListItemStyles.hidden
                                }
                            >
                                <Text
                                    allowFontScaling={false}
                                    style={BotListItemStyles.tabBadgeText}
                                >
                                    {totalUnread}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </PreventDoubleClick>
        );
    }
}
