import React from 'react';
import {
    View,
    Text,
    Image,
    Switch,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Alert,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Picker
} from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import _ from 'lodash';
import styles from './styles';
import { SafeAreaView } from 'react-navigation';
import images from '../../config/images';
import Config from './config';
import config from '../../config/config';
import { Auth, Media, ResourceTypes, Resource } from '../../lib/capability';
import Utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import PhoneTypeModal from './PhoneTypeModal';
import Loader from '../Loader/Loader';
import { BotInputBarCapabilities } from '../ChatBotScreen/BotConstants';
import ActionSheet from '@yfuks/react-native-action-sheet';
import I18n from '../../config/i18n/i18n';
import Constants from '../../config/constants';
import ProfileImage from '../ProfileImage';
import { MyProfileImage } from '../ProfileImage';
import { HeaderBack } from '../Header';
import { connect } from 'react-redux';
import { uploadImage } from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import ImageCache from '../../lib/image_cache';
import utils from '../../lib/utils';
import Toast, { DURATION } from 'react-native-easy-toast';
import RNFS from 'react-native-fs';
import moment from 'moment-timezone';
import TimeZonePickerModal from './TimeZonePickerModel';
import countries from '../../lib/utils/ListOfCountries';
import CountryModal from './CountryModal';

const R = require('ramda');

class MyProfileScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        return {
            headerTitle:
                navigation.state.params.title || headerConfig.headerTitle,
            headerLeft: (
                <HeaderBack
                    onPress={() => {
                        Actions.pop();
                        setTimeout(() => {
                            Actions.refresh({
                                key: Math.random()
                            });
                        }, 100);
                    }}
                />
            )
        };
    }
    constructor(props) {
        super(props);
        this.state = {
            profileImage: '',
            reloadProfileImage: '',
            userId: this.props.userId,
            myName: '',
            phoneNumbers: {
                mobile: '',
                land: '',
                satellite: ''
            },
            prefixes: {
                mobile: '',
                land: '',
                satellite: ''
            },
            emailAddress: '',
            userCompanyName: '',
            state: '',
            addressLine1: '',
            city: '',
            country: 'IND',
            userTimezone: 'Etc/UTC',
            selectedTimezoneObj: {},
            selectedCountryObj: {},
            searchable: true,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false,
            modalVisible: false,
            modalVisibleCountry: false,
            timeZones: [],
            errorMsgCity: false
        };
        this.mounted = true;
        this.inputs = {};
    }

    componentDidMount() {
        this.gettingUserProfile();
    }

    fetchTimeZone = () => {
        let timeZones = moment.tz.names();
        let offsetTmz = [];
        for (let i in timeZones) {
            let obj = {
                value: timeZones[i],
                placeholder:
                    ' (GMT' +
                    moment.tz(timeZones[i]).format('Z') +
                    ')' +
                    timeZones[i]
            };
            offsetTmz.push(obj);
        }

        timeZones.forEach((elem, index) => {
            if (this.state.userTimezone === elem.value) {
                this.setState({ selectedTimezoneObj: elem });
            }
        });
    };

    gettingUserProfile = () => {
        Auth.getUser()
            .then(userDetails => {
                console.log('data===========', userDetails.info);
                const imageUrl =
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.profileImage +
                    userDetails.userId +
                    '.png';

                const info = { ...userDetails.info };

                let timeZones = moment.tz.names();
                let offsetTmz = [];
                for (let i in timeZones) {
                    let obj = {
                        value: timeZones[i],
                        placeholder:
                            ' (GMT' +
                            moment.tz(timeZones[i]).format('Z') +
                            ')' +
                            timeZones[i]
                    };

                    if (!info.userTimezone) {
                        if (timeZones[i] === 'Etc/UTC') {
                            this.setState({
                                selectedTimezoneObj: obj
                            });
                        }
                    } else {
                        if (info.userTimezone === timeZones[i]) {
                            this.setState({
                                selectedTimezoneObj: obj
                            });
                        }
                    }

                    offsetTmz.push(obj);
                }

                // offsetTmz.forEach((elem, index) => {
                //     if (info.userTimezone === elem.value) {
                //         this.setState(
                //             {
                //                 selectedTimezoneObj: elem
                //             }
                //         );
                //     }
                // });
                // const emailArray = [];
                // let phoneArray = [];
                // if (info.phoneNumbers) {
                //     if (Array.isArray(info.phoneNumbers)) {
                //         phoneArray = [...info.phoneNumbers];
                //     } else {
                //         let phoneObject = { ...info.phoneNumbers };

                //         for (var key in phoneObject) {
                //             let tempObj = {};
                //             if (phoneObject.hasOwnProperty(key)) {
                //                 const keyName = key;
                //                 tempObj = {
                //                     [keyName]: phoneObject[key]
                //                 };
                //             }

                //             phoneArray.push(tempObj);
                //         }
                //     }
                // }

                // emailArray.push(info.emailAddress);

                if (userDetails.info && userDetails.info.phoneNumbers) {
                    const mobileNumber = userDetails.info.phoneNumbers.mobile;
                    const landNumber = userDetails.info.phoneNumbers.land;
                    const satelliteNumber =
                        userDetails.info.phoneNumbers.satellite;
                    if (mobileNumber) {
                        if (mobileNumber.charAt(0) === '+') {
                            const spaceIndex = mobileNumber.indexOf(' ');
                            if (spaceIndex > 0) {
                                this.state.prefixes.mobile = mobileNumber.slice(
                                    1,
                                    spaceIndex
                                );
                                this.state.phoneNumbers.mobile = mobileNumber.slice(
                                    spaceIndex + 1
                                );
                            } else {
                                this.state.prefixes.mobile = mobileNumber.slice(
                                    1
                                );
                            }
                        } else {
                            this.state.phoneNumbers.mobile = mobileNumber;
                        }
                    }
                    if (landNumber) {
                        if (landNumber.charAt(0) === '+') {
                            const spaceIndex = landNumber.indexOf(' ');
                            if (spaceIndex > 0) {
                                this.state.prefixes.land = landNumber.slice(
                                    1,
                                    spaceIndex
                                );
                                this.state.phoneNumbers.land = landNumber.slice(
                                    spaceIndex + 1
                                );
                            } else {
                                this.state.prefixes.land = landNumber.slice(1);
                            }
                        } else {
                            this.state.phoneNumbers.land = landNumber;
                        }
                    }
                    if (satelliteNumber) {
                        if (satelliteNumber.charAt(0) === '+') {
                            const spaceIndex = satelliteNumber.indexOf(' ');
                            if (spaceIndex > 0) {
                                this.state.prefixes.satellite = satelliteNumber.slice(
                                    1,
                                    spaceIndex
                                );
                                this.state.phoneNumbers.satellite = satelliteNumber.slice(
                                    spaceIndex + 1
                                );
                            } else {
                                this.state.prefixes.satellite = satelliteNumber.slice(
                                    1
                                );
                            }
                        } else {
                            this.state.phoneNumbers.satellite = satelliteNumber;
                        }
                    }
                    this.setState({ phoneNumbers: this.state.phoneNumbers });
                }
                if (this.mounted) {
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
                        userTimezone: info.userTimezone || 'Etc/UTC'
                    });
                    if (
                        (info.address && !info.address.country) ||
                        !info.address
                    ) {
                        this.setState({
                            selectedCountryObj: {
                                code: null,
                                name: 'SELECT COUNTRY'
                            }
                        });
                    } else {
                        countries.forEach(elem => {
                            if (info.address.country === elem.code) {
                                this.setState({ selectedCountryObj: elem });
                            }
                        });
                    }
                }
            })
            .catch(err => {
                console.log('Error Loading User details', err);
            });
    };

    setPhoneNumber = (number, index, key) => {
        let getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index][key] = number;
        this.setState({ phoneNumbers: [...getPhoneNumbers] });
    };

    saveProfile = async () => {
        if (!this.state.city || this.state.city.trim() === '') {
            this.setState({ errorMsgCity: true });
            return;
        }
        try {
            this.setState({ loading: true });
            let mobilePrefix = this.state.prefixes.mobile.replace(/\s/g, '');
            if (mobilePrefix) {
                mobilePrefix = '+' + mobilePrefix + ' ';
            }
            let landPrefix = this.state.prefixes.land.replace(/\s/g, '');
            if (landPrefix) {
                landPrefix = '+' + landPrefix + ' ';
            }
            let satellitePrefix = this.state.prefixes.satellite.replace(
                /\s/g,
                ''
            );
            if (satellitePrefix) {
                satellitePrefix = '+' + satellitePrefix + ' ';
            }
            let phoneNumbers = {
                mobile:
                    mobilePrefix +
                    this.state.phoneNumbers.mobile.replace(/\s/g, ''),
                land:
                    landPrefix +
                    this.state.phoneNumbers.land.replace(/\s/g, ''),
                satellite:
                    satellitePrefix +
                    this.state.phoneNumbers.satellite.replace(/\s/g, '')
            };
            let detailObj = {
                emailAddress: this.state.emailAddress,
                searchable: this.state.searchable,
                visible: this.state.visible,
                userName: this.state.myName,
                phoneNumbers: phoneNumbers,
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

            let userDetails = {
                userName: this.state.myName,
                searchable: this.state.searchable,
                visible: this.state.visible,
                phoneNumbers: phoneNumbers,
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

            // if (this.state.phoneNumbers && this.state.phoneNumbers.length > 0) {
            //     let phoneNum = {};
            //     this.state.phoneNumbers.forEach(elem => {
            //         let key;
            //         let phValue;

            //         key = Object.keys(elem)[0];
            //         phValue = elem[key];
            //         if (elem.number === '') {
            //             console.log('its empty');
            //         } else {
            //             phoneNum[key] = phValue;
            //         }
            //     });
            //     userDetails.phoneNumbers = { ...phoneNum };
            //     detailObj.phoneNumbers = { ...phoneNum };
            // }

            // if (
            //     userDetails.phoneNumbers &&
            //     Object.keys(userDetails.phoneNumbers).length === 0
            // ) {
            //     delete detailObj.phoneNumbers;
            // }

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
                    .then(data => {
                        // console.log('saved data ', data);
                        this.setState({ loading: false });
                        setTimeout(() => {
                            this.showAlert('Profile updated');
                        }, 200);
                    })
                    .catch(err => {
                        this.setState({ loading: false });
                        console.log('error ', err);
                    });
            }
            Actions.pop();
        } catch (e) {
            this.setState({ loading: false });
            this.refs.toast.show(
                'Could not update profile',
                DURATION.LENGTH_SHORT
            );
        }
    };

    selectNumberType = index => {
        this.setState({ currentIndex: index });
        this.setState({
            inviteModalVisible: !this.state.inviteModalVisible
        });
    };

    addNewNumber = () => {
        let number = [...this.state.phoneNumbers];
        number.push({ mobile: '' });
        this.setState(() => {
            return { phoneNumbers: [...number] };
        });
    };

    removephone = index => {
        let number = [...this.state.phoneNumbers];
        number.splice(index, 1);
        this.setState({ phoneNumbers: [...number] });
    };

    getTheIcon = phoneLabel => {
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

        if (phoneLabel === 'Satellite' || phoneLabel === 'satellite') {
            return (
                <Image source={images.satellite} style={styles.satelliteIcon} />
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
        let numbers = [...this.state.phoneNumbers];
        this.setState({ inviteModalVisible: false });

        let currentJson = numbers[this.state.currentIndex];
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
        this.props.uploadImage();
        this.setState({ loading: true });
        const PROFILE_PIC_BUCKET = 'profile-pics';
        let newUri;
        let user;
        Auth.getUser()
            .then(res => {
                user = res;
                // console.log('user ', user);
                // Send the file to the S3/backend and then let the user know
                return ImageResizer.createResizedImage(
                    imageUri,
                    800,
                    800,
                    'PNG',
                    50,
                    0,
                    'images'
                );
            })
            .then(imageResizeResponse => {
                newUri =
                    Constants.IMAGES_DIRECTORY +
                    '/' +
                    imageUri.split('/').pop();
                return RNFS.moveFile(imageResizeResponse.uri, newUri);
            })
            .then(() => {
                return Resource.uploadFile(
                    newUri,
                    PROFILE_PIC_BUCKET,
                    user.userId,
                    ResourceTypes.Image,
                    null
                );
            })

            .then(fileUrl => {
                if (fileUrl) {
                    ImageCache.imageCacheManager.storeIncache(fileUrl, newUri);
                }
                if (_.isNull(fileUrl)) {
                    console.log(
                        'You have disabled access to media library. Please enable access to upload a profile picture'
                    );
                } else {
                    this.setState(
                        {
                            loading: false,
                            reloadProfileImage: imageUri
                        },
                        async () => {
                            this.props.updateContactScreen();
                            // let uriSrc = this.getUri(this.state.userId);
                            // if (uriSrc) {
                            //     await ImageCache.imageCacheManager.removeFromCache(
                            //         uriSrc
                            //     );
                            // }

                            setTimeout(() => {
                                this.showAlert('Profile image updated');
                            }, 200);
                        }
                    );
                }
            });
    }

    showAlert(msg) {
        Alert.alert(
            '',
            msg,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // console.log('image changed');
                    }
                }
            ],
            { cancelable: false }
        );
    }

    async takePicture() {
        Keyboard.dismiss();
        let result = await Media.takePicture(Config.CameraOptions);
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    async pickImage() {
        Keyboard.dismiss();
        let result = await Media.pickMediaFromLibrary(Config.CameraOptions);
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
        let optionLabels = moreOptions.map(elem => elem.label);
        if (Platform.OS === 'ios') {
            optionLabels.push('Cancel');
        }

        ActionSheet.showActionSheetWithOptions(
            {
                options: optionLabels,
                cancelButtonIndex: cancelButtonIndex
            },
            buttonIndex => {
                if (
                    buttonIndex !== undefined &&
                    buttonIndex !== cancelButtonIndex
                ) {
                    this.onOptionSelected(moreOptions[buttonIndex].key);
                }
            }
        );
    }

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
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
                            style={styles.profilePic}
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
                        width: 300,
                        alignItems: 'flex-start'
                    }}
                >
                    <Text style={styles.nameLabel}>{I18n.t('Name')}</Text>
                    <TextInput
                        editable={this.props.appState.network === 'full'}
                        style={styles.input}
                        autoCorrect={false}
                        value={this.state.myName}
                        onChangeText={val => {
                            this.setState({ myName: val });
                        }}
                        blurOnSubmit={false}
                        placeholder="Your Name"
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                </View>
            </View>
        );
    }

    renderNumbersOLD() {
        return (
            <View style={styles.userInfoNumberContainer}>
                {this.infoRender('phNumber', this.state.phoneNumbers)}
                <View style={styles.addContainer}>
                    <Image source={images.btn_more} style={styles.iconStyle} />
                    <TouchableOpacity
                        disabled={this.props.appState.network !== 'full'}
                        onPress={() => {
                            this.addNewNumber();
                        }}
                    >
                        <Text style={styles.addLabel}>
                            {I18n.t('Add_phone')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderEmailsOLD() {
        return (
            <View style={styles.userInfoEmailContainer}>
                {this.infoRender('email', this.state.emailAddress)}
                <View style={styles.addContainer}>
                    <Image
                        source={images.btn_more}
                        style={{
                            height: 8,
                            width: 8,
                            marginRight: 15
                        }}
                    />
                    <Text
                        style={{
                            color: 'rgba(0, 189, 242, 1)',
                            fontFamily: 'SF Pro Text',
                            fontSize: 12
                        }}
                    >
                        Add Email
                    </Text>
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

    focusNextField = id => {
        this.inputs[id].focus();
    };

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }
    setModalVisibleCountry(value) {
        this.setState({ modalVisibleCountry: value });
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

    renderAddress() {
        return (
            <View
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'position' : null}
            >
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> Company </Text>
                    <TextInput
                        style={styles.input}
                        autoCorrect={false}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        value={this.state.userCompanyName}
                        placeholder="Company"
                        onSubmitEditing={() => {
                            this.focusNextField('address');
                        }}
                        ref={input => {
                            this.inputs.company = input;
                        }}
                        onChangeText={this.onChangeCompany}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> Address </Text>
                    <TextInput
                        style={styles.input}
                        autoCorrect={false}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        value={this.state.addressLine1}
                        placeholder="Address"
                        ref={input => {
                            this.inputs.address = input;
                        }}
                        onSubmitEditing={() => {
                            this.focusNextField('city');
                        }}
                        onChangeText={this.onChangeAddressLine1}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> City* </Text>
                    <TextInput
                        style={styles.input}
                        autoCorrect={false}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        value={this.state.city}
                        placeholder="City"
                        ref={input => {
                            this.inputs.city = input;
                        }}
                        onEndEditing={(e: any) => {
                            // console.log('data====== ', e.nativeEvent.text);
                            if (
                                e.nativeEvent.text.trim() === '' ||
                                e.nativeEvent.text.length === 0
                            ) {
                                this.setState({ errorMsgCity: true });
                            }
                        }}
                        onSubmitEditing={data => {
                            this.focusNextField('state');
                        }}
                        onChangeText={this.onChangeCity}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                    {this.displayCityErrorMessege()}
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> State </Text>
                    <TextInput
                        style={styles.input}
                        autoCorrect={false}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        value={this.state.state}
                        placeholder="State"
                        ref={input => {
                            this.inputs.state = input;
                        }}
                        onSubmitEditing={() => {
                            this.focusNextField('postCode');
                        }}
                        onChangeText={this.onChangeState}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> Post Code </Text>
                    <TextInput
                        style={styles.input}
                        autoCorrect={false}
                        returnKeyType={'done'}
                        blurOnSubmit={false}
                        value={this.state.postCode}
                        placeholder="Post Code"
                        ref={input => {
                            this.inputs.postCode = input;
                        }}
                        onChangeText={this.onChangePostCode}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
                    />
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> Country </Text>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ modalVisibleCountry: true });
                        }}
                        style={styles.input}
                    >
                        <Text style={{ color: '#666666' }}>
                            {this.state.selectedCountryObj.name}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.entryFields}>
                    <Text style={styles.placeholderText}> Timezone </Text>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ modalVisible: true });
                        }}
                        style={styles.input}
                    >
                        <Text style={{ color: '#666666' }}>
                            {this.state.selectedTimezoneObj.placeholder}
                        </Text>
                    </TouchableOpacity>
                </View>
                <CountryModal
                    isVisible={this.state.modalVisibleCountry}
                    setVisible={this.setModalVisibleCountry.bind(this)}
                    selectedCountry={this.state.country}
                    selectingCountry={this.selectCountry}
                />
                <TimeZonePickerModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    selectedTimezone={this.state.userTimezone}
                    selectingTimeZone={this.selectTimeZone}
                />
            </View>
        );
    }

    selectTimeZone = data => {
        this.setState({ userTimezone: data.value, selectedTimezoneObj: data });
    };
    selectCountry = data => {
        this.setState({ country: data.code, selectedCountryObj: data });
    };

    onChangeCompany = text => {
        this.setState({ userCompanyName: text });
    };
    onChangeAddressLine1 = text => {
        this.setState({ addressLine1: text });
    };
    onChangeCity = text => {
        if (text && text.length > 0) {
            this.setState({ errorMsgCity: false });
        }
        this.setState({ city: text });
    };
    onChangeState = text => {
        this.setState({ state: text });
    };
    onChangePostCode = text => {
        this.setState({ postCode: text });
    };

    infoRender = type => {
        let icon;
        if (type === 'land' || type === 'mobile') {
            icon = (
                <Image
                    source={images.phone_icon}
                    style={styles.phoneIcon}
                    resizeMode={'contain'}
                />
            );
        } else if (type === 'satellite') {
            icon = (
                <Image
                    source={images.satellite_icon}
                    style={styles.phoneIcon}
                    resizeMode={'contain'}
                />
            );
        } else if (type === 'email') {
            icon = (
                <Image
                    source={images.email_icon}
                    style={styles.emailIcon}
                    resizeMode={'contain'}
                />
            );
        }

        return (
            <View style={styles.mainInfoRenderContainer}>
                <View style={styles.labelContainer}>
                    {icon}
                    <Text style={styles.labelStyle}>{type}</Text>
                </View>
                <View style={styles.infoContainer}>
                    {type === 'land' ||
                    type === 'mobile' ||
                    type === 'satellite' ? (
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={styles.inputPrefix}>
                                    {/* prefix */}
                                    <Text
                                        style={{
                                            color: 'rgba(102, 102, 102, 1)',
                                            fontSize: 14
                                        }}
                                    >
                                    +
                                    </Text>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            color: 'rgba(102, 102, 102, 1)',
                                            fontSize: 14
                                        }}
                                        value={this.state.prefixes[type]}
                                        keyboardType="number-pad"
                                        autoCorrect={false}
                                        maxLength={4}
                                        blurOnSubmit={false}
                                        onChangeText={text => {
                                            let numbers = this.state.prefixes;
                                            numbers[type] = text;
                                            this.setState({ prefixes: numbers });
                                        }}
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor="rgba(155,155,155,1)"
                                    />
                                </View>
                                {/* number */}
                                <TextInput
                                    style={styles.inputNumber}
                                    value={this.state.phoneNumbers[type]}
                                    keyboardType="phone-pad"
                                    autoCorrect={false}
                                    maxLength={20}
                                    blurOnSubmit={false}
                                    onChangeText={text => {
                                        let numbers = this.state.phoneNumbers;
                                        numbers[type] = text;
                                        this.setState({ phoneNumbers: numbers });
                                    }}
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
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
                <View style={styles.switchContainer}>
                    <Text style={styles.longTextStyle}>
                        {I18n.t('Search_my_info_text')}
                    </Text>
                    <Switch
                        disabled={this.props.appState.network !== 'full'}
                        style={styles.switchStyle}
                        value={this.state.searchable}
                        onValueChange={val => {
                            let stateTint = this.state.searchable;
                            stateTint = !stateTint;
                            this.setState({
                                searchable: stateTint
                            });
                        }}
                        trackColor="rgba(244,244,244,1)"
                        onTintColor="rgba(244,244,244,1)"
                        // tintColor="rgba(244,244,244,1)"
                        thumbColor={
                            this.state.searchable
                                ? 'rgba(0,189,242,1)'
                                : 'rgba(102,102,102,1)'
                        }
                    />
                </View>
                <View
                    style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: 'rgba(221,222,227,1)'
                    }}
                />
                <View style={styles.switchContainer}>
                    <Text style={styles.longTextStyle}>
                        {I18n.t('Share_my_info_text')}
                    </Text>
                    <Switch
                        disabled={this.props.appState.network !== 'full'}
                        style={styles.switchStyle}
                        value={this.state.visible}
                        onValueChange={val => {
                            let stateTint = this.state.visible;
                            stateTint = !stateTint;
                            this.setState({
                                visible: stateTint
                            });
                        }}
                        trackColor="rgba(244,244,244,1)"
                        onTintColor="rgba(244,244,244,1)"
                        // tintColor="rgba(244,244,244,1)"
                        thumbColor={
                            this.state.visible
                                ? 'rgba(0,189,242,1)'
                                : 'rgba(102,102,102,1)'
                        }
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
                        Actions.pop(this.props.updateContactScreen());
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

    render() {
        // console.log('profile data =======', this.state);

        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <SafeAreaView
                    style={styles.safeAreaStyle}
                    keyboardShouldPersistTaps={'handled'}
                >
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
                            {/* {this.renderNumbersOLD()}
                            {this.renderEmailsOLD()} */}
                            {this.renderNumbers()}
                            {this.renderEmails()}
                            {this.renderAddress()}
                            {this.renderBottomSettings()}
                            {this.renderBottomButtons()}
                        </View>
                    </ScrollView>
                    {this.renderToast()}
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {
        uploadImage: () => dispatch(uploadImage())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyProfileScreen);
