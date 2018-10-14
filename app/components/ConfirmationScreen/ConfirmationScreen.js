import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    AsyncStorage,
    BackHandler,
    ScrollView
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
            userEmail: this.props.userEmail,
            password: this.props.password,
            code: 0,
            loading: false,
            errorMessage: ''
        };
    }

    componentWillMount() {
        AsyncStorage.getItem('userEmail').then(token => {
            this.setState(() => {
                return { userEmail: token };
            });
        });

        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    handleBackButtonClick() {
        if (Actions.currentScene === 'confirmationScreen') {
            BackHandler.exitApp();
        }
    }

    async onFormSubmit() {
        const userDetails = {
            email: this.state.userEmail,
            confirmCode: this.state.code
        };
        this.setState({ loading: true });
        console.log('send code done', userDetails);

        await Auth.confirmFrontmSignup(userDetails)
            .then(async data => {
                console.log('you can log in now', data);
                if (data.success) {
                    await AsyncStorage.setItem('signupStage', 'done');
                    this.showMainScreen();
                }
            })
            .catch(err => {
                console.log('error is ', err);
                this.setState({ errorMessage: 'Wrong code' });
                this.setState({ loading: false });
            });
    }

    showMainScreen = () => {
        if (this.state.password && this.state.password !== '') {
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
                    this.setState({ loading: false });
                    Actions.timeline({ type: ActionConst.REPLACE });
                })
                .catch(err => {
                    console.log('errors', err);
                    this.setState({ errorMessage: err.message });
                    this.setState({ loading: false });
                });
        } else {
            Actions.swiperScreen({
                type: ActionConst.REPLACE,
                email: this.state.userEmail,
                swiperIndex: 4
            });
        }

        return;
    };

    onChangeCode(text) {
        this.setState(() => {
            return { code: text };
        });
    }

    onResendButton() {
        console.log('Go to resend page');
        Actions.resendCodeScreen({
            type: ActionConst.REPLACE,
            email: this.state.userEmail
        });
    }
    checkFieldEmpty = () => {
        if (this.state.code !== 0 && this.state.code.length === 6) {
            return true;
        } else {
            return false;
        }
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Loader loading={this.state.loading} />
                <ScrollView style={styles.container}>
                    <KeyboardAvoidingView style={{ flex: 1 }}>
                        <View style={styles.innerContainer}>
                            <View style={styles.captionText}>
                                <Text style={styles.header}>
                                    Confirmation code
                                </Text>
                                <Text style={styles.firstTitle}>
                                    A confirmation code, with a 24 hour
                                    validity, has been sent to{' '}
                                    <Text style={styles.emailText}>
                                        {this.state.userEmail}
                                    </Text>{' '}
                                </Text>
                                <Text style={styles.secondTitle}>
                                    Please enter the code below to complete the
                                    registration process
                                </Text>
                            </View>
                            <View style={styles.pinCode}>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="numeric"
                                    autoFocus={true}
                                    placeholder="------"
                                    returnKeyType={'done'}
                                    onChangeText={this.onChangeCode.bind(this)}
                                    maxLength={6} //setting limit of input
                                />
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
                                    <Text style={styles.buttonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={this.onResendButton.bind(this)}
                            >
                                <Text style={styles.textColor}>
                                    Review email address and send the code again
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        );
    }
}
