import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    AsyncStorage
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import styles from './styles';
import { Auth } from '../../lib/capability';

export default class ConfirmationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: 'test@test.com',
            code: 0
        };
    }

    componentWillMount() {
        AsyncStorage.getItem('userEmail').then(token => {
            this.setState(() => {
                return { userEmail: token };
            });
        });
    }

    async onFormSubmit() {
        const userDetails = {
            email: this.state.userEmail,
            confirmCode: this.state.code
        };
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
            });
    }

    showMainScreen = () => {
        Actions.swiperScreen({
            type: ActionConst.REPLACE,
            email: this.state.userEmail,
            swiperIndex: 4
        });
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

    render() {
        return (
            <View style={styles.container}>
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <View>
                        <Text style={styles.header}>Confirmation code</Text>
                        <Text style={styles.firstTitle}>
                            A confirmation code, with a 24 hour validity, has
                            been sent to{' '}
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
                            returnKeyType="go"
                            onChangeText={this.onChangeCode.bind(this)}
                            maxLength={6} //setting limit of input
                        />
                    </View>
                    <View>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.onFormSubmit.bind(this)}
                        >
                            <Text style={styles.buttonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={this.onResendButton.bind(this)}
                    >
                        <Text>
                            Review email address and send the code again
                        </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
