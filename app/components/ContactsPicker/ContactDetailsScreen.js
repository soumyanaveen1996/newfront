import React from 'react';
import {
    View,
    Text,
    Image,
    AsyncStorage,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    PermissionsAndroid
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
import Store from '../../redux/store/configureStore';
import EventEmitter, { AuthEvents } from '../../lib/events';

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

    static onEnter() {
        const user = Store.getState().user;
        if (user.contactsLoaded === false) {
            Contact.refreshContacts();
        }
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Contacts'));
        Store.dispatch(refreshContacts(true));
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

    updateContact() {
        this.forceUpdate();
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
                    <ProfileImage
                        uuid={this.props.contact.id}
                        placeholder={Images.user_image}
                        style={styles.propicCD}
                        placeholderStyle={styles.propicCD}
                        resizeMode="cover"
                    />
                    {this.props.contact.contactType === 'local' ? (
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 20
                            }}
                            accessibilityLabel="More Button"
                            onPress={() => {
                                Actions.newContactScreen({
                                    contact: this.props.contact,
                                    updateContact: this.updateContact.bind(this)
                                });
                            }}
                        >
                            <Image
                                style={{
                                    width: 60,
                                    height: 60
                                }}
                                source={images.edit_btn}
                            />
                        </TouchableOpacity>
                    ) : null}
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
        // console.log('emails fo contacts ', phoneEmails);
        if (this.props.contact.contactType === 'local') {
            const localEmails = Object.values(
                this.props.contact.emailAddresses
            );
            return R.intersection(localEmails, phoneEmails).length > 0;
        } else {
            const found = phoneEmails.find(email => {
                email === this.props.contact.emailAddress;
            });
            if (found) {
                return true;
            } else {
                return false;
            }
        }
    };

    getLocalContacts = async () => {
        console.log('going thos getLocalContact');

        return new Promise((resolve, reject) => {
            Contacts.getAllWithoutPhotos((error, contacts) => {
                if (error) {
                    return reject('Cannt Find Local Contacts');
                }
                // console.log('get contacts ', contacts);

                const foundLocalContact = R.filter(this.compareEmail, contacts);
                return resolve(foundLocalContact);

                // R.filter();
            });
        });
    };

    addLocalConatcts = localContacts => {
        console.log('checking local contact ', localContacts);

        let emailToDisplay = this.props.contact.emails[0].email || '';
        let contactEmail = '';

        if (emailToDisplay && emailToDisplay.home) {
            contactEmail = emailToDisplay.home;
        }

        if (emailToDisplay && emailToDisplay.work) {
            contactEmail = emailToDisplay.work;
        }
        if (emailToDisplay && emailToDisplay.home && emailToDisplay.work) {
            contactEmail = emailToDisplay.work;
        }

        if (
            emailToDisplay &&
            (emailToDisplay.home === '' || emailToDisplay.work === '')
        ) {
            contactEmail = '';
        }

        console.log('we see', localContacts);

        if (localContacts.length === 0) {
            // this.setState({ loading: false });
            return Alert.alert(
                'No phone contact found for email address ',
                contactEmail
            );
        }
        const localPhone = localContacts[0].phoneNumbers[0].number;
        if (localPhone && localPhone !== '') {
            this.setState({ loading: true });
            Contact.getAddedContacts().then(contactsData => {
                let updateContacts = contactsData.map(elem => {
                    if (elem.userId === this.props.contact.id) {
                        const localPhonePath = R.lensPath([
                            'phoneNumbers',
                            'local'
                        ]);
                        elem = R.set(localPhonePath, localPhone, elem);

                        // elem.phoneNumbers.local = localPhone;
                    }
                    return elem;
                });
                Contact.saveContacts(updateContacts).then(() => {
                    this.props.updateContactScreen();

                    setTimeout(async () => {
                        const allContacts = await Contact.getAddedContacts();
                        this.setState({ loading: false });
                        const newContact = allContacts
                            .filter(contact => contact.ignored === false)
                            .filter(
                                contact =>
                                    contact.userId === this.props.contact.id
                            );
                        // console.log('lets see this one ', newContact);

                        if (newContact && newContact.length > 0) {
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
                                updateContactScreen: this.props
                                    .updateContactScreen
                            });
                        }
                    }, 2000);
                    // this.setState({ isFavourite: true });
                });
            });
        }
    };
    importLocalContacts = async () => {
        console.log('import local contact');

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
                    // console.log(
                    //     'granted =======',
                    //     granted === PermissionsAndroid.RESULTS.GRANTED
                    // );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        // console.log('going in this condition');

                        this.getLocalContacts().then(data => {
                            // console.log('get all conatctcs', data);
                            this.addLocalConatcts(data);
                        });
                        // localContacts = await this.getLocalContacts();
                        // console.log('we will se th contact ', localContacts);

                        // this.addLocalConatcts(localContacts);
                    } else {
                        console.log('Cannot get permission for Contacts');
                        return Alert.alert('Please grant access for contacts');
                        // Alert.alert(
                        //     'Please grant access for contacts',
                        //     'Would you like to grant access for contacts to diaplay in FrontM?',
                        //     [
                        //         {
                        //             text: 'No',
                        //             onPress: () =>
                        //                 console.log('Cancel Pressed'),
                        //             style: 'cancel'
                        //         },
                        //         {
                        //             text: 'Yes',
                        //             onPress: () => {
                        //                 this.importLocalContacts();
                        //                 console.log('OK Pressed');
                        //             }
                        //         }
                        //     ],
                        //     { cancelable: false }
                        // );
                    }
                })
                .catch(err => {
                    console.log('PermissionsAndroid', err);
                });
        } else {
            localContacts = await this.getLocalContacts();

            // console.log(
            //     'we will see ',
            //     localContacts,
            //     this.props.contact.emails
            // );

            this.addLocalConatcts(localContacts);
        }
    };
    addToFavourite = () => {
        console.log('contacts details ', this.props.contact);
        this.setState({ loading: true });
        let data = {
            type: 'contacts',
            userId: this.props.contact.id,
            action: 'add',
            userDomain: 'frontmai'
        };

        Conversation.setFavorite(data)
            .then(value => {
                // console.log('contacts Set as favorite', value);
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
            .catch(err => {
                this.setState({ loading: false });
                console.log('Cannot set favorite', err);
            });
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
            .catch(err => {
                this.setState({ loading: false });
                console.log('Cannot remove favorite', err);
            });
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

    checkFavourite = () => {
        if (
            this.props.contact.contactType &&
            this.props.contact.contactType !== 'local'
        ) {
            if (this.state.isFavourite) {
                return (
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
                        <Text style={{ textAlign: 'center' }}>
                            Remove Favourite
                        </Text>
                    </TouchableOpacity>
                );
            } else {
                return (
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
                );
            }
        }
    };

    renderActionButtons() {
        if (!this.props.contact.isWaitingForConfirmation) {
            return (
                <View style={styles.actionAreaCD}>
                    {this.props.contact.contactType &&
                    this.props.contact.contactType !== 'local' &&
                    this.props.contact.type !== 'Vessels' ? (
                            <TouchableOpacity
                                style={styles.actionButtonCD}
                                onPress={this.startChat.bind(this)}
                            >
                                <View
                                    style={[
                                        styles.actionIconCD,
                                        {
                                            backgroundColor:
                                            GlobalColors.sideButtons
                                        }
                                    ]}
                                >
                                    <Icon name="chat" size={16} color={'white'} />
                                </View>
                                <Text>Chat</Text>
                            </TouchableOpacity>
                        ) : null}
                    {this.props.contact.contactType === 'local' &&
                    (!this.props.contact.phoneNumbers ||
                        !Object.values(this.props.contact.phoneNumbers).find(
                            number => {
                                return number;
                            }
                        )) ? null : (
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
                        )}

                    {this.checkFavourite()}
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
                    {this.renderNumbers()}
                    {this.renderEmails()}
                </View>
            );
        } else {
            return null;
        }
    }

    deletePersonalContact = () => {
        this.setState({ loading: true });
        let { name, phoneNumbers, emails, id } = this.props.contact;
        let localContactObj = {
            userId: id,
            emailAddresses: {
                home: '',
                work: ''
            },
            phoneNumbers: {
                land: '',
                mobile: '',
                satellite: ''
            },
            userName: name
        };

        let bodyParse = {
            capability: 'RemoveContact',
            botId: 'onboarding-bot',
            localContacts: [localContactObj]
        };

        // console.log('data to send ', bodyParse);
        Conversation.deleteLocalContacts(bodyParse)
            .then(value => {
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.filter(elem => {
                        return elem.userId !== this.props.contact.id;
                    });

                    // console.log('on deleting contacts ', updateContacts);

                    Contact.saveContacts(updateContacts).then(allNewContact => {
                        this.props.updateContactScreen();
                    });
                });
                this.setState({ loading: false });
                Actions.pop();
                setTimeout(() => {
                    Actions.refresh({
                        key: Math.random()
                    });
                }, 100);
            })
            .catch(err => {
                this.setState({ loading: false });
                console.log('Cannot delete local conatcts', err);
            });
    };

    deleteContact() {
        this.setState({ loading: true });
        let bodyParse = {
            capability: 'RemoveContact',
            botId: 'onboarding-bot',
            users: []
        };

        if (this.props.contact && this.props.contact.id) {
            bodyParse.users.push(this.props.contact.id);
        }

        // console.log('delete this contact ', bodyParse, this.props.contact.id);

        Conversation.deleteContacts(bodyParse)
            .then(value => {
                Contact.getAddedContacts().then(contactsData => {
                    let updateContacts = contactsData.filter(elem => {
                        return elem.userId !== this.props.contact.id;
                    });

                    // console.log('on deleting contacts ', updateContacts);

                    Contact.saveContacts(updateContacts).then(allNewContact => {
                        this.props.updateContactScreen();
                    });
                });
                let conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );
                if (conversationId) {
                    Conversation.deleteConversation(conversationId)
                        .then(() => console.log('Updated db>>>>>>>'))
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }

                this.setState({ loading: false });
                Actions.pop();
                setTimeout(() => {
                    Actions.refresh({
                        key: Math.random()
                    });
                }, 100);
            })
            .catch(err => {
                this.setState({ loading: false });
                console.log('Cannot delete conatcts', err);
            });
    }

    renderFooterButtons() {
        // console.log('checking in andorid', this.props);

        if (
            this.props.contact.isWaitingForConfirmation ||
            (!this.props.contact.emailAddress &&
                !this.props.contact.emailAddresses)
        ) {
            return <View />;
        }
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
                    style={styles.import_btn}
                >
                    <Text style={styles.cancel_text}>
                        Import phone from address book
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderEmails() {
        if (!this.props.contact.isWaitingForConfirmation) {
            if (
                this.props.contact.contactType === 'local' &&
                this.props.contact.emailAddresses
            ) {
                return (
                    <View>
                        {this.props.contact.emailAddresses.home
                            ? this.renderDetailRow(
                                'email',
                                'Home',
                                this.props.contact.emailAddresses.home
                            )
                            : null}
                        {this.props.contact.emailAddresses.work
                            ? this.renderDetailRow(
                                'email',
                                'Work',
                                this.props.contact.emailAddresses.work
                            )
                            : null}
                    </View>
                );
            } else {
                return (
                    <View>
                        {this.props.contact.emailAddress
                            ? this.renderDetailRow(
                                'email',
                                'Email',
                                this.props.contact.emailAddress
                            )
                            : null}
                    </View>
                );
            }
        } else {
            return null;
        }
    }

    renderNumbers() {
        if (
            !this.props.contact.isWaitingForConfirmation &&
            this.props.contact.phoneNumbers
        ) {
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
                            'phone',
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
        let iconImage;
        if (icon === 'smartphone' || icon === 'phone') {
            iconImage = (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        } else if (icon === 'satellite') {
            iconImage = (
                <Image
                    source={images.satellite_icon}
                    style={styles.phoneIcon}
                />
            );
        } else if (icon === 'email') {
            iconImage = (
                <Image source={images.email_icon} style={styles.emailIcon} />
            );
        }
        return (
            <View style={styles.mainInfoRenderContainer}>
                <View style={styles.labelContainer}>
                    {iconImage}
                    <Text style={styles.labelStyle}>{label}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.inputNumber}>{content}</Text>
                </View>
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
                {/* {this.renderFooterButtons()} */}
                {this.props.contact.contactType &&
                    this.props.contact.contactType !== 'local' &&
                    this.props.contact.type !== 'Vessels' && (
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                marginVertical: 40
                            }}
                            onPress={this.deleteContact.bind(this)}
                        >
                            <Image source={images.delete_icon_trash} />
                            <Text
                                style={{
                                    color: 'rgba(229, 69, 59, 1)',
                                    fontFamily: 'SF Pro Text',
                                    fontSize: 16,
                                    marginHorizontal: 10
                                }}
                            >
                                    Delete contact
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {this.props.contact.contactType &&
                    this.props.contact.contactType === 'local' && (
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                marginVertical: 40
                            }}
                            onPress={this.deletePersonalContact.bind(this)}
                        >
                            <Image source={images.delete_icon_trash} />
                            <Text
                                style={{
                                    color: 'rgba(229, 69, 59, 1)',
                                    fontFamily: 'SF Pro Text',
                                    fontSize: 16,
                                    marginHorizontal: 10
                                }}
                            >
                                    Delete contact
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <CallModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    contact={this.props.contact}
                />
            </ScrollView>
        );
    }
}
