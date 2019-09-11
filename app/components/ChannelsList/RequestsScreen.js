import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import ProfileImage from '../ProfileImage';
import images from '../../images';
import { Channel } from '../../lib/capability';
import _ from 'lodash';
import ContactStyles from '../ContactsPicker/styles';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Actions } from 'react-native-router-flux';
import NetworkButton from '../Header/NetworkButton';

export default class RequestsScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: 'Pending requests'
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        Actions.pop();
                    }}
                />
            );
        }
        navigationOptions.headerRight = (
            <View style={{ marginHorizontal: 17 }}>
                <NetworkButton
                    manualAction={() => {
                        state.params.refresh();
                    }}
                    gsmAction={() => {
                        state.params.showConnectionMessage('gsm');
                    }}
                    satelliteAction={() => {
                        state.params.showConnectionMessage('satellite');
                    }}
                    disconnectedAction={() => {}}
                />
            </View>
        );
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.state = {
            pendingUsers: this.props.pendingUsers
        };
    }

    ignoreRequest(user) {
        Channel.manageRequests(
            this.props.channel.channelName,
            this.props.channel.userDomain,
            [],
            [user.userId]
        )
            .then(() => {
                this.props.onDone();
                let newPendingUsers = _.differenceBy(
                    this.state.pendingUsers,
                    user,
                    'userId'
                );
                this.setState({ pendingUsers: newPendingUsers });
            })
            .catch(e => {
                console.log('ignore request failer');
            });
    }

    acceptRequest(user) {
        Channel.manageRequests(
            this.props.channel.channelName,
            this.props.channel.userDomain,
            [user.userId],
            []
        )
            .then(() => {
                this.props.onDone();
                let newPendingUsers = _.differenceBy(
                    this.state.pendingUsers,
                    [user],
                    'userId'
                );
                this.setState({ pendingUsers: newPendingUsers });
            })
            .catch(e => {
                console.log('accept request failed');
            });
    }

    renderItem({ item }) {
        return (
            <View style={styles.adminRow}>
                <View style={{ flexDirection: 'row' }}>
                    <ProfileImage
                        uuid={item.userId}
                        placeholder={images.user_image}
                        style={ContactStyles.contactItemImage}
                        placeholderStyle={ContactStyles.contactItemImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.participantName}>{item.userName}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={styles.requestIgnoreButton}
                        onPress={this.ignoreRequest.bind(this, item)}
                    >
                        <Text style={styles.requestIgnoreText}>Ignore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.requestAcceptButton}
                        onPress={this.acceptRequest.bind(this, item)}
                    >
                        <Text style={styles.requestAcceptText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <FlatList
                    data={this.state.pendingUsers}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.state}
                />
            </View>
        );
    }
}
