import React, { Component } from 'react';
import {
    View,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    Alert
} from 'react-native';
import styles from './styles';
import Bot from '../../../lib/bot/index';

import { SafeAreaView } from 'react-navigation';
import Loader from '../../Loader/Loader';

export default class NewProviderPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            wrongCode: false,
            code: '',
            apiError: false,
            loading: false
        };
    }

    onChangeName(e) {
        this.setState({ code: e });
    }

    cancelNewProvider = () => {
        this.props.canelNewProvider(false);
    };

    async newProvider() {
        this.setState({ loading: true });
        try {
            const addProvider = await Bot.addNewProvider(this.state.code);
            if (!addProvider) {
                this.setState({ loading: false });
                this.setState({ wrongCode: true, apiError: false });
            }
            if (addProvider && !addProvider[0]) {
                this.setState({ loading: false });
                this.setState({ wrongCode: true, apiError: false });
            } else {
                this.setState({ loading: false, apiError: false });
                this.cancelNewProvider();
                this.props.onSubmit();
            }
        } catch (e) {
            this.setState({ loading: false });
            this.setState({ wrongCode: false, apiError: true });
            // this.cancelNewProvider()
            // Alert.alert('Cannot add new provider')
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
        if (this.state.apiError) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            Cannot Add Provider. An error occured.
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
                <Loader loading={this.state.loading} />
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
                            autoCapitalize="none"
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
                                style={
                                    this.state.code.length > 0
                                        ? styles.submitBtn
                                        : styles.emptyBtn
                                }
                                disabled={this.state.code.length === 0}
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
