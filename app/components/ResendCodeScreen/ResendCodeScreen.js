import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableOpacity,
    KeyboardAvoidingView
} from 'react-native';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Auth } from '../../lib/capability';

export default class ResendCodeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: 'testy@test.com'
        };
    }

    onChangeEmailText(i, text) {
        console.log('we will see ', i, text);
        this.setState(() => {
            return { userEmail: text };
        });
    }

    async onFormSubmit() {
        console.log('send code again');
        const userDetails = {
            email: this.state.userEmail
        };
        await Auth.resendFrontmSignupCode(userDetails)
            .then(async data => {
                if (data.success) {
                    await AsyncStorage.setItem('userEmail', data.data);
                    await AsyncStorage.setItem('signupStage', 'confirmCode');
                    Actions.confirmationScreen({
                        type: ActionConst.REPLACE
                    });
                }
            })
            .catch(err => {
                console.log('error on resending code again ', err);
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <KeyboardAvoidingView style={styles.keyboardConatiner}>
                    <View>
                        <Text style={styles.header}>Confirmation code</Text>
                        <Text style={styles.firstTitle}>
                            Please confirm the email address
                        </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={this.onChangeEmailText.bind(this, 0)}
                            keyboardType="email-address"
                            returnKeyType="next"
                            placeholder="email@example.com"
                            value={this.props.email}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor="rgba(0,0,0,1)"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={this.onFormSubmit.bind(this)}
                    >
                        <Text style={styles.buttonText}>Send code again</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
