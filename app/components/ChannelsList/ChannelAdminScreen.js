import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Channel } from '../../lib/capability';
import Loader from '../Loader/Loader';
import images from '../../images';
import { connect } from 'react-redux';
import {
    setChannelParticipants,
    setChannelTeam
} from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { Auth } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import Utils from '../../lib/utils';
import CachedImage from '../CachedImage';
import config from '../../config/config';
import Toast, { DURATION } from 'react-native-easy-toast';
import { Conversation } from '../../lib/conversation';
import { MessageDAO } from '../../lib/persistence';
import _ from 'lodash';
import NetworkButton from '../Header/NetworkButton';

const SeparatorSize = {
    SMALL: 2,
    BIG: 5
};

class ChannelAdminScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        state.params.onBack();
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
            participants: [],
            admins: [],
            pendingRequests: [],
            uiDisabled: true,
            isLoading: true,
            checkIsFavourite: 0
        };
        this.channel = this.props.channel;
    }

    componentDidMount() {
        let participants;
        let admins;
        let pendingRequests;
        this.props.navigation.setParams({ onBack: this.onBack.bind(this) });
        let { isFavourite } = this.props.channel;

        if (typeof isFavourite === 'string') {
            this.setState({ checkIsFavourite: +isFavourite });
        } else {
            this.setState({ checkIsFavourite: isFavourite });
        }
        Channel.getParticipants(
            this.channel.channelName,
            this.channel.userDomain
        )
            .then(prt => {
                participants = prt;
                this.props.setParticipants(prt);
                return Channel.getRequests(
                    this.channel.channelName,
                    this.channel.userDomain
                );
            })
            .then(pend => {
                pendingRequests = pend;
                return Channel.getAdmins(
                    this.channel.channelName,
                    this.channel.userDomain
                );
            })
            .then(adm => {
                admins = adm;
                return this.setState({
                    participants: participants,
                    admins: admins,
                    pendingRequests: pendingRequests,
                    uiDisabled: false
                });
            })
            .then(() => {
                this.setState({ isLoading: false });
            })
            .catch(() => {
                Actions.pop();
            });
    }

    componentWillUnmount() {
        this.props.setParticipants([]);
        this.props.setTeam('');
    }

    onBack() {
        Actions.pop();
    }

    refresh() {
        let participants;
        let pendingRequests;

        this.setState({ isLoading: true, uiDisabled: true }, () => {
            Channel.getParticipants(
                this.channel.channelName,
                this.channel.userDomain
            )
                .then(prt => {
                    participants = prt;
                    return Channel.getRequests(
                        this.channel.channelName,
                        this.channel.userDomain
                    );
                })
                .then(pend => {
                    pendingRequests = pend;
                    return this.setState({
                        participants: participants,
                        pendingRequests: pendingRequests,
                        uiDisabled: false,
                        isLoading: false
                    });
                })
                .catch(e => {
                    this.setState({
                        uiDisabled: false,
                        isLoading: false
                    });
                });
        });
    }

    setFavourite() {
        this.setState({ isLoading: true });
        const data = {
            type: 'channel',
            channelConvId: this.channel.channelId,
            channelName: this.channel.channelName,
            action: 'add',
            description: this.channel.description,
            userDomain: this.channel.userDomain
        };

        Conversation.setFavorite(data)
            .then(() => {
                this.setState({ checkIsFavourite: 1 });
                this.setState({ isLoading: false });
            })
            .catch(err => {
                console.log('updtaing error on channel add favourite', err);
                this.setState({ isLoading: false });
            });
    }

    removeFavourite() {
        this.setState({ isLoading: true });
        const data = {
            type: 'channel',
            channelConvId: this.channel.channelId,
            channelName: this.channel.channelName,
            action: 'remove',
            description: this.channel.description,
            userDomain: this.channel.userDomain
        };

        Conversation.setFavorite(data)
            .then(() => {
                this.setState({ checkIsFavourite: 0 });
                this.setState({ isLoading: false });
            })
            .catch(err => {
                console.log('updtaing error on channel remove favourite', err);
                this.setState({ isLoading: false });
            });
    }

    //PARTICIPANTS
    manageParticipants() {
        Actions.addParticipants({
            title: 'Manage participants',
            onSelected: this.updateParticipants.bind(this)
        });
    }

    updateParticipants(participants) {
        const participantsIds = _.map(participants, part => {
            return part.userId;
        });
        Channel.updateParticipants(
            this.channel.channelName,
            this.channel.userDomain,
            participantsIds
        )
            .then(() => {
                this.setState({ participants: participants });
            })
            .catch(e => {
                console.log(e);
            });
    }

    //REQUESTS
    manageRequests() {
        Actions.requestsScreen({
            pendingUsers: this.state.pendingRequests,
            onDone: this.refresh.bind(this),
            channel: this.channel
        });
    }

    //ADMINS
    manageAdmins() {
        Actions.manageContacts({
            title: 'Manage admins',
            onSelected: this.setAdmins.bind(this),
            allContacts: this.state.participants,
            alreadySelected: this.state.admins,
            disabledUserIds: [this.channel.ownerId]
        });
    }

    setAdmins(admins) {
        const adminIds = _.map(admins, admin => {
            return admin.userId;
        });
        Channel.updateAdmins(
            this.channel.channelName,
            this.channel.userDomain,
            adminIds
        ).then(() => {
            this.setState({ admins: admins });
        });
    }

    //OWNERSHIP
    setOwner() {
        Actions.setChannelOwner({
            channel: this.channel,
            participants: this.state.participants,
            admins: this.state.admins
        });
    }

    unsubscribe() {
        this.setState({ uiDisabled: true }, () => {
            Channel.unsubscribe(this.channel)
                .then(() => {
                    return Conversation.deleteChannelConversation(
                        this.channel.channelId
                    );
                })
                .then(() => {
                    return MessageDAO.deleteBotMessages(this.channel.channelId);
                })
                .then(() => {
                    Actions.pop();
                })
                .catch(e => {
                    this.setState({ uiDisabled: false });
                    this.refs.toast.show(
                        'Fail to unsubscribe',
                        DURATION.LENGTH_SHORT
                    );
                });
        });
    }

    deleteChannel() {
        Alert.alert(
            'Delete channel',
            'Are you sure you want to delete this channel?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        Channel.deleteChannel(this.channel)
                            .then(() => {
                                return Conversation.deleteChannelConversation(
                                    this.channel.channelId
                                );
                            })
                            .then(() => {
                                return MessageDAO.deleteBotMessages(
                                    this.channel.channelId
                                );
                            })
                            .then(() => {
                                Actions.pop();
                            })
                            .catch(e => {
                                this.refs.toast.show(
                                    'Unable to delete channel',
                                    DURATION.LENGTH_SHORT
                                );
                            });
                    }
                }
            ]
        );
    }

    renderTopArea() {
        return (
            <View style={styles.adminTopArea}>
                <CachedImage
                    imageTag="channelLogo"
                    source={{ uri: Utils.channelLogoUrl(this.channel.logo) }}
                    style={styles.adminLogo}
                    resizeMode="contain"
                />
                <View style={styles.adminTopRightArea}>
                    <Text style={styles.adminH1}>
                        {this.channel.channelName}
                    </Text>
                    <Text style={styles.adminH2}>
                        {this.channel.description}
                    </Text>
                </View>
            </View>
        );
    }

    renderAdminArea() {
        let { checkIsFavourite } = this.state;

        return (
            <View>
                {!checkIsFavourite ? (
                    <TouchableOpacity
                        style={styles.adminRow}
                        disabled={this.state.uiDisabled}
                        onPress={this.setFavourite.bind(this)}
                    >
                        <Text style={styles.adminH2}>Add to favourite</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.adminRow}
                        disabled={this.state.uiDisabled}
                        onPress={this.removeFavourite.bind(this)}
                    >
                        <Text style={styles.adminH2}>Remove favourite</Text>
                    </TouchableOpacity>
                )}

                {this.renderSeparator(SeparatorSize.SMALL)}
                {this.props.isOwner ? (
                    <TouchableOpacity
                        style={styles.adminRow}
                        onPress={this.setOwner.bind(this)}
                        disabled={this.state.uiDisabled}
                    >
                        <Text style={styles.adminH2}>Transfer ownership</Text>
                    </TouchableOpacity>
                ) : null}
                {this.renderSeparator(SeparatorSize.SMALL)}
                {!this.props.isOwner ? (
                    <TouchableOpacity
                        style={styles.adminRow}
                        onPress={this.unsubscribe.bind(this)}
                        disabled={this.state.uiDisabled}
                    >
                        <Text
                            style={[
                                styles.adminH2,
                                { color: GlobalColors.red }
                            ]}
                        >
                            Leave channel
                        </Text>
                    </TouchableOpacity>
                ) : null}
                {this.renderSeparator(SeparatorSize.SMALL)}
                {this.props.isOwner ? (
                    <TouchableOpacity
                        style={styles.adminRow}
                        onPress={this.deleteChannel.bind(this)}
                        disabled={this.state.uiDisabled}
                    >
                        <Text
                            style={[
                                styles.adminH2,
                                { color: GlobalColors.red }
                            ]}
                        >
                            Delete channel
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }

    renderParticipantsArea() {
        return (
            <View>
                <View style={styles.adminRow}>
                    <Text style={styles.adminH1}>Participants</Text>
                </View>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity
                    style={styles.adminRow}
                    onPress={this.manageRequests.bind(this)}
                    disabled={this.state.uiDisabled}
                >
                    <View>
                        <Text style={styles.adminH2}>
                            Participants awaiting authorization
                        </Text>
                        <Text style={styles.adminH3}>
                            Pending authotization:{' '}
                            {this.state.pendingRequests.length}
                        </Text>
                    </View>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity
                    style={styles.adminRow}
                    onPress={this.manageParticipants.bind(this)}
                    disabled={this.state.uiDisabled}
                >
                    <View>
                        <Text style={styles.adminH2}>Manage participants</Text>
                        <Text style={styles.adminH3}>
                            Participants in this channel:{' '}
                            {this.state.participants.length}
                        </Text>
                    </View>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <TouchableOpacity
                    style={styles.adminRow}
                    onPress={this.manageAdmins.bind(this)}
                    disabled={this.state.uiDisabled}
                >
                    <Text style={styles.adminH2}>Manage admins</Text>
                    {Icons.formMessageArrow()}
                </TouchableOpacity>
                {this.renderSeparator(SeparatorSize.SMALL)}
                <View style={styles.emptyComponent} />
            </View>
        );
    }

    renderSeparator(size) {
        return (
            <View
                style={{
                    height: size,
                    backgroundColor: GlobalColors.disabledGray
                }}
            />
        );
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                <ScrollView style={styles.adminContainer}>
                    <ActivityIndicator size="small" />
                </ScrollView>
            );
        } else {
            return (
                <ScrollView style={styles.adminContainer}>
                    {this.renderTopArea()}
                    {this.renderSeparator(SeparatorSize.BIG)}
                    {this.renderAdminArea()}
                    {this.renderSeparator(SeparatorSize.BIG)}
                    {this.renderParticipantsArea()}
                    {this.renderToast()}
                </ScrollView>
            );
        }
    }
}

const mapStateToProps = state => ({
    appState: state.user,
    channels: state.channel
});

const mapDispatchToProps = dispatch => {
    return {
        setParticipants: participants =>
            dispatch(setChannelParticipants(participants)),
        setTeam: team => dispatch(setChannelTeam(team)),
        setCurrentScene: scene => dispatch(setCurrentScene(scene))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChannelAdminScreen);
