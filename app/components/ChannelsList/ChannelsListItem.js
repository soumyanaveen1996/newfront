import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text, Image } from 'react-native';
import styles from './styles';
import Utils from '../../lib/utils';
import { Channel } from '../../lib/capability';
import { Icons } from '../../config/icons';

const subtitleNumberOfLines = 2;

const ChannelsListItemStates = {
    UNSUBSCRIBING: 'unsubscribing',
    NONE: 'none',
};

export default class ChannelsListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status: ChannelsListItemStates.NONE
        }
    }

    unsubscribeChannel() {
        this.setState({
            status: ChannelsListItemStates.UNSUBSCRIBING
        });

        Channel.unsubscribe(this.props.channel)
            .then(() => {
                this.props.onUnsubscribe(this.props.channel)
                this.setState({
                    status: ChannelsListItemStates.NONE
                });
            })
            .catch((error) => {
                this.props.onUnsubscribeFailed(this.props.channel);
                this.setState({ status: ChannelsListItemStates.NONE });
            })
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
                    <TouchableOpacity onPress={this.unsubscribeChannel.bind(this)}>
                        {Icons.delete()}
                    </TouchableOpacity>
                </View>
            );
        }
    }

    onItemPressed() {
        console.log('On Item pressed')
        if (this.props.onChannelTapped) {
            this.props.onChannelTapped(this.props.channel);
        }
    }

    render() {
        const channel = this.props.channel;
        return (
            <TouchableOpacity style={styles.container} onPress={this.onItemPressed.bind(this)}>
                <Image source={{ uri: Utils.channelLogoUrl(channel.logo) } } style={ styles.image } resizeMode="contain"/>
                <View style={styles.textContainer}>
                    <Text style={ styles.title } >{ channel.name }</Text>
                    <Text numberOfLines={subtitleNumberOfLines} style={ styles.subTitle }>{channel.desc}</Text>
                </View>
                { this.renderRightArea() }
            </TouchableOpacity>
        );
    }
}
