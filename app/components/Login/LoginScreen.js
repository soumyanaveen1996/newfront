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
    SafeAreaView,
    AsyncStorage
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { isEmail } from '../../lib/utils';
import images from '../../images';
import { Auth, Network } from '../../lib/capability';
import Loader from '../Loader/Loader';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';
import RemoteBotInstall from '../../lib/RemoteBotInstall';
import config from '../../config/config';
import Conversation from '../../lib/conversation/Conversation';
import { TwilioVoIP } from '../../lib/twilio';
import {
    synchronizeUserData,
    synchronizePhoneBook
} from '../../lib/UserData/SyncData';
import AfterLogin from '../../services/afterLogin';
import SystemBot from '../../lib/bot/SystemBot';
import Config, { overrideConsole } from '../../config/config';

import { headerConfig } from './config';
import CenterComponent from './header/CenterComponent';
import DefaultPreference from 'react-native-default-preference';
import Store from '../../redux/store/configureStore';
import { setFirstLogin } from '../../redux/actions/UserActions';
import { LoginButton, AccessToken } from 'react-native-fbsdk';
import swiperStyle from '../Swiper/styles';
import EventEmitter, { AuthEvents } from '../../lib/events';

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
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: '',
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
            loading: false,
            pressedFbBtn: false,
            pressedGglBtn: false,
            suspendedRegistration: false
        };

        this.formValuesArray = [];
        this.inputs = {};
    }

    static onEnter() {
        this.updateStage();
    }

    componentDidMount() {
        EventEmitter.addListener(
            AuthEvents.loginStageUpdate,
            this.updateStage.bind(this)
        );
        this.updateStage();
    }

    componentWillUnmount() {
        EventEmitter.removeListener(
            AuthEvents.loginStageUpdate,
            this.updateStage.bind(this)
        );
    }

    updateStage() {
        AsyncStorage.getItem('signupStage').then(stage => {
            if (stage && stage === 'checkCode') {
                this.setState({ suspendedRegistration: true });
            } else {
                this.setState({ suspendedRegistration: false });
            }
        });
    }

    onFormSubmit() {
        this.setState({
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: ''
        });
        this.setState({ loading: true });
        if (!this.isValid()) {
            this.setState({ loading: false });
            return;
        }

        const userDetails = {
            email: this.state.email,
            password: this.state.password
        };
        // console.log('userDetails ', userDetails);

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
            .catch(async err => {
                if (err.message === 'User is not confirmed.') {
                    await AsyncStorage.setItem('signupStage', 'checkCode');
                    await AsyncStorage.setItem('userEmail', this.state.email);
                    this.setState(
                        {
                            loading: false,
                            emailErrorMessage: err.message,
                            passwordErrorMessage: ''
                        },
                        () => {
                            this.updateStage();
                            Actions.confirmationScreen({
                                type: ActionConst.REPLACE,
                                userEmail: this.state.email,
                                password: this.state.password
                            });
                        }
                    );
                }
                this.setState(
                    {
                        loading: false,
                        emailErrorMessage: err.message,
                        passwordErrorMessage: ''
                    },
                    () => {
                        this.updateStage();
                    }
                );
            });
    }

    showMainScreen = async () => {
        // await Conversation.downloadRemoteConversations();
        // await RemoteBotInstall.syncronizeBots();
        // Actions.timeline({ type: ActionConst.REPLACE });
        await TwilioVoIP.init();
        // RemoteBotInstall.syncronizeBots()
        console.log('Sourav Logging:::: 7');
        Auth.getUser().then(user => {
            if (Platform.OS === 'android') {
                DefaultPreference.setName('NativeStorage');
            }
            const ContactsURL = `${Config.network.queueProtocol}${
                Config.proxy.user_details_path
            }`;

            const ContactsBOT = SystemBot.contactsBot.botId;
            DefaultPreference.set('SESSION', user.creds.sessionId);
            DefaultPreference.set('URL', ContactsURL);
            DefaultPreference.set('CONTACTS_BOT', ContactsBOT);
        });
        Store.dispatch(setFirstLogin(true));
        AfterLogin.executeAfterLogin();
        synchronizeUserData();
        synchronizePhoneBook();
        this.setState({
            loading: false,
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: '',
            email: '',
            password: ''
        });
        Actions.replace('tabbar');
        // Actions.tabbar({ type: 'replace' });
        this.formValuesArray.length = 0;

        return;
    };

    isValid() {
        if (_.trim(this.state.email) === '') {
            this.setState({ emailErrorMessage: I18n.t('Field_mandatory') });
            return false;
        } else {
            if (!isEmail(_.trim(this.state.email))) {
                this.setState({ emailErrorMessage: I18n.t('Not_an_email') });
                return false;
            }
        }

        if (_.trim(this.state.password) === '') {
            this.setState({ passwordErrorMessage: I18n.t('Field_mandatory') });
            return false;
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
                const errMsg = err.message;
                console.log('google error login ', errMsg);
                this.setState({ loading: false });
                this.setState({
                    errorMessage: errMsg
                });
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
                const errMsg = err.message;
                console.log('fb error login =====', errMsg);
                this.setState({ loading: false });
                this.setState({ errorMessage: errMsg });
            });
    };

    renderFacebookBtn = () => {
        let imgSource = this.state.pressedFbBtn
            ? images.btn_pressed_facebook
            : images.btn_facebook;

        return (
            <Image
                source={imgSource}
                accessibilityLabel="F login"
                testID="F-login"
            />
        );
    };
    renderGoogleBtn = () => {
        let imgSource = this.state.pressedGglBtn
            ? images.btn_pressed_google
            : images.btn_google;

        return (
            <Image
                source={imgSource}
                accessibilityLabel="G login"
                testID="G-login"
            />
        );
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

        if (this.state.errorMessage && this.state.errorMessage.length > 0) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.errorMessage}
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

    goToForgotPassword = () => {
        Actions.sendCodePassword();
        // Actions.resetPassword({ email: 'sidhemu09@gmail.com' });
    };

    goToSignupPage = () => {
        Actions.signupScreen({
            type: ActionConst.PUSH,
            key: Math.random()
        });
    };

    render() {
        const B = props => (
            <Text style={{ fontWeight: '900' }}>{props.children}</Text>
        );
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'stretch' }}>
                <View style={styles.logoHeader}>
                    <Image source={images.frontm_header_logo} />
                </View>
                <ScrollView
                    style={styles.container}
                    keyboardShouldPersistTaps="always"
                >
                    <Loader loading={this.state.loading} />
                    <View style={styles.keyboardConatiner}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.loginHeader}> Welcome! </Text>
                            <Text style={styles.loginSubHeader}>
                                {' '}
                                Log in to FrontM{' '}
                            </Text>
                        </View>
                        <View style={styles.formContainer}>
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
                            <Text
                                style={styles.forgotPassowrd}
                                onPress={this.goToForgotPassword}
                            >
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
                                accessibilityLabel="F login"
                                testID="F-login"
                                onPress={() => this.loginWithFacebook()}
                            >
                                {this.renderFacebookBtn()}
                            </TouchableOpacity>

                            <TouchableOpacity
                                accessibilityLabel="G login"
                                testID="G-login"
                                onPress={() => this.loginWithGoogle()}
                            >
                                {this.renderGoogleBtn()}
                            </TouchableOpacity>
                        </View>
                        {this.state.suspendedRegistration ? (
                            <TouchableOpacity
                                onPress={() =>
                                    Actions.confirmationScreen({
                                        type: ActionConst.REPLACE
                                    })
                                }
                                style={{ alignItems: 'center', zIndex: 1 }}
                            >
                                <Text style={swiperStyle.goToLine}>
                                    Or complete your registration
                                    <Image
                                        style={swiperStyle.arrow}
                                        source={images.blue_arrow}
                                    />
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </ScrollView>
                <View
                    style={swiperStyle.bottomBox}
                    accessibilityLabel="Signup"
                    testID="Signup"
                >
                    <TouchableOpacity
                        onPress={this.goToSignupPage}
                        style={{ alignItems: 'center', zIndex: 1 }}
                        accessibilityLabel="Signup"
                        testID="Signup"
                    >
                        <Text style={swiperStyle.goToLine}>
                            You don’t have an account?
                            <Text style={swiperStyle.bolder}> Sign up </Text>
                            <Image
                                style={swiperStyle.arrow}
                                source={images.blue_arrow}
                            />
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
