import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Alert,
    ScrollView,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import { SafeAreaView } from 'react-navigation';
import images from '../../config/images';
import Config from './config';
import { Auth, Media, Contact } from '../../lib/capability';
import { Actions } from 'react-native-router-flux';
import Loader from '../Loader/Loader';
import { BotInputBarCapabilities } from '../ChatBotScreen/BotConstants';
import ActionSheet from '@yfuks/react-native-action-sheet';
import I18n from '../../config/i18n/i18n';

import { MyProfileImage } from '../ProfileImage';
import { HeaderBack } from '../Header';
import LocalContactModal from './LocalContactModal';
import {
    AddLocalContacts,
    UpdateLocalContacts
} from '../../api/ContactServices';
import Store from '../../redux/store/configureStore';
import { completeContactsLoad } from '../../redux/actions/UserActions';

class NewContactScreen extends React.Component {
    static navigationOptions({ navigation }) {
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
            name:
                this.props.contact && this.props.contact.name
                    ? this.props.contact.name
                    : '',
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
            emailAddresses:
                this.props.contact && this.props.contact.emailAddresses
                    ? this.props.contact.emailAddresses
                    : {
                        home: '',
                        work: ''
                    },
            currentIndex: null,
            loading: false,
            modalVisible: false
        };
        this.mounted = true;
    }

    componentDidMount() {
        if (this.props.contact && this.props.contact.phoneNumbers) {
            if (this.props.contact.phoneNumbers.mobile) {
                const mobile = this.props.contact.phoneNumbers.mobile.split(
                    ' '
                );
                if (mobile.length > 1) {
                    this.state.phoneNumbers.mobile = mobile[1];
                    this.state.prefixes.mobile = mobile[0];
                } else {
                    this.state.phoneNumbers.mobile = mobile[0];
                }
            }
            if (this.props.contact.phoneNumbers.land) {
                const land = this.props.contact.phoneNumbers.land.split(' ');
                if (land.length > 1) {
                    this.state.phoneNumbers.land = land[1];
                    this.state.prefixes.land = land[0];
                } else {
                    this.state.phoneNumbers.land = land[0];
                }
            }
            if (this.props.contact.phoneNumbers.satellite) {
                const satellite = this.props.contact.phoneNumbers.satellite.split(
                    ' '
                );
                if (satellite.length > 1) {
                    this.state.phoneNumbers.satellite = satellite[1];
                    this.state.prefixes.satellite = satellite[0];
                } else {
                    this.state.phoneNumbers.satellite = satellite[0];
                }
            }
            this.setState({ phoneNumbers: this.state.phoneNumbers });
        }
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

    infoRender = (type, myInfoData) => {
        let icon;
        if (type === 'land' || type === 'mobile') {
            icon = (
                <Image source={images.phone_icon} style={styles.phoneIcon} />
            );
        } else if (type === 'satellite') {
            icon = (
                <Image source={images.satellite} style={styles.satelliteIcon} />
            );
        } else if (type === 'home' || type === 'work') {
            icon = (
                <Image source={images.email_icon} style={styles.emailIcon} />
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
                                        maxLength={6}
                                        blurOnSubmit={false}
                                        onChangeText={text => {
                                            let numbers = this.state.prefixes;
                                            numbers[type] = text.replace(
                                                /[^0-9]/,
                                                ''
                                            );
                                            this.setState({ prefixes: numbers });
                                        }}
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor="rgba(155,155,155,1)"
                                    />
                                </View>
                                <TextInput
                                    style={styles.inputNumber}
                                    value={this.state.phoneNumbers[type]}
                                    keyboardType="phone-pad"
                                    autoCorrect={false}
                                    maxLength={15}
                                    blurOnSubmit={false}
                                    onChangeText={text => {
                                        let numbers = this.state.phoneNumbers;
                                        numbers[type] = text;
                                        this.setState({ phoneNumbers: numbers });
                                    }}
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                />
                            </View>
                        ) : (
                            <TextInput
                                style={styles.inputNumber}
                                value={this.state.emailAddresses[type]}
                                keyboardType="email-address"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                onChangeText={text => {
                                    let emails = this.state.emailAddresses;
                                    emails[type] = text;
                                    this.setState({ emailAddresses: emails });
                                }}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor="rgba(155,155,155,1)"
                            />
                        )}
                </View>
            </View>
        );
    };

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
        if (Object.keys(data).length <= 0) {
            this.setState({ modalVisible: false });
            return;
        }
        this.setState({
            emailAddresses: data.emails,
            phoneNumbers: data.phoneNumbers,
            reloadProfileImage: data.profileImage
        });
    };

    saveProfile = () => {
        this.setState({ loading: true });
        let saveLocalContactData = {
            localContacts: [
                {
                    userName: this.state.name,
                    emailAddresses: this.state.emailAddresses,
                    phoneNumbers: {
                        mobile:
                            this.state.prefixes.mobile +
                            ' ' +
                            this.state.phoneNumbers.mobile,
                        land:
                            this.state.prefixes.land +
                            ' ' +
                            this.state.phoneNumbers.land,
                        satellite:
                            this.state.prefixes.satellite +
                            ' ' +
                            this.state.phoneNumbers.satellite
                    }
                }
            ]
        };

        if (this.props.contact) {
            saveLocalContactData.userIds = [this.props.contact.id];
            saveLocalContactData.localContacts[0].userId = this.props.contact.id;
            UpdateLocalContacts(saveLocalContactData)
                .then(() => {
                    Store.dispatch(completeContactsLoad(false));
                    return Contact.fetchGrpcContacts(this.state.user);
                })
                .then(() => {
                    this.setState({ loading: false });
                    this.props.contact.name = this.state.name;
                    this.props.contact.emailAddresses = this.state.emailAddresses;
                    this.props.contact.phoneNumbers =
                        saveLocalContactData.localContacts[0].phoneNumbers;
                    this.props.updateContact();
                    setTimeout(() => Actions.pop(), 100);
                })
                .catch(err => {
                    console.log('error on saving local contact ', err);
                    this.setState({ loading: false });
                });
        } else {
            AddLocalContacts(saveLocalContactData)
                .then(() => {
                    Store.dispatch(completeContactsLoad(false));
                    return Contact.fetchGrpcContacts(this.state.user);
                })
                .then(() => {
                    this.setState({ loading: false });
                    setTimeout(() => Actions.pop(), 100);
                })
                .catch(err => {
                    console.log('error on saving local contact ', err);
                    this.setState({ loading: false });
                });
        }
    };

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
            </View>
        );
    }

    renderNameBar() {
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
                        style={styles.input}
                        autoCorrect={false}
                        value={this.state.name}
                        onChangeText={val => {
                            this.setState({ name: val });
                        }}
                        blurOnSubmit={false}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor="rgba(155,155,155,1)"
                        clearButtonMode="always"
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
                        Actions.pop();
                    }}
                    style={styles.cancel_btn}
                >
                    <Text style={styles.cancel_text}>{I18n.t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        this.saveProfile();
                    }}
                    style={styles.save_btn}
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
                                        Import details from address book
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {this.renderBottomArea()}
                        </View>
                    </ScrollView>
                    <LocalContactModal
                        isVisible={this.state.modalVisible}
                        setVisible={this.setModalVisible.bind(this)}
                        selectedContact={this.importSelectedContact}
                    />
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

export default NewContactScreen;
