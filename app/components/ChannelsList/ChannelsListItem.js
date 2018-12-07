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
import { Auth } from '../../lib/capability';
import moment from 'moment';

const subtitleNumberOfLines = 2;

const ChannelsListItemStates = {
    UNSUBSCRIBING: 'unsubscribing',
    NONE: 'none'
};

export default class ChannelsListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: ChannelsListItemStates.NONE,
            user: null,
            loading: false
        };
    }

    unsubscribeChannel() {}

    editChannel() {
        this.props.onChannelEdit();
    }

    onItemPressed() {
        if (this.props.onChannelTapped) {
            this.props.onChannelTapped(this.props.channel);
        }
    }

    onUnsubscribeChannel = () => {
        console.log('unsubscribe', this.props.channel);
        this.setState({
            loading: true
        });

        this.props.wait(true);

        const { channel } = this.props;

        Channel.unsubscribeChannel(channel.channelName, channel.userDomain)
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
                    loading: false
                });
                this.props.wait(false);
            })
            .catch(error => {
                this.props.onUnsubscribeFailed(this.props.channel);
                this.setState({ loading: false });
                this.props.wait(false);
            });
    };

    onsubscribeChannel = channel => {
        console.log('subscribe', channel);
        this.setState({ loading: true });
        this.props.wait(true);
        Channel.subscribeChannel(channel.channelName, channel.userDomain)
            .then(data => {
                this.props.onSubscribed();
                this.setState({ loading: false });
                this.props.wait(false);
            })
            .catch(err => {
                console.log('Failed Subscription', err);
                this.props.onSubscribeFailed();
                this.setState({ loading: false });
                this.props.wait(false);
            });
    };

    subscriptionButton(channel, userId) {
        const isOwner = channel.ownerId === userId ? true : false;

        if (this.props.channel.subcription === 'true' || isOwner) {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={styles.openChannelButtonContainer}
                        onPress={this.onItemPressed.bind(this)}
                    >
                        <Text style={styles.buttonText}>Open</Text>
                    </TouchableOpacity>
                    {isOwner ? null : (
                        <TouchableOpacity
                            style={styles.openChannelButtonContainerUnSub}
                            onPress={this.onUnsubscribeChannel}
                        >
                            <Text style={styles.buttonTextUnSub}>
                                Unsubscribe
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.openChannelButtonContainer}
                    onPress={() => this.onsubscribeChannel(channel)}
                    disabled={this.state.loading}
                >
                    <Text style={styles.buttonText}>Subscribe</Text>
                </TouchableOpacity>
            );
        }
    }

    renderRightArea(channel, userId) {
        const isOwner = channel.ownerId === userId ? true : false;
        if (this.state.status === ChannelsListItemStates.UNSUBSCRIBING) {
            return (
                <View style={styles.rightContainer}>
                    <ActivityIndicator size="small" />
                </View>
            );
        } else {
            if (isOwner) {
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
            } else {
                return <View style={styles.rightContainer} />;
            }
        }
    }
    render() {
        const channel = this.props.channel;
        const user = this.props.user;

        let createdOn;
        if (channel.createdOn && channel.createdOn !== '') {
            createdOn = moment(parseInt(channel.createdOn)).format(
                'MMM Do YYYY'
            );
        } else {
            createdOn = moment().format('MMM Do YYYY');
        }

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
                        <Text
                            style={styles.title}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                        >
                            {channel.channelName}
                        </Text>
                        <Text
                            style={styles.channelOwnerDetails}
                            ellipsizeMode="tail"
                            numberOfLines={2}
                        >
                            Created by{' '}
                            {(
                                <Text
                                    style={{
                                        fontWeight: '400',
                                        color: 'black'
                                    }}
                                >
                                    {channel.ownerName}{' '}
                                </Text>
                            ) || 'N/A'}{' '}
                            on {<Text>{createdOn}</Text>}
                        </Text>
                    </View>
                    {this.renderRightArea(channel, user.userId)}
                </View>
                <View style={styles.channelDescription}>
                    <View style={styles.channelType}>
                        <Text style={styles.channelTypeText}>
                            {channel.discoverable === 'public'
                                ? 'Public Channel'
                                : 'Private Channel'}
                        </Text>
                    </View>
                    <View style={styles.channelDescriptionContainer}>
                        <Text
                            ellipsizeMode="tail"
                            numberOfLines={subtitleNumberOfLines}
                            style={styles.subTitle}
                        >
                            {channel.description}
                        </Text>
                    </View>
                    <View style={styles.channelButtonContainer}>
                        {this.subscriptionButton(channel, user.userId)}
                    </View>
                </View>
            </View>
        );
    }
}
