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

export default class BotListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subTitle: '',
            date: '',
            count: 0,
            message: null
        };
    }

    handleBotSelection() {
        Actions.botChat({ bot: this.props.bot, onBack: this.props.onBack });
    }

    componentDidMount() {
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
                subTitle: this.props.bot.description
            };
        }
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
                <Image
                    style={BotListItemStyles.chatImage}
                    source={{ uri: message.getMessage() }}
                />
            );
        } else {
            return (
                <Text numberOfLines={2} style={BotListItemStyles.subTitle}>
                    {JSON.stringify(subTitle)}
                </Text>
            );
        }
    }

    render() {
        const { bot } = this.props;

        return (
            <TouchableOpacity
                style={
                    this.props.last
                        ? BotListItemStyles.containerLast
                        : BotListItemStyles.container
                }
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
                            this.props.chatData.totalUnread > 0
                                ? BotListItemStyles.count
                                : BotListItemStyles.hidden
                        }
                    >
                        {this.props.chatData.totalUnread}
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
