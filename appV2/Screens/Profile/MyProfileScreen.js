import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    Keyboard,
    ScrollView,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ImageResizer from 'react-native-image-resizer';
import ActionSheet from 'react-native-action-sheet';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import _ from 'lodash';
import styles from '../Contacts/styles';
import images from '../../config/images';
import Config from '../Contacts/config';
import config from '../../config/config';
import { Auth, Media, ResourceTypes, Resource } from '../../lib/capability';
import PhoneTypeModal from '../Contacts/ContactComponents/PhoneTypeModal';
import Loader from '../../widgets/Loader';
import { BotInputBarCapabilities } from '../Chat/config/BotConstants';
import I18n from '../../config/i18n/i18n';
import Constants from '../../config/constants';
import { MyProfileImage } from '../../widgets/ProfileImage';
import { uploadImage } from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../../widgets';
import utils, { getTimeZones } from '../../lib/utils';
import countries from '../../lib/utils/ListOfCountries';
import GlobalColors from '../../config/styles';
import form2Styles from '../Chat/ChatComponents/Form2Message/styles';
import image_cache from '../../lib/image_cache';
import NavigationAction from '../../navigation/NavigationAction';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwitchControll } from '../../widgets/Switch';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const R = require('ramda');

class MyProfileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profileImage: '',
            reloadProfileImage: '',
            userId: this.props.route.params.userId,
            myName: '',
            phoneNumbers: {
                mobile: '',
                land: '',
                satellite: ''
            },
            emailAddress: '',
            userCompanyName: '',
            state: '',
            addressLine1: '',
            city: '',
            country: '',
            userTimezone: 'Etc/UTC',
            iosCountry: 'Select country',
            iosUserTimezone: ' (GMT+00:00)Etc/UTC',
            searchable: true,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false,
            errorMsgCity: false,
            pickerModal: null
        };
        this.mounted = true;
        this.inputs = {};
        this.timeZones = getTimeZones();
        this.env = config.name ? '- Dev' : '';
        this.appVersion = config.appVersion;
    }

    componentDidMount() {
        this.gettingUserProfile();
    }

    gettingUserProfile = () => {
        const userDetails = Auth.getUserData();
        console.log('the data is ', userDetails);
        if (userDetails) {
            const imageUrl = `${
                config.proxy.protocol +
                config.proxy.host +
                config.proxy.profileImage +
                userDetails.userId
            }.png`;

            const info = { ...userDetails.info };
            if (userDetails.info && userDetails.info.phoneNumbers) {
                this.setState({
                    phoneNumbers: userDetails.info.phoneNumbers
                });
            }
            if (this.mounted) {
                let iosCountry;
                let iosUserTimezone;
                if (Platform.OS === 'ios') {
                    if (info.address && info.address.country) {
                        iosCountry = countries.find(
                            (country) => country.code === info.address?.country
                        )?.name;
                    }
                    if (info.userTimezone) {
                        iosUserTimezone = this.timeZones.find(
                            (zone) => zone.code === info.userTimezone
                        )?.name;
                    }
                }
                this.setState({
                    myName: info.userName,
                    emailAddress: info.emailAddress,
                    searchable: info.searchable || false,
                    visible: info.visible || false,
                    profileImage: imageUrl,
                    userCompanyName: info.userCompanyName || '',
                    addressLine1:
                        (info.address && info.address.addressLine1) || '',
                    city: (info.address && info.address.city) || '',
                    state: (info.address && info.address.state) || '',
                    postCode: (info.address && info.address.postCode) || '',
                    country: (info.address && info.address.country) || '',
                    userTimezone: info.userTimezone || 'Etc/UTC',
                    iosCountry,
                    iosUserTimezone
                });
            }
        }
    };

    setPhoneNumber = (number, index, key) => {
        const getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index][key] = number;
        this.setState({ phoneNumbers: [...getPhoneNumbers] });
    };

    isEmpty = (str) => !str || str.length === 0;

    saveProfile = async () => {
        try {
            this.setState({ loading: true });
            const { phoneNumbers } = this.state;
            const detailObj = {
                emailAddress: this.state.emailAddress,
                searchable: this.state.searchable,
                visible: this.state.visible,
                userName: this.state.myName,
                phoneNumbers,
                userCompanyName: this.state.userCompanyName,
                address: {
                    addressLine1: this.state.addressLine1,
                    state: this.state.state,
                    postCode: this.state.postCode,
                    city: this.state.city,
                    country: this.state.country
                },
                userTimezone: this.state.userTimezone
            };

            const userDetails = {
                userName: this.state.myName,
                searchable: this.state.searchable,
                visible: this.state.visible,
                phoneNumbers,
                userCompanyName: this.state.userCompanyName,
                address: {
                    addressLine1: this.state.addressLine1,
                    state: this.state.state,
                    postCode: this.state.postCode,
                    city: this.state.city,
                    country: this.state.country
                },
                userTimezone: this.state.userTimezone
            };
            console.log('beforeing saving profile ', detailObj, userDetails);

            const updatedUserInfo = await Auth.updatingUserProfile(detailObj);

            if (!updatedUserInfo) {
                this.setState({ loading: false });
                console.log('error');
            }
            if (updatedUserInfo && !updatedUserInfo[0]) {
                this.setState({ loading: false });
                console.log('error');
            } else {
                Auth.updateUserDetails(userDetails)
                    .then((data) => {
                        // console.log('saved data ', data);
                        this.setState({ loading: false });
                        this.props.route.params.updateMyProfile?.();
                        setTimeout(() => {
                            this.showAlert('Profile updated');
                        }, 200);
                    })
                    .catch((err) => {
                        this.setState({ loading: false });
                        Toast.show({ text1: 'Something went wrong' });
                        console.log('error ', err);
                    });
            }
            NavigationAction.pop();
        } catch (e) {
            this.setState({ loading: false });
            Toast.show({ text1: 'Could not update profile' });
        }
    };

    selectNumberType = (index) => {
        this.setState({ currentIndex: index });
        this.setState({
            inviteModalVisible: !this.state.inviteModalVisible
        });
    };

    addNewNumber = () => {
        const number = [...this.state.phoneNumbers];
        number.push({ mobile: '' });
        this.setState(() => ({ phoneNumbers: [...number] }));
    };

    removephone = (index) => {
        const number = [...this.state.phoneNumbers];
        number.splice(index, 1);
        this.setState({ phoneNumbers: [...number] });
    };

    getTheIcon = (phoneLabel) => {
        if (phoneLabel === 'Mobile' || phoneLabel === 'mobile') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }

        if (phoneLabel === 'Land' || phoneLabel === 'land') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }
    };

    setInviteVisible(value) {
        this.setState({
            inviteModalVisible: value
        });
    }

    fix_key(key) {
        return key.replace(/^element_/, '');
    }

    setupType(val) {
        const numbers = [...this.state.phoneNumbers];
        this.setState({ inviteModalVisible: false });

        const currentJson = numbers[this.state.currentIndex];
        let newObj = {};
        let key;
        let phValue;

        key = Object.keys(currentJson)[0];
        phValue = currentJson[key];

        newObj = {
            [val]: phValue
        };
        numbers.splice(this.state.currentIndex, 1);

        numbers[this.state.currentIndex] = newObj;

        this.setState({ phoneNumbers: [...numbers] });
    }

    getUri(userId) {
        return utils.userProfileUrl(userId);
    }

    async sendImage(imageUri, base64) {
        // console.log('images ', imageUri);
        // this.props.route.params.uploadImage();
        this.setState({ loading: true });
        const PROFILE_PIC_BUCKET = 'profile-pics';
        let newUri;
        const user = Auth.getUserData();
        ImageResizer.createResizedImage(imageUri, 800, 800, 'PNG', 50, 0)
            .then(async (imageResizeResponse) => {
                console.log('++++ imageResizeResponse ', imageResizeResponse);
                newUri = await utils.copyFileAsync(
                    decodeURI(imageResizeResponse.uri),
                    Constants.IMAGES_DIRECTORY,
                    `${user.userId}.png`
                );
            })
            .then(async () => {
                const fileUrl = await Resource.uploadFile(
                    newUri,
                    PROFILE_PIC_BUCKET,
                    user.userId,
                    ResourceTypes.Image,
                    null
                );
                if (_.isNull(fileUrl)) {
                } else {
                    this.setState(
                        {
                            loading: false,
                            reloadProfileImage: imageUri
                        },
                        async () => {
                            await image_cache.imageCacheManager.removeFromCache(
                                this.getUri(user.userId)
                            );
                            setTimeout(() => {
                                this.showAlert('Profile image updated');
                                this.props.route.params.updateMyProfile?.();
                            }, 200);
                        }
                    );
                }
            });
    }

    showAlert(msg) {
        Toast.show({ text1: msg, type: 'success' });
    }

    async takePicture() {
        Keyboard.dismiss();
        const result = await Media.takePicture(Config.CameraOptions);
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    async pickImage() {
        Keyboard.dismiss();
        const result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    onOptionSelected(key) {
        if (key === BotInputBarCapabilities.camera) {
            this.takePicture();
        } else if (key === BotInputBarCapabilities.photo_library) {
            this.pickImage();
        }
    }

    showOptions() {
        const moreOptions = [
            {
                key: BotInputBarCapabilities.camera,
                label: I18n.t('Chat_Input_Camera')
            },
            {
                key: BotInputBarCapabilities.photo_library,
                label: I18n.t('Chat_Input_Photo_Library')
            }
        ];

        const cancelButtonIndex = moreOptions.length;
        const optionLabels = moreOptions.map((elem) => elem.label);
        if (Platform.OS === 'ios') {
            optionLabels.push('Cancel');
        }

        ActionSheet.showActionSheetWithOptions(
            {
                options: optionLabels,
                cancelButtonIndex
            },
            (buttonIndex) => {
                if (
                    buttonIndex !== undefined &&
                    buttonIndex !== cancelButtonIndex
                ) {
                    this.onOptionSelected(moreOptions[buttonIndex].key);
                }
            }
        );
    }

    renderTopArea() {
        return (
            <View style={styles.profileImageContainer}>
                <View
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60
                    }}
                >
                    {this.state.reloadProfileImage ? (
                        <Image
                            source={{
                                uri: this.state.reloadProfileImage
                            }}
                            style={styles.profileImgStyle}
                        />
                    ) : (
                        <MyProfileImage
                            uuid={this.state.userId}
                            placeholder={images.user_image}
                            style={styles.profileImgStyle}
                            placeholderStyle={styles.profileImgStyle}
                            resizeMode="cover"
                            changeProfileImageBack={() => {
                                this.changeProfileStatuBack.bind(this);
                            }}
                        />
                    )}
                </View>
                <TouchableOpacity
                    disabled={this.props.appState.network !== 'full'}
                    style={{
                        position: 'absolute',
                        right: 20
                    }}
                    accessibilityLabel="More Button"
                    onPress={this.showOptions.bind(this)}
                >
                    <Image
                        style={{
                            width: 45,
                            height: 45
                        }}
                        source={images.edit_btn}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    renderNameArea() {
        return (
            <View style={styles.nameContainerStyle}>
                <View
                    style={{
                        alignItems: 'center'
                    }}
                >
                    <TextInput
                        editable={this.props.appState.network === 'full'}
                        style={[styles.input, { width: '75%' }]}
                        autoCorrect={false}
                        value={this.state.myName}
                        onChangeText={(val) => {
                            this.setState({ myName: val });
                        }}
                        blurOnSubmit={false}
                        placeholder="enter your name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor={GlobalColors.placeholderText}
                    />
                </View>
            </View>
        );
    }

    renderNumbers() {
        return (
            <View style={styles.userInfoNumberContainer}>
                {this.infoRender('mobile')}
                {this.infoRender('land')}
                {this.infoRender('satellite')}
            </View>
        );
    }

    renderEmails() {
        return (
            <View style={styles.userInfoEmailContainer}>
                {this.infoRender('email')}
            </View>
        );
    }

    focusNextField = (id) => {
        this.inputs[id].focus();
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

    renderAddress() {
        return (
            <View style={styles.formContainer}>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Company </Text>
                    <TextInput
                        style={styles.addressInput}
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        value={this.state.userCompanyName}
                        placeholder="enter company name"
                        onSubmitEditing={() => {
                            this.focusNextField('address');
                        }}
                        ref={(input) => {
                            this.inputs.company = input;
                        }}
                        onChangeText={this.onChangeCompany}
                        placeholderTextColor={GlobalColors.placeholderText}
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Address </Text>
                    <TextInput
                        style={styles.addressInput}
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
                        placeholderTextColor={GlobalColors.placeholderText}
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> City* </Text>
                    <TextInput
                        style={styles.addressInput}
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
                        placeholderTextColor={GlobalColors.placeholderText}
                    />
                    {this.displayCityErrorMessege()}
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> State </Text>
                    <TextInput
                        style={styles.addressInput}
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
                        placeholderTextColor={GlobalColors.placeholderText}
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Post Code </Text>
                    <TextInput
                        style={styles.addressInput}
                        autoCorrect={false}
                        returnKeyType="done"
                        blurOnSubmit={false}
                        value={this.state.postCode}
                        placeholder="enter post code"
                        ref={(input) => {
                            this.inputs.postCode = input;
                        }}
                        onChangeText={this.onChangePostCode}
                        placeholderTextColor="rgba(155,155,155,1)"
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Country </Text>
                    {Platform.OS === 'ios' ? (
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => {
                                this.setState({
                                    pickerModal: {
                                        list: countries,
                                        isCountry: true,
                                        onSelectedValue: (value, index) => {
                                            this.setState({
                                                country: value,
                                                iosCountry:
                                                    countries[index].name
                                            });
                                        }
                                    }
                                });
                            }}
                        >
                            <Text>{this.state.iosCountry}</Text>
                        </TouchableOpacity>
                    ) : (
                        <Picker
                            selectedValue={this.state.country}
                            mode="dialog"
                            style={styles.addressInput}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ country: itemValue })
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
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.entryFieldLabel}> Timezone </Text>
                    {Platform.OS === 'ios' ? (
                        <TouchableOpacity
                            style={[
                                styles.input,
                                {
                                    justifyContent: 'center'
                                }
                            ]}
                            onPress={() => {
                                this.setState({
                                    pickerModal: {
                                        list: this.timeZones,
                                        isCountry: false,
                                        onSelectedValue: (value, index) =>
                                            this.setState({
                                                userTimezone: value,
                                                iosUserTimezone: this.timeZones[
                                                    index
                                                ].name
                                            })
                                    }
                                });
                            }}
                        >
                            <Text>{this.state.iosUserTimezone}</Text>
                        </TouchableOpacity>
                    ) : (
                        <Picker
                            selectedValue={this.state.userTimezone}
                            mode="dialog"
                            style={styles.addressInput}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ userTimezone: itemValue })
                            }
                        >
                            {this.timeZones.map((zone) => (
                                <Picker.Item
                                    label={zone.name}
                                    value={zone.code}
                                />
                            ))}
                        </Picker>
                    )}
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
                    selectedValue={
                        pickerModal.isCountry
                            ? this.state.country
                            : this.state.userTimezone
                    }
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

    onChangeCompany = (text) => {
        this.setState({ userCompanyName: text });
    };

    onChangeAddressLine1 = (text) => {
        this.setState({ addressLine1: text });
    };

    onChangeCity = (text) => {
        if (text && text.length > 0) {
            this.setState({ errorMsgCity: false });
        }
        this.setState({ city: text });
    };

    onChangeState = (text) => {
        this.setState({ state: text });
    };

    onChangePostCode = (text) => {
        this.setState({ postCode: text });
    };

    infoRender = (type) => {
        let icon;
        let placeholder;
        if (type === 'land' || type === 'mobile') {
            icon = (
                <Image
                    source={images.phone_icon}
                    style={styles.phoneIcon}
                    resizeMode="contain"
                />
            );
            placeholder = 'enter number';
        } else if (type === 'satellite') {
            icon = (
                <Image
                    source={images.satellite_icon}
                    style={styles.phoneIcon}
                    resizeMode="contain"
                />
            );
            placeholder = 'enter number';
        } else if (type === 'email') {
            icon = (
                <Image
                    source={images.email_icon}
                    style={styles.phoneIcon}
                    resizeMode="contain"
                />
            );
            placeholder = 'enter email address';
        }

        return (
            <View
                style={[
                    styles.mainInfoRenderContainer,
                    { paddingHorizontal: 32 }
                ]}
            >
                <View style={styles.labelContainer}>
                    {icon}
                    <Text style={styles.labelStyle}>{type}</Text>
                </View>
                <View style={styles.infoContainer}>
                    {type === 'land' ||
                    type === 'mobile' ||
                    type === 'satellite' ? (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <TextInput
                                style={styles.inputNumber}
                                value={this.state.phoneNumbers[type]}
                                keyboardType="phone-pad"
                                autoCorrect={false}
                                maxLength={20}
                                blurOnSubmit={false}
                                onChangeText={(text) => {
                                    const numbers = this.state.phoneNumbers;
                                    numbers[type] = text;
                                    this.setState({ phoneNumbers: numbers });
                                }}
                                placeholder={placeholder}
                                underlineColorAndroid="transparent"
                                placeholderTextColor={
                                    GlobalColors.placeholderText
                                }
                            />
                        </View>
                    ) : (
                        // email
                        <Text style={styles.inputNumber}>
                            {this.state.emailAddress}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    renderBottomSettings() {
        return (
            <View style={styles.bottomSettingContainer}>
                <View style={[styles.switchContainer, { paddingVertical: 8 }]}>
                    <Text style={styles.longTextStyle}>
                        {I18n.t('Search_my_info_text')}
                    </Text>
                    <SwitchControll
                        disabled={this.props.appState.network !== 'full'}
                        value={this.state.searchable}
                        onValueChange={(val) => {
                            let stateTint = this.state.searchable;
                            stateTint = !stateTint;
                            this.setState({
                                searchable: stateTint
                            });
                        }}
                    />
                </View>
                <View
                    style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: 'rgba(221,222,227,1)'
                    }}
                />
                <View style={[styles.switchContainer, { paddingVertical: 8 }]}>
                    <Text style={styles.longTextStyle}>
                        {I18n.t('Share_my_info_text')}
                    </Text>
                    <SwitchControll
                        disabled={this.props.appState.network !== 'full'}
                        value={this.state.visible}
                        onValueChange={(val) => {
                            let stateTint = this.state.visible;
                            stateTint = !stateTint;
                            this.setState({
                                visible: stateTint
                            });
                        }}
                    />
                </View>
            </View>
        );
    }

    renderBottomButtons() {
        return (
            <View style={styles.btn_container}>
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
                        this.saveProfile();
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

    renderAbout = () => (
        <View style={{ width: '100%' }}>
            <Text style={styles.profileAboutText}>
                {`${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()} - ${
                    this.appVersion
                } ${this.env} `}
            </Text>
        </View>
    );

    render() {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <SafeAreaView style={styles.safeAreaStyle}>
                    <NetworkStatusNotchBar />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.mainViewContainer}>
                            <Loader loading={this.state.loading} />
                            <PhoneTypeModal
                                currentIndex={this.state.currentIndex}
                                isVisible={this.state.inviteModalVisible}
                                setVisible={this.setInviteVisible.bind(this)}
                                settingType={this.setupType.bind(this)}
                            />
                            {this.renderTopArea()}
                            {this.renderNameArea()}
                            {this.renderNumbers()}
                            {this.renderEmails()}
                            {this.renderAddress()}
                            {this.renderBottomSettings()}
                            {this.renderBottomButtons()}
                            {Platform.OS === 'ios'
                                ? this.renderIOSPickerModal()
                                : null}
                            {this.renderAbout()}
                        </View>
                    </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyProfileScreen);
