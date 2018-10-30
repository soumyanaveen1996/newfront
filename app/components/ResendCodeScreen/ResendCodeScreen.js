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

export default class ResendCodeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: this.props.email,
            password: this.props.password,
            errorMessage: '',
            loading: false
        };
    }

    componentWillMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    handleBackButtonClick() {
        Actions.pop();

        return true;
    }
    onChangeEmailText(text) {
        this.setState({ userEmail: text });
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    async onFormSubmit() {
        this.setState({ loading: true });
        console.log('send code again');
        const userDetails = {
            email: this.state.userEmail
        };

        await Auth.resendFrontmSignupCode(userDetails)
            .then(async data => {
                if (data.success) {
                    this.setState({ loading: false });
                    await AsyncStorage.setItem('userEmail', data.data);
                    await AsyncStorage.setItem('signupStage', 'confirmCode');
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
        if (this.state.userEmail === '') {
            return false;
        } else {
            if (this.validateEmail(this.state.userEmail)) {
                return true;
            } else {
                return false;
            }
        }
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
                                Please confirm the email address
                            </Text>
                        </View>
                        <View style={styles.pinCode}>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                onChangeText={this.onChangeEmailText.bind(this)}
                                keyboardType="email-address"
                                editable={true}
                                returnKeyType={'done'}
                                placeholder="email@example.com"
                                value={this.state.userEmail}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                                selectTextOnFocus={true}
                            />
                            {this.displayEmailErrorMessege()}
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
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
