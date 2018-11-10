import React from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TextInput,
    SafeAreaView,
    Platform,
    TouchableOpacity,
    ScrollView,
    AsyncStorage
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import images from '../../images';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';

export default class SignupScreen extends React.Component {
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
            name: this.props.userName || '',
            email: this.props.userEmail || '',
            password: '',
            confirmPassword: '',
            nameError: '',
            emailError: '',
            passwordError: '',
            confirmPasswordError: '',
            errorMessage: ''
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

    goBackToLogin = () => {
        Actions.swiperScreen({ type: ActionConst.REPLACE });
    };

    checkFieldEmpty = () => {
        let emailResult = this.validateEmail(this.state.email);
        let passworResult = this.passwordValidation(this.state.password);
        let passwordConfirmResult = this.passwordConfirm();

        if (
            this.state.name.length >= 3 &&
            emailResult &&
            passworResult &&
            passwordConfirmResult
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
                    if (data.success) {
                        await AsyncStorage.setItem('userEmail', data.data);
                        await AsyncStorage.setItem(
                            'userDisplayName',
                            this.state.name
                        );
                        await AsyncStorage.setItem(
                            'signupStage',
                            'confirmCode'
                        );

                        this.setState({ loading: false, name: '', email: '' });
                        Actions.confirmationScreen({
                            type: ActionConst.REPLACE,
                            userEmail: this.state.email,
                            password: this.state.password
                        });
                    } else {
                        this.setState({ emailError: err.message });
                        this.setState(() => {
                            return { loading: false };
                        });
                    }
                })
                .catch(err => {
                    this.setState({ emailError: 'Email already in use', err });
                    this.setState(() => {
                        return { loading: false };
                    });
                });
        } else {
            if (!emailResult) {
                this.setState({ emailError: 'Invalid Email' });
            }
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

    onChangeName(text) {
        this.setState({ name: text });
    }

    onChangeEmail(text) {
        this.setState({ email: text });
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

    getCorrectPassword = () => {
        return (
            <Image
                style={{
                    width: 15,
                    height: 15,
                    marginRight: 5
                }}
                source={images.pass_checkbox_empty}
            />
        );
    };

    displayNameErrorMessege = () => {
        if (this.state.nameError && this.state.nameError.length > 0) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.nameError}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    displayEmailErrorMessege = () => {
        if (this.state.emailError && this.state.emailError.length > 0) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.emailError}
                        </Text>
                    </View>
                </View>
            );
        }
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

    goToLoginPage = () => {
        Actions.swiperScreen({
            type: ActionConst.REPLACE,
            swiperIndex: 4
        });
    };

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={styles.logoHeader}>
                    <Image source={images.frontm_header_logo} />
                </View>
                <ScrollView
                    style={styles.container}
                    keyboardShouldPersistTaps="always"
                >
                    <Loader loading={this.state.loading} />
                    <KeyboardAwareScrollView
                        style={styles.keyboardConatiner}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        scrollEnabled={false}
                    >
                        <View style={styles.headerContainer}>
                            <Text style={styles.signupHeader}> Welcome! </Text>
                            <Text style={styles.signupSubHeader}>
                                {' '}
                                Sign up to FrontM{' '}
                            </Text>
                        </View>
                        <View
                            style={styles.formContainer}
                            behavior={Platform.OS === 'ios' ? 'position' : null}
                        >
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    Name{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    autoCorrect={false}
                                    returnKeyType={'next'}
                                    blurOnSubmit={false}
                                    value={this.state.name}
                                    onBlur={() => {
                                        if (this.state.name.length < 3) {
                                            this.setState({
                                                nameError: 'Atleast 3 letters'
                                            });
                                        } else {
                                            this.setState({
                                                nameError: ''
                                            });
                                        }
                                    }}
                                    onSubmitEditing={() => {
                                        this.focusNextField('email');
                                    }}
                                    placeholder="Name"
                                    onChangeText={this.onChangeName.bind(this)}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                                {this.displayNameErrorMessege()}
                            </View>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    Email{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={this.state.email}
                                    keyboardType="email-address"
                                    returnKeyType={'next'}
                                    blurOnSubmit={false}
                                    onBlur={() => {
                                        const isValidEmail = this.validateEmail(
                                            this.state.email
                                        );
                                        if (!isValidEmail) {
                                            this.setState({
                                                emailError: 'Invalid Email'
                                            });
                                        } else {
                                            this.setState({
                                                emailError: ''
                                            });
                                        }
                                    }}
                                    onSubmitEditing={() => {
                                        this.focusNextField('password');
                                    }}
                                    ref={input => {
                                        this.inputs.email = input;
                                    }}
                                    placeholder="Email"
                                    onChangeText={this.onChangeEmail.bind(this)}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                                {this.displayEmailErrorMessege()}
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
                                onPress={this.onSignup}
                            >
                                <Text style={styles.buttonText}>SIGNUP</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.bottomMargin}>
                            <TouchableOpacity
                                onPress={this.goToLoginPage}
                                style={{
                                    alignItems: 'center',
                                    marginBottom: 10
                                }}
                            >
                                <Text style={styles.goToLine}>
                                    Already have an account?{' '}
                                    <Text style={styles.bolder}> Log in </Text>
                                    <Image
                                        style={styles.arrow}
                                        source={images.blue_arrow}
                                    />
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.dotSider}>
                                <View style={styles.innerWidth}>
                                    <Image
                                        style={styles.dotSize}
                                        source={images.dot_gray}
                                    />
                                    <Image
                                        style={styles.dotSize}
                                        source={images.dot_gray}
                                    />
                                    <Image
                                        style={styles.dotSize}
                                        source={images.dot_gray}
                                    />
                                    <Image
                                        style={styles.dotSize}
                                        source={images.dot_gray}
                                    />
                                    <Image
                                        style={styles.lastDotSize}
                                        source={images.dot_gray}
                                    />
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
