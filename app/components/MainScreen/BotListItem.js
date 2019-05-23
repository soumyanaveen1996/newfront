import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { BotListItemStyles } from './styles';
import { Icons } from '../../config/icons';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import { MessageTypeConstants } from '../../lib/capability';
import { CachedImage } from '../CachedImage';
import SystemBot from '../../lib/bot/SystemBot';
import images from '../../images';
import { Auth } from '../../lib/capability';

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

    handleBotSelection() {
        Actions.botChat({ bot: this.props.bot, onBack: this.props.onBack });
    }

    componentDidMount = async () => {
        let stateObj = {};

        const user = await Auth.getUser();
        const userName = user.info.userName;

        console.log('Sourav Logging:::: User is', user);

        if (this.props.chatData && this.props.chatData.lastMessage) {
            let message = this.props.chatData.lastMessage;
            stateObj = {
                message: message,
                subTitle: message.getDisplayMessage(),
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
            subTitle = message.getDisplayMessage();
            date = this.props.chatData.lastMessageDate;
        } else {
            subTitle = SystemBot.imBot.desc;
        }

        if (
            this.props.bot.botId === 'onboarding-bot' &&
            this.props.chatData.lastMessage === null
        ) {
            subTitle = `Hi ${this.state.name} open me to start using FrontM`;
            date = Date.now();
        }

        if (
            message &&
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE
        ) {
            return (
                <Image
                    style={BotListItemStyles.chatImage}
                    source={{ uri: message.getMessage() }}
                />
            );
        } else {
            return (
                <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                    {subTitle}
                </Text>
            );
        }
    }

    render() {
        const { bot } = this.props;
        let totalUnread = this.props.chatData.totalUnread;

        if (
            this.props.bot.botId === 'onboarding-bot' &&
            this.props.chatData.lastMessage === null
        ) {
            totalUnread = 1;
        }

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
                <CachedImage
                    imageTag="botLogo"
                    source={{ uri: bot.logoUrl }}
                    style={BotListItemStyles.image}
                    resizeMode="contain"
                />
                <View style={BotListItemStyles.textContainer}>
                    <Text style={BotListItemStyles.title}>{bot.botName}</Text>
                    {this.renderSubview()}
                </View>
                <View
                    accessibilityLabel="List Element Right Arrow"
                    testID="list-element-right-arrow"
                    style={BotListItemStyles.rightContainer}
                >
                    {/* {Icons.listRightArrow()} */}
                    <Image source={images.home_gray_arrow} />
                    <Text
                        allowFontScaling={false}
                        style={
                            totalUnread > 0
                                ? BotListItemStyles.count
                                : BotListItemStyles.hidden
                        }
                    >
                        {totalUnread}
                    </Text>
                </View>
                {/* <Text
                    accessibilityLabel="List Element Date"
                    testID="list-element-date"
                    style={BotListItemStyles.time}
                >
                    {utils.formattedDate(this.state.date)}
                </Text> */}
            </TouchableOpacity>
        );
    }
}
