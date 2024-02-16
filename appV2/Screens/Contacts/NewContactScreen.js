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
import _ from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionSheet from 'react-native-action-sheet';
import styles from './ContactEditStyle';
import images from '../../config/images';
import Config from './config';
import { Auth, Media, Contact } from '../../lib/capability';
import Loader from '../../widgets/Loader';
import { BotInputBarCapabilities } from '../Chat/config/BotConstants';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import { completeContactsLoad } from '../../redux/actions/UserActions';
import { isEmail } from '../../lib/utils';
import ContactServices from '../../apiV2/ContactServices';
import NavigationAction from '../../navigation/NavigationAction';
import GlobalColors from '../../config/styles';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

class NewContactScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            profileImage: '',
            reloadProfileImage: '',
            name:
                props.route.params.contact && props.route.params.contact.name
                    ? props.route.params.contact.name
                    : '',
            phoneNumbers: {
                mobile: '',
                land: '',
                satellite: ''
            },
            emailAddresses:
                props.route.params.contact &&
                props.route.params.contact.emailAddresses
                    ? props.route.params.contact.emailAddresses
                    : {
                          home: '',
                          work: ''
                      },
            currentIndex: null,
            emailErrorMessage: {
                home: '',
                work: ''
            },
            loading: false,
            modalVisible: false
        };

        this.mounted = true;
    }

    componentDidMount() {
        if (
            this.props.route.params.contact &&
            this.props.route.params.contact.phoneNumbers
        ) {
            this.setState({
                phoneNumbers: this.props.route.params.contact.phoneNumbers
            });
        }
        const user = Auth.getUserData();
        this.setState({ user: { ...user } });
        if (this.props.route.params.goToImport) {
            this.importPhoneBook();
        }
        if (this.props.route.params.selectedContact) {
            this.importSelectedContact(this.props.route.params.selectedContact);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }

    displayEmailErrorMessage = (type) => {
        if (this.state.emailErrorMessage[type]) {
            return (
                <View style={styles.errorContainer}>
                    <View style={styles.userError}>
                        <Text style={styles.errorText}>
                            {this.state.emailErrorMessage[type]}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    infoRender = (type) => {
        let icon;
        let placeholderText;
        if (type === 'land') {
            icon = (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
            placeholderText = 'enter landline number';
        } else if (type === 'mobile') {
            icon = (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
            placeholderText = 'enter mobile number';
        } else if (type === 'satellite') {
            icon = (
                <Image
                    source={images.satellite_icon}
                    style={styles.phoneIcon}
                />
            );
            placeholderText = 'enter satellite number';
        } else if (type === 'home' || type === 'work') {
            icon = (
                <Image source={images.email_icon} style={styles.emailIcon} />
            );
            placeholderText = 'enter email address';
        }

        return (
            <View style={styles.mainInfoRenderContainerEdit}>
                <View style={styles.labelContainer}>
                    {/*{icon}*/}
                    <Text style={styles.labelStyle}>{type}</Text>
                </View>
                <View style={styles.infoContainer}>
                    {type === 'land' ||
                    type === 'mobile' ||
                    type === 'satellite' ? (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <TextInput
                                accessibilityLabel={`number${type}`}
                                testID={`number${type}`}
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
                                placeholder={placeholderText}
                                underlineColorAndroid="transparent"
                                placeholderTextColor={
                                    GlobalColors.formPlaceholderText
                                }
                            />
                        </View>
                    ) : (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {/* email */}
                            <TextInput
                                accessibilityLabel={`Email${type}`}
                                testID={`email${type}`}
                                style={styles.inputNumber}
                                value={this.state.emailAddresses[type]}
                                keyboardType="email-address"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                onChangeText={(text) => {
                                    const emails = this.state.emailAddresses;
                                    emails[type] = text;
                                    const emailErrors =
                                        this.state.emailErrorMessage;
                                    emailErrors[type] = '';
                                    this.setState({
                                        emailAddresses: emails,
                                        emailErrorMessage: emailErrors
                                    });
                                }}
                                underlineColorAndroid="transparent"
                                placeholderTextColor={
                                    GlobalColors.formPlaceholderText
                                }
                                placeholder={placeholderText}
                            />
                            {this.displayEmailErrorMessage(type)}
                        </View>
                    )}
                </View>
            </View>
        );
    };

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

    importPhoneBook = () => {
        console.log('open phone book modal');
        NavigationAction.push(NavigationAction.SCREENS.picPhonebookContact, {
            showImportButton: true,
            contactRequest: true,
            onContactSelected: this.importSelectedContact
        });
    };

    formatContact = (data) => {
        const contactObj = {
            idTemp: data.id,
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
            profileImage: data.profileImage,
            name: data.name,
            emails: {
                home: '',
                work: ''
            },
            selected: false
        };

        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
            const landNumber = data.phoneNumbers.find(
                (element) =>
                    element.label === 'land' ||
                    element.label === 'home' ||
                    element.label === 'work' ||
                    element.label === 'other'
            );
            if (landNumber) {
                contactObj.phoneNumbers.land = landNumber.number;
            }
            const mobileNumber = data.phoneNumbers.find(
                (element) => element.label === 'mobile'
            );
            if (mobileNumber) {
                contactObj.phoneNumbers.mobile = mobileNumber.number;
            }
            const satelliteNumber = data.phoneNumbers.find(
                (element) => element.label === 'satellite'
            );
            if (satelliteNumber) {
                contactObj.phoneNumbers.satellite = satelliteNumber.number;
            }
        }
        contactObj.phoneNumbers.land = contactObj.phoneNumbers.land.replace(
            /[^+\d]+/g,
            ''
        );
        contactObj.phoneNumbers.mobile = contactObj.phoneNumbers.mobile.replace(
            /[^+\d]+/g,
            ''
        );
        contactObj.phoneNumbers.satellite =
            contactObj.phoneNumbers.satellite.replace(/[^+\d]+/g, '');
        if (data.emails && data.emails.length > 0) {
            const home = data.emails.find(
                (element) => element.label === 'home'
            );
            if (home) {
                contactObj.emails.home = home.email;
            } else if (data.emails[0]) {
                contactObj.emails.home = data.emails[0].email;
            }
            const work = data.emails.find(
                (element) => element.label === 'work'
            );
            if (work) {
                contactObj.emails.work = work.email;
            } else if (data.emails[1]) {
                contactObj.emails.work = data.emails[1].email;
            }
        }
        console.log('contactObj', contactObj);
        return contactObj;
    };

    importSelectedContact = (contact) => {
        const data = this.formatContact(contact);
        console.log('+++++++selected cntact:', data);
        // TODO: get callback here
        if (Object.keys(data).length <= 0) {
            this.setState({
                modalVisible: false
            });
            return;
        }
        this.setState({
            emailAddresses: data.emails,
            phoneNumbers: data.phoneNumbers,
            reloadProfileImage: data.profileImage,
            name: data.name
        });
    };

    profileHasInvalidNumbers = () => {
        const { phoneNumbers } = this.state;
        if (
            phoneNumbers.mobile &&
            (phoneNumbers.mobile.startsWith(881) ||
                phoneNumbers.mobile.startsWith(870))
        ) {
            Toast.show({
                text1: 'Please enter a valid code for mobile number'
            });
            return true;
        }
        if (
            phoneNumbers.land &&
            (phoneNumbers.land.startsWith(881) ||
                phoneNumbers.land.startsWith(870))
        ) {
            Toast.show({
                text1: 'Please enter a valid code for landline number'
            });
            return true;
        }
        return false;
    };

    isEmpty = (str) => !str || str.length === 0;

    saveProfile = () => {
        if (this.profileHasInvalidNumbers()) {
            return;
        }
        const { home, work } = this.state.emailAddresses;
        if (home && !isEmail(_.trim(home))) {
            this.setState({
                emailErrorMessage: {
                    home: I18n.t('Not_an_email')
                }
            });
            return;
        }
        if (work && !isEmail(_.trim(work))) {
            this.setState({
                emailErrorMessage: {
                    work: I18n.t('Not_an_email')
                }
            });
            return;
        }
        this.setState({ loading: true });
        const saveLocalContactData = {
            localContacts: [
                {
                    userName: this.state.name,
                    emailAddresses: this.state.emailAddresses,
                    phoneNumbers: {
                        mobile: this.state.phoneNumbers.mobile,
                        land: this.state.phoneNumbers.land,
                        satellite: this.state.phoneNumbers.satellite
                    }
                }
            ]
        };

        if (this.props.route.params.contact) {
            saveLocalContactData.userIds = [this.props.route.params.contact.id];
            saveLocalContactData.localContacts[0].userId =
                this.props.route.params.contact.id;
            ContactServices.update(saveLocalContactData)
                .then(() => {
                    Store.dispatch(completeContactsLoad(false));
                    return Contact.fetchGrpcContacts(this.state.user);
                })
                .then(() => {
                    this.setState({ loading: false });
                    this.props.route.params.contact.name = this.state.name;
                    this.props.route.params.contact.emailAddresses =
                        this.state.emailAddresses;
                    this.props.route.params.contact.phoneNumbers =
                        saveLocalContactData.localContacts[0].phoneNumbers;
                    this.props.route.params.updateContact();
                    setTimeout(() => NavigationAction.pop(), 100);
                })
                .catch((err) => {
                    console.log('error on saving local contact ', err);
                    this.setState({ loading: false });
                });
        } else {
            // saveLocalContactData.userIds = [this.props.route.params.contact.id]; //TODO:
            // saveLocalContactData.localContacts[0].userId =  ?//TODO:
            ContactServices.add(saveLocalContactData)
                .then((result) => {
                    if (result.error === 0) {
                        Store.dispatch(completeContactsLoad(false));
                        return Contact.fetchGrpcContacts(this.state.user);
                    } else {
                        this.setState({ loading: false });
                    }
                })
                .then(() => {
                    this.setState({ loading: false });
                    if (this.props.route.params.selectedContact) {
                        NavigationAction.push(
                            NavigationAction.SCREENS.contactsCallMenu
                        );
                    } else {
                        NavigationAction.pop();
                    }
                })
                .catch((err) => {
                    console.log('error on saving local contact ', err);
                    this.setState({ loading: false });
                });
        }
    };

    renderTopArea() {
        return (
            <View style={styles.profileImageContainer}>
                <Image
                    source={images.user_image}
                    style={styles.profileImgStyle}
                />
            </View>
        );
    }

    renderNameBar() {
        return (
            <View style={styles.nameContainerStyle}>
                <TextInput
                    accessibilityLabel="Name"
                    testID="name"
                    style={styles.input}
                    autoCorrect={false}
                    value={this.state.name}
                    onChangeText={(val) => {
                        this.setState({ name: val });
                    }}
                    blurOnSubmit={false}
                    underlineColorAndroid="transparent"
                    placeholderTextColor={GlobalColors.formPlaceholderText}
                    placeholder="enter full name"
                    clearButtonMode="never"
                />
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
                {this.infoRender('home')}
                {this.infoRender('work')}
            </View>
        );
    }

    renderBottomArea() {
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
                    onPress={() => {
                        this.saveProfile();
                    }}
                    style={
                        this.state.name
                            ? styles.save_btn
                            : styles.save_btn_disabled
                    }
                    disabled={!this.state.name}
                >
                    <Text style={styles.save_btn_text}>{I18n.t('SAVE')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.safeAreaStyle}>
                    <ScrollView
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.mainViewContainer}>
                            <Loader loading={this.state.loading} />
                            {this.renderTopArea()}
                            {this.renderNameBar()}
                            {this.renderNumbers()}
                            {this.renderEmails()}
                            {this.renderBottomArea()}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

export default NewContactScreen;
