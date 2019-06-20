import React from 'react';
import {
    ActivityIndicator,
    TouchableOpacity,
    View,
    Text,
    Image,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from './styles';
import Utils from '../../lib/utils';
import CachedImage from '../CachedImage';
import { Channel } from '../../lib/capability';
import { Icons } from '../../config/icons';
import { Conversation } from '../../lib/conversation';
import { MessageDAO } from '../../lib/persistence';
import { Auth } from '../../lib/capability';
import moment from 'moment';
import ActionSheet from '@yfuks/react-native-action-sheet';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import GlobalColors from '../../config/styles';

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
            loading: false,
            isAdmin: false
        };
    }

    async componentDidMount() {
        if (this.props.channel.isAdmin) {
            this.setState({ isAdmin: true });
        } else {
            this.setState({ isAdmin: false });
        }
    }

    unsubscribeChannel() {}

    editChannel = channel => {
        this.props.onChannelEdit(channel, this.onUnsubscribeChannel);
    };

    onItemPressed() {
        if (this.props.onChannelTapped) {
            this.props.onChannelTapped(this.props.channel);
        }
    }

    onUnsubscribeChannel = () =>
        new Promise((resolve, reject) => {
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
                .then(resolve)
                .catch(error => {
                    this.props.onUnsubscribeFailed(this.props.channel);
                    this.setState({ loading: false });
                    this.props.wait(false);
                    reject(error);
                });
        });

    onsubscribeChannel = (channel, open = false) => {
        if (channel.discoverable === 'public') {
            console.log('subscribe', channel);
            this.setState({ loading: true });
            this.props.wait(true);
            Channel.subscribeChannel(channel.channelName, channel.userDomain)
                .then(data => {
                    this.props.onSubscribed();
                    this.setState({ loading: false });
                    this.props.wait(false);
                    if (open) {
                        this.props.onChannelTapped(channel);
                    }
                })
                .catch(err => {
                    console.log('Failed Subscription', err);
                    this.props.onSubscribeFailed();
                    this.setState({ loading: false });
                    this.props.wait(false);
                });
        } else {
            requestModalContent = (
                <View style={styles.requestModalContainer}>
                    <CachedImage
                        imageTag="channelLogo"
                        source={{ uri: Utils.channelLogoUrl(channel.logo) }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{channel.channelName}</Text>
                    <Text style={styles.subTitle}>
                        This is a private channel.{'/n'}Send request to
                        subscribe
                    </Text>
                    <TouchableOpacity
                        style={styles.requestModalYesButton}
                        onPress={() => {
                            this.sendRequestToPrivateChannel(channel);
                            this.props.onSubscribeRequest();
                        }}
                    >
                        <Text style={[styles.title, { color: 'white' }]}>
                            Send request to subscribe
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.requestModalNoButton}
                        onPress={() => this.props.onSubscribeRequest()}
                    >
                        <Text
                            style={[
                                styles.title,
                                { color: GlobalColors.frontmLightBlue }
                            ]}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            this.props.onSubscribeRequest(requestModalContent);
        }
    };

    sendRequestToPrivateChannel(channel) {
        Channel.requestPrivateChannelAccess(
            channel.channelName,
            channel.userDomain
        ).catch(() => {
            this.props.onRequestToPrivateFailed();
        });
    }

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

        if (this.state.isAdmin) {
            return (
                <TouchableOpacity
                    style={styles.rightContainer}
                    onPress={() => {
                        // ActionSheet.showActionSheetWithOptions(
                        //     {
                        //         options: ['Edit', 'Cancel'],
                        //         cancelButtonIndex: 1,
                        //         destructiveButtonIndex: 1,
                        //         tintColor: 'blue'
                        //     },
                        //     buttonIndex => {
                        //         if (
                        //             buttonIndex !== undefined &&
                        //             buttonIndex === 0
                        //         ) {
                        //             this.editChannel(channel);
                        //         }
                        //     }
                        // );
                        this.editChannel(channel);
                    }}
                >
                    {Icons.editChannel()}
                </TouchableOpacity>
            );
        } else if (channel.subcription === 'true') {
            return (
                <TouchableOpacity
                    style={styles.rightContainer}
                    onPress={() => {
                        // this.ActionSheetOwner.show()
                        ActionSheet.showActionSheetWithOptions(
                            {
                                options: ['Unsubscribe', 'Cancel'],
                                cancelButtonIndex: 1,
                                destructiveButtonIndex: 1,
                                tintColor: 'blue'
                            },
                            buttonIndex => {
                                if (
                                    buttonIndex !== undefined &&
                                    buttonIndex === 0
                                ) {
                                    this.onUnsubscribeChannel();
                                }
                            }
                        );
                    }}
                >
                    {Icons.more()}
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.rightContainer}
                    onPress={() => {
                        // this.ActionSheetOwner.show()
                        ActionSheet.showActionSheetWithOptions(
                            {
                                options: ['Subscribe', 'Cancel'],
                                cancelButtonIndex: 1,
                                destructiveButtonIndex: 1,
                                tintColor: GlobalColors.frontmLightBlue
                            },
                            buttonIndex => {
                                if (
                                    buttonIndex !== undefined &&
                                    buttonIndex === 0
                                ) {
                                    this.onsubscribeChannel(channel);
                                }
                            }
                        );
                    }}
                >
                    {Icons.more()}
                </TouchableOpacity>
            );
        }

        // if (this.state.status === ChannelsListItemStates.UNSUBSCRIBING) {
        //     return (
        //         <View style={styles.rightContainer}>
        //             <ActivityIndicator size="small" />
        //         </View>
        //     );
        // } else {
        //     if (isOwner) {
        //         return (
        //             <View style={styles.rightContainer}>
        //                 <TouchableOpacity
        //                     onPress={() => {
        //                         this.editChannel(channel);
        //                     }}
        //                 >
        //                     {/* {Icons.delete()} */}
        //                     <Icon
        //                         style={styles.editIcon}
        //                         name="edit-2"
        //                         size={18}
        //                         color="rgba(3,3,3,1)"
        //                     />
        //                 </TouchableOpacity>
        //             </View>
        //         );
        //     } else {
        //         return <View style={styles.rightContainer} />;
        //     }
        // }
    }
    // renderActionSheet = (channel, user) => {
    //     return (
    //         <View>
    //             <ActionSheet
    //                 ref={o => (this.ActionSheetOwner = o)}
    //                 options={['Edit', 'Cancel']}
    //                 cancelButtonIndex={1}
    //                 destructiveButtonIndex={1}
    //                 onPress={index => {
    //                     if (index === 0) {
    //                         this.editChannel(channel)
    //                     }
    //                 }}
    //             />
    //             <ActionSheet
    //                 ref={o => (this.ActionSheetSubscribed = o)}
    //                 options={['Unsubscribe', 'Cancel']}
    //                 cancelButtonIndex={1}
    //                 destructiveButtonIndex={1}
    //                 onPress={index => {
    //                     if (index === 0) {
    //                         this.onUnsubscribeChannel()
    //                     }
    //                 }}
    //             />
    //             <ActionSheet
    //                 ref={o => (this.ActionSheetUnSubscribed = o)}
    //                 options={['Subscribe', 'Cancel']}
    //                 cancelButtonIndex={1}
    //                 destructiveButtonIndex={1}
    //                 onPress={index => {
    //                     if (index === 0) {
    //                         this.onsubscribeChannel(channel)
    //                     }
    //                 }}
    //             />
    //             <ActionSheet
    //                 ref={o => (this.ActionSheetSubscribeNOpen = o)}
    //                 options={['Subscribe', 'Cancel']}
    //                 cancelButtonIndex={1}
    //                 destructiveButtonIndex={1}
    //                 onPress={index => {
    //                     if (index === 0) {
    //                         this.onsubscribeChannel(channel, true)
    //                     }
    //                 }}
    //             />
    //         </View>
    //     )
    // }

    openChannel = (channel, user) => {
        const isOwner = channel.ownerId === user ? true : false;
        if (isOwner) {
            return this.props.onChannelTapped(channel);
        }
        if (channel.subcription === 'true') {
            return this.props.onChannelTapped(channel);
        }

        if (channel.subcription === 'false') {
            ActionSheet.showActionSheetWithOptions(
                {
                    options: ['Subscribe', 'Cancel'],
                    cancelButtonIndex: 1,
                    destructiveButtonIndex: 1,
                    tintColor: 'blue'
                },
                buttonIndex => {
                    if (buttonIndex !== undefined && buttonIndex === 0) {
                        this.onsubscribeChannel(channel, true);
                    }
                }
            );
        }
    };

    render() {
        const channel = this.props.channel;
        const user = this.props.user;

        const isOwner = channel.ownerId === user.userId ? true : false;

        let createdOn;
        if (channel.createdOn && channel.createdOn !== '') {
            createdOn = moment(parseInt(channel.createdOn)).format(
                'MMM Do YYYY'
            );
        } else {
            createdOn = moment().format('MMM Do YYYY');
        }

        return (
            <TouchableOpacity
                style={styles.container}
                onPress={() => this.openChannel(channel, user.userId)}
            >
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
                                    {isOwner ? 'You' : channel.ownerName}{' '}
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
                    {/* <View style={styles.channelButtonContainer}>
                        {this.subscriptionButton(channel, user.userId)}
                    </View> */}
                </View>
                {/* {this.renderActionSheet(channel, user)} */}
            </TouchableOpacity>
        );
    }
}
