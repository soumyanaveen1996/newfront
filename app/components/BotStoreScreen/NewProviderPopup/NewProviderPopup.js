import React, { Component } from 'react';
import { View, Modal, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';
import Bot from '../../../lib/bot/index';

import { SafeAreaView } from 'react-navigation';

export default class NewProviderPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            wrongCode: false,
            code: ''
        };
    }

    onChangeName(e) {
        this.setState({ code: e });
    }

    cancelNewProvider = () => {
        this.props.canelNewProvider(false);
    };

    async newProvider() {
        const addProvider = await Bot.addNewProvider(this.state.code);
        if (!addProvider) {
            this.setState({ wrongCode: true });
        }
        if (addProvider && !addProvider[0]) {
            this.setState({ wrongCode: true });
        } else {
            this.cancelNewProvider();
        }
    }

    displayErrorMessege = () => {
        if (this.state.wrongCode) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            Incorrect code. Try again
                        </Text>
                    </View>
                </View>
            );
        }
    };

    render() {
        return (
            <Modal
                transparent={true}
                animationType={'none'}
                visible={this.state.show}
                onRequestClose={() => {
                    console.log('close modal');
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.container}>
                        <Text style={styles.headerText}>
                            {' '}
                            Sign in to a new provider
                        </Text>
                        <Text style={styles.descriptionText}>
                            Please write an alphanumeric code.
                        </Text>
                        <TextInput
                            style={styles.input}
                            autoCorrect={false}
                            onChangeText={this.onChangeName.bind(this)}
                            placeholderTextColor="rgba(155,155,155,1)"
                            clearButtonMode="always"
                        />
                        {this.displayErrorMessege()}
                        <View
                            style={{
                                flexDirection: 'row',
                                height: 40,
                                justifyContent: 'center',
                                marginTop: 35
                            }}
                        >
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={this.cancelNewProvider}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={this.newProvider.bind(this)}
                            >
                                <Text style={styles.submitText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}