import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
    KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import DeviceInfo from 'react-native-device-info';
import styles from './styles';
import I18n from '../../../config/i18n/i18n';
import { isEmail } from '../../../lib/utils';
import images from '../../../images';
import { Auth, Settings, PollingStrategyTypes } from '../../../lib/capability';
import Loader from '../../../widgets/Loader';
import { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import { synchronizeUserData } from '../../../lib/UserData/SyncData';
import AfterLogin from './afterLogin';

import Config from '../../../config/config';
import Store from '../../../redux/store/configureStore';
import { setFirstLogin } from '../../../redux/actions/UserActions';
import swiperStyle from '../Swiper/styles';
import EventEmitter, { AuthEvents } from '../../../lib/events';
import AppleLoginButton from './AppleLoginButton';
import ConfirmOtp from './ConfirmOtp';
import NavigationAction, * as Actions from '../../../navigation/NavigationAction';
import GlobalColors from '../../../config/styles';
import configToUse from '../../../config/config';
import { NetworkHandler } from '../../../lib/network';
import SimpleLoader from '../../../widgets/SimpleLoader';

export default class LoginView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: '',
            formData: [
                {
                    id: 2,
                    title: 'User name or email',
                    type: 'email_field',
                    optional: false
                },
                {
                    id: 3,
                    title: 'Password',
                    type: 'password_field',
                    optional: false
                },
                {
                    id: 4,
                    title: 'Login',
                    type: 'button',
                    action: 'signIn'
                }
            ],
            loading: false,
            pressedFbBtn: false,
            pressedGglBtn: false,
            suspendedRegistration: false,
            textWidth: '99%',
            modalVisible: false,
            deviceMan: '',
            isTwoFactorAuthEnabled: false
        };

        this.formValuesArray = [];
        this.inputs = {};
        this.scrollViewRef = React.createRef(null);
    }

    static onEnter() {
        this.updateStage();
    }

    componentDidMount() {
        AsyncStorage.setItem('newLogin', 'yes');
        DeviceInfo.getManufacturer().then((manufacturer) => {
            this.setState({ deviceMan: manufacturer });
        });
        console.log('[FRONTM]  login componentDidMount 1');
        // Workaround for https://github.com/facebook/react-native/issues/27204
        setTimeout(() => {
            this.setState({ textWidth: '100%' });
        }, 100);

        this.listener = EventEmitter.addListener(
            AuthEvents.loginStageUpdate,
            this.updateStage.bind(this)
        );
        this.updateStage();
    }

    componentWillUnmount() {
        this.listener?.remove();
    }

    updateStage() {
        AsyncStorage.getItem('signupStage').then((stage) => {
            if (stage && stage === 'checkCode') {
                this.setState({ suspendedRegistration: true });
            } else {
                this.setState({ suspendedRegistration: false });
            }
        });
    }

    onFormSubmit = (otp) => {
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
        const { isTwoFactorAuthEnabled } = this.state;
        const userDetails = isTwoFactorAuthEnabled
            ? {
                  email: this.state.email,
                  password: this.state.password,
                  otpToken: otp
              }
            : {
                  email: this.state.email,
                  password: this.state.password
              };

        Auth.loginWithFrontm(
            userDetails,
            '',
            SYSTEM_BOT_MANIFEST['onboarding-bot'].botId
        )
            .then((res) => {
                this.setState({
                    passwordErrorMessage: '',
                    emailErrorMessage: ''
                });

                this.showMainScreen();
            })
            .catch(async (err) => {
                if (err.message === 'User is not confirmed.') {
                    await AsyncStorage.setItem('signupStage', 'checkCode');
                    await AsyncStorage.setItem('userEmail', this.state.email);

                    this.setState(
                        {
                            loading: false,
                            emailErrorMessage:
                                err.message === 'UserNotFoundException'
                                    ? I18n.t('UserNotFoundErrorMessage')
                                    : err.message,
                            passwordErrorMessage: ''
                        },
                        () => {
                            this.updateStage();
                            NavigationAction.replace(
                                NavigationAction.SCREENS.confirmationScreen,
                                {
                                    userEmail: this.state.email,
                                    password: this.state.password
                                }
                            );
                        }
                    );
                }
                if (
                    err.message ===
                    'Missing required parameter SOFTWARE_TOKEN_MFA_CODE'
                ) {
                    this.setState(
                        {
                            isTwoFactorAuthEnabled: true,
                            loading: false,
                            passwordErrorMessage: ''
                        },
                        () => {
                            this.updateStage();
                        }
                    );
                } else {
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
                }
            });
    };

    showMainScreen = async () => {
        await AsyncStorage.setItem('existingUser', 'true');
        await Settings.setPollingStrategy(PollingStrategyTypes.satellite);
        Store.dispatch(setFirstLogin(true));
        synchronizeUserData();
        NetworkHandler.setCheckTime(Date.now());
        await AfterLogin.executeAfterLogin();

        // synchronizePhoneBook();
        this.setState({
            loading: false,
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: '',
            email: '',
            password: ''
        });
        AsyncStorage.setItem('newLogin', 'yes').then(() => {
            NavigationAction.replace(NavigationAction.SCREENS.drawer, {
                newLogin: true
            });
        });
        this.formValuesArray.length = 0;
    };

    isValid() {
        if (_.trim(this.state.email) === '') {
            this.setState({ emailErrorMessage: I18n.t('Field_mandatory') });
            return false;
        }
        if (this.state.email.indexOf('@') > -1)
            if (!isEmail(_.trim(this.state.email))) {
                this.setState({ emailErrorMessage: I18n.t('Not_an_email') });
                return false;
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
        Auth.loginWithGoogle(conversationId, botName)
            .then(() => {
                this.showMainScreen();
            })
            .catch((err) => {
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
            .catch((err) => {
                const errMsg = err.message;
                console.log('fb error login =====', errMsg);
                this.setState({ loading: false });
                this.setState({ errorMessage: errMsg });
            });
    };

    renderGoogleBtn = () => (
        <Image
            style={{
                height: 40,
                width: '100%',
                borderRadius: 20,
                overflow: 'hidden'
            }}
            source={images.btn_google}
            accessibilityLabel="G login"
            testID="G-login"
        />
    );

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

    focusTheField = (id) => {
        this.inputs[id].focus();
    };

    updateErrorMessageState = () => {
        this.setState({
            email: '',
            password: '',
            errorMessage: '',
            emailErrorMessage: '',
            passwordErrorMessage: ''
        });
    };

    goToForgotPassword = () => {
        this.updateErrorMessageState();
        NavigationAction.push(NavigationAction.SCREENS.sendCodePassword);
    };

    goToSignupPage = () => {
        this.updateErrorMessageState();
        NavigationAction.replace(NavigationAction.SCREENS.signupScreen, {
            key: Math.random()
        });
    };

    onSignInComplete = async (appleResponse) => {
        this.setState({ loading: true });
        const conversationId = '';
        const botName = SYSTEM_BOT_MANIFEST['onboarding-bot'].botId;

        await Auth.loginWithApple(
            conversationId,
            botName,
            appleResponse.authorizationCode,
            `${appleResponse.fullName.givenName} ${appleResponse.fullName.familyName}`
        )
            .then(() => {
                this.showMainScreen();
            })
            .catch((err) => {
                const errMsg = err.message;
                console.log('+++++apple error login ', errMsg);
                this.setState({ loading: false });
                this.setState({
                    errorMessage: errMsg
                });
            });
    };

    shouldCaretHidden = () => this.state.deviceMan === I18n.t('DeviceType');

    renderForm = () => {
        const { isTwoFactorAuthEnabled } = this.state;
        return (
            <ScrollView
                style={styles.container}
                keyboardShouldPersistTaps="always"
                ref={this.scrollViewRef}
                contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    scrollEnabled={true}
                >
                    <View style={styles.keyboardConatiner}>
                        <View style={styles.headerContainer}>
                            {images.loginTitleImage && (
                                <Image
                                    style={{ marginBottom: 40 }}
                                    source={images.loginTitleImage}
                                />
                            )}
                            <Text style={styles.loginHeader}>
                                {I18n.t('login_title')}
                            </Text>
                            <Text style={styles.loginSubHeader}>
                                {I18n.t('login_subtitle')}
                            </Text>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {this.state.formData[0].title}
                                </Text>
                                <TextInput
                                    caretHidden={this.shouldCaretHidden()}
                                    contextMenuHidden={false}
                                    style={[
                                        styles.input,
                                        {
                                            width: this.state.textWidth
                                        },
                                        !configToUse.loginImageEnabled && {
                                            borderColor:
                                                GlobalColors.itemDevider,
                                            borderWidth: 1
                                        }
                                    ]}
                                    autoCapitalize="none"
                                    onFocus={() =>
                                        this.scrollViewRef.current.scrollTo(
                                            0,
                                            50,
                                            {
                                                Animation: true
                                            }
                                        )
                                    }
                                    autoCorrect={false}
                                    onChangeText={this.onChangeEmailText.bind(
                                        this,
                                        0
                                    )}
                                    value={this.state.email}
                                    keyboardType="email-address"
                                    blurOnSubmit={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => {
                                        this.focusTheField('password');
                                    }}
                                    // placeholder="email@example.com"
                                    underlineColorAndroid="transparent"
                                    placeholderTextColor={
                                        GlobalColors.descriptionText
                                    }
                                    selectionColor={GlobalColors.cursorColor}
                                    clearButtonMode="always"
                                />
                                {this.displayEmailErrorMessege()}
                            </View>
                            <View style={styles.entryFields}>
                                <Text style={styles.placeholderText}>
                                    {this.state.formData[1].title}
                                </Text>
                                <TextInput
                                    contextMenuHidden={false}
                                    style={[
                                        styles.input,
                                        {
                                            width: this.state.textWidth
                                        },
                                        !configToUse.loginImageEnabled && {
                                            borderColor:
                                                GlobalColors.itemDevider,
                                            borderWidth: 1
                                        }
                                    ]}
                                    blurOnSubmit
                                    returnKeyType="done"
                                    ref={(input) => {
                                        this.inputs.password = input;
                                    }}
                                    onChangeText={this.onChangePasswordText.bind(
                                        this,
                                        1
                                    )}
                                    underlineColorAndroid="transparent"
                                    placeholderTextColor={
                                        GlobalColors.descriptionText
                                    }
                                    selectionColor={GlobalColors.cursorColor}
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
                                onPress={this.onFormSubmit}
                            >
                                <Text style={styles.buttonText}>Log in</Text>
                            </TouchableOpacity>
                        </View>

                        {Config.app.socialLoginEnabled && (
                            <View style={styles.socialMediaButtons}>
                                <Text style={styles.socialMediaText}>
                                    {' '}
                                    Or log in with social media
                                </Text>
                                <AppleLoginButton
                                    onSignInComplete={this.onSignInComplete}
                                />

                                <TouchableOpacity
                                    style={{ width: '100%' }}
                                    accessibilityLabel="G login"
                                    testID="G-login"
                                    onPress={() => this.loginWithGoogle()}
                                >
                                    {this.renderGoogleBtn()}
                                </TouchableOpacity>
                            </View>
                        )}

                        {this.state.suspendedRegistration ? (
                            <TouchableOpacity
                                onPress={() =>
                                    NavigationAction.replace(
                                        NavigationAction.SCREENS
                                            .confirmationScreen
                                    )
                                }
                                style={{
                                    alignItems: 'center',
                                    zIndex: 1
                                }}
                            >
                                <Text style={swiperStyle.goToLine}>
                                    Or complete your registration
                                    <Image
                                        style={swiperStyle.arrow}
                                        source={images.small_arrow}
                                    />
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    };
    renderContent = () => {
        const { isTwoFactorAuthEnabled } = this.state;
        return (
            <View style={{ flex: 1, paddingBottom: 16 }}>
                {!configToUse.simpleLogin && (
                    <View style={styles.logoHeader}>
                        <Image
                            source={images.frontm_Login_header_logo}
                            resizeMode="contain"
                            style={{ tintColor: GlobalColors.frontmLightBlue }}
                        />
                    </View>
                )}

                {isTwoFactorAuthEnabled ? (
                    <ConfirmOtp
                        onDone={(otp) => this.onFormSubmit(otp)}
                        errorMessage={this.state.emailErrorMessage}
                        onSkip={() => {
                            this.updateErrorMessageState();
                            this.setState({
                                isTwoFactorAuthEnabled: false
                            });
                        }}
                    />
                ) : (
                    <>
                        {this.renderForm()}
                        {images.loginFooterImage && (
                            <Image
                                source={images.loginFooterImage}
                                style={{ alignSelf: 'center' }}
                            />
                        )}
                        {configToUse.signUpEnabled && (
                            <View
                                style={swiperStyle.bottomBox}
                                accessibilityLabel="Signup"
                                testID="Signup"
                            >
                                <TouchableOpacity
                                    onPress={this.goToSignupPage}
                                    style={{
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        zIndex: 1
                                    }}
                                    accessibilityLabel="Signup"
                                    testID="Signup"
                                >
                                    <Text style={swiperStyle.goToLine}>
                                        You don’t have an account? Sign up
                                        <Image
                                            style={[
                                                swiperStyle.arrow,
                                                { resizeMode: 'contain' }
                                            ]}
                                            source={images.small_arrow}
                                        />
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
                {Config.name && (
                    <Text
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            height: 16,
                            fontSize: 12,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            width: '100%',
                            textAlign: 'center',
                            color: GlobalColors.formText,
                            backgroundColor: GlobalColors.tableItemBackground
                        }}
                    >
                        {Config.name}
                    </Text>
                )}
                {this.state.loading && (
                    <SimpleLoader
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%'
                        }}
                    />
                )}
            </View>
        );
    };

    render() {
        if (configToUse.loginImageEnabled) {
            return (
                <ImageBackground
                    style={{
                        flex: 1,
                        backgroundColor: GlobalColors.contentBackgroundColor
                    }}
                    source={images.loginBackgroundImage}
                >
                    <SafeAreaView
                        style={{
                            flex: 1,
                            alignItems: 'stretch'
                        }}
                    >
                        {this.renderContent()}
                    </SafeAreaView>
                </ImageBackground>
            );
        }
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    alignItems: 'stretch',
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                {this.renderContent()}
            </SafeAreaView>
        );
    }
}
