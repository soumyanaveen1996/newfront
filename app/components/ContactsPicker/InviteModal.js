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

export default class InviteModal extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            isVisible: this.props.isVisible,
            contactSelected: this.props.contact,
            keyboard: false
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

    cancelInvite() {
        this.props.setVisible(false);
        this.textInput.clear();
    }

    sendInvite() {
        Keyboard.dismiss();
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

    addNewContactScreen() {
        this.props.setVisible(false);
        Actions.addressBookScreen({ title: 'Add new contacts' });
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
                avoidKeyboard={true}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modal}>
                        <View
                            style={{
                                // backgroundColor: 'white',
                                flexDirection: 'column',
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                marginBottom: 25
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => this.props.setVisible(false)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    margin: 10
                                }}
                            >
                                <Image
                                    style={{ width: 14, height: 14 }}
                                    source={require('../../images/contact/popup-close.png')}
                                />
                            </TouchableOpacity>
                            <Text style={styles.inviteTitle}>
                                Add New Contact
                            </Text>
                            {this.state.keyboard ? null : (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Text style={styles.inviteText}>
                                        Search FrontM users with name, email or
                                        phone number
                                    </Text>
                                    <TouchableOpacity
                                        style={
                                            styles.searchContactButtonContainer
                                        }
                                        onPress={() => {
                                            this.props.setVisible(false);
                                            Actions.searchUsers({
                                                multiSelect: true
                                            });
                                        }}
                                    >
                                        <Text style={styles.searchText}>
                                            Search
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <View
                            style={{
                                backgroundColor: 'rgba(244,244,244,1)',
                                width: '100%',
                                flexDirection: 'column',
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={styles.inviteEmail}>
                                Or invite a friend with an email
                            </Text>
                            {/* <Text
                                style={{
                                    alignSelf: 'flex-start',
                                    color: 'rgba(74,74,74,1)',
                                    fontSize: 14
                                }}
                            >
                                Email
                            </Text> */}
                            <TextInput
                                ref={input => {
                                    this.textInput = input;
                                }}
                                onSubmitEditing={this.sendInvite.bind(this)}
                                onChangeText={text =>
                                    this.setState({ email: text })
                                }
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
                                    onPress={this.sendInvite.bind(this)}
                                >
                                    <Text style={styles.inviteButtonText}>
                                        Send Invite
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {/* <TouchableOpacity
                                style={styles.addressBookContainerStyle}
                                onPress={this.addNewContactScreen.bind(this)}
                            >
                                <Text style={styles.addressBookStyle}>
                                    Or invite user from address book
                                </Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}
