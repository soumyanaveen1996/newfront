import React, { Component } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styles from './styles';
import { Auth } from '../../../lib/capability';
import Loader from '../../../widgets/Loader';
import EventEmitter, { AuthEvents } from '../../../lib/events';
import NavigationAction from '../../../navigation/NavigationAction';

export default class ResendCodeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: this.props.route.params.email,
            password: this.props.route.params.password,
            errorMessage: '',
            loading: false,
            signupStage: this.props.route.params.signupStage
        };
    }

    componentDidMount() {
        this.backhandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                this.handleBackButtonClick(
                    this.props.route.params.email,
                    this.props.route.params.password
                );
            },
            false
        );
    }

    componentWillUnmount() {
        this.backhandler?.remove();
    }

    handleBackButtonClick(email, password) {
        if (NavigationAction.currentScreen() === 'resendCodeScreen') {
            NavigationAction.push(NavigationAction.SCREENS.confirmationScreen, {
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
        const getStatus = AsyncStorage.removeItem('signupStage');
        NavigationAction.replace(NavigationAction.SCREENS.signupScreen, {
            userName: name,
            userEmail: this.state.userEmail
        });
    }

    async onFormSubmit() {
        this.setState({ loading: true });

        const getStatus = await AsyncStorage.getItem('signupStage');
        if (getStatus && getStatus === 'done') {
            NavigationAction.replace(
                NavigationAction.SCREENS.confirmationScreen,
                {
                    userEmail: this.state.userEmail,
                    password: this.state.password,
                    lastScreen: 'resendScreen'
                }
            );
        }

        const userDetails = {
            email: this.state.userEmail
        };
        // console.log('send code again', userDetails, getStatus);

        await Auth.resendFrontmSignupCode(userDetails)
            .then(async (data) => {
                // console.log('response =========', data);

                if (data.success) {
                    this.setState({ loading: false });
                    await AsyncStorage.setItem(
                        'userEmail',
                        this.state.userEmail
                    );
                    await AsyncStorage.setItem('signupStage', 'checkCode');
                    EventEmitter.emit(AuthEvents.loginStageUpdate);
                    NavigationAction.replace(
                        NavigationAction.SCREENS.confirmationScreen,
                        {
                            userEmail: this.state.userEmail,
                            password: this.state.password
                        }
                    );
                }
            })
            .catch((err) => {
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

        if (!this.props.route.params.signupScreen) {
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
