import React from 'react';
import {
    View,
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    NativeModules
} from 'react-native';
import _ from 'lodash';
import { Auth, Contact } from '../../../lib/capability';
import styles, {
    chatMessageBubbleStyle,
    chatMessageTextStyle
} from '../styles';

import { ProfileImage } from '../../../widgets/ProfileImage';
import Images from '../../../config/images';
import ContactServices from '../../../apiV2/ContactServices';
import AppFonts from '../../../config/fontConfig';
//TODO: review for optimization
export default class ContactCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            localContact: false
        };
        this.newContact = true;
        Contact.getAddedContacts().then((addedContacts) => {
            const contact = _.find(
                addedContacts,
                (c) => c.userId === this.props.id
            );
            if (contact) {
                this.setState({ userName: contact.userName });
                this.newContact = false;
            } else {
                this.newContact = true;
                if (props.name) {
                    this.setState({ userName: props.name });
                } else {
                    const user = Auth.getUserData();
                    Contact.getUserDetails(user, this.props.id)
                        .then((c) => {
                            // console.log(i a)
                            this.setState({ userName: c.data.userName });
                        })
                        .catch((e) => {
                            console.log('>>>>>contact card error:', e);
                        });
                }
            }
        });
    }

    addContactModal = () => {
        let modalContent;
        if (!this.props.disabled && !this.newContact) {
            modalContent = (
                <View style={styles.contactCardModalContainer}>
                    <Text style={styles.contactCardModalText}>
                        This contact is already in your contacts{' '}
                        <Text style={{ fontWeight: AppFonts.BOLD }}>
                            {'\n'} {this.state.userName}
                        </Text>
                        {/* as a contact? */}
                    </Text>
                    <View style={styles.contactCardModalBottomArea}>
                        <TouchableOpacity
                            style={styles.contactCardModalCancelButton}
                            onPress={this.props.hideChatModal}
                        >
                            <Text
                                style={styles.contactCardModalCancelButtonText}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactCardModalOkButton}
                            onPress={this.props.hideChatModal}
                        >
                            <Text style={styles.contactCardModalOkButtonText}>
                                Ok
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            modalContent = (
                <View style={styles.contactCardModalContainer}>
                    <Text style={styles.contactCardModalText}>
                        Do you want to add{' '}
                        <Text style={{ fontWeight: AppFonts.BOLD }}>
                            {this.state.userName}
                        </Text>{' '}
                        as a contact?
                    </Text>
                    <View style={styles.contactCardModalBottomArea}>
                        <TouchableOpacity
                            style={styles.contactCardModalCancelButton}
                            onPress={this.props.hideChatModal}
                        >
                            <Text
                                style={styles.contactCardModalCancelButtonText}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactCardModalOkButton}
                            onPress={this.addContact}
                        >
                            <Text style={styles.contactCardModalOkButtonText}>
                                Ok
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        this.props.openModalWithContent(modalContent);
    };

    grpcAddContacts(user, userIds) {
        if (!userIds || userIds.length === 0) {
            return;
        }
        if (this.props.contactType && this.props.contactType === 'local') {
            userIds.localContacts = [this.props.msgData]; //for adding locaContactsl
        }
        ContactServices.add(userIds).then((response) => {
            console.log('axios grpcAddContacts response:', response);
        });
    }

    addContact() {
        this.props.hideChatModal();
        const user = Auth.getUserData();
        Contact.addContacts({
            userName: this.state.userName,
            userId: this.props.id
        }).then(() => this.grpcAddContacts(user, [this.props.id]));
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.contactCardContainer}
                onPress={this.addContactModal}
                disabled={this.props.disabled && !this.newContact}
            >
                <View>
                    <ProfileImage
                        uuid={this.props.id}
                        placeholder={Images.user_image}
                        style={[styles.placeholderProfilePic, {}]}
                        placeholderStyle={[styles.placeholderProfilePic]}
                        resizeMode="cover"
                        userName={this.state.userName}
                    />
                </View>
                <View>
                    <Text
                        style={styles.contactCardTitleTxt}
                        ellipsizeMode="head"
                        numberOfLines={
                            this.state.userName
                                ? this.state.userName.length > 22
                                    ? 2
                                    : 1
                                : 1
                        }
                        adjustsFontSizeToFit={true}
                        allowFontScaling={true}
                    >
                        {this.state.userName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}
