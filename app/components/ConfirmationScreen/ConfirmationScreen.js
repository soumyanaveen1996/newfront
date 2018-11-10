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
    SafeAreaView
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import styles from './styles';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';

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
            passwordErrorMessage: ''
        };
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

    async onFormSubmit() {
        const userDetails = {
            email: this.state.userEmail,
            confirmCode: this.state.code
        };
        this.setState({ loading: true, errorMessage: '' });

        await Auth.confirmFrontmSignup(userDetails)
            .then(async data => {
                if (data.success) {
                    await AsyncStorage.setItem('signupStage', 'done');
                    this.showMainScreen();
                }
            })
            .catch(err => {
                console.log('error from confirmation page ', err);
                this.setState({ errorMessage: 'Wrong code', loading: false });
            });
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
            .then(() => {
                this.setState({ loading: false, code: '', password: '' });
                Actions.timeline({ type: ActionConst.REPLACE });
            })
            .catch(err => {
                this.setState({ errorMessage: err.message });
                this.setState({ loading: false });
            });

        return;
    };

    onChangeCode(text) {
        this.setState(() => {
            return { code: text };
        });
    }

    onResendButton() {
        Actions.resendCodeScreen({
            type: ActionConst.REPLACE,
            email: this.state.userEmail,
            password: this.state.password
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
        if (!this.props.password) {
            return (
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}>
                        {' '}
                        {this.state.confirmPasswordTitle}{' '}
                    </Text>
                    <TextInput
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
                                autoFocus={true}
                                placeholder="------"
                                returnKeyType={'done'}
                                value={
                                    this.state.code === 0
                                        ? null
                                        : this.state.code
                                }
                                onChangeText={this.onChangeCode.bind(this)}
                                underlineColorAndroid="transparent"
                                maxLength={6} //setting limit of input
                            />
                        </View>
                        {this.displayPasswordField()}
                        <View style={styles.codeButton}>
                            <TouchableOpacity
                                disabled={!this.checkFieldEmpty()}
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

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={this.onResendButton.bind(this)}
                        >
                            <Text style={styles.textColor}>
                                Review email address and send the code again
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
