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
    TouchableOpacity
} from 'react-native';
import styles from './styles';
import { SafeAreaView } from 'react-navigation';
import images from '../../images';
import { isEmail } from '../../lib/utils';
import _ from 'lodash';
import I18n from '../../config/i18n/i18n';
import Loader from '../Loader/Loader';
import { Auth } from '../../lib/capability';
import { Actions } from 'react-native-router-flux';

export default class SendCodePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            emailErrorMessage: '',
            loading: false
        };
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
            .then(data => {
                if (data.success) {
                    this.setState({
                        emailErrorMessage: '',
                        loading: false
                    });
                    Actions.resetPassword({
                        email: this.state.email
                    });
                }
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    emailErrorMessage: err.message
                });
            });
    }

    goBackToLogin = () => {
        Actions.pop();
    };

    render() {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                <Loader loading={this.state.loading} />
                <ScrollView style={{ flex: 1 }}>
                    <KeyboardAvoidingView style={styles.container}>
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
                            <Text style={{ marginBottom: 10 }}>Email</Text>
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

                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.onFormSubmit.bind(this)}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
                <View
                    style={{
                        height: 60,
                        backgroundColor: '#fff',
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
                        <Image
                            style={styles.arrow}
                            source={images.blue_arrow}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
