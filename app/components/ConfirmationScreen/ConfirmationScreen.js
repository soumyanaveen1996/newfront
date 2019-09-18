import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    AsyncStorage,
    BackHandler,
    ScrollView,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import styles from './styles';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';
import DefaultPreference from 'react-native-default-preference';
import AfterLogin from '../../services/afterLogin';
import {
    synchronizeUserData,
    synchronizePhoneBook
} from '../../lib/UserData/SyncData';
import { TwilioVoIP } from '../../lib/twilio';

export default class ConfirmationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmPasswordTitle: 'Confirm password',
            userEmail: this.props.userEmail,
            password: this.props.password,
            code: 0,
            loading: false,
            errorMessage: '',
            passwordErrorMessage: '',
            signupStatus: '',
            disable: false
        };
        this.textInput = null;
    }

    componentWillMount() {
        AsyncStorage.getItem('userEmail').then(token => {
            this.setState(() => {
                return { userEmail: token };
            });
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            this.setState({
                userEmail: this.props.userEmail,
                password: this.props.password
            });
        }
    }

    componentWillUnmount() {
        Keyboard.dismiss();
    }

    static onExit() {
        Keyboard.dismiss();
    }

    async onFormSubmit() {
        this.setState({ loading: true });
        const getStatus = await AsyncStorage.getItem('signupStage');

        if (getStatus && getStatus === 'done') {
            if (
                this.state.password &&
                typeof this.state.password !== 'undefined' &&
                this.state.password.length >= 8
            ) {
                this.showMainScreen();
            } else {
                this.setState({
                    errorMessage: 'Enter password',
                    loading: false
                });
            }
        } else {
            const userDetails = {
                email: this.state.userEmail,
                confirmCode: this.state.code
            };
            this.setState({ loading: true, errorMessage: '' });

            await Auth.confirmFrontmSignup(userDetails)
                .then(async data => {
                    if (data.success) {
                        await AsyncStorage.setItem('signupStage', 'done');
                        this.setState({ signupStatus: 'codeConfirmed' });
                        this.showMainScreen();
                    }
                })
                .catch(err => {
                    console.log('error from confirmation page ', err);
                    this.setState({
                        errorMessage: 'Wrong code',
                        loading: false
                    });
                });
        }
    }

    showMainScreen = () => {
        const userDetails = {
            email: this.state.userEmail,
            password: this.state.password
        };

        Auth.loginWithFrontm(
            userDetails,
            '',
            SYSTEM_BOT_MANIFEST['onboarding-bot'].botId
        )
            .then(async () => {
                this.setState({
                    code: '',
                    password: '',
                    signupStatus: '',
                    errorMessage: '',
                    disable: true
                });
                await TwilioVoIP.init();
                // RemoteBotInstall.syncronizeBots()
                Auth.getUser().then(user => {
                    if (Platform.OS === 'android') {
                        DefaultPreference.setName('NativeStorage');
                    }
                    const ContactsURL = `${Config.network.queueProtocol}${
                        Config.proxy.host
                    }${Config.network.userDetailsPath}`;
                    const ContactsBOT = SystemBot.contactsBot.botId;
                    DefaultPreference.set('SESSION', user.creds.sessionId);
                    DefaultPreference.set('URL', ContactsURL);
                    DefaultPreference.set('CONTACTS_BOT', ContactsBOT);
                });
                AfterLogin.executeAfterLogin();
                synchronizeUserData();
                synchronizePhoneBook();
                this.setState({ loading: false });
                setTimeout(
                    () =>
                        Actions.timeline({
                            type: ActionConst.REPLACE
                        }),
                    0
                );
            })
            .catch(err => {
                console.log('error on incorrect password ', err);
                this.setState({ errorMessage: 'Incorrect Password' });
                this.setState({ loading: false, disable: false });
            });

        return;
    };

    onChangeCode(text) {
        // Keyboard.dismiss()
        this.setState(() => {
            return { code: text };
        });
    }

    onResendButton() {
        Actions.resendCodeScreen({
            type: ActionConst.REPLACE,
            email: this.state.userEmail,
            password: this.state.password,
            signupStatus: this.state.signupStatus
        });
    }

    onGoToLoginButton() {
        Actions.swiperScreen({
            type: ActionConst.REPLACE,
            swiperIndex: 4
        });
    }
    checkFieldEmpty = () => {
        if (this.state.code !== 0 && this.state.code.length === 6) {
            if (this.props.password) {
                return true;
            } else {
                if (
                    this.state.password &&
                    typeof this.state.password !== 'undefined' &&
                    this.state.password.length >= 8
                ) {
                    return true;
                }
            }
        } else {
            return false;
        }
    };

    onChangePasswordText(i, text) {
        this.setState({ password: text });
    }

    displayPasswordField = () => {
        if (
            !this.props.password ||
            (this.props.lastScreen && this.props.lastScreen === 'resendScreen')
        ) {
            return (
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}>
                        {' '}
                        {this.state.confirmPasswordTitle}{' '}
                    </Text>
                    <TextInput
                        ref={element => (this.textInput = element)}
                        style={styles.input}
                        blurOnSubmit={true}
                        returnKeyType={'done'}
                        onChangeText={this.onChangePasswordText.bind(this, 1)}
                        placeholder="password"
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor="rgba(155,155,155,1)"
                        secureTextEntry
                        clearButtonMode="always"
                        value={this.state.password}
                    />
                    {this.displayPasswordErrorMessege()}
                </View>
            );
        }
    };

    displayPasswordErrorMessege = () => {
        if (
            this.state.passwordErrorMessage &&
            this.state.passwordErrorMessage.length > 0
        ) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.passwordErrorMessage}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    confirmCodeStatus = () => {
        if (
            this.state.signupStatus &&
            this.state.signupStatus === 'codeConfirmed'
        ) {
            return (
                <View
                    style={
                        !this.props.password
                            ? styles.pinCodeWithPassword
                            : styles.pinCode
                    }
                >
                    <Text style={styles.textCode}>{this.state.code}</Text>
                </View>
            );
        } else {
            return (
                <View
                    style={
                        !this.props.password
                            ? styles.pinCodeWithPassword
                            : styles.pinCode
                    }
                >
                    <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        // autoFocus={true}
                        placeholder="------"
                        returnKeyType={'done'}
                        value={this.state.code === 0 ? null : this.state.code}
                        onChangeText={this.onChangeCode.bind(this)}
                        underlineColorAndroid="transparent"
                        blurOnSubmit={true}
                        returnKeyType={'done'}
                        maxLength={6} //setting limit of input
                        editable={!this.state.disable}
                    />
                </View>
            );
        }
    };

    checkToResendCodeScreen = () => {
        if (
            this.state.signupStatus &&
            this.state.signupStatus === 'codeConfirmed'
        ) {
            return (
                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={this.onGoToLoginButton.bind(this)}
                >
                    <Text style={styles.textColor}>Go to Login</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={this.onResendButton.bind(this)}
                >
                    <Text style={styles.textColor}>
                        Review email address and send the code again
                    </Text>
                </TouchableOpacity>
            );
        }
    };

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Loader loading={this.state.loading} />
                <ScrollView style={{ flex: 1 }}>
                    <KeyboardAvoidingView
                        style={styles.container}
                        keyboardShouldPersistTaps="always"
                    >
                        <View style={styles.captionText}>
                            <Text style={styles.header}>Confirmation code</Text>
                            <Text style={styles.firstTitle}>
                                A confirmation code, with a 24 hour validity,
                                has been sent to{' '}
                                <Text style={styles.emailText}>
                                    {this.state.userEmail}
                                </Text>{' '}
                            </Text>
                            <Text style={styles.secondTitle}>
                                Please enter the code below to complete the
                                registration process
                            </Text>
                        </View>
                        {this.confirmCodeStatus()}
                        {this.displayPasswordField()}
                        <View style={styles.codeButton}>
                            <TouchableOpacity
                                disabled={
                                    !this.checkFieldEmpty() ||
                                    this.state.disable
                                }
                                style={
                                    this.checkFieldEmpty()
                                        ? styles.buttonContainer
                                        : styles.diableButton
                                }
                                onPress={this.onFormSubmit.bind(this)}
                            >
                                <Text style={styles.buttonText}>Done</Text>
                            </TouchableOpacity>
                            <View style={{ bottom: 60 }}>
                                {this.state.errorMessage ? (
                                    <Text
                                        style={{
                                            color: 'rgba(255,0,0,1)'
                                        }}
                                    >
                                        {this.state.errorMessage}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {this.checkToResendCodeScreen()}
                    </KeyboardAvoidingView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
