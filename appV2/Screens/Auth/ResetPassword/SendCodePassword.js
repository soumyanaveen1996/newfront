import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isEmail } from '../../../lib/utils';
import _ from 'lodash';
import I18n from '../../../config/i18n/i18n';
import Loader from '../../../widgets/Loader';
import { Auth } from '../../../lib/capability';
import NavigationAction from '../../../navigation/NavigationAction';
import GlobalColors from '../../../config/styles';
import icons from '../../../config/icons';
export default class SendCodePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            emailErrorMessage: '',
            loading: false
        };
        this.scrollViewRef = React.createRef(null);

    }

    onChangeEmailText(text) {
        this.setState({ email: text });
    }

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

        return true;
    }

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

    onFormSubmit() {
        this.setState({
            emailErrorMessage: ''
        });
        this.setState({ loading: true });
        if (!this.isValid()) {
            this.setState({ loading: false });
            return;
        }

        const userDetails = {
            email: this.state.email
        };

        Auth.resetPassword(userDetails)
            .then((data) => {
                if (data.success) {
                    this.setState({
                        emailErrorMessage: '',
                        loading: false
                    });
                    NavigationAction.push(
                        NavigationAction.SCREENS.resetPassword,
                        {
                            email: this.state.email
                        }
                    );
                } else {
                    this.setState({
                        emailErrorMessage: data.message,
                        loading: false
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    loading: false,
                    emailErrorMessage: err.message
                });
            });
    }

    goBackToLogin = () => {
        NavigationAction.pop();
    };

    render() {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                <Loader loading={this.state.loading} />
                <ScrollView  style={{ flex: 1 }}
                      keyboardShouldPersistTaps="always"
                      contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                      ref={this.scrollViewRef}>
                <KeyboardAwareScrollView
                        contentContainerStyle={styles.container}
                        style={styles.keyboardConatiner}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        scrollEnabled={false}
                        extraHeight={140}
                        >
                        <View>
                            <Text style={styles.headerText}>
                                Reset your password
                            </Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>
                                Please enter your email address and we will send
                                you instructions to reset your password.
                            </Text>
                        </View>
                        <View style={{ marginBottom: 60 }}>
                            <Text
                                style={{
                                    marginBottom: 10,
                                    color: GlobalColors.primaryTextColor
                                }}
                            >
                                Email
                            </Text>
                            <TextInput
                                style={styles.input}
                                onFocus={() =>
                                    this.scrollViewRef.current.scrollTo(0, 120, {
                                        Animation: true
                                    })
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                                onChangeText={this.onChangeEmailText.bind(this)}
                                keyboardType="email-address"
                                editable={true}
                                returnKeyType={'done'}
                                placeholder="email@example.com"
                                value={this.state.userEmail}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor={
                                    GlobalColors.descriptionText
                                }
                                selectTextOnFocus={true}
                            />
                            {this.displayEmailErrorMessege()}
                        </View>

                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.onFormSubmit.bind(this)}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </KeyboardAwareScrollView>
                </ScrollView>
                <View
                    style={{
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={styles.loginScreenView}
                        onPress={this.goBackToLogin}
                    >
                        <Text style={styles.loginScreenText}>
                            Go back to the Log in screen
                        </Text>
                        {icons.arrowRight({
                            color: GlobalColors.primaryButtonColor
                        })}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
