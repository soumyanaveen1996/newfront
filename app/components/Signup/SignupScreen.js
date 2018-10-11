import React from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    AsyncStorage
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { isEmail } from '../../lib/utils';
import images from '../../images';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { Button } from 'react-native-elements';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';

export default class SignupScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            passwordCriteria: [
                ' One uppercase letter',
                ' One lowercase letter',
                ' One special character',
                ' One number',
                ' 8 characters minimum'
            ],
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            nameError: '',
            emailError: '',
            passwordError: '',
            confirmPasswordError: ''
        };
        this.inputs = {};
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    passwordValidation = string => {
        var counter = 0;
        if (string.length >= 8) {
            if (/[a-z]/.test(string)) {
                counter++;
            }
            if (/[A-Z]/.test(string)) {
                counter++;
            }
            if (/[0-9]/.test(string)) {
                counter++;
            }
            if (/[!@#$&*_]/.test(string)) {
                counter++;
            }
        }
        return counter === 4;
    };

    passwordConfirm = () => {
        if (this.state.password !== this.state.confirmPassword) {
            return false;
        } else {
            return true;
        }
    };

    goBackToLogin = () => {
        Actions.swiperScreen({ type: ActionConst.REPLACE });
    };

    checkFieldEmpty = () => {
        if (this.state.name && this.state.name === '') {
        }

        if (
            this.state.name !== '' &&
            this.state.email !== '' &&
            this.state.password !== '' &&
            this.state.confirmPassword !== ''
        ) {
            return true;
        }
    };

    onSignup = async () => {
        this.setState(() => {
            return { loading: true };
        });
        let emailResult = this.validateEmail(this.state.email);
        let passworResult = this.passwordValidation(this.state.password);
        let passwordConfirmResult = this.passwordConfirm();
        if (emailResult && passworResult && passwordConfirmResult) {
            const userDetails = {
                userName: this.state.name,
                email: this.state.email,
                password: this.state.password
            };
            await Auth.signupWithFrontm(userDetails)
                .then(async data => {
                    console.log('success signup email went', data);
                    if (data.success) {
                        await AsyncStorage.setItem('userEmail', data.data);
                        await AsyncStorage.setItem(
                            'signupStage',
                            'confirmCode'
                        );

                        this.setState(() => {
                            return { loading: false };
                        });
                        Actions.confirmationScreen({
                            type: ActionConst.REPLACE
                        });
                    }
                })
                .catch(err => {
                    this.setState({ errorMessage: err.message });
                    this.setState(() => {
                        return { loading: false };
                    });
                });
        } else {
            if (!emailResult) {
                this.ssetState({ emailError: 'Invalid Email' });
            }
            this.setState(() => {
                return { loading: false };
            });
        }
    };

    onChangeName(text) {
        this.setState({ name: text });
    }

    onChangeEmail(text) {
        this.setState({ email: text });
    }

    onChangePassword(text) {
        this.setState({ password: text });
    }
    onChangeConfirmPassword(text) {
        this.setState({ confirmPassword: text });
    }

    focusNextField = id => {
        this.inputs[id].focus();
    };

    render() {
        return (
            <ScrollView style={styles.container}>
                <Loader loading={this.state.loading} />
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <Text style={styles.signupHeader}>Sign up to FrontM</Text>
                    <View
                        style={styles.formContainer}
                        behavior={Platform.OS === 'ios' ? 'position' : null}
                    >
                        <Text style={styles.placeholderText}> Name </Text>
                        <TextInput
                            style={styles.input}
                            autoCorrect={false}
                            returnKeyType={'next'}
                            blurOnSubmit={false}
                            onSubmitEditing={() => {
                                this.focusNextField('two');
                            }}
                            ref={input => {
                                this.inputs.one = input;
                            }}
                            placeholder="Name"
                            onChangeText={this.onChangeName.bind(this)}
                            placeholderTextColor="rgba(155,155,155,1)"
                        />
                        <Text style={styles.placeholderText}> Email </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            returnKeyType={'next'}
                            blurOnSubmit={false}
                            onSubmitEditing={() => {
                                this.focusNextField('three');
                            }}
                            ref={input => {
                                this.inputs.two = input;
                            }}
                            placeholder="Email"
                            onChangeText={this.onChangeEmail.bind(this)}
                            placeholderTextColor="rgba(155,155,155,1)"
                        />
                        <Text style={styles.placeholderText}> Password </Text>
                        <TextInput
                            style={styles.input}
                            returnKeyType={'next'}
                            blurOnSubmit={false}
                            onSubmitEditing={() => {
                                this.focusNextField('four');
                            }}
                            ref={input => {
                                this.inputs.three = input;
                            }}
                            placeholder="Password"
                            placeholderTextColor="rgba(155,155,155,1)"
                            onChangeText={this.onChangePassword.bind(this)}
                            secureTextEntry
                        />
                        <Text style={styles.placeholderText}>
                            {' '}
                            Confirm Password{' '}
                        </Text>
                        <TextInput
                            style={styles.input}
                            returnKeyType={'done'}
                            blurOnSubmit={true}
                            ref={input => {
                                this.inputs.four = input;
                            }}
                            placeholder="Confirm Password"
                            placeholderTextColor="rgba(155,155,155,1)"
                            onChangeText={this.onChangeConfirmPassword.bind(
                                this
                            )}
                            secureTextEntry
                        />
                        <Text style={{ color: 'red' }}>
                            {this.state.errorMessage}
                        </Text>
                        <View
                            style={{
                                width: 285,
                                height: 170,
                                padding: 5,
                                marginBottom: 35
                            }}
                        >
                            <Text style={styles.passwordText}>
                                Password must contain:
                            </Text>
                            <FlatList
                                data={this.state.passwordCriteria}
                                renderItem={({ item }) => (
                                    <Text style={styles.passwordCriteriaList}>
                                        {item}
                                    </Text>
                                )}
                            />
                        </View>
                        <TouchableOpacity
                            disabled={!this.checkFieldEmpty()}
                            style={
                                this.checkFieldEmpty()
                                    ? styles.buttonContainer
                                    : styles.diableButton
                            }
                            onPress={this.onSignup}
                        >
                            <Text style={styles.buttonText}>SIGNUP</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}
