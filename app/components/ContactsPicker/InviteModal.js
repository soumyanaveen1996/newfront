import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import styles from './styles';
import config from '../../config/config';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import _ from 'lodash';

import { AddLocalContacts, grpcInvite } from '../../api/ContactServices';
import { NativeModules } from 'react-native';
const ContactsServiceClient = NativeModules.ContactsServiceClient;
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default class InviteModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: this.props.isVisible,
            contactSelected: this.props.contact,
            keyboard: false,
            isInviteVisible: false,
            sending: false
        };
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.keyboardDidHide.bind(this)
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow() {
        this.setState({ keyboard: true });
    }

    keyboardDidHide() {
        this.setState({ keyboard: false });
    }

    getInputRef = input => (this.textInput = input);
    hideModal = ({ message }) => {
        message
            ? this.props.setVisible(false, message)
            : this.props.setVisible(false);
        this.setState({ isInviteVisible: false });
    };

    cancelInvite() {
        this.hideModal({});
        this.textInput.clear();
    }

    onChangeText = text => this.setState({ email: text });
    sendInvite = () => {
        let reg = /\S+@\S+/;
        if (!reg.test(this.state.email)) {
            return;
        }
        Keyboard.dismiss();

        this.textInput.clear();
        this.setState({ sending: true });
        Auth.getUser()
            .then(user => {
                if (_.isArray(this.state.email)) {
                    return grpcInvite(user, this.state.email);
                } else {
                    return grpcInvite(user, [this.state.email]);
                }
            })
            .then(data => {
                console.log('sent invite done', data);

                if (data.error > 0) {
                    console.log('error in sending invite');
                }
                this.setState({ sending: false });
                this.hideModal({ message: 'done' });

                console.log('Invite sent successfully');
            })
            .catch(err => {
                this.setState({ sending: false });
                this.hideModal({});
                console.log('error in sending invite ', err);
            });
    };

    addNewContactScreen = () => {
        this.hideModal({});
        Actions.addressBookScreen({ title: 'Add new contacts' });
    };

    setInviteVisible = () => this.setState({ isInviteVisible: true });
    setInviteHide = () => this.setState({ isInviteVisible: false });
    createLocalContact = () => {
        const fakeData = {
            localContacts: [
                {
                    userName: `SidHemu${Math.floor(
                        Math.random() * 20
                    ).toString()}`,
                    emailAddresses: {
                        home: `sid_hello+${Math.floor(
                            Math.random() * 20
                        ).toString()}@example.com`,
                        work: ''
                    },
                    phoneNumbers: {
                        land: '08045678955',
                        mobile: '919880433199',
                        satellite: ''
                    }
                }
            ]
        };

        AddLocalContacts(fakeData).then(elem => {
            console.log('data ', elem);
            this.props.setVisible(false);
        });
    };

    createNewContact = () => {
        Actions.newContactScreen();
        this.props.setVisible(false);
    };

    render() {
        const contactSelected = this.state.contactSelected;
        return (
            <View>
                <Modal
                    isVisible={this.props.isVisible}
                    onBackdropPress={() => {
                        this.hideModal({});
                    }}
                    onBackButtonPress={() => {
                        this.hideModal({});
                    }}
                    onSwipe={() => this.hideModal({})}
                    swipeDirection="right"
                    avoidKeyboard={true}
                >
                    {!this.state.isInviteVisible ? (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modal}>
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: wp('85%'),
                                        justifyContent: 'flex-end',
                                        margin: 10
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => this.hideModal({})}
                                    >
                                        <Image
                                            style={{
                                                width: 15,
                                                height: 15,
                                                resizeMode: 'center',
                                                padding: 5
                                            }}
                                            source={require('../../images/remove-icon/popup-close.png')}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text
                                    style={{
                                        display: 'flex',
                                        width: wp('80%'),
                                        justifyContent: 'flex-start',
                                        margin: 10,
                                        padding: 5,
                                        fontSize: 20
                                    }}
                                >
                                    Add New Contact
                                </Text>
                                <TouchableOpacity
                                    style={{
                                        ...styles.searchContactButtonContainer
                                    }}
                                    onPress={() => {
                                        this.hideModal({});
                                        Actions.searchUsers({
                                            multiSelect: true,
                                            onDone: this.props.addContacts.bind(
                                                this
                                            )
                                        });
                                    }}
                                >
                                    <Text style={styles.searchText}>
                                        Search FrontM
                                    </Text>
                                </TouchableOpacity>

                                <View
                                    style={{
                                        width: wp('90%'),
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <View
                                        style={{
                                            width: wp('40%'),
                                            height: 1.5,
                                            borderBottomWidth: 0.5,
                                            borderBottomColor: '#D8D8D8'
                                        }}
                                    />
                                    <Text
                                        style={{ color: 'rgba(155,155,155,1)' }}
                                    >
                                        or
                                    </Text>
                                    <View
                                        style={{
                                            width: wp('40%'),
                                            height: 5,
                                            borderBottomWidth: 0.5,
                                            borderBottomColor: '#D8D8D8'
                                        }}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={{
                                        width: wp('80%'),
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 10,
                                        marginBottom: 5
                                    }}
                                    onPress={() => {
                                        this.createNewContact();
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: 'contain',
                                            marginLeft: 10
                                        }}
                                        source={require('../../images/email-icon/create-new-contact-icon3x.png')}
                                    />

                                    <Text style={styles.inviteEmail}>
                                        Create New Contact
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        width: wp('80%'),
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginVertical: 10
                                    }}
                                    onPress={() => {
                                        this.setInviteVisible();
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: 'contain',
                                            marginLeft: 10
                                        }}
                                        source={require('../../images/email-icon/send-invitation-icon3x.png')}
                                    />

                                    <Text style={styles.inviteEmail}>
                                        Invite Friends to FrontM
                                    </Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    style={{
                                        width: wp('80%'),
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginVertical: 10
                                    }}
                                    onPress={() => {
                                        this.createLocalContact();
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: 'contain',
                                            marginLeft: 10
                                        }}
                                        source={require('../../images/email-icon/send-invitation-icon3x.png')}
                                    />

                                    <Text style={styles.inviteEmail}>
                                        FAKE CREATE LOCAL CONTACTS(REMOVE
                                        THIS!!!)
                                    </Text>
                                </TouchableOpacity> */}
                            </View>
                        </TouchableWithoutFeedback>
                    ) : (
                        <InviteByEmail
                            sendInvite={this.sendInvite}
                            addNewContactScreen={this.addNewContactScreen}
                            onChangeText={this.onChangeText}
                            getInputRef={this.getInputRef}
                            onClose={() => this.hideModal({})}
                            inviting={this.state.sending}
                        />
                    )}
                </Modal>
            </View>
        );
    }
}

