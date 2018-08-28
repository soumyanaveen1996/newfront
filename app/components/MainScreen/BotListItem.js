import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { BotListItemStyles } from './styles';
import { Icons } from '../../config/icons';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import { MessageTypeConstants } from '../../lib/capability';
import { CachedImage } from '../CachedImage';

export default class BotListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subTitle: '',
            date: '',
            count: 0,
            message: null
        }
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
        const { message } = this.state;
        if (message && message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE) {
            return <Image style={BotListItemStyles.chatImage} source={{ uri: message.getMessage()}}/>;
        } else {
            return <Text numberOfLines={2} style={ BotListItemStyles.subTitle } >{this.state.subTitle}</Text>;
        }
    }

    render() {
        const { bot } = this.props;
        return (
            <TouchableOpacity style={BotListItemStyles.container} onPress={ this.handleBotSelection.bind(this) }>
                <CachedImage source={{ uri: bot.logoUrl }} style={ BotListItemStyles.image } resizeMode="contain"/>
                <View style={BotListItemStyles.textContainer}>
                    <Text style={ BotListItemStyles.title } >{bot.botName}</Text>
                    {this.renderSubview()}
                </View>
                <View style={BotListItemStyles.rightContainer}>
                    { Icons.listRightArrow() }
                    <Text allowFontScaling={false} style={ this.state.count > 0 ? BotListItemStyles.count : BotListItemStyles.hidden } >{ this.state.count }</Text>
                </View>
                <Text style={ BotListItemStyles.time } >{utils.formattedDate(this.state.date)}</Text>
            </TouchableOpacity>
        );
    }
}
