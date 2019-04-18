import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    FlatList,
    Platform,
    BackHandler,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import styles from './styles';
import Loader from '../Loader/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import images from '../../images';
import { Auth } from '../../lib/capability';
import { Actions } from 'react-native-router-flux';

export default class ResetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            passwordCriteria: [
                { text: ' One uppercase letter', isDone: false },
                { text: ' One lowercase letter', isDone: false },
                { text: ' One special character', isDone: false },
                { text: ' One number', isDone: false },
                { text: ' 8 characters minimum', isDone: false }
            ],
            email: this.props.email || '',
            verificationCode: '',
            password: '',
            confirmPassword: '',
            passwordError: '',
            confirmPasswordError: '',
            errorMessage: ''
        };
        this.inputs = {};
    }

    alidateEmail(email) {
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
    passwordChecking = string => {
        if (string.length >= 8) {
            const newArr = [...this.state.passwordCriteria];
            newArr[4].isDone = true;
            this.setState({ passwordCriteria: [...newArr] });
        } else {
            const newArr = [...this.state.passwordCriteria];
            this.setState({ eightCharacterCase: false });
            newArr[4].isDone = false;
            this.setState({ passwordCriteria: [...newArr] });
        }
        if (/[a-z]/.test(string)) {
            const passArr = [...this.state.passwordCriteria];
            passArr[1].isDone = true;
            this.setState({ passwordCriteria: [...passArr] });
        } else {
            const passArr = [...this.state.passwordCriteria];
            passArr[1].isDone = false;
            this.setState({ passwordCriteria: [...passArr] });
        }
        if (/[A-Z]/.test(string)) {
            const passArr = [...this.state.passwordCriteria];
            passArr[0].isDone = true;
            this.setState({ passwordCriteria: [...passArr] });
        } else {
            const passArr = [...this.state.passwordCriteria];
            passArr[0].isDone = false;
            this.setState({ passwordCriteria: [...passArr] });
        }
        if (/[0-9]/.test(string)) {
            const passArr = [...this.state.passwordCriteria];
            passArr[3].isDone = true;
            this.setState({ passwordCriteria: [...passArr] });
        } else {
            const passArr = [...this.state.passwordCriteria];
            passArr[3].isDone = false;
            this.setState({ passwordCriteria: [...passArr] });
        }
        if (/[!@#$&*_]/.test(string)) {
            const passArr = [...this.state.passwordCriteria];
            passArr[2].isDone = true;
            this.setState({ passwordCriteria: [...passArr] });
        } else {
            const passArr = [...this.state.passwordCriteria];
            passArr[2].isDone = false;
            this.setState({ passwordCriteria: [...passArr] });
        }
    };

    passwordConfirm = () => {
        if (this.state.password !== this.state.confirmPassword) {
            return false;
        } else {
            return true;
        }
    };

    checkFieldEmpty = () => {
        let passworResult = this.passwordValidation(this.state.password);
        let passwordConfirmResult = this.passwordConfirm();

        if (passworResult && passwordConfirmResult) {
            return true;
        }
    };

    onChangeCode(text) {
        // Keyboard.dismiss()
        this.setState(() => {
            return { verificationCode: text };
        });
    }

    onChangePassword(text) {
        this.setState({ password: text }, () => {
            this.passwordChecking(this.state.password);
        });
    }
    onChangeConfirmPassword(text) {
        this.setState({ confirmPassword: text });
    }

    focusNextField = id => {
        this.inputs[id].focus();
    };

    displayPasswordErrorMessege = () => {
        if (this.state.passwordError && this.state.passwordError.length > 0) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.passwordError}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    displayPasswordSuccessMessege = () => {
        if (this.passwordValidation(this.state.password)) {
            return (
                <View style={styles.successContainer}>
                    <View style={styles.userSuccess}>
                        <Text style={styles.successText}>Perfect!</Text>
                    </View>
                </View>
            );
        }
    };

    displayConfrimSuccessMessege = () => {
        if (
            this.state.confirmPassword &&
            this.state.confirmPassword.length > 0 &&
            this.passwordConfirm()
        ) {
            return (
                <View style={styles.successContainer}>
                    <View style={styles.userSuccess}>
                        <Text style={styles.successText}>Match!</Text>
                    </View>
                </View>
            );
        }
    };

    displayConfrimErrorMessege = () => {
        if (
            this.state.confirmPasswordError &&
            this.state.confirmPasswordError.length > 0
        ) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.confirmPasswordError}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    onResetPassword = () => {
        this.setState(() => {
            return { loading: true };
        });

        let passworResult = this.passwordValidation(this.state.password);
        let passwordConfirmResult = this.passwordConfirm();
        if (passworResult && passwordConfirmResult) {
            const userDetails = {
                verificationCode: this.state.verificationCode,
                email: this.state.email,
                newPassword: this.state.password
            };
            // console.log('userdetails ', userDetails);
            Auth.confirmReset(userDetails)
                .then(data => {
                    if (data.success) {
                        this.setState(() => {
                            return { loading: false };
                        });
                        Actions.loginScreen();
                    }
                })
                .catch(err => {
                    console.log('error from reset password ', err);
                    this.setState(() => {
                        return { loading: false };
                    });
                });
        } else {
            if (!passworResult) {
                this.setState({ passwordError: 'Invalid Password' });
            }
            if (!passwordConfirmResult) {
                this.setState({
                    confirmPasswordError: 'Password do not match'
                });
            }
            this.setState(() => {
                return { loading: false };
            });
        }
    };

    render() {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView
                    style={styles.containerReset}
                    keyboardShouldPersistTaps="always"
                >
                    <Loader loading={this.state.loading} />
                    <KeyboardAwareScrollView
                        style={styles.keyboardConatiner}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        scrollEnabled={false}
                    >
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>
                                Reset your password
                            </Text>
                        </View>
                        <View
                            style={styles.formContainer}
                            behavior={Platform.OS === 'ios' ? 'position' : null}
                        >
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    Confirmation Code{' '}
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType="numeric"
                                    autoFocus={true}
                                    placeholder="- - - - - -"
                                    onChangeText={this.onChangeCode.bind(this)}
                                    underlineColorAndroid="transparent"
                                    blurOnSubmit={false}
                                    returnKeyType={'next'}
                                    onSubmitEditing={() => {
                                        this.focusNextField('password');
                                    }}
                                    maxLength={6} //setting limit of input
                                />
                            </View>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    Password{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    returnKeyType={'next'}
                                    blurOnSubmit={false}
                                    onBlur={() => {
                                        const isValidPasswword = this.passwordValidation(
                                            this.state.password
                                        );
                                        if (!isValidPasswword) {
                                            this.setState({
                                                passwordError:
                                                    'Check your Password'
                                            });
                                        } else {
                                            this.setState({
                                                passwordError: ''
                                            });
                                        }
                                    }}
                                    onSubmitEditing={() => {
                                        this.focusNextField('confirmPassword');
                                    }}
                                    ref={input => {
                                        this.inputs.password = input;
                                    }}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    onChangeText={this.onChangePassword.bind(
                                        this
                                    )}
                                    secureTextEntry
                                    clearButtonMode="always"
                                />

                                {this.passwordValidation(this.state.password)
                                    ? this.displayPasswordSuccessMessege()
                                    : this.displayPasswordErrorMessege()}
                            </View>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    Confirm Password{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    returnKeyType={'done'}
                                    blurOnSubmit={true}
                                    onBlur={() => {
                                        const isValidConfirmPasswword = this.passwordConfirm(
                                            this.state.confirmPassword
                                        );
                                        if (!isValidConfirmPasswword) {
                                            this.setState({
                                                confirmPasswordError:
                                                    "Don't match"
                                            });
                                        } else {
                                            this.setState({
                                                confirmPasswordError: ''
                                            });
                                        }
                                    }}
                                    ref={input => {
                                        this.inputs.confirmPassword = input;
                                    }}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    onChangeText={this.onChangeConfirmPassword.bind(
                                        this
                                    )}
                                    secureTextEntry
                                    clearButtonMode="always"
                                />

                                {this.passwordConfirm()
                                    ? this.displayConfrimSuccessMessege()
                                    : this.displayConfrimErrorMessege()}
                            </View>
                            <View
                                style={{
                                    width: 285,
                                    height: 170,
                                    padding: 5,
                                    marginTop: 30,
                                    marginBottom: 35,
                                    backgroundColor: 'rgba(0,0,0,0.0)'
                                }}
                            >
                                <Text style={styles.passwordText}>
                                    Password must contain:
                                </Text>
                                <FlatList
                                    data={this.state.passwordCriteria}
                                    renderItem={({ item }) => (
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start'
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    width: 15,
                                                    height: 15,
                                                    marginRight: 5
                                                }}
                                                source={
                                                    item.isDone
                                                        ? images.pass_checkbox_checked
                                                        : images.pass_checkbox_empty
                                                }
                                            />
                                            <Text
                                                style={
                                                    styles.passwordCriteriaList
                                                }
                                            >
                                                {item.text}
                                            </Text>
                                        </View>
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
                                onPress={this.onResetPassword}
                            >
                                <Text style={styles.buttonText}>
                                    Reset Password
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