const InviteByEmail = ({
    sendInvite,
    addNewContactScreen,
    onChangeText,
    getInputRef,
    onClose,
    inviting
}) => {
    const modalStyle = {
        ...styles.modal
    };
    return (
        <View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyle}>
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: wp('85%'),
                            justifyContent: 'flex-end',
                            margin: 10
                        }}
                    >
                        <TouchableOpacity onPress={onClose}>
                            <Image
                                style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: 'center',
                                    padding: 5
                                }}
                                source={require('../../images/remove-icon/popup-close.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={{
                            display: 'flex',
                            width: wp('80%'),
                            justifyContent: 'flex-start',
                            margin: 10,
                            padding: 5,
                            fontSize: 20
                        }}
                    >
                        Send an email invitation
                    </Text>
                    <TextInput
                        ref={input => {
                            getInputRef(input);
                        }}
                        onSubmitEditing={sendInvite}
                        onChangeText={onChangeText}
                        style={{ ...styles.inviteInput, marginTop: 20 }}
                        keyboardType={'email-address'}
                        textContentType={'emailAddress'}
                        placeholder="email@example.com"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <View style={styles.inviteButtonArea}>
                        <TouchableOpacity
                            style={{
                                ...styles.inviteButton,
                                backgroundColor: '#00BDF2'
                            }}
                            onPress={sendInvite}
                            disabled={inviting}
                        >
                            {inviting ? (
                                <Text
                                    style={{
                                        ...styles.inviteButtonText,
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Sending...
                                </Text>
                            ) : (
                                <Text
                                    style={{
                                        ...styles.inviteButtonText,
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Send Invite
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            width: wp('90%'),
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <View
                            style={{
                                width: wp('40%'),
                                height: 1.5,
                                borderBottomWidth: 0.5,
                                borderBottomColor: '#D8D8D8'
                            }}
                        />
                        <Text style={{ color: 'rgba(155,155,155,1)' }}>or</Text>
                        <View
                            style={{
                                width: wp('40%'),
                                height: 5,
                                borderBottomWidth: 0.5,
                                borderBottomColor: '#D8D8D8'
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        style={{
                            width: wp('80%'),
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 10
                        }}
                        onPress={addNewContactScreen}
                    >
                        <Image
                            style={{
                                width: 25,
                                height: 25,
                                resizeMode: 'contain',
                                marginLeft: 10
                            }}
                            source={require('../../images/email-icon/send-invitation-icon3x.png')}
                        />

                        <Text style={styles.inviteEmail}>
                            Select Contact from Address Book
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};
