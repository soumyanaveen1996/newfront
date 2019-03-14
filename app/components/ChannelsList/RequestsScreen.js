import react from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import ProfileImage from '../ProfileImage';
import images from '../../images';
import { Channel } from '../../lib/capability';
import _ from 'lodash';

export default class RequestsScreen extends React.Component {
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
            [item.userId]
        ).then(() => {
            let newPendingUsers = _.differenceBy(
                this.state.pendingUsers,
                user,
                'userId'
            );
            this.setState({ pendingUsers: newPendingUsers });
        });
    }

    acceptRequest(user) {
        Channel.manageRequests(
            this.props.channel.channelName,
            this.props.channel.userDomain,
            [item.userId],
            []
        ).then(() => {
            let newPendingUsers = _.differenceBy(
                this.state.pendingUsers,
                user,
                'userId'
            );
            this.setState({ pendingUsers: newPendingUsers });
        });
    }

    updateParent() {
        this.props.onDone(this.state.pendingUsers);
    }

    renderItem({ item }) {
        return (
            <View style={styles.adminRow}>
                <View>
                    <ProfileImage
                        uuid={item.userId}
                        placeholder={images.user_image}
                        style={styles.propic}
                        placeholderStyle={styles.propic}
                        resizeMode="contain"
                    />
                    <Text style={styles.adminH1}>{item.userName}</Text>
                </View>
                <View>
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
            <View>
                <FlatList
                    data={this.state.pendingUsers}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.state}
                />
            </View>
        );
    }
}
