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
    KeyboardAvoidingView
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
            phoneNumbers: [],
            emailAddress: [],
            searchable: true,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        this.gettingUserProfile();
    }

    gettingUserProfile = () => {
        Auth.getUser()
            .then(userDetails => {
                // console.log('data', userDetails.info);
                const imageUrl =
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.profileImage +
                    userDetails.userId +
                    '.png';

                this.setState({ profileImage: imageUrl });

                const info = { ...userDetails.info };
                const emailArray = [];
                let phoneArray = [];
                if (info.phoneNumbers) {
                    if (Array.isArray(info.phoneNumbers)) {
                        phoneArray = [...info.phoneNumbers];
                    } else {
                        let phoneObject = { ...info.phoneNumbers };

                        for (var key in phoneObject) {
                            let tempObj = {};
                            if (phoneObject.hasOwnProperty(key)) {
                                const keyName = key;
                                tempObj = {
                                    [keyName]: phoneObject[key]
                                };
                            }

                            phoneArray.push(tempObj);
                        }
                    }
                }

                emailArray.push(info.emailAddress);
                if (this.mounted) {
                    this.setState({
                        myName: info.userName,
                        emailAddress: [...emailArray],
                        phoneNumbers: info.phoneNumbers ? [...phoneArray] : [],
                        searchable: info.searchable || false,
                        visible: info.visible || false
                    });
                }
            })
            .catch(err => {
                console.log('Error Loading User details', err);
            });
    };

    componentWillUnmount() {
        this.mounted = false;
    }

    setPhoneNumber = (number, index, key) => {
        let getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index][key] = number;
        this.setState({ phoneNumbers: [...getPhoneNumbers] });
    };

    saveProfile = async () => {
        this.setState({ loading: true });
        let detailObj = {
            emailAddress: this.state.emailAddress[0],
            searchable: this.state.searchable,
            visible: this.state.visible,
            userName: this.state.myName
        };

        let userDetails = {
            userName: this.state.myName,
            searchable: this.state.searchable,
            visible: this.state.visible
        };

        if (this.state.phoneNumbers && this.state.phoneNumbers.length > 0) {
            let phoneNum = {};
            this.state.phoneNumbers.forEach(elem => {
                let key;
                let phValue;

                key = Object.keys(elem)[0];
                phValue = elem[key];
                if (elem.number === '') {
                    console.log('its empty');
                } else {
                    phoneNum[key] = phValue;
                }
            });
            userDetails.phoneNumbers = { ...phoneNum };
            detailObj.phoneNumbers = { ...phoneNum };
        }

        if (
            userDetails.phoneNumbers &&
            Object.keys(userDetails.phoneNumbers).length === 0
        ) {
            delete detailObj.phoneNumbers;
        }

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

    infoRender = (type, myInfoData) => {
        return myInfoData.map((info, index) => {
            // console.log('all th data ', info);

            let key;
            let phValue;

            if (type === 'phNumber') {
                key = Object.keys(info)[0];
                phValue = info[key];
            }

            return (
                <View
                    key={index}
                    indexData={index}
                    style={styles.mainInfoRenderContainer}
                >
                    <View style={styles.labelContainer}>
                        {type === 'phNumber' ? (
                            this.getTheIcon(key)
                        ) : (
                            <Image
                                source={images.email_icon}
                                style={styles.emailIcon}
                            />
                        )}
                        {type === 'phNumber' ? (
                            <Text style={styles.labelStyle}>{key}</Text>
                        ) : (
                            <Text style={styles.labelStyle}>
                                {I18n.t('Email')}
                            </Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
                                disabled={
                                    this.props.appState.network !== 'full'
                                }
                                style={{
                                    width: 40,
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    this.selectNumberType(index);
                                }}
                            >
                                <Image
                                    source={images.collapse_gray_arrow_down}
                                    style={styles.arrowStyle}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={styles.infoContainer}>
                        {type === 'phNumber' ? (
                            <TextInput
                                editable={
                                    this.props.appState.network === 'full'
                                }
                                style={styles.inputNumber}
                                value={phValue}
                                keyboardType="phone-pad"
                                autoCorrect={false}
                                maxLength={15}
                                blurOnSubmit={false}
                                onChangeText={value => {
                                    this.setPhoneNumber(value, index, key);
                                }}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                            />
                        ) : (
                            <Text style={styles.infoLabelStyle}>{info}</Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
                                disabled={
                                    this.props.appState.network !== 'full'
                                }
                                style={{
                                    width: 40,
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    this.removephone(index);
                                }}
                            >
                                <Image
                                    style={{ width: 10, height: 10 }}
                                    source={images.remove_icon}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            );
        });
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
        const toUri = await Utils.copyFileAsync(
            imageUri,
            Constants.IMAGES_DIRECTORY
        );

        Auth.getUser()
            .then(user => {
                // console.log('user ', user);
                // Send the file to the S3/backend and then let the user know

                return Resource.uploadFile(
                    base64,
                    toUri,
                    PROFILE_PIC_BUCKET,
                    user.userId,
                    user,
                    ResourceTypes.Image,
                    null,
                    true,
                    true
                );
            })

            .then(fileUrl => {
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
                            let uriSrc = this.getUri(this.state.userId);
                            if (uriSrc) {
                                await ImageCache.imageCacheManager.removeFromCache(
                                    uriSrc
                                );
                            }

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

    render() {
        // console.log('image url ', this.state.reloadProfileImage);

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
                                                uri: this.state
                                                    .reloadProfileImage
                                            }}
                                            style={styles.profileImgStyle}
                                        />
                                    ) : (
                                        <MyProfileImage
                                            uuid={this.state.userId}
                                            placeholder={images.user_image}
                                            style={styles.profilePic}
                                            placeholderStyle={
                                                styles.profileImgStyle
                                            }
                                            resizeMode="cover"
                                            changeProfileImageBack={() => {
                                                this.changeProfileStatuBack.bind(
                                                    this
                                                );
                                            }}
                                        />
                                    )}
                                </View>
                                <TouchableOpacity
                                    disabled={
                                        this.props.appState.network !== 'full'
                                    }
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
                            <View style={styles.nameContainerStyle}>
                                <View
                                    style={{
                                        width: 300,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <Text style={styles.nameLabel}>
                                        {I18n.t('Name')}
                                    </Text>
                                    <TextInput
                                        editable={
                                            this.props.appState.network ===
                                            'full'
                                        }
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
                            <View style={styles.userInfoNumberContainer}>
                                {this.infoRender(
                                    'phNumber',
                                    this.state.phoneNumbers
                                )}
                                <View style={styles.addContainer}>
                                    <Image
                                        source={images.btn_more}
                                        style={styles.iconStyle}
                                    />
                                    <TouchableOpacity
                                        disabled={
                                            this.props.appState.network !==
                                            'full'
                                        }
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
                            <View style={styles.userInfoEmailContainer}>
                                {this.infoRender(
                                    'email',
                                    this.state.emailAddress
                                )}
                                {/* <View
                                style={styles.addContainer}
                            >
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
                            </View> */}
                            </View>
                            <View style={styles.bottomSettingContainer}>
                                <View style={styles.switchContainer}>
                                    <Text style={styles.longTextStyle}>
                                        {I18n.t('Search_my_info_text')}
                                    </Text>
                                    <Switch
                                        disabled={
                                            this.props.appState.network !==
                                            'full'
                                        }
                                        style={styles.switchStyle}
                                        value={this.state.searchable}
                                        onValueChange={val => {
                                            let stateTint = this.state
                                                .searchable;
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
                                        disabled={
                                            this.props.appState.network !==
                                            'full'
                                        }
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
                            <View style={styles.btn_container}>
                                <TouchableOpacity
                                    onPress={() => {
                                        Actions.pop(
                                            this.props.updateContactScreen()
                                        );
                                    }}
                                    style={styles.cancel_btn}
                                >
                                    <Text style={styles.cancel_text}>
                                        {I18n.t('Cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={
                                        this.props.appState.network !== 'full'
                                    }
                                    onPress={() => {
                                        this.saveProfile();
                                    }}
                                    style={[
                                        styles.save_btn,
                                        {
                                            opacity:
                                                this.props.appState.network ===
                                                'full'
                                                    ? 1
                                                    : 0.2
                                        }
                                    ]}
                                >
                                    <Text style={styles.save_btn_text}>
                                        {I18n.t('SAVE')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
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
