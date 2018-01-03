import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { BotListItemStyles } from './styles';
import { Icons } from '../../config/icons';
import images from '../../config/images';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import { MessageTypeConstants } from '../../lib/capability';
import SystemBot, { SYSTEM_BOT_MANIFEST_NAMES, SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';

export default class ConversationListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subTitle: '',
            date: '',
            count: 0,
            message: null,
            chatName: SYSTEM_BOT_MANIFEST.IMChat.name
        }
        this.conversation = this.props.conversation;
    }

    handleBotSelection() {
        SystemBot.get(SYSTEM_BOT_MANIFEST_NAMES.IMChat)
            .then((imBot) => {
                Actions.peopleChat({ bot: imBot, conversation: this.conversation, onBack: this.props.onBack });
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
                subTitle: SYSTEM_BOT_MANIFEST.IMChat.description
            };
        }
        stateObj.chatName = this.props.chatData.chatName;

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
        return (
            <TouchableOpacity style={BotListItemStyles.container} onPress={ this.handleBotSelection.bind(this) }>
                <Image source={ images.user_image } style={ BotListItemStyles.image } resizeMode="contain"/>
                <View style={BotListItemStyles.textContainer}>
                    <Text style={ BotListItemStyles.title } >{this.state.chatName}</Text>
                    {this.renderSubview()}
                </View>
                <View style={BotListItemStyles.rightContainer}>
                    { Icons.listRightArrow() }
                    <Text style={ this.state.count > 0 ? BotListItemStyles.count : BotListItemStyles.hidden } >{ this.state.count }</Text>
                </View>
                <Text style={ BotListItemStyles.time } >{utils.formattedDate(this.state.date)}</Text>
            </TouchableOpacity>
        );
    }
}
