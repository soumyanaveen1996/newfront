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
import images from '../../images';
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
                            value={this.state.userEmail}
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
