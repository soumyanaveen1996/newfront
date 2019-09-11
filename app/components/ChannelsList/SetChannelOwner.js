import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import ProfileImage from '../ProfileImage';
import images from '../../images';
import { Channel } from '../../lib/capability';
import _ from 'lodash';
import { GlobalColors } from '../../config/styles';
import Modal from 'react-native-modal';
import Icons from '../../config/icons';
import { Actions } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import ContactStyles from '../ContactsPicker/styles';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import NetworkButton from '../Header/NetworkButton';

export default class SetChannelOwner extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: 'Transfer ownership'
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
            showModal: false
        };
    }

    selectOwner(user) {
        this.setState({
            showModal: true,
            owner: user
        });
    }

    ownerSelected() {
        Channel.setChannelOwner(
            this.props.channel.channelName,
            this.props.channel.userDomain,
            this.state.owner.userId
        )
            .then(() => {
                this.setState({ showModal: false });
                Actions.popTo(ROUTER_SCENE_KEYS.channelsList);
            })
            .catch(e => {
                this.setState({ showModal: false });
            });
    }

    renderItem({ item }) {
        isAdmin = _.find(this.props.admins, { userId: item.userId });
        let rowStyle;
        if (this.state.owner && item.userId === this.state.owner.userId) {
            rowStyle = [
                styles.adminRow,
                { backgroundColor: 'rgba(0,189,242,0.1)' }
            ];
        } else {
            rowStyle = styles.adminRow;
        }
        return (
            <TouchableOpacity
                style={rowStyle}
                onPress={this.selectOwner.bind(this, item)}
            >
                <View style={styles.ownerRowLeft}>
                    <ProfileImage
                        uuid={item.userId}
                        placeholder={images.user_image}
                        style={ContactStyles.contactItemImage}
                        placeholderStyle={ContactStyles.contactItemImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.participantName}>{item.userName}</Text>
                </View>
                <View>
                    <Text style={styles.adminH2}>{isAdmin ? 'Admin' : ''}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderModal() {
        return (
            <Modal
                isVisible={this.state.showModal}
                onBackdropPress={() => {
                    this.setState({
                        showModal: false
                    });
                }}
                style={styles.ownerModal}
                backdropOpacity={0.1}
            >
                <View style={styles.ownerModalContainer}>
                    <Text style={[styles.adminH1, { textAlign: 'center' }]}>
                        Transfer ownership
                    </Text>
                    <Text style={[styles.adminH2, { textAlign: 'center' }]}>
                        Are you sure you want to transfer ownership to{' '}
                        {this.state.owner ? this.state.owner.userName : null}
                    </Text>
                    <View style={styles.ownerModalWarningArea}>
                        {Icons.redWarning()}
                        <Text
                            style={[
                                styles.adminH2,
                                { color: GlobalColors.red }
                            ]}
                        >
                            You can't revert this action
                        </Text>
                    </View>
                    <View style={styles.ownerModalButtonArea}>
                        <TouchableOpacity
                            style={styles.ownerModalButtonCancel}
                            onPress={() => this.setState({ showModal: false })}
                        >
                            <Text
                                style={[
                                    styles.adminH2,
                                    { color: GlobalColors.sideButtons }
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.ownerModalButtonYes}
                            onPress={this.ownerSelected.bind(this)}
                        >
                            <Text
                                style={[
                                    styles.adminH2,
                                    { color: GlobalColors.white }
                                ]}
                            >
                                Yes, transfer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    render() {
        return (
            <View style={styles.adminContainer}>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.adminH2}>
                        You cannot undo this action, and the transfer is
                        immediate.
                        {'\n'}
                        {'\n'}
                        The new owner will have ultimate authority over the
                        channel - including promoting others to ownership roles.
                    </Text>
                    <Text style={styles.newOwnerTitle}>Select new owner</Text>
                </View>
                <FlatList
                    data={this.props.participants}
                    renderItem={this.renderItem.bind(this)}
                    extraData={this.state}
                    ListFooterComponent={<View style={styles.emptyComponent} />}
                />
                {this.renderModal()}
            </View>
        );
    }
}
