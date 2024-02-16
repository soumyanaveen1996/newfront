import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    BackHandler
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import form2Styles from '../Chat/ChatComponents/Form2Message/styles';
import _ from 'lodash';
import styles from '../Contacts/styles';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';
import countries from '../../lib/utils/ListOfCountries';
import GlobalColors from '../../config/styles';
import NavigationAction from '../../navigation/NavigationAction';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import alertForGoingBackDailog from '../../widgets/SaveConfirmationDialog';

class AddressScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state: '',
            addressLine1: '',
            city: '',
            country: '',
            postCode: '',
            iosCountry: 'Select country',
            searchable: true,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false,
            errorMsgCity: false,
            errorMsgCountry: false,
            pickerModal: null,
            trackChange: false
        };
        this.mounted = true;
        this.inputs = {};
        this.topHeaderBack = false;
    }
    handleBackButtonClick = (flag) => {
        if (flag) this.topHeaderBack = true;
        if (this.state.trackChange) {
            return alertForGoingBackDailog(
                this.isCallbackCalled,
                `Your saved changes will be lost. \n Save changes before closing?`
            );
        } else {
            if (flag) {
                NavigationAction.pop();
            } else {
                return true;
            }
        }
    };

    isCallbackCalled = (flag) => {
        if (flag) {
            this.updateAddress();
        } else {
            this.setState({ trackChange: false });
            if (this.topHeaderBack) {
                this.topHeaderBack = false;
                NavigationAction.pop();
            }
            return true;
        }
    };

    componentDidMount() {
        // console.log("the data is params", this.props.route.params);
        this.setData();
        this.props.navigation.setParams({
            onBack: this.handleBackButtonClick
        });
        if (Platform.OS === 'android')
            this.backhandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    this.handleBackButtonClick();
                },
                false
            );
    }
    componentWillUnmount() {
        if (Platform.OS === 'android') this.backhandler?.remove();
    }
    setData = () => {
        if (this.mounted) {
            let iosCountry;
            let info = this.props.route.params.infoData;
            if (Platform.OS === 'ios') {
                if (info.address && info.address.country) {
                    iosCountry = countries.find(
                        (country) => country.code === info.address?.country
                    )?.name;
                }
            }
            this.setState({
                addressLine1: (info.address && info.address.addressLine1) || '',
                city: (info.address && info.address.city) || '',
                state: (info.address && info.address.state) || '',
                postCode: (info.address && info.address.postCode) || '',
                country: (info.address && info.address.country) || '',
                iosCountry,
                trackChange: false
            });
        }
    };

    focusNextField = (id) => {
        this.inputs[id].focus();
    };

    onChangeAddressLine1 = (text) => {
        this.setState({ addressLine1: text, trackChange: true });
    };

    onChangeCity = (text) => {
        if (text && text.length > 0) {
            this.setState({ errorMsgCity: false });
        }
        this.setState({ city: text, trackChange: true });
    };

    onChangeState = (text) => {
        this.setState({ state: text, trackChange: true });
    };

    onChangePostCode = (text) => {
        this.setState({ postCode: text, trackChange: true });
    };

    displayCityErrorMessege = () => {
        if (
            !this.state.city &&
            this.state.city.length === 0 &&
            this.state.errorMsgCity
        ) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            City field is required
                        </Text>
                    </View>
                </View>
            );
        }
    };
    displayCountryErrorMessege = () => {
        if (
            !this.state.country &&
            this.state.country.length === 0 &&
            this.state.errorMsgCountry
        ) {
            return (
                <View
                    style={[
                        styles.errorContainer,
                        Platform.OS == 'android'
                            ? {
                                  bottom: -40
                              }
                            : { bottom: -30 }
                    ]}
                >
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            Country field is required
                        </Text>
                    </View>
                </View>
            );
        }
    };
    updateAddress = () => {
        if (!this.state.city || this.state.city.trim() === '') {
            this.setState({ errorMsgCity: true });
            return;
        }
        if (!this.state.country || this.state.country.trim() === '') {
            this.setState({ errorMsgCountry: true });
            return;
        }
        let infoData = {
            addressLine1: this.state.addressLine1,
            state: this.state.state,
            postCode: this.state.postCode,
            city: this.state.city,
            country: this.state.country,
            postCode: this.state.postCode,
            iosCountry: this.state.iosCountry
                ? this.state.iosCountry
                : 'Select country'
        };
        this.props.route.params.updateAddress(infoData);

        NavigationAction.pop();
    };
    renderAddress() {
        return (
            <View style={styles.formContainer}>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Address </Text>
                    <TextInput
                        style={styles.addressInputNewUI}
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        value={this.state.addressLine1}
                        placeholder="enter address"
                        ref={(input) => {
                            this.inputs.address = input;
                        }}
                        onSubmitEditing={() => {
                            this.focusNextField('city');
                        }}
                        onChangeText={this.onChangeAddressLine1}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> City* </Text>
                    <TextInput
                        style={styles.addressInputNewUI}
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        value={this.state.city}
                        placeholder="enter city"
                        ref={(input) => {
                            this.inputs.city = input;
                        }}
                        onEndEditing={(e) => {
                            // console.log('data====== ', e.nativeEvent.text);
                            if (
                                e.nativeEvent.text.trim() === '' ||
                                e.nativeEvent.text.length === 0
                            ) {
                                this.setState({ errorMsgCity: true });
                            }
                        }}
                        onSubmitEditing={(data) => {
                            this.focusNextField('state');
                        }}
                        onChangeText={this.onChangeCity}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                    />
                    {this.displayCityErrorMessege()}
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> State </Text>
                    <TextInput
                        style={styles.addressInputNewUI}
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        value={this.state.state}
                        placeholder="enter state"
                        ref={(input) => {
                            this.inputs.state = input;
                        }}
                        onSubmitEditing={() => {
                            this.focusNextField('postCode');
                        }}
                        onChangeText={this.onChangeState}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Post Code </Text>
                    <TextInput
                        style={styles.addressInputNewUI}
                        autoCorrect={false}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        value={this.state.postCode}
                        placeholder="enter post code"
                        ref={(input) => {
                            this.inputs.postCode = input;
                        }}
                        onChangeText={this.onChangePostCode}
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                    />
                </View>
                <View style={[styles.entryFields, { alignItems: 'center' }]}>
                    <Text style={styles.entryFieldLabel}> Country* </Text>
                    {Platform.OS === 'ios' ? (
                        <Pressable
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => {
                                this.setState({
                                    pickerModal: {
                                        list: countries,
                                        isCountry: true,
                                        onSelectedValue: (value, index) => {
                                            this.setState({
                                                country: value,
                                                iosCountry:
                                                    countries[index].name,
                                                trackChange: true
                                            });
                                        }
                                    }
                                });
                            }}
                        >
                            {this.state.iosCountry ? (
                                <Text style={{ color: GlobalColors.formText }}>
                                    {this.state.iosCountry}
                                </Text>
                            ) : (
                                <Text
                                    style={{
                                        color: GlobalColors.formPlaceholderText
                                    }}
                                >
                                    {' '}
                                    {'your country'}
                                </Text>
                            )}
                        </Pressable>
                    ) : (
                        <Picker
                            selectedValue={this.state.country}
                            mode="dialog"
                            placeholder="Select Country"
                            dropdownIconColor={GlobalColors.primaryColor}
                            style={[
                                styles.addressInput,
                                { backgroundColor: GlobalColors.appBackground }
                            ]}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({
                                    country: itemValue ? itemValue : '',
                                    trackChange: true
                                })
                            }
                        >
                            {countries.map((country) => (
                                <Picker.Item
                                    label={country.name}
                                    value={country.code}
                                />
                            ))}
                        </Picker>
                    )}
                    {this.displayCountryErrorMessege()}
                </View>
            </View>
        );
    }

    renderIOSPickerModal() {
        const pickerModal = this.state.pickerModal || { list: [] };
        return (
            <Modal
                isVisible={this.state.pickerModal}
                onBackdropPress={() => {
                    this.setState({
                        pickerModal: null
                    });
                }}
                style={form2Styles.dateModalIOS}
                backdropOpacity={0.1}
            >
                <Picker
                    selectedValue={this.state.country}
                    style={{ backgroundColor: GlobalColors.white }}
                    onValueChange={(itemValue, itemIndex) => {
                        pickerModal.onSelectedValue(itemValue, itemIndex);
                    }}
                >
                    {pickerModal.list.map((value) => (
                        <Picker.Item label={value.name} value={value.code} />
                    ))}
                </Picker>
            </Modal>
        );
    }

    renderBottomButtons() {
        return (
            <View style={[styles.btn_container]}>
                <TouchableOpacity
                    onPress={() => {
                        NavigationAction.pop();
                    }}
                    style={styles.cancel_btn}
                >
                    <Text style={styles.cancel_text}>{I18n.t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={this.props.appState.network !== 'full'}
                    onPress={() => {
                        this.updateAddress();
                    }}
                    style={[
                        styles.save_btn,
                        {
                            opacity:
                                this.props.appState.network === 'full' ? 1 : 0.2
                        }
                    ]}
                >
                    <Text style={styles.save_btn_text}>{I18n.t('SAVE')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <SafeAreaView style={styles.safeAreaStyle}>
                    <ScrollView style={{ flex: 1 }}>
                        <View
                            style={[
                                styles.mainViewContainer,
                                { alignContent: 'space-between' }
                            ]}
                        >
                            {this.renderAddress()}

                            {Platform.OS === 'ios'
                                ? this.renderIOSPickerModal()
                                : null}
                        </View>
                    </ScrollView>
                    {this.renderBottomButtons()}
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({
    uploadImage: () => dispatch(uploadImage())
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressScreen);
