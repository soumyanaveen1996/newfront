import React from 'react';
import {
    View,
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';
import ImageCache from '../../lib/image_cache';
import { Auth, Network, Contact } from '../../lib/capability';
import utils from '../../lib/utils';
import { chatMessageBubbleStyle, chatMessageTextStyle } from './styles';
import styles from './styles';
import config from '../../config/config';
import { ProfileImage } from '../ProfileImage';
import Images from '../../config/images';
import _ from 'lodash';

export default class ContactCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: ''
        };
        this.newContact = true;
        Contact.getAddedContacts().then(addedContacts => {
            const contact = _.find(addedContacts, c => {
                return c.userId === this.props.id;
            });
            if (contact) {
                this.setState({ userName: contact.userName });
                this.newContact = false;
            } else {
                this.newContact = true;
                Auth.getUser()
                    .then(user => {
                        const options = {
                            method: 'GET',
                            url:
                                config.proxy.protocol +
                                config.proxy.host +
                                '/userDetails?userId=' +
                                this.props.id,
                            headers: {
                                sessionId: user.creds.sessionId
                            }
                        };
                        return Network(options);
                    })
                    .then(c => {
                        this.setState({ userName: c.data.userName });
                    });
            }
        });
    }

    addContactModal() {
        modalContent = (
            <View style={styles.contactCardModalContainer}>
                <Text style={styles.contactCardModalText}>
                    Do you want to add{' '}
                    <Text style={{ fontWeight: 'bold' }}>
                        {this.state.userName}
                    </Text>{' '}
                    as a contact?
                </Text>
                <View style={styles.contactCardModalBottomArea}>
                    <TouchableOpacity
                        style={styles.contactCardModalCancelButton}
                        onPress={this.props.hideChatModal.bind(this)}
                    >
                        <Text style={styles.contactCardModalCancelButtonText}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.contactCardModalOkButton}
                        onPress={this.addContact.bind(this)}
                    >
                        <Text style={styles.contactCardModalOkButtonText}>
                            Ok
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
        this.props.openModalWithContent(modalContent);
    }

    addContact() {
        this.props.hideChatModal();
        Contact.addContacts({
            userName: this.state.userName,
            userId: this.props.id
        })
            .then(() => {
                return Auth.getUser();
            })
            .then(user => {
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
                        capability: 'AddContact',
                        botId: 'onboarding-bot',
                        users: [this.props.id]
                    }
                };
                return Network(options);
            });
    }

    render() {
        return (
            <TouchableOpacity
                style={chatMessageBubbleStyle(
                    this.props.alignRight,
                    this.props.imageSource
                )}
                onPress={this.addContactModal.bind(this)}
                disabled={this.props.disabled && !this.newContact}
            >
                <ProfileImage
                    uuid={this.props.id}
                    placeholder={Images.user_image}
                    style={styles.profilePic}
                    placeholderStyle={styles.placeholderProfilePic}
                    resizeMode="cover"
                />
                <Text style={chatMessageTextStyle(this.props.alignRight)}>
                    {this.state.userName}
                </Text>
            </TouchableOpacity>
        );
    }
}
