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
    Platform
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import { SafeAreaView } from 'react-navigation';
import images from '../../config/images';
import Config from './config';
import config from '../../config/config';
import {
    Auth,
    Media,
    ResourceTypes,
    Resource,
    Contact
} from '../../lib/capability';
import Utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import PhoneTypeModal from './PhoneTypeModal';
import Loader from '../Loader/Loader';
import { BotInputBarCapabilities } from '../ChatBotScreen/BotConstants';
import ActionSheet from '@yfuks/react-native-action-sheet';
import I18n from '../../config/i18n/i18n';
import Constants from '../../config/constants';

import { MyProfileImage } from '../ProfileImage';
import { HeaderBack } from '../Header';
import { connect } from 'react-redux';
import { uploadImage } from '../../redux/actions/UserActions';
import LocalContactModal from './LocalContactModal';
import { AddLocalContacts } from '../../api/ContactServices';
import Store from '../../redux/store/configureStore';
import { completeContactsLoad } from '../../redux/actions/UserActions';

class NewContactScreen extends React.Component {
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
            user: {},
            profileImage: '',
            reloadProfileImage: '',
            userId: this.props.userId,
            myName: '',
            phoneNumbers: [{ mobile: '' }],
            emailAddress: [{ email: '' }],
            phoneNumbersObj: {},
            emailAddressObj: {},
            searchable: false,
            visible: false,
            inviteModalVisible: false,
            currentIndex: null,
            loading: false,
            modalVisible: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        Auth.getUser().then(data => {
            console.log('all data for user', data);
            this.setState({ user: { ...data } });
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }

    setPhoneNumber = (number, index, key) => {
        let getPhoneNumbers = [...this.state.phoneNumbers];
        let getPhoneNumbersObj = { ...this.state.phoneNumbersObj };
        getPhoneNumbers[index][key] = number;

        getPhoneNumbers.map(elem => {
            let getKey = Object.keys(elem)[0];
            getPhoneNumbersObj[getKey] = elem[getKey];
        });
        this.setState({
            phoneNumbers: [...getPhoneNumbers],
            phoneNumbersObj: { ...getPhoneNumbersObj }
        });
    };
    setEmail = (email, index, key) => {
        let getEmail = [...this.state.emailAddress];
        let getEmailObj = { ...this.state.emailAddressObj };
        // console.log('email set ', getEmail, email, index, key);
        getEmail[index][key] = email;
        getEmail.map(elem => {
            let getKey = Object.keys(elem)[0];
            getEmailObj[getKey] = elem[getKey];
        });
        this.setState({
            emailAddress: [...getEmail],
            emailAddressObj: { ...getEmailObj }
        });
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

    addNewEmail = () => {
        let email = [...this.state.emailAddress];
        email.push({ email: '' });
        this.setState(() => {
            return { emailAddress: [...email] };
        });
    };

    removephone = index => {
        let number = [...this.state.phoneNumbers];
        number.splice(index, 1);
        this.setState({ phoneNumbers: [...number] });
    };
    removeemail = index => {
        let email = [...this.state.emailAddress];
        email.splice(index, 1);
        this.setState({ emailAddress: [...email] });
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
            let key;
            let phValue;
            let emailValue;
            key = Object.keys(info)[0];

            if (type === 'phNumber') {
                phValue = info[key];
            } else {
                emailValue = info[key];
            }
            // if (type === 'email') {
            //     console.log('email ', info);
            //     console.log('key ', key);
            //     console.log('emailValue ', emailValue);
            //     console.log('state email ', this.state.emailAddress);
            // }

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
                        ) : (
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.infoContainer}>
                        {type === 'phNumber' ? (
                            <TextInput
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
                            <TextInput
                                style={styles.inputNumber}
                                value={emailValue}
                                keyboardType="email-address"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                onChangeText={value => {
                                    this.setEmail(value, index, key);
                                }}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                            />
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
                        ) : (
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    this.removeemail(index);
                                }}
                            >
                                <Image
                                    style={{ width: 10, height: 10 }}
                                    source={images.remove_icon}
                                />
                            </TouchableOpacity>
                        )}
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
                    // console.log('file url upload image ', fileUrl);
                    this.setState(
                        {
                            loading: false,
                            reloadProfileImage: imageUri
                        },
                        () => {
                            this.props.updateContactScreen();
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

    importPhoneBook = () => {
        // console.log('open phone book modal');
        this.setState({ modalVisible: true });
    };

    importSelectedContact = data => {
        console.log('selected contact data ', data);
        let contactEmails = [];
        let contactEmailsObj = {};
        let contactPhoneNumbers = [];
        let contactPhoneNumbersObj = {};

        if (Object.keys(data).length <= 0) {
            this.setState({ modalVisible: false });
            return;
        }

        data.emails.map(elem => {
            let keyName = elem.label;
            let objEmail = {};
            objEmail[keyName] = elem.email;
            contactEmails.push(objEmail);
            contactEmailsObj[elem.label] = elem.email;
        });

        data.phoneNumbers.map(elem => {
            let keyName = elem.label;
            let objNumber = {};
            objNumber[keyName] = elem.number;
            contactPhoneNumbers.push(objNumber);
            contactPhoneNumbersObj[elem.label] = elem.number;
        });

        let checkMobile = contactPhoneNumbersObj.hasOwnProperty('mobile');
        let checkLand = contactPhoneNumbersObj.hasOwnProperty('land');
        let checkSatellite = contactPhoneNumbersObj.hasOwnProperty('satellite');
        let checkHomeEmail = contactEmailsObj.hasOwnProperty('home');
        let checkWorkEmail = contactEmailsObj.hasOwnProperty('work');

        Object.keys(contactPhoneNumbersObj).map(elem => {
            if (elem !== 'mobile' && elem !== 'land' && elem !== 'satellite') {
                delete contactPhoneNumbersObj[elem];
            }
        });
        Object.keys(contactEmailsObj).map(elem => {
            if (elem !== 'home' && elem !== 'work') {
                delete contactEmailsObj[elem];
            }
        });

        if (!checkMobile) {
            contactPhoneNumbersObj.mobile = '';
        }
        if (!checkLand) {
            contactPhoneNumbersObj.land = '';
        }
        if (!checkSatellite) {
            contactPhoneNumbersObj.satellite = '';
        }
        if (!checkHomeEmail) {
            contactEmailsObj.home = '';
        }
        if (!checkWorkEmail) {
            contactEmailsObj.work = '';
        }

        console.log(
            'added contact  ',
            contactPhoneNumbersObj,
            contactEmailsObj
        );

        this.setState({
            myName: data.name,
            emailAddress: [...contactEmails],
            phoneNumbers: [...contactPhoneNumbers],
            emailAddressObj: { ...contactEmailsObj },
            phoneNumbersObj: { ...contactPhoneNumbersObj },
            reloadProfileImage: data.profileImage
        });
    };

    saveProfile = () => {
        let {
            emailAddressObj,
            phoneNumbersObj,
            myName,
            phoneNumbers,
            emailAddress
        } = this.state;

        let saveLocalContactData = {
            localContacts: [
                {
                    userName: myName,
                    emailAddresses: {
                        ...emailAddressObj
                    },
                    phoneNumbers: {
                        ...phoneNumbersObj
                    }
                }
            ]
        };

        console.log('save sata ', saveLocalContactData, this.state.userId);
        AddLocalContacts(saveLocalContactData)
            .then(elem => {
                console.log('data ', elem);
                // Actions.newContactScreen({});
                Store.dispatch(completeContactsLoad(false));
                return Contact.fetchGrpcContacts(this.state.user);
            })
            .then(contactsData => {
                console.log('all contact ', contactsData);
                let frontmContact = [...contactsData.data.contacts];
                let localContacts = [...contactsData.data.localContacts];
                let updateContacts = frontmContact.concat(localContacts);

                console.log('on adding contacts ', updateContacts);

                // Contact.saveContacts(updateContacts);
                Actions.pop();
                setTimeout(() => {
                    Actions.refresh({
                        key: Math.random()
                    });
                }, 100);
            })
            .catch(err => {
                console.log('error on saving local contact ', err);
            });
    };

    render() {
        // console.log('all the things ', this.state, this.props);

        return (
            <SafeAreaView style={styles.safeAreaStyle}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.mainViewContainer}>
                        <Loader loading={this.state.loading} />
                        <PhoneTypeModal
                            currentValue={
                                this.state.phoneNumbers[this.state.currentIndex]
                            }
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
                                            uri: this.state.reloadProfileImage
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
                                <Text style={styles.nameLabel}>
                                    {I18n.t('Name')}
                                </Text>
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
                                        {I18n.t('Add_phone')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
                                <TouchableOpacity
                                    onPress={() => {
                                        this.addNewEmail();
                                    }}
                                >
                                    <Text style={styles.addLabel}>
                                        Add Email
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                style={styles.import_btn}
                                onPress={() => {
                                    this.importPhoneBook();
                                }}
                            >
                                <Text style={styles.cancel_text}>
                                    Import phone from address book
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.btn_container}>
                            <TouchableOpacity
                                onPress={() => {
                                    Actions.pop();
                                }}
                                style={styles.cancel_btn}
                            >
                                <Text style={styles.cancel_text}>
                                    {I18n.t('Cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.saveProfile();
                                }}
                                style={styles.save_btn}
                            >
                                <Text style={styles.save_btn_text}>
                                    {I18n.t('SAVE')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <LocalContactModal
                    isVisible={this.state.modalVisible}
                    setVisible={this.setModalVisible.bind(this)}
                    selectedContact={this.importSelectedContact}
                />
            </SafeAreaView>
        );
    }
}

export default NewContactScreen;
