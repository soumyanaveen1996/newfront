import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    SafeAreaView,
    Keyboard,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styles from './styles';
import { Auth, Settings, PollingStrategyTypes } from '../../../lib/capability';
import Loader from '../../../widgets/Loader';
import SystemBot, { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import AfterLogin from '../Login/afterLogin';
import { synchronizeUserData } from '../../../lib/UserData/SyncData';
import EventEmitter, { AuthEvents } from '../../../lib/events';
import Config from '../../../config/config';
import NavigationAction from '../../../navigation/NavigationAction';
import configToUse from '../../../config/config';
import Bot from '../../../lib/bot';
import { NetworkHandler } from '../../../lib/network';

export default class ConfirmationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmPasswordTitle: 'Confirm password',
            userEmail: this.props.route.params.userEmail,
            password: this.props.route.params.password,
            code: 0,
            loading: false,
            errorMessage: null,
            passwordErrorMessage: '',
            signupStatus: '',
            disable: false
        };
        this.textInput = null;
    }

    componentDidMount() {
        AsyncStorage.getItem('userEmail').then((token) => {
            this.setState({
                userEmail: this.props.route.params.userEmail || token,
                password: this.props.route.params.password
            });
        });
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
            this.setState({ loading: true, errorMessage: null });

            await Auth.confirmFrontmSignup(userDetails)
                .then(async (data) => {
                    if (data.success) {
                        await AsyncStorage.setItem('signupStage', 'done');
                        EventEmitter.emit(AuthEvents.loginStageUpdate);
                        this.setState({ signupStatus: 'codeConfirmed' });
                        this.showMainScreen();
                    }
                })
                .catch((err) => {
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
                    errorMessage: null,
                    disable: true
                });

                // RemoteBotInstall.syncronizeBots()
                await Settings.setPollingStrategy(
                    PollingStrategyTypes.satellite
                );
                Auth.getUser().then((user) => {
                    if (Platform.OS === 'android') {
                        DefaultPreference.setName('NativeStorage');
                    }
                    const ContactsURL = `${Config.network.queueProtocol}${Config.proxy.user_details_path}`;
                    const ContactsBOT = SystemBot.contactsBot.botId;
                    DefaultPreference.set('SESSION', user.creds.sessionId);
                    DefaultPreference.set('URL', ContactsURL);
                    DefaultPreference.set('CONTACTS_BOT', ContactsBOT);
                });
                NetworkHandler.setCheckTime(Date.now());
                await AfterLogin.executeAfterLogin();
                await Bot.addNewProvider(configToUse.defaultProvider);
                synchronizeUserData();
                this.setState({ loading: false });
                AsyncStorage.setItem('newLogin', 'yes').then(() => {
                    NavigationAction.replace(NavigationAction.SCREENS.drawer, {
                        newLogin: true
                    });
                });
            })
            .catch((err) => {
                console.log('error on incorrect password ', err);
                this.setState({ errorMessage: 'Incorrect Password' });
                this.setState({ loading: false, disable: false });
            });
    };

    onChangeCode(text) {
        this.setState(() => ({ code: text }));
    }

    onResendButton() {
        NavigationAction.replace(NavigationAction.SCREENS.resendCodeScreen, {
            email: this.state.userEmail,
            password: this.state.password,
            signupStatus: this.state.signupStatus
        });
    }

    onGoToLoginButton() {
        NavigationAction.replace(NavigationAction.SCREENS.swiperScreen, {
            swiperIndex: 4
        });
    }

    checkFieldEmpty = () => {
        if (this.state.code !== 0 && this.state.code.length === 6) {
            if (this.props.route.params.password) {
                return true;
            }
            if (
                this.state.password &&
                typeof this.state.password !== 'undefined' &&
                this.state.password.length >= 8
            ) {
                return true;
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
            !this.props.route.params.password ||
            (this.props.route.params.lastScreen &&
                this.props.route.params.lastScreen === 'resendScreen')
        ) {
            return (
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}>
                        {' '}
                        {this.state.confirmPasswordTitle}{' '}
                    </Text>
                    <TextInput
                        ref={(element) => (this.textInput = element)}
                        style={styles.input}
                        blurOnSubmit
                        returnKeyType="done"
                        onChangeText={this.onChangePasswordText.bind(this, 1)}
                        placeholder="password"
                        underlineColorAndroid="transparent"
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
                        !this.props.route.params.password
                            ? styles.pinCodeWithPassword
                            : styles.pinCode
                    }
                >
                    <Text style={styles.textCode}>{this.state.code}</Text>
                </View>
            );
        }
        return (
            <View
                style={
                    !this.props.route.params.password
                        ? styles.pinCodeWithPassword
                        : styles.pinCode
                }
            >
                <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    // autoFocus={true}
                    placeholder="------"
                    value={this.state.code === 0 ? null : this.state.code}
                    onChangeText={this.onChangeCode.bind(this)}
                    underlineColorAndroid="transparent"
                    blurOnSubmit
                    returnKeyType="done"
                    maxLength={6} // setting limit of input
                    editable={!this.state.disable}
                />
            </View>
        );
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
        }
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
                                {this.state.errorMessage && (
                                    <Text
                                        style={{
                                            color: 'rgba(255,0,0,1)'
                                        }}
                                    >
                                        {this.state.errorMessage}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {this.checkToResendCodeScreen()}
                    </KeyboardAvoidingView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
