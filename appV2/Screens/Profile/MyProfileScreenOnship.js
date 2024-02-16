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
    SafeAreaView,
    KeyboardAvoidingView,
    BackHandler
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
import { Icon } from '@rneui/themed';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { SwitchControll } from '../../widgets/Switch';
import alertForGoingBackDailog from '../../widgets/SaveConfirmationDialog';

const R = require('ramda');

class MyProfileScreenOnship extends React.Component {
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
            postCode: '',
            userTimezone: 'Etc/UTC',
            iosCountry: 'Select country',
            iosUserTimezone: ' (GMT+00:00)Etc/UTC',
            searchable: true,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false,
            errorMsgCity: false,
            pickerModal: null,
            nationality: '',
            iosNationality: 'Select Nationality',
            role: false,
            info: false,
            trackChange: false
        };
        this.mounted = true;
        this.inputs = {};
        this.timeZones = getTimeZones();
        this.env = config.name ? '- Dev' : '';
        this.appVersion = config.appVersion;
        this.applicationName = `${DeviceInfo.getApplicationName()}`;
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
            this.saveProfile();
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
        this.gettingUserProfile();

        this.props.navigation.setParams({
            onBack: this.handleBackButtonClick
        });
        // console.log(this.props.route.params);
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

    gettingUserProfile = async () => {
        const userDetailsOriginal = await Auth.getUserData();
        const userDetails = JSON.parse(JSON.stringify(userDetailsOriginal));
        if (userDetails) {
            const imageUrl = `${
                config.proxy.protocol +
                config.proxy.host +
                config.proxy.profileImage +
                userDetails.userId
            }.png`;

            const info = { ...userDetails.info };
            // console.log('the data is use profile', info);
            if (userDetails.info && userDetails.info.phoneNumbers) {
                this.setState({
                    phoneNumbers: userDetails.info.phoneNumbers
                });
            }
            if (this.mounted) {
                let iosCountry;
                let iosNationality;
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
                    if (info.nationality) {
                        iosNationality = countries.find(
                            (country) =>
                                country.nationality === info.nationality
                        )?.nationality;
                    }
                }
                this.setState({
                    userId: userDetails.userId,
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
                    nationality: info.nationality || '',
                    iosUserTimezone,
                    isSeafarer: info.rankLevel1 === 'ship' ? true : false,
                    rankLevel2: info.rankLevel2,
                    rankLevel3: info.rankLevel3,
                    info: info,
                    sailingStatus: info.sailingStatus,
                    shipIMO: info.shipIMO,
                    shipName: info.shipName,
                    iosNationality,
                    isAdressAvailable:
                        info.address?.addressLine1 ||
                        info.address?.city ||
                        info.address?.state ||
                        info.address?.country ||
                        info.address?.postCode
                            ? true
                            : false
                });
            }
        }
    };

    setPhoneNumber = (number, index, key) => {
        const getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index][key] = number;
        this.setState({
            phoneNumbers: [...getPhoneNumbers],
            trackChange: true
        });
    };

    isEmpty = (str) => !str || str.length === 0;

    upDateRoleAndPosition = async (data) => {
        this.setState(
            {
                rankLevel2: data.rankLevel2,
                rankLevel3: data.rankLevel3,
                sailingStatus: data.isSailing,
                shipIMO: data.shipIMO,
                shipName: data.shipName,
                isSeafarer: data.isSeafarer
            },
            () => {
                this.saveProfile();
            }
        );
    };

    updateAddressInfo = async (data) => {
        console.log('the address is -----', data);
        this.setState(
            {
                state: data.state,
                addressLine1: data.addressLine1,
                city: data.city,
                country: data.country,
                postCode: data.postCode,
                iosCountry: data.iosCountry
                    ? data.iosCountry
                    : 'Select country',
                isAdressAvailable: true
            },
            () => {
                this.saveProfile();
            }
        );
    };

    showCountry = () => {
        if (this.state.country.length > 0)
            return countries.find(
                (country) => country.code === this.state.country
            )?.name;
        return '';
    };

    saveProfile = async () => {
        console.log('save profile called---');

        try {
            this.setState({ loading: true });
            const { phoneNumbers } = this.state;
            const detailObj = {
                searchable: this.state.searchable,
                visible: this.state.visible,
                userName: this.state.myName,
                phoneNumbers,
                userCompanyName: this.state.userCompanyName,
                address: this.state.isAdressAvailable
                    ? {
                          addressLine1: this.state.addressLine1,
                          state: this.state.state,
                          postCode: this.state.postCode,
                          city: this.state.city,
                          country: this.state.country
                      }
                    : null,
                nationality: this.state.nationality,
                userTimezone: this.state.userTimezone,
                sailingStatus: this.state.sailingStatus,
                shipIMO: this.state.shipIMO,
                shipName: this.state.shipName,
                rankLevel1: this.state.isSeafarer ? 'ship' : 'shore',
                rankLevel2: this.state.rankLevel2,
                rankLevel3: this.state.rankLevel3
            };
            const updatedUserInfo = await Auth.updatingUserProfile(detailObj);

            if (!updatedUserInfo) {
                this.setState({ loading: false, trackChange: false });
                console.log('error');
            }
            if (updatedUserInfo && !updatedUserInfo[0]) {
                this.setState({ loading: false, trackChange: false });

                console.log('error');
            } else {
                await Auth.updateUserDetails(detailObj)
                    .then((data) => {
                        this.setState({
                            loading: false,
                            trackChange: false
                        });
                        this.props.route.params.updateMyProfile?.();
                        setTimeout(() => {
                            this.showAlert('Profile updated');
                        }, 200);
                    })
                    .catch((err) => {
                        this.setState({ loading: false, trackChange: false });
                        console.log('error ', err);
                    });
            }
            NavigationAction.pop();
        } catch (e) {
            console.log('error ', e);
            this.setState({ loading: false, trackChange: false });
            Toast.show({
                text1: 'Could not update profile'
            });
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
        console.log('this.props ', this.props);
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
                const fileUrl = await Resource.uploadFileForhumbnailAlso(
                    newUri,
                    PROFILE_PIC_BUCKET,
                    user.userId,
                    ResourceTypes.Image,
                    null,
                    null,
                    true
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
                        right: 20,
                        padding: 4
                    }}
                    accessibilityLabel="More Button"
                    onPress={this.showOptions.bind(this)}
                >
                    <Image
                        style={{
                            width: 18,
                            height: 18,
                            tintColor: GlobalColors.primaryButtonColor
                        }}
                        resizeMode={'contain'}
                        source={images.editIconNew}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    renderNameArea() {
        return (
            <View style={styles.nameContainerStyleProfile}>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 24
                    }}
                >
                    <TextInput
                        editable={this.props.appState.network === 'full'}
                        style={styles.profileNameContainerInput}
                        autoCorrect={false}
                        value={this.state.myName}
                        onChangeText={(val) => {
                            this.setState({ myName: val, trackChange: true });
                        }}
                        blurOnSubmit={false}
                        placeholder="enter your name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                        selectionColor={GlobalColors.cursorColor}
                    />
                    <View
                        style={{
                            height: 1,
                            width: '60%',
                            backgroundColor: GlobalColors.gunmetal,
                            opacity: 0.1
                        }}
                    />
                </View>
                {this.state.rankLevel3 || this.state.rankLevel2 ? (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 10,
                            flexDirection: 'row'
                        }}
                    >
                        <View style={{ flex: 2 }} />
                        <View style={[styles.roleAndPositionView, { flex: 6 }]}>
                            <View>
                                <Text style={styles.roleAndPositionTextView}>
                                    {this.state.rankLevel3 +
                                        ' | ' +
                                        this.state.rankLevel2}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flex: 2 }} />
                        <TouchableOpacity
                            disabled={this.props.appState.network !== 'full'}
                            style={{
                                position: 'absolute',
                                right: 20,
                                padding: 4
                            }}
                            accessibilityLabel="More Button"
                            onPress={() => {
                                NavigationAction.push(
                                    NavigationAction.SCREENS.addRoleScreen,
                                    {
                                        updateRole: this.upDateRoleAndPosition,
                                        isSeafarer: this.state.isSeafarer,
                                        rankLevel2: this.state.rankLevel2,
                                        rankLevel3: this.state.rankLevel3,
                                        isSailing: this.state.sailingStatus,
                                        shipIMO: this.state.shipIMO,
                                        shipName: this.state.shipName
                                        // onBack: NavigationAction.pop()
                                    }
                                );
                            }}
                        >
                            <Image
                                style={{
                                    width: 18,
                                    height: 18,
                                    tintColor: GlobalColors.primaryButtonColor
                                }}
                                resizeMode={'contain'}
                                source={images.editIconNew}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginVertical: 10
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                if (!this.state.roleAndPosition)
                                    NavigationAction.push(
                                        NavigationAction.SCREENS.addRoleScreen,
                                        {
                                            updateRole:
                                                this.upDateRoleAndPosition,
                                            isSeafarer: this.state.isSeafarer,
                                            rankLevel2: this.state.rankLevel2,
                                            rankLevel3: this.state.rankLevel3,
                                            isSailing: this.state.sailingStatus,
                                            shipIMO: this.state.shipIMO,
                                            shipName: this.state.shipName
                                            // onBack: NavigationAction.pop()
                                        }
                                    );
                            }}
                            style={styles.roleAndPositionBtn}
                        >
                            <View>
                                <Text
                                    style={styles.roleAndPositionTextBtn}
                                >{`Add your position or role`}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    renderNumbers() {
        return (
            <View>
                {this.infoRender('mobile')}
                {this.renderSmallDevider()}
                {this.infoRender('land')}
                {this.renderSmallDevider()}
                {this.infoRender('satellite')}
                {this.renderSmallDevider()}
            </View>
        );
    }

    renderEmails() {
        return <View>{this.infoRender('email')}</View>;
    }

    focusNextField = (id) => {
        this.inputs[id].focus();
    };

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
                    dropdownIconColor={GlobalColors.primaryButtonColor}
                    selectedValue={this.state.nationality}
                    style={{ backgroundColor: GlobalColors.white }}
                    onValueChange={(itemValue, itemIndex) => {
                        pickerModal.onSelectedValue(itemValue, itemIndex);
                        this.setState({ trackChange: true });
                    }}
                >
                    {pickerModal.list.map((value) => (
                        <Picker.Item
                            label={value.nationality}
                            value={value.nationality}
                        />
                    ))}
                </Picker>
            </Modal>
        );
    }
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

    renderCompany() {
        let icon = (
            <Image
                source={images.companyIcon}
                style={styles.phoneIconNewUI}
                resizeMode="contain"
            />
        );
        return (
            <View style={styles.mainInfoRenderContainer}>
                <View style={styles.labelContainerNewUI}>
                    {icon}
                    <Text style={styles.labelStyleNewUI}>{'Company'}</Text>
                </View>
                <View style={styles.infoContainerNewUI}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TextInput
                            style={styles.addressInputNewUI}
                            autoCorrect={false}
                            blurOnSubmit={true}
                            value={this.state.userCompanyName}
                            placeholder="enter company name"
                            ref={(input) => {
                                this.inputs.company = input;
                            }}
                            onChangeText={this.onChangeCompany}
                            placeholderTextColor={
                                GlobalColors.formPlaceholderText
                            }
                            selectionColor={GlobalColors.cursorColor}
                        />
                    </View>
                </View>
            </View>
        );
    }

    renderNationality() {
        let icon = (
            <Image
                source={images.flagIcon}
                style={styles.phoneIconNewUI}
                resizeMode="contain"
            />
        );
        return (
            <View style={styles.mainInfoRenderContainerNewUI}>
                <View style={[styles.labelContainerNewUI]}>
                    {icon}
                    <Text style={styles.labelStyleNewUI}>{'Nationality'}</Text>
                </View>
                <View style={styles.infoContainerNewUITimeZone}>
                    {Platform.OS === 'ios' ? (
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => {
                                this.setState({
                                    pickerModal: {
                                        isNationality: true,
                                        list: countries,
                                        onSelectedValue: (value, index) =>
                                            this.setState({
                                                trackChange: true,
                                                nationality:
                                                    countries[index]
                                                        .nationality,
                                                iosNationality:
                                                    countries[index].nationality
                                            })
                                    }
                                });
                            }}
                        >
                            {this.state.nationality ? (
                                <Text style={styles.inputValueNewUI}>
                                    {this.state.iosNationality}
                                </Text>
                            ) : (
                                <Text style={{ color: 'rgba(155,155,155,1)' }}>
                                    {' '}
                                    {'your nationality'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Picker
                            selectedValue={this.state.nationality}
                            mode="dialog"
                            itemStyle={styles.inputValueNewUI}
                            dropdownIconColor={'rgb(99,141,255)'}
                            style={[
                                styles.inputValueNewUI,
                                {
                                    height: 40,
                                    flex: 1,
                                    width: '100%',
                                    textAlign: 'left'
                                }
                            ]}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({
                                    nationality: itemValue,
                                    trackChange: true
                                })
                            }
                        >
                            {countries.map((country) => (
                                <Picker.Item
                                    label={`${country.nationality}`}
                                    value={country.nationality}
                                />
                            ))}
                        </Picker>
                    )}
                </View>
            </View>
        );
    }
    renderTimeZone() {
        let icon = <Text style={styles.phoneIconNewUI} />;
        return (
            <View style={[styles.mainInfoRenderContainerNewUI]}>
                <View style={[styles.labelContainerNewUI]}>
                    {icon}
                    <Text style={styles.labelStyleNewUI}>
                        {
                            'Timezone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    '
                        }
                    </Text>
                </View>
                <View style={styles.infoContainerNewUITimeZone}>
                    {Platform.OS === 'ios' ? (
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => {
                                this.setState({
                                    pickerModal: {
                                        list: this.timeZones,
                                        isNationality: false,
                                        onSelectedValue: (value, index) =>
                                            this.setState({
                                                trackChange: true,
                                                userTimezone: value,
                                                iosUserTimezone:
                                                    this.timeZones[index].name
                                            })
                                    }
                                });
                            }}
                        >
                            {this.state.iosUserTimezone ? (
                                <View>
                                    <Text
                                        style={{
                                            color: GlobalColors.formText
                                        }}
                                    >
                                        {this.state.iosUserTimezone}
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    <Text
                                        style={{ color: 'rgba(155,155,155,1)' }}
                                    >
                                        {'your timezone'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Picker
                            selectedValue={this.state.userTimezone}
                            mode="dialog"
                            itemStyle={styles.inputValueNewUI}
                            dropdownIconColor={'rgb(99,141,255)'}
                            style={[
                                styles.inputValueNewUI,
                                {
                                    height: 40,
                                    flex: 1,
                                    width: '100%',
                                    textAlign: 'left'
                                }
                            ]}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({
                                    userTimezone: itemValue,
                                    trackChange: true
                                })
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

    renderAddress() {
        let icon = (
            <Image
                source={images.addressIcon}
                style={{
                    width: 18,
                    height: 18,
                    tintColor: GlobalColors.primaryButtonColor
                }}
                resizeMode="contain"
            />
        );
        let checkFlag =
            this.state.addressLine1 ||
            this.state.city ||
            this.state.state ||
            this.state.country ||
            this.state.postCode
                ? true
                : false;
        return (
            <View style={[styles.mainInfoRenderContainerNewUI]}>
                <View
                    style={[
                        styles.labelContainerNewUI,
                        { alignItems: 'flex-start', marginTop: 16 }
                    ]}
                >
                    {icon}
                    <Text style={[styles.labelStyleNewUI]}>Address</Text>
                </View>
                <View style={styles.infoContainerNewUI}>
                    <TextInput
                        style={[
                            styles.infoContainerNewUIAddress,
                            { ...styles.inputValueNewUI }
                        ]}
                        autoCorrect={false}
                        // returnKeyType="next"
                        multiline={true}
                        editable={false}
                        value={
                            checkFlag
                                ? `${this.state.addressLine1} ${
                                      this.state.city
                                  } ${this.state.postCode} ${
                                      this.state.state
                                  } ${
                                      this.state.country &&
                                      this.state.country !== 'Select Country'
                                          ? this.showCountry()
                                          : ''
                                  }`
                                : ''
                        }
                        placeholder="your address"
                        placeholderTextColor={GlobalColors.formPlaceholderText}
                        selectionColor={GlobalColors.cursorColor}
                    />
                </View>
                <TouchableOpacity
                    disabled={this.props.appState.network !== 'full'}
                    style={{
                        position: 'relative',
                        right: 6,
                        top: 16,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        padding: 4
                    }}
                    accessibilityLabel="More Button"
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.addressScreen,
                            {
                                infoData: this.state.info,
                                updateAddress: this.updateAddressInfo
                            }
                        );
                    }}
                >
                    <Image
                        style={{
                            width: 18,
                            height: 18,
                            tintColor: GlobalColors.primaryButtonColor
                        }}
                        resizeMode={'contain'}
                        source={images.editIconNew}
                    />
                </TouchableOpacity>
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
                        pickerModal.isNationality
                            ? this.state.nationality
                            : this.state.userTimezone
                    }
                    style={{ backgroundColor: GlobalColors.white }}
                    onValueChange={(itemValue, itemIndex) => {
                        pickerModal.onSelectedValue(itemValue, itemIndex);
                        this.setState({ trackChange: true });
                    }}
                >
                    {pickerModal.isNationality
                        ? pickerModal.list.map((value) => (
                              <Picker.Item
                                  label={value.nationality}
                                  value={value.nationality}
                              />
                          ))
                        : pickerModal.list.map((value) => (
                              <Picker.Item
                                  label={value.name}
                                  value={value.code}
                              />
                          ))}
                </Picker>
            </Modal>
        );
    }

    onChangeCompany = (text) => {
        this.setState({ userCompanyName: text, trackChange: true });
    };

    renderDevider() {
        return <View style={styles.deviderNewUI} />;
    }
    renderSmallDevider() {
        return <View style={styles.deviderSmallNewUI} />;
    }
    infoRender = (type) => {
        let icon;
        let placeholder;
        if (type === 'mobile') {
            icon = (
                <Icon
                    name="cellphone"
                    size={14}
                    type="material-community"
                    color={GlobalColors.primaryButtonColor}
                />
            );
            placeholder = 'enter number';
        }
        if (type === 'land') {
            icon = (
                <Image
                    source={images.mobile_icon}
                    style={styles.phoneIconNewUI}
                    resizeMode="contain"
                />
            );
            placeholder = 'enter number';
        } else if (type === 'satellite') {
            icon = (
                <Icon
                    size={14}
                    name="satellite-variant"
                    type="material-community"
                    color={GlobalColors.primaryButtonColor}
                />
            );
            placeholder = 'enter number';
        } else if (type === 'email') {
            icon = (
                <Image
                    source={images.mailIcon}
                    style={styles.emailIconNew}
                    resizeMode="contain"
                />
            );
            placeholder = 'enter email address';
        }

        return (
            <View
                style={[
                    styles.mainInfoRenderContainer,
                    {
                        paddingHorizontal: 12
                    }
                ]}
            >
                <View style={styles.labelContainerNewUI}>
                    {icon}
                    <Text style={styles.labelStyleNewUI}>{type}</Text>
                </View>
                <View style={[styles.infoContainerNewUI]}>
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
                                    this.setState({
                                        phoneNumbers: numbers,
                                        trackChange: true
                                    });
                                }}
                                placeholder={placeholder}
                                underlineColorAndroid="transparent"
                                placeholderTextColor={
                                    GlobalColors.formPlaceholderText
                                }
                                selectionColor={GlobalColors.cursorColor}
                            />
                        </View>
                    ) : (
                        // email
                        <Text
                            style={[
                                styles.inputNumber,
                                {
                                    color: 'rgb(79,91,125)',
                                    fontSize: 14
                                }
                            ]}
                        >
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
                <View
                    style={[
                        styles.switchContainer,
                        { minHeight: 60, paddingVertical: 20 }
                    ]}
                >
                    <Text style={styles.longTextStyleNewUi}>
                        {I18n.t('Search_my_info_text')}
                    </Text>
                    <SwitchControll
                        disabled={this.props.appState.network !== 'full'}
                        value={this.state.searchable}
                        onValueChange={(val) => {
                            let stateTint = this.state.searchable;
                            stateTint = !stateTint;
                            this.setState({
                                searchable: stateTint,
                                trackChange: true
                            });
                        }}
                    />
                </View>
                {this.renderSmallDevider()}
                <View
                    style={[
                        styles.switchContainer,
                        { minHeight: 60, paddingVertical: 20 }
                    ]}
                >
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
                                visible: stateTint,
                                trackChange: true
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
                    onPress={this.saveProfile}
                    style={
                        this.props.appState.network
                            ? styles.save_btn
                            : styles.save_btn_disabled
                    }
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
                            {this.renderDevider()}
                            {this.renderNumbers()}
                            {this.renderEmails()}
                            {this.renderDevider()}
                            {this.renderCompany()}
                            {this.renderSmallDevider()}
                            {this.renderNationality()}
                            {this.renderDevider()}
                            {this.renderAddress()}
                            {this.renderDevider()}
                            {this.renderTimeZone()}
                            {this.renderSmallDevider()}
                            {this.renderBottomSettings()}
                            {this.renderSmallDevider()}
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyProfileScreenOnship);
