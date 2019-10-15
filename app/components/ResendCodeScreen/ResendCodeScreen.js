import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    BackHandler,
    AsyncStorage
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import EventEmitter, { AuthEvents } from '../../lib/events';

export default class ResendCodeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: this.props.email,
            password: this.props.password,
            errorMessage: '',
            loading: false,
            signupStage: this.props.signupStage
        };
    }

    componentDidMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                this.handleBackButtonClick(
                    this.props.email,
                    this.props.password
                );
            },
            false
        );
    }

    handleBackButtonClick(email, password) {
        if (Actions.currentScene === 'resendCodeScreen') {
            Actions.confirmationScreen({
                type: ActionConst.REPLACE,
                userEmail: email,
                password: password
            });
        }
    }
    onChangeEmailText(text) {
        this.setState({ userEmail: text });
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    async redirectToSignup() {
        const name = await AsyncStorage.getItem('userDisplayName');
        Actions.signupScreen({
            type: ActionConst.REPLACE,
            userName: name,
            userEmail: this.state.userEmail
        });
    }

    async onFormSubmit() {
        this.setState({ loading: true });

        const getStatus = await AsyncStorage.getItem('signupStage');
        if (getStatus && getStatus === 'done') {
            Actions.confirmationScreen({
                type: ActionConst.REPLACE,
                userEmail: this.state.userEmail,
                password: this.state.password,
                lastScreen: 'resendScreen'
            });
        }

        const userDetails = {
            email: this.state.userEmail
        };
        // console.log('send code again', userDetails, getStatus);

        await Auth.resendFrontmSignupCode(userDetails)
            .then(async data => {
                // console.log('response =========', data);

                if (data.success) {
                    this.setState({ loading: false });
                    await AsyncStorage.setItem(
                        'userEmail',
                        this.state.userEmail
                    );
                    await AsyncStorage.setItem('signupStage', 'checkCode');
                    EventEmitter.emit(AuthEvents.loginStageUpdate);
                    Actions.confirmationScreen({
                        type: ActionConst.REPLACE,
                        userEmail: this.state.userEmail,
                        password: this.state.password
                    });
                }
            })
            .catch(err => {
                console.log('error from resendCode ', err);
                this.setState({ loading: false });
                this.setState({
                    errorMessage: 'User/Email not found'
                });
            });
    }
    checkFieldEmpty = () => {
        // if (this.state.userEmail === '') {
        //     return false;
        // } else {
        //     if (this.validateEmail(this.state.userEmail)) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }

        if (
            this.state.signupStage &&
            this.state.signupStage === 'codeConfirmed'
        ) {
            return true;
        }

        if (!this.props.signupScreen) {
            return true;
        }

        return false;
    };

    displayEmailErrorMessege = () => {
        if (this.state.errorMessage && this.state.errorMessage.length > 0) {
            return (
                <View style={styles.userError}>
                    <Text style={styles.errorText}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            );
        }
    };
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Loader loading={this.state.loading} />
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <ScrollView
                        style={styles.container}
                        keyboardShouldPersistTaps="always"
                    >
                        <View style={styles.captionText}>
                            <Text style={styles.header}>Confirmation code</Text>
                            <Text style={styles.firstTitle}>
                                Please touch the button below and we will send a
                                new code to the email address{' '}
                                {this.state.userEmail}. If your email is not
                                correct please return to the signup screen and
                                change it.
                            </Text>
                        </View>
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
                                <Text style={styles.buttonText}>
                                    Send code again
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.changeEmailTextStyle}>
                            <TouchableOpacity
                                onPress={this.redirectToSignup.bind(this)}
                            >
                                <Text style={styles.goToSignup}>
                                    Go back to the Sign up screen
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
