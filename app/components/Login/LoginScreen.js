import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { isEmail } from '../../lib/utils';
import images from '../../images';
import { Auth } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import { TwilioVoIP } from '../../lib/twilio';

import { headerConfig } from './config';
import CenterComponent from './header/CenterComponent';

export default class LoginScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let ret = {
            headerTitle: <CenterComponent />
        };

        return ret;
    }

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            formData: [
                { id: 2, title: 'Email', type: 'email_field', optional: false },
                {
                    id: 3,
                    title: 'Password',
                    type: 'password_field',
                    optional: false
                },
                { id: 4, title: 'Login', type: 'button', action: 'signIn' }
            ],
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: '',
            loading: false,
            pressedFbBtn: false,
            pressedGglBtn: false
        };

        this.formValuesArray = [];
        this.errorMessages = [];
        this.inputs = {};
    }

    componentWillMount() {
        //     AsyncStorage.getItem('signupStage').then(token => {
        //         if (token === 'done') {
        //             AsyncStorage.getItem('userEmail').then(tokenEmail => {
        //                 this.setState(() => {
        //                     return { userEmail: tokenEmail };
        //                 });
        //             });
        //         }
        //     });
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    handleBackButtonClick() {
        if (Actions.currentScene === 'swiperScreen') {
            BackHandler.exitApp();
        }
    }

    onFormSubmit() {
        this.setState({ loading: true });
        if (!this.isValid()) {
            if (this.errorMessages && this.errorMessages.length >= 0) {
                this.setState({ emailErrorMessage: this.errorMessages[0] });
            } else {
                this.setState({ emailErrorMessage: '' });
            }

            if (this.errorMessages && this.errorMessages.length > 1) {
                this.setState({ passwordErrorMessage: this.errorMessages[1] });
            } else {
                this.setState({ passwordErrorMessage: '' });
            }
            this.setState({ errorMessage: this.errorMessages });
            this.setState({ loading: false });
            return;
        }

        let formInfo = this.state.formData;
        for (let i = 0; i < formInfo.length; i++) {
            let eachFormData = formInfo[i];
            eachFormData.value = _.trim(this.formValuesArray[i]);
            formInfo[i] = eachFormData;
        }

        const userDetails = {
            email: formInfo[0].value,
            password: formInfo[1].value
        };
        console.log('userDetails ', userDetails);

        Auth.loginWithFrontm(
            userDetails,
            '',
            SYSTEM_BOT_MANIFEST['onboarding-bot'].botId
        )
            .then(() => {
                this.setState({
                    passwordErrorMessage: '',
                    emailErrorMessage: ''
                });
                this.showMainScreen();
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    emailErrorMessage: err.message,
                    passwordErrorMessage: ''
                });
            });
    }

    showMainScreen = async () => {
        TwilioVoIP.init();
        RemoteBotInstall.syncronizeBots();
        this.setState({ loading: false });
        Actions.timeline({ type: ActionConst.REPLACE });
        this.setState({
            email: '',
            password: ''
        });
        return;
    };

    isValid() {
        let formData = this.state.formData;
        for (var i = 0; i < formData.length; i++) {
            this.errorMessages[i] = undefined;
            if (
                formData[i].optional === false &&
                _.trim(this.formValuesArray[i]) === ''
            ) {
                this.errorMessages[i] = I18n.t('Field_mandatory');
                return false;
            }

            if (
                formData[i].type === 'password_field' &&
                _.trim(this.formValuesArray[i]) === ''
            ) {
                this.errorMessages[i] = I18n.t('Password_not_empty');
                return false;
            }

            if (
                formData[i].type === 'email_field' &&
                !isEmail(_.trim(this.formValuesArray[i]))
            ) {
                this.errorMessages[i] = I18n.t('Not_an_email');
                return false;
            }
        }
        return true;
    }
    onChangeEmailText(i, text) {
        this.formValuesArray[i] = text;
        this.setState({ email: text });
    }

    onChangePasswordText(i, text) {
        this.formValuesArray[i] = text;
        this.setState({ password: text });
    }

    loginWithGoogle = async () => {
        this.setState({ loading: true });
        this.setState({ pressedGglBtn: !this.state.pressedGglBtn });
        const conversationId = '';
        const botName = SYSTEM_BOT_MANIFEST['onboarding-bot'].botId;
        await Auth.loginWithGoogle(conversationId, botName)
            .then(() => {
                this.showMainScreen();
            })
            .catch(err => {
                this.setState({ loading: false });
                this.setState({ errorMessage: err.message });
            });
    };
    loginWithFacebook = async () => {
        this.setState({ loading: true });
        this.setState({ pressedFbBtn: !this.state.pressedFbBtn });
        const conversationId = '';
        const botName = SYSTEM_BOT_MANIFEST['onboarding-bot'].botId;
        await Auth.loginWithFacebook(conversationId, botName)
            .then(() => {
                this.showMainScreen();
            })
            .catch(err => {
                this.setState({ loading: false });
                this.setState({ errorMessage: err.message });
            });
    };

    renderFacebookBtn = () => {
        let imgSource = this.state.pressedFbBtn
            ? images.btn_pressed_facebook
            : images.btn_facebook;

        return <Image source={imgSource} />;
    };
    renderGoogleBtn = () => {
        let imgSource = this.state.pressedGglBtn
            ? images.btn_pressed_google
            : images.btn_google;

        return <Image source={imgSource} />;
    };

    displayEmailErrorMessege = () => {
        if (
            this.state.emailErrorMessage &&
            this.state.emailErrorMessage.length > 0
        ) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.emailErrorMessage}
                        </Text>
                    </View>
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

    focusTheField = id => {
        this.inputs[id].focus();
    };

    render() {
        const B = props => (
            <Text style={{ fontWeight: '900' }}>{props.children}</Text>
        );
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={styles.container}
                    keyboardShouldPersistTaps="always"
                >
                    <Loader loading={this.state.loading} />
                    <KeyboardAvoidingView style={styles.keyboardConatiner}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.loginHeader}> Welcome! </Text>
                            <Text style={styles.loginSubHeader}>
                                {' '}
                                Log in to FrontM{' '}
                            </Text>
                        </View>
                        <View
                            style={styles.formContainer}
                            behavior={Platform.OS === 'ios' ? 'position' : null}
                        >
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    {this.state.formData[0].title}{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={this.onChangeEmailText.bind(
                                        this,
                                        0
                                    )}
                                    value={this.state.email}
                                    keyboardType="email-address"
                                    blurOnSubmit={false}
                                    returnKeyType={'next'}
                                    onSubmitEditing={() => {
                                        this.focusTheField('password');
                                    }}
                                    placeholder="email@example.com"
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                                {this.displayEmailErrorMessege()}
                            </View>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {' '}
                                    {this.state.formData[1].title}{' '}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    blurOnSubmit={true}
                                    returnKeyType={'done'}
                                    ref={input => {
                                        this.inputs.password = input;
                                    }}
                                    onChangeText={this.onChangePasswordText.bind(
                                        this,
                                        1
                                    )}
                                    placeholder="password"
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    secureTextEntry
                                    clearButtonMode="always"
                                    value={this.state.password}
                                />
                                {this.displayPasswordErrorMessege()}
                            </View>
                            <Text style={styles.forgotPassowrd}>
                                Forgot Password?
                            </Text>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={this.onFormSubmit.bind(this)}
                            >
                                <Text style={styles.buttonText}>Log in</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.socialMediaText}>
                            {' '}
                            Or log in with social media
                        </Text>
                        <View style={styles.socialMediaButtons}>
                            <TouchableOpacity
                                onPress={() => this.loginWithFacebook()}
                            >
                                {this.renderFacebookBtn()}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => this.loginWithGoogle()}
                            >
                                {this.renderGoogleBtn()}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
