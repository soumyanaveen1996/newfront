import React, { Component } from 'react';
import {
    View,
    Modal,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    Image
} from 'react-native';
import styles from './styles';
import Bot from '../../../../lib/bot/index';
import Loader from '../../../../widgets/Loader';
import images from '../../../../images';
import { Media, RemoteBotInstall } from '../../../../lib/capability';
import GlobalColors from '../../../../config/styles';
import { Icon } from '@rneui/themed';

export default class NewProviderPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            code: '',
            apiError: false,
            loading: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.qrCode !== this.props.qrCode) {
            this.setState({ code: nextProps.qrCode });
        }
    }

    onChangeName(e) {
        this.setState({ code: e });
    }

    cancelNewProvider = () => {
        this.props.cancelNewProvider(false);
    };

    async newProvider() {
        this.setState({ loading: true, apiError: '' });
        try {
            const addProvider = await Bot.addNewProvider(this.state.code);
            console.log('Add provider : ', addProvider);
            if (!addProvider || addProvider.length <= 0) {
                this.setState({
                    loading: false,
                    apiError: 'Cannot Add Provider. An error occured.'
                });
            } else {
                await RemoteBotInstall.syncronizeBots();
                this.setState({ loading: false, apiError: null });
                // console.log('lets see the data ', data);
                this.cancelNewProvider();
                this.props.onSubmit(addProvider);
            }
        } catch (errorMessage) {
            this.setState({ loading: false, apiError: errorMessage });
        }
    }

    readBarCode = async () => {
        Keyboard.dismiss();
        this.props.cancelNewProvider(false);
        let result = await Media.readBarcode();
        if (!result.cancelled) {
            this.props.onSubmittingCode(result.data);
        } else {
            this.props.cancelNewProvider(true);
        }
    };

    displayErrorMessege = () => {
        if (this.state.apiError) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.apiError}
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
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0
                            }}
                        >
                            <Icon
                                name="close"
                                color={GlobalColors.secondaryButtonColor}
                                style={{
                                    height: 40,
                                    width: 40,
                                    justifyContent: 'center'
                                }}
                                onPress={this.cancelNewProvider}
                            />
                        </View>
                        <Text style={styles.headerText}>
                            Activate Premium Apps
                        </Text>
                        <Text style={styles.descriptionText}>
                            Please write an alphanumeric code or scan if it is a
                            QR code.
                        </Text>
                        <View style={styles.inputBoxContainer}>
                            <TextInput
                                style={styles.input}
                                autoCorrect={false}
                                value={this.state.code}
                                onChangeText={this.onChangeName.bind(this)}
                                placeholderTextColor={
                                    GlobalColors.formPlaceholderText
                                }
                                autoCapitalize="none"
                                clearButtonMode="always"
                            />
                            <TouchableOpacity
                                style={styles.barCodeIcon}
                                onPress={this.readBarCode}
                            >
                                <Image
                                    style={{
                                        height: 16,
                                        width: 16,
                                        tintColor:
                                            GlobalColors.secondaryButtonColor
                                    }}
                                    source={images.qr_code_icon}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.containerError}>
                            {this.displayErrorMessege()}
                        </View>
                        <View style={styles.buttonContainer}>
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
