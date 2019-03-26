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
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { relativeTimeRounding } from 'moment';

export default class InviteModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: this.props.isVisible,
            contactSelected: this.props.contact,
            keyboard: false,
            isInviteVisible: false
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
    hideModal = (message = null) => {
        message
            ? this.props.setVisible(false, message)
            : this.props.setVisible(false);
        this.setState({ isInviteVisible: false });
    };

    cancelInvite() {
        this.hideModal();
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
        Auth.getUser()
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
                        capability: 'InviteUsers',
                        botId: 'onboarding-bot',
                        emailIds: this.state.email
                    }
                };
                return Network(options);
            })
            .then(data => {
                console.log('sent invite done', data);

                if (data.error > 0) {
                    console.log('error in sending invite');
                }
                this.hideModal('done');

                console.log('Invite sent successfully');
            })
            .catch(err => {
                this.hideModal();
                console.log('error in sending invite ', err);
            });
    };

    addNewContactScreen = () => {
        this.hideModal();
        Actions.addressBookScreen({ title: 'Add new contacts' });
    };

    setInviteVisible = () => this.setState({ isInviteVisible: true });
    setInviteHide = () => this.setState({ isInviteVisible: false });

    render() {
        const contactSelected = this.state.contactSelected;
        return (
            <View>
                <Modal
                    isVisible={this.props.isVisible}
                    onBackdropPress={() => {
                        this.hideModal();
                    }}
                    onBackButtonPress={() => {
                        this.hideModal();
                    }}
                    onSwipe={() => this.hideModal()}
                    swipeDirection="right"
                    avoidKeyboard={true}
                >
                    {!this.state.isInviteVisible ? (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modal}>
                                <TouchableOpacity
                                    style={styles.searchContactButtonContainer}
                                    onPress={() => {
                                        this.hideModal();
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

                                <TouchableOpacity
                                    style={{
                                        width: wp('80%'),
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginVertical: 30
                                    }}
                                    onPress={() => {
                                        this.setInviteVisible();
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            marginLeft: 10
                                        }}
                                        source={require('../../images/email-icon/email-icon3x.png')}
                                    />

                                    <Text style={styles.inviteEmail}>
                                        Invite Friends to FrontM
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    ) : (
                        <InviteByEmail
                            sendInvite={this.sendInvite}
                            addNewContactScreen={this.addNewContactScreen}
                            onChangeText={this.onChangeText}
                            getInputRef={this.getInputRef}
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
    getInputRef
}) => {
    const modalStyle = {
        ...styles.modal,
        justifyContent: 'center'
    };
    return (
        <View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyle}>
                    <TextInput
                        ref={input => {
                            getInputRef(input);
                        }}
                        onSubmitEditing={sendInvite}
                        onChangeText={onChangeText}
                        style={styles.inviteInput}
                        keyboardType={'email-address'}
                        textContentType={'emailAddress'}
                        placeholder="email@example.com"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <View style={styles.inviteButtonArea}>
                        <TouchableOpacity
                            style={[
                                styles.inviteButton,
                                { backgroundColor: GlobalColors.white }
                            ]}
                            onPress={sendInvite}
                        >
                            <Text style={styles.inviteButtonText}>
                                Send Invite
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.addressBookContainerStyle}
                        onPress={addNewContactScreen}
                    >
                        <Text style={styles.addressBookStyle}>
                            Or Select Contact from Address Book
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};
