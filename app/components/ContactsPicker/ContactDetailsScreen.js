import React from 'react';
import {
    View,
    Text,
    Image,
    AsyncStorage,
    TouchableOpacity,
    Alert,
    ScrollView,
    Platform
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GlobalColors } from '../../config/styles';
import ProfileImage from '../ProfileImage';
import Images from '../../config/images';
import Contact from '../../lib/capability/Contact';
import config from '../../config/config';
import { Auth, Network } from '../../lib/capability';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import CallModal from './CallModal';
import images from '../../images';
import { Conversation } from '../../lib/conversation';
import { ConversationDAO } from '../../lib/persistence';
import Contacts from 'react-native-contacts';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
const R = require('ramda');
import { Loader } from '../Loader';

export default class ContactDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            isFavourite: this.props.contact.isFavourite,
            loading: false
        };
    }

    componentDidMount() {
        // this.props.contact = this.props.contact;
    }

    startChat() {
        // console.log('ID ' + this.props.contact.id);
        let participants = [
            {
                userId: this.props.contact.id,
                userName: this.props.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                // type: ActionConst.REPLACE,
                onBack: this.props.onBack
            });
        });
    }

    callContact() {
        // console.log(this.props.contact);
        if (this.props.contact.phoneNumbers) {
            this.setModalVisible(true);
            return;
        }
        this.makeVoipCall();
    }

    renderNameArea() {
        return (
            <View style={styles.topContainerCD}>
                <View style={styles.topAreaCD}>
                    {/* <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="share"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity> */}
                    <ProfileImage
                        uuid={this.props.contact.id}
                        placeholder={Images.user_image}
                        style={styles.propicCD}
                        placeholderStyle={styles.propicCD}
                        resizeMode="cover"
                    />
                    {/* <TouchableOpacity style={styles.topButtonCD}>
                        <Icon
                            name="edit"
                            size={16}
                            color={GlobalColors.sideButtons}
                        />
                    </TouchableOpacity> */}
                </View>
                <Text style={styles.nameCD}>{this.props.contact.name}</Text>
                {this.props.contact.isWaitingForConfirmation ? (
                    <Text
                        style={{
                            textAlign: 'center',
                            color: 'rgba(155, 155, 155, 1)',
                            fontFamily: 'SF Pro Text',
                            fontSize: 14
                        }}
                    >
                        Awaiting for authorization
                    </Text>
                ) : null}
            </View>
        );
    }

    compareEmail = contact => {
        const { emailAddresses = [] } = contact;
        const phoneEmails = emailAddresses.map(email => email.email);
        const { emails } = this.props.contact;
        const contactEmail = emails.map(email => email.email);
        return R.intersection(contactEmail, phoneEmails).length > 0;
    };

    getLocalContacts = async () => {
        return new Promise((resolve, reject) => {
            Contacts.getAllWithoutPhotos((error, contacts) => {
                if (error) {
                    return reject('Cannt Find Local Contacts');
                }
                const foundLocalContact = R.filter(this.compareEmail, contacts);
                return resolve(foundLocalContact);

                // R.filter();
            });
        });
    };

    importLocalContacts = async () => {
        let localContacts;
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    title: 'Contacts',
                    message: 'Grant access for contacts to display in FrontM'
                }
            )
                .then(async granted => {
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        localContacts = await this.getLocalContacts();
                    } else {
                        console.log('Cannot get permission for Contacts');
                    }
                })
                .catch(err => {
                    console.log('PermissionsAndroid', err);
                });
        } else {
            localContacts = await this.getLocalContacts();
        }
        console.log(localContacts);
        const localPhone = localContacts[0].phoneNumbers[0].number;
        if (localPhone && localPhone !== '') {
            Contact.getAddedContacts().then(contactsData => {
                let updateContacts = contactsData.map(elem => {
                    if (elem.userId === this.props.contact.id) {
                        elem.phoneNumbers.local = localPhone;
                    }

                    return elem;
                });
                Contact.saveContacts(updateContacts).then(() => {
                    this.props.updateContactScreen();

                    setTimeout(async () => {
                        const allContacts = await Contact.getAddedContacts();
                        const newContact = allContacts
                            .filter(contact => contact.ignored === false)
                            .filter(
                                contact =>
                                    contact.userId === this.props.contact.id
                            );
                        const reloadContact = newContact.map(data => ({
                            id: data.userId,
                            name: data.userName,
                            emails: [{ email: data.emailAddress }], // Format based on phone contact from expo
                            phoneNumbers: data.phoneNumbers,
                            isWaitingForConfirmation:
                                data.waitingForConfirmation || false,
                            isFavourite: data.isFavourite || false
                        }));
                        Actions.refresh({
                            key: Math.random(),
                            contact: reloadContact[0],
                            updateList: this.props.updateList,
                            updateContactScreen: this.props.updateContactScreen
                        });
                    }, 2000);
                    // this.setState({ isFavourite: true });
                });
            });
        }
    };
    addToFavourite = () => {
        // console.log('contacts details ', this.props.contact);
        this.setState({ loading: true });
        let data = {
            type: 'contacts',
            userId: this.props.contact.id,
            action: 'add',
            userDomain: 'frontmai'
        };

        Conversation.setFavorite(data)
            .then(value => {
                console.log('contacts Set as favorite', value);
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.map(elem => {
                        if (elem.userId === value.otherUserId) {
                            elem.isFavourite = true;
                        }

                        return elem;
                    });
                    Contact.saveContacts(updateContacts).then(() => {
                        this.props.updateContactScreen();
                        this.setState({ isFavourite: true });
                    });
                });

                let conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );

                if (conversationId) {
                    ConversationDAO.updateConvFavorite(conversationId, 1)
                        .then(() => console.log('Updated db>>>>>>>'))
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }
                this.setState({ loading: false });
            })
            .catch(err => console.log('Cannot set favorite', err));
    };

    removeFavourite = () => {
        // console.log('contacts details ', this.props.contact);
        this.setState({ loading: true });
        let data = {
            type: 'contacts',
            userId: this.props.contact.id,
            action: 'remove',
            userDomain: 'frontmai'
        };

        Conversation.setFavorite(data)
            .then(value => {
                console.log('contacts Set as unfavorite', value);
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.map(elem => {
                        if (elem.userId === value.otherUserId) {
                            elem.isFavourite = false;
                        }

                        return elem;
                    });

                    Contact.saveContacts(updateContacts).then(() => {
                        this.props.updateContactScreen();
                        this.setState({ isFavourite: false });
                    });
                });
                let conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );
                if (conversationId) {
                    ConversationDAO.updateConvFavorite(conversationId, 0)
                        .then(() => console.log('Updated db>>>>>>>'))
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }

                // console.log('conversation ID', conversationId);
                this.setState({ loading: false });
            })
            .catch(err => console.log('Cannot remove favorite', err));
    };

    invitationSent = () => {
        return Alert.alert(
            'Contact added to your favourite',
            '',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        console.log('OK Pressed');
                    }
                }
            ],
            { cancelable: false }
        );
    };

    renderActionButtons() {
        if (!this.props.contact.isWaitingForConfirmation) {
            return (
                <View style={styles.actionAreaCD}>
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.startChat.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.sideButtons }
                            ]}
                        >
                            <Icon name="chat" size={16} color={'white'} />
                        </View>
                        <Text>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.callContact.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.green }
                            ]}
                        >
                            <Icon name="call" size={16} color={'white'} />
                        </View>
                        <Text>Call</Text>
                    </TouchableOpacity>
                    {this.state.isFavourite ? (
                        <TouchableOpacity
                            style={styles.actionButtonCD}
                            onPress={() => {
                                this.removeFavourite();
                            }}
                        >
                            <View
                                style={[
                                    styles.actionIconCD,
                                    { backgroundColor: GlobalColors.darkGray }
                                ]}
                            >
                                <Image
                                    source={images.add_remove_favourite}
                                    style={{ width: 32, height: 32 }}
                                />
                            </View>
                            <Text>Remove Favourite</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.actionButtonCD}
                            onPress={() => {
                                this.addToFavourite();
                            }}
                        >
                            <View
                                style={[
                                    styles.actionIconCD,
                                    { backgroundColor: GlobalColors.darkGray }
                                ]}
                            >
                                <Image
                                    source={images.add_remove_favourite}
                                    style={{ width: 32, height: 32 }}
                                />
                            </View>
                            <Text>Favourite</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        } else {
            return (
                <View
                    style={{
                        height: 75,
                        borderTopColor: 'rgba(221,222,227,1)',
                        borderTopWidth: 1,
                        borderBottomWidth: 5,
                        borderBottomColor: 'rgba(221,222,227,1)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={this.startChat.bind(this)}
                    >
                        <View
                            style={[
                                styles.actionIconCD,
                                { backgroundColor: GlobalColors.sideButtons }
                            ]}
                        >
                            <Image
                                style={{ width: 32, height: 32 }}
                                source={images.contact_chat_btn}
                            />
                        </View>
                        <Text>Conversation</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderDetails() {
        if (!this.props.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.props.contact.phoneNumbers
                        ? this.renderNumbers()
                        : null}
                    {this.renderEmails()}
                </View>
            );
        } else {
            return null;
        }
    }

    renderFooterButtons() {
        return (
            <View
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 10
                }}
            >
                <TouchableOpacity
                    onPress={this.importLocalContacts}
                    style={{
                        borderWidth: 0.5,
                        borderColor: 'rgba(0,167,214,1)',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 40,
                        width: wp('70%')
                    }}
                >
                    <Text style={{ color: 'rgba(0,167,214,1)' }}>
                        Import Phone from address book
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderEmails() {
        if (!this.props.contact.isWaitingForConfirmation) {
            return _.map(this.props.contact.emails, () =>
                this.renderDetailRow(
                    'email',
                    'Email',
                    this.props.contact.emails[0].email
                )
            );
        }
    }

    renderNumbers() {
        if (!this.props.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.props.contact.phoneNumbers.mobile
                        ? this.renderDetailRow(
                            'smartphone',
                            'Mobile',
                            this.props.contact.phoneNumbers.mobile
                        )
                        : null}
                    {this.props.contact.phoneNumbers.land
                        ? this.renderDetailRow(
                            'local_phone',
                            'Land',
                            this.props.contact.phoneNumbers.land
                        )
                        : null}
                    {this.props.contact.phoneNumbers.satellite
                        ? this.renderDetailRow(
                            'satellite',
                            'Satellite',
                            this.props.contact.phoneNumbers.satellite
                            // 'Unavailable'
                        )
                        : null}
                    {this.props.contact.phoneNumbers.local
                        ? this.renderDetailRow(
                            'smartphone',
                            'Phone*',
                            this.props.contact.phoneNumbers.local
                            // 'Unavailable'
                        )
                        : null}
                </View>
            );
        } else {
            return null;
        }
    }

    makeVoipCall() {
        this.setModalVisible(false);
        let participants = [
            {
                userId: this.props.contact.id,
                userName: this.props.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                call: true
            });
        });
    }

    renderDetailRow(icon, label, content) {
        return (
            <View style={styles.detailRowCD} key={icon}>
                <Icon
                    name={icon}
                    size={16}
                    color={
                        label === 'Phone*'
                            ? GlobalColors.grey
                            : GlobalColors.sideButtons
                    }
                />
                <Text style={styles.labelCD}>{label}</Text>
                <Text style={styles.rowContentCD}>{content}</Text>
            </View>
        );
    }

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }

    render() {
        if (!this.props.contact) {
            return <View />;
        }
        return (
            <ScrollView style={styles.containerCD}>
                <Loader loading={this.state.loading} />
                {this.renderNameArea()}
                {this.renderActionButtons()}
                {this.renderDetails()}
                {this.renderFooterButtons()}
                <CallModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    contact={this.props.contact}
                />
            </ScrollView>
        );
    }
}
