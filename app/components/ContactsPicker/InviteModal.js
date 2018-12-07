import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import styles from './styles';
import config from '../../config/config';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';

export default class InviteModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: this.props.isVisible,
            contactSelected: this.props.contact
        };
    }

    cancelInvite() {
        this.props.setVisible(false);
        this.textInput.clear();
    }

    sendInvite() {
        this.props.setVisible(false);
        this.textInput.clear();
        Auth.getUser().then(user => {
            const options = {
                method: 'post',
                url:
                    config.proxy.protocol +
                    config.proxy.host +
                    '/contactsActions',
                headers: {
                    sessionId: user.creds.sessionId
                },
                data: {
                    capability: 'InviteUsers',
                    botId: 'onboarding-bot',
                    emailIds: this.state.email
                }
            };
            return Network(options);
        });
    }

    render() {
        const contactSelected = this.state.contactSelected;
        return (
            <Modal
                isVisible={this.props.isVisible}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                onSwipe={() => this.props.setVisible(false)}
                swipeDirection="right"
            >
                <View style={styles.modal}>
                    <Text style={styles.inviteTitle}>Invite contacts</Text>
                    <Text style={styles.inviteText}>
                        Please enter your contact’s email or import it from your
                        address book and invite her to use FrontM.
                    </Text>
                    <Text style={styles.inviteEmail}>Email</Text>
                    <TextInput
                        ref={input => {
                            this.textInput = input;
                        }}
                        onSubmitEditing={this.sendInvite.bind(this)}
                        onChangeText={text => this.setState({ email: text })}
                        style={styles.inviteInput}
                        keyboardType={'email-address'}
                        textContentType={'emailAddress'}
                    />
                    <View style={styles.inviteButtonArea}>
                        <TouchableOpacity
                            style={[
                                styles.inviteButton,
                                { backgroundColor: GlobalColors.white }
                            ]}
                            onPress={this.cancelInvite.bind(this)}
                        >
                            <Text style={styles.inviteButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.inviteButton,
                                { backgroundColor: GlobalColors.sideButtons }
                            ]}
                            onPress={this.sendInvite.bind(this)}
                        >
                            <Text style={styles.inviteButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}
