import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView
} from 'react-native';

import styles from './styles';

export default class ConfirmationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: 'test@test.com'
        };
    }
    async onFormSubmit() {
        console.log('send code done');
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
                </KeyboardAvoidingView>
            </View>
        );
    }
}
