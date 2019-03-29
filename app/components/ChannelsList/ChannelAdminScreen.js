import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Alert,
    Platform
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
        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.state = {
            participants: [],
            admins: [],
            pendingRequests: [],
            uiDisabled: true
        };
        this.channel = this.props.channel;
    }

    componentDidMount() {
        let participants;
        let admins;
        let pendingRequests;
        this.props.navigation.setParams({ onBack: this.onBack.bind(this) });
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
                return Channel.getAdmins(
                    this.channel.channelName,
                    this.channel.userDomain
                );
            })
            .then(adm => {
                admins = adm;
                this.setState({
                    participants: participants,
                    admins: admins,
                    pendingRequests: pendingRequests,
                    uiDisabled: false
                });
            });
    }

    componentWillUnmount() {
        this.props.setParticipants([]);
        this.props.setTeam('');
    }

    onBack() {
        Actions.pop();
    }

    //PARTICIPANTS
    manageParticipants() {
        Actions.manageContacts({
            title: 'Manage participants',
            onSelected: this.updateParticipants.bind(this),
            alreadySelected: this.state.participants,
            disabledUserIds: [this.channel.ownerId]
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
            onDone: this.updateRequests.bind(this),
            channel: this.channel
        });
    }

    updateRequests(pendingRequests) {
        this.setState({ pendingRequests: pendingRequests });
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
        this.setState({ uiDisabled: true }, () => {
            Channel.deleteChannel(this.channel)
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
                    this.refs.toast.show(
                        'Unable to delete channel',
                        DURATION.LENGTH_SHORT
                    );
                });
        });
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
        return (
            <View>
                <TouchableOpacity
                    style={styles.adminRow}
                    disabled={this.state.uiDisabled}
                >
                    <Text style={styles.adminH2}>Add to favourite</Text>
                </TouchableOpacity>
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
