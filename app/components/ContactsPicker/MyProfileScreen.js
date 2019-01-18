import React from 'react';
import {
    View,
    Text,
    Image,
    Switch,
    TouchableOpacity,
    TextInput,
    Keyboard,
    ScrollView,
    Platform
} from 'react-native';
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

export default class MyProfileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profileImage: '',
            userId: this.props.userId,
            myName: '',
            phoneNumbers: [],
            emailAddress: [],
            searchState: false,
            shareState: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        Auth.getUser()
            .then(userDetails => {
                console.log('data', userDetails.info);
                const imageUrl =
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.profileImage +
                    userDetails.userId +
                    '.png';

                this.setState({ profileImage: imageUrl });

                const info = { ...userDetails.info };
                const emailArray = [];
                emailArray.push(info.emailAddress);
                if (this.mounted) {
                    this.setState({
                        myName: info.userName,
                        emailAddress: [...emailArray],
                        phoneNumbers: info.phoneNumbers
                            ? [...info.phoneNumbers]
                            : [],
                        searchState: info.searchState || false,
                        shareState: info.shareState || false
                    });
                }
            })
            .catch(err => {
                console.log('Error Loading User details', err);
            });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setPhoneNumber = (number, index) => {
        let getPhoneNumbers = [...this.state.phoneNumbers];
        getPhoneNumbers[index].number = number;
        this.setState({ phoneNumbers: [...getPhoneNumbers] });
    };

    saveProfile = async () => {
        this.setState({ loading: true });
        let detailObj = {
            emailAddress: this.state.emailAddress[0],
            phoneNumbers: {
                land: '',
                mobile: '',
                satellite: ''
            },
            searchable: this.state.searchState,
            visible: this.state.shareState
        };

        let userDetails = {
            userName: this.state.myName,
            phoneNumbers: [],
            searchState: this.state.searchState,
            shareState: this.state.shareState
        };

        this.state.phoneNumbers.forEach(elem => {
            userDetails.phoneNumbers.push(elem);
            if (elem.text in detailObj.phoneNumbers) {
                detailObj.phoneNumbers[elem.text] = elem.number;
            }
        });

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
                    this.setState({ loading: false });
                    Actions.pop();
                })
                .catch(err => {
                    this.setState({ loading: false });
                    console.log('error ', err);
                });
        }
    };

    selectNumberType = index => {
        this.setState({ currentIndex: index });
        console.log('select type');
        this.setState({
            inviteModalVisible: !this.state.inviteModalVisible
        });
    };

    addNewNumber = () => {
        let number = [...this.state.phoneNumbers];
        number.push({ label: 'Mobile', number: '', text: 'mobile' });
        this.setState({ phoneNumbers: [...number] });
    };

    removephone = index => {
        let number = [...this.state.phoneNumbers];
        number.splice(index, 1);
        this.setState({ phoneNumbers: [...number] });
    };

    getTheIcon = phoneLabel => {
        if (phoneLabel === 'Mobile') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }

        if (phoneLabel === 'Land') {
            return (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        }

        if (phoneLabel === 'Satellite') {
            return (
                <Image source={images.satellite} style={styles.satelliteIcon} />
            );
        }
    };

    infoRender = (type, myInfoData) => {
        return myInfoData.map((info, index) => {
            return (
                <View
                    key={index}
                    indexData={index}
                    style={styles.mainInfoRenderContainer}
                >
                    <View style={styles.labelContainer}>
                        {type === 'phNumber' ? (
                            this.getTheIcon(info.label)
                        ) : (
                            <Image
                                source={images.email_icon}
                                style={styles.emailIcon}
                            />
                        )}
                        {type === 'phNumber' ? (
                            <Text style={styles.labelStyle}>{info.label}</Text>
                        ) : (
                            <Text style={styles.labelStyle}>Email</Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
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
                                style={styles.inputNumber}
                                value={info.number}
                                keyboardType="numeric"
                                autoCorrect={false}
                                maxLength={10}
                                blurOnSubmit={false}
                                onChangeText={val => {
                                    this.setPhoneNumber(val, index);
                                }}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                            />
                        ) : (
                            <Text style={styles.infoLabelStyle}>{info}</Text>
                        )}
                        {type === 'phNumber' ? (
                            <TouchableOpacity
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

    setupType(val) {
        console.log('setting yp type ', val);
        let numbers = [...this.state.phoneNumbers];

        this.setState({ inviteModalVisible: false });

        if (val === 'mobile') {
            numbers[this.state.currentIndex].label = 'Mobile';
            numbers[this.state.currentIndex].text = 'mobile';
        }
        if (val === 'satellite') {
            numbers[this.state.currentIndex].label = 'Satellite';
            numbers[this.state.currentIndex].text = 'satellite';
        }
        if (val === 'land') {
            numbers[this.state.currentIndex].label = 'Land';
            numbers[this.state.currentIndex].text = 'land';
        }
    }

    async sendImage(imageUri, base64) {
        // console.log('images ', imageUri);
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
                    ResourceTypes.Image,
                    user,
                    true
                );
            })
            .then(fileUrl => {
                if (_.isNull(fileUrl)) {
                    console.log(
                        'You have disabled access to media library. Please enable access to upload a profile picture'
                    );
                } else {
                    console.log('file url upload image ', fileUrl);
                    this.setState({ loading: false });
                }
            });
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
        console.log('profile image', this.props.userId);

        return (
            <SafeAreaView style={styles.safeAreaStyle}>
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
                                <ProfileImage
                                    uuid={this.props.userId}
                                    placeholder={require('../../images/chat/avatar-1577909_1280.png')}
                                    style={styles.profilePic}
                                    placeholderStyle={styles.profileImgStyle}
                                    resizeMode="cover"
                                />
                            </View>
                            <TouchableOpacity
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
                                style={{ width: 300, alignItems: 'flex-start' }}
                            >
                                <Text style={styles.nameLabel}>Name</Text>
                                <TextInput
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
                                    onPress={() => {
                                        this.addNewNumber();
                                    }}
                                >
                                    <Text style={styles.addLabel}>
                                        Add phone
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.userInfoEmailContainer}>
                            {this.infoRender('email', this.state.emailAddress)}
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
                        <View
                            style={{
                                height: 130,
                                width: '100%',
                                borderBottomWidth: 5,
                                borderTopWidth: 5,
                                borderColor: 'rgba(222,222,222,1)'
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(102, 102, 102, 1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 14
                                    }}
                                >
                                    I don't want to appear in searches
                                </Text>
                                <Switch
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(222,222,222,1);',
                                        borderRadius: 15
                                    }}
                                    value={this.state.searchState}
                                    onValueChange={val => {
                                        let stateTint = this.state.searchState;
                                        stateTint = !stateTint;
                                        this.setState({
                                            searchState: stateTint
                                        });
                                    }}
                                    trackColor="rgba(244,244,244,1)"
                                    onTintColor="rgba(244,244,244,1)"
                                    // tintColor="rgba(244,244,244,1)"
                                    thumbColor={
                                        this.state.searchState
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
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(102, 102, 102, 1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 14
                                    }}
                                >
                                    Share my information with my contacts
                                </Text>
                                <Switch
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(222,222,222,1);',
                                        borderRadius: 15
                                    }}
                                    value={this.state.shareState}
                                    onValueChange={val => {
                                        let stateTint = this.state.shareState;
                                        stateTint = !stateTint;
                                        this.setState({
                                            shareState: stateTint
                                        });
                                    }}
                                    trackColor="rgba(244,244,244,1)"
                                    onTintColor="rgba(244,244,244,1)"
                                    // tintColor="rgba(244,244,244,1)"
                                    thumbColor={
                                        this.state.shareState
                                            ? 'rgba(0,189,242,1)'
                                            : 'rgba(102,102,102,1)'
                                    }
                                />
                            </View>
                        </View>
                        <View
                            style={{
                                height: 90,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    Actions.pop();
                                }}
                                style={{
                                    width: 150,
                                    height: 30,
                                    backgroundColor: '#ffffff',
                                    borderColor: 'rgba(0,167,214,1)',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(0,167,214,1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 16
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.saveProfile();
                                }}
                                style={{
                                    width: 150,
                                    height: 30,
                                    backgroundColor: 'rgba(0,189,242,1)',
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'rgba(255,255,255,1)',
                                        fontFamily: 'SF Pro Text',
                                        fontSize: 16
                                    }}
                                >
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
