import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from './styles';
import Utils from '../../lib/utils';
import CachedImage from '../CachedImage';
import { Channel } from '../../lib/capability';
// import { Icons } from '../../config/icons';
import { Conversation } from '../../lib/conversation';
import { MessageDAO } from '../../lib/persistence';

const subtitleNumberOfLines = 2;

const ChannelsListItemStates = {
    UNSUBSCRIBING: 'unsubscribing',
    NONE: 'none'
};

export default class ChannelsListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: ChannelsListItemStates.NONE
        };
    }

    unsubscribeChannel() {
        this.setState({
            status: ChannelsListItemStates.UNSUBSCRIBING
        });

        const { channel } = this.props;

        Channel.unsubscribe(this.props.channel)
            .then(() => {
                return Conversation.deleteChannelConversation(
                    channel.channelId
                );
            })
            .then(() => {
                return MessageDAO.deleteBotMessages(channel.channelId);
            })
            .then(() => {
                this.props.onUnsubscribe(this.props.channel);
                this.setState({
                    status: ChannelsListItemStates.NONE
                });
            })
            .catch(error => {
                this.props.onUnsubscribeFailed(
                    this.props.channel,
                    error.message
                );
                this.setState({ status: ChannelsListItemStates.NONE });
            });
    }

    editChannel() {
        console.log('edit channel');
    }

    renderRightArea() {
        if (this.state.status === ChannelsListItemStates.UNSUBSCRIBING) {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            return (
                <View style={styles.rightContainer}>
                    <TouchableOpacity onPress={this.editChannel.bind(this)}>
                        {/* {Icons.delete()} */}
                        <Icon
                            style={styles.editIcon}
                            name="edit-2"
                            size={18}
                            color="rgba(3,3,3,1)"
                        />
                    </TouchableOpacity>
                </View>
            );
        }
    }

    onItemPressed() {
        if (this.props.onChannelTapped) {
            this.props.onChannelTapped(this.props.channel);
        }
    }

    onUnsubscribeButton() {
        console.log('unsubscribe');
    }

    onsubscribeButton() {
        console.log('subscribe');
    }

    subscriptionButton() {
        if (this.props.channel.subcription === 'true') {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={styles.openChannelButtonContainer}
                        onPress={this.onItemPressed.bind(this)}
                    >
                        <Text style={styles.buttonText}>Open</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.openChannelButtonContainer}
                        onPress={this.onItemPressed.bind(this)}
                    >
                        <Text style={styles.buttonText}>Unsubscribe</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.openChannelButtonContainer}
                    onPress={this.onsubscribeButton.bind(this)}
                >
                    <Text style={styles.buttonText}>Subscribe</Text>
                </TouchableOpacity>
            );
        }
    }

    render() {
        const channel = this.props.channel;
        return (
            <View style={styles.container}>
                <View style={styles.channelHeaderPart}>
                    <View style={styles.imageContainer}>
                        <CachedImage
                            imageTag="channelLogo"
                            source={{ uri: Utils.channelLogoUrl(channel.logo) }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{channel.channelName}</Text>
                        <Text style={styles.channelOwnerDetails}>
                            Created by {channel.ownerName || 'N/A'} on October
                            2018
                        </Text>
                    </View>
                </View>
                <View style={styles.channelDescription}>
                    <View style={styles.channelType}>
                        <Text style={styles.channelTypeText}>
                            Public Channel
                        </Text>
                    </View>
                    <View style={styles.channelDescriptionContainer}>
                        <Text
                            numberOfLines={subtitleNumberOfLines}
                            style={styles.subTitle}
                        >
                            {channel.description}
                        </Text>
                    </View>
                    <View style={styles.channelButtonContainer}>
                        {this.subscriptionButton()}
                    </View>
                </View>
                {this.renderRightArea()}
            </View>
        );
    }
}
