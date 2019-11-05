import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    PermissionsAndroid,
    Alert,
    InteractionManager
} from 'react-native';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import ImageLoad from 'react-native-image-placeholder';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
// import { Contact } from '../../lib/capability';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import { CallQuotaEvents } from '../../lib/events';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import NewChatItemSeparator from './NewChatItemSeparator';
import NewChatSectionHeader from './NewChatSectionHeader';
import { Message, MessageTypeConstants } from '../../lib/capability';
import NewChatIndexView from './NewChatIndexView';
import NewChatRow from './NewChatRow';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import Images from '../../config/images';
import ProfileImage from '../ProfileImage';
import Modal from 'react-native-modal';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { Icons } from '../../config/icons';
import { EmptyContact } from '../ContactsPicker';
import { BackgroundImage } from '../BackgroundImage';
const R = require('ramda');
import Contacts from 'react-native-contacts';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

import DStyles from '../Dialler/styles';
import Bot from '../../lib/bot';
import contactsStyles from '../ContactsPicker/styles';
import GlobalColors from '../../config/styles';
import { LargeList } from 'react-native-largelist-v3';
import { NETWORK_STATE } from '../../lib/network';

var EventListeners = [];
const MESSAGE_TYPE = MessageTypeConstants.MESSAGE_TYPE_UPDATE_CALL_QUOTA;

class NewCallContacts extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            contactVisible: false,
            contactSelected: null,
            updatingCallQuota: false,
            searchString: '',
            sectionTitles: [],
            filteredSections: []
        };
    }

    componentDidMount() {
        this.initBackGroundBot();
        EventListeners.push(
            EventEmitter.addListener(
                CallQuotaEvents.UPDATED_QUOTA,
                this.handleCallQuotaUpdateSuccess
            )
        );

        EventListeners.push(
            EventEmitter.addListener(
                CallQuotaEvents.UPD_QUOTA_ERROR,
                this.handleCallQuotaUpdateFailure
            )
        );

        this.refresh(this.props.appState.phoneContacts);

        // InteractionManager.runAfterInteractions(() => {
        //     if (Platform.OS === 'android') {
        //         PermissionsAndroid.request(
        //             PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        //             {
        //                 title: 'Contacts',
        //                 message:
        //                     'Grant access for contacts to display in FrontM'
        //             }
        //         )
        //             .then(granted => {
        //                 if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //                     this.gettingAllContactData();
        //                 } else {
        //                     this.refresh([]);
        //                 }
        //             })
        //             .catch(err => {
        //                 console.log('PermissionsAndroid', err);
        //             });
        //     } else {
        //         this.gettingAllContactData();
        //     }
        // });
    }

    componentDidUpdate(prevProps) {}

    componentWillUnmount() {
        EventListeners.forEach(listener => listener.remove());
        EventListeners = [];
    }

    initBackGroundBot = async () => {
        const message = new Message({
            msg: {
                callQuotaUsed: 0
            },
            messageType: MESSAGE_TYPE
        });
        message.setCreatedBy({ addedByBot: true });
        var bgBotScreen = new BackgroundBotChat({
            bot: SystemBot.backgroundTaskBot
        });

        this.setState({ updatingCallQuota: true, bgBotScreen });
        bgBotScreen.initialize().then(() => {
            bgBotScreen.next(message, {}, [], bgBotScreen.getBotContext());
        });
    };

    getCredit() {
        Actions.getCredit({ currentBalance: this.state.callQuota });
        // console.log('In Get Credit');

        this.setContactVisible(false, null);

        // Bot.getInstalledBots()
        //     .then(bots => {
        //         // console.log(bots);
        //         dwIndex = R.findIndex(R.propEq('botId', 'DigitalWallet'))(bots);
        //         if (dwIndex < 0) {
        //             return Alert.alert(
        //                 'You have to download DigitalWallet Bot to buy Credits'
        //             );
        //         }
        //         const DWBot = bots[dwIndex];
        //         // Actions.botChat({bot: DWBot})
        //         // Actions.pop();
        //         setTimeout(() => Actions.botChat({ bot: DWBot }), 0);
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         Alert.alert('An error occured');
        //     });
    }
    handleCallQuotaUpdateSuccess = ({ callQuota }) => {
        this.setState({
            callQuota,
            updatingCallQuota: false,
            callQuotaUpdateError: false
        });
    };

    handleCallQuotaUpdateFailure = ({ error }) => {
        this.setState({
            updatingCallQuota: false,
            callQuotaUpdateError: true
        });
    };

    static onEnter() {
        // const user = Store.getState().user;
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            'Phone Contacts',
            I18n.t('Contacts')
        );
        // Store.dispatch(refreshContacts(true));
    }

    static onExit() {
        // Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === 'Phone Contacts';
    }

    setContactVisible = (value, contact) =>
        this.setState({ contactVisible: value, contactSelected: contact });

    createAddressBook = contacts => {
        const Alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
        const uniqId = R.eqProps('userId');
        const contactsUniq = R.uniqWith(uniqId)(contacts);

        const phoneContacts = contactsUniq.map(contact => ({
            ...contact,
            userName: contact.userName
                ? contact.name
                    .trim()
                    .split(' ')
                    .map(
                        word =>
                            `${word.charAt(0).toUpperCase()}${word.slice(1)}`
                    )
                    .join(' ')
                : ''
        }));

        const PhoneContacts = Alphabets.map(letter => {
            let contactBook = [];
            if (letter !== '#') {
                contactBook = phoneContacts
                    .filter(
                        contact =>
                            contact.userName.charAt(0).toUpperCase() ===
                            letter.toUpperCase()
                    )
                    .map(contact => {
                        const yeahMail =
                            contact.emails.length > 0
                                ? contact.emails[0].email
                                : undefined;
                        return {
                            id: contact.userId,
                            name: contact.userName,
                            profileImage: contact.profileImage,
                            emails: [{ email: yeahMail }],
                            phoneNumbers: [...contact.phoneNumbers] || undefined
                        };
                    });
            } else {
                contactBook = phoneContacts
                    .filter(
                        contact => !contact.userName.charAt(0).match(/[a-z]/i)
                    )
                    .map(contact => {
                        const yeahMail =
                            contact.emails.length > 0
                                ? contact.emails[0].email
                                : undefined;
                        let name = '';
                        if (contact.userName !== '') {
                            name = contact.userName;
                        } else if (yeahMail) {
                            name = yeahMail;
                        } else if (contact.phoneNumbers.length > 0) {
                            name = contact.phoneNumbers[0].number;
                        } else {
                            name = 'No Name';
                        }

                        return {
                            id: contact.userId,
                            name,
                            profileImage: contact.profileImage,
                            emails: [{ email: yeahMail }],
                            phoneNumbers: [...contact.phoneNumbers] || undefined
                        };
                    });
            }
            return {
                title: letter,
                items: contactBook
            };
        });
        return PhoneContacts;
    };

    refresh = contacts => {
        // this.dataSource.loadData()
        if (!contacts) {
            return;
        }
        const AddressBook = this.createAddressBook(contacts);

        let newAddressBook = AddressBook.filter(elem => {
            return elem.items.length > 0;
        });
        this.setState({ contactsData: newAddressBook });
    };

    filter = () => {
        if (this.state.searchString.length > 0) {
            const filteredContacts = this.props.appState.phoneContacts.filter(
                contact =>
                    contact.userName
                        .toLowerCase()
                        .includes(this.state.searchString.toLowerCase())
            );
            this.refresh(filteredContacts);
        }

        // const sectionTitles = _.map(
        //     this.state.contactsData,
        //     section => section.title
        // );
        // let filteredSections = [];

        // if (sectionTitles && sectionTitles.length > 0) {
        //     filteredSections = [...this.state.contactsData];
        //     if (this.state.searchString.length > 0) {
        //         filteredSections = this.state.contactsData.map(section => {
        //             let data = section.data.filter(contact =>
        //                 contact.name
        //                     .toLowerCase()
        //                     .includes(this.state.searchString.toLowerCase())
        //             );
        //             return {
        //                 ...section,
        //                 data: data
        //             };
        //         });
        //     }
        // }
        // this.setState({ filteredSections, sectionTitles });
    };

    renderItem(path) {
        const contact = this.state.contactsData[path.section].items[path.row];

        const placeHolderImage = require('../../images/avatar-icon-placeholder/Default_Image_Thumbnail.png');
        // const testImage = (
        //     <Image
        //         source={{ uri: contact.profileImage }}
        //         style={styles.avatarImage}
        //         resizeMode="cover"
        //     />
        // );
        const ImageProf = (
            <ImageLoad
                style={styles.avatarImage}
                resizeMode="cover"
                source={{ uri: contact.profileImage }}
                isShowActivity={false}
                placeholderStyle={styles.avatarImage}
                borderRadius={styles.avatarImage.width / 2}
                placeholderSource={placeHolderImage}
            />
        );
        // const Image = (
        //     <ProfileImage
        //         uuid={contact.id}
        //         placeholder={Images.user_image}
        //         style={styles.avatarImage}
        //         placeholderStyle={styles.avatarImage}
        //         resizeMode="cover"
        //     />
        // );
        return (
            <View>
                <NewChatRow
                    key={contact.id}
                    item={contact}
                    title={contact.name}
                    image={ImageProf}
                    id={contact.id}
                    onItemPressed={this.onContactSelected}
                    email={contact.emails[0].email}
                />
            </View>
        );
    }
    onContactSelected = contact => {
        if (contact.phoneNumbers) {
            this.setContactVisible(true, contact);
            return;
        }

        this.setState({ contactSelected: contact, contactVisible: false }, () =>
            this.makeVoipCall()
        );
    };

    onSideIndexItemPressed(item) {
        const sectionIndex = _.findIndex(
            this.state.contactsData,
            section => section.title === item
        );
        this.contactsList.scrollToLocation({
            sectionIndex: sectionIndex,
            itemIndex: 0,
            viewOffset: SECTION_HEADER_HEIGHT
        });
    }

    renderSearchBar() {
        return (
            <View style={contactsStyles.searchBar}>
                {Icons.search({
                    size: 18,
                    color: GlobalColors.frontmLightBlue,
                    iconStyle: { paddingHorizontal: 10 }
                })}
                <TextInput
                    autoCorrect={false}
                    style={contactsStyles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search contact"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={text =>
                        this.setState({ searchString: text }, () => {
                            this.filter();
                        })
                    }
                    value={this.state.searchString}
                    clearButtonMode="always"
                />
            </View>
        );
    }

    renderContactsList() {
        if (this.state.contactsData.length > 0) {
            return (
                <View style={styles.addressBookContainer}>
                    {/* {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null} */}

                    <LargeList
                        style={styles.addressBook}
                        data={this.state.contactsData}
                        heightForSection={() => 30}
                        renderSection={section => {
                            const sec = this.state.contactsData[section].title;
                            return <NewChatSectionHeader title={sec} />;
                        }}
                        heightForIndexPath={() => 50}
                        renderIndexPath={this.renderItem.bind(this)}
                    />

                    {/* <SectionList
                        ItemSeparatorComponent={NewChatItemSeparator}
                        style={styles.addressBook}
                        renderItem={this.renderItem.bind(this)}
                        renderSectionHeader={({ section }) => (
                            <NewChatSectionHeader title={section.title} />
                        )}
                        sections={this.state.filteredSections}
                        keyExtractor={(item, index) => item.id}
                        removeClippedSubviews={true}
                    /> */}
                    {/* <NewChatIndexView
                        onItemPressed={this.onSideIndexItemPressed.bind(this)}
                        items={sectionTitles}
                    /> */}
                </View>
            );
        } else {
            return <EmptyContact />;
        }
    }

    makeVoipCall = () => {
        const { contactSelected } = this.state;
        if (!contactSelected) {
            alert('Sorry, cannot make call!');
            return;
        }
        this.setContactVisible(false, null);
        let participants = [
            {
                userId: contactSelected.id,
                userName: contactSelected.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                call: true
            });
        });
    };

    onClickDialpad = () => {
        Actions.dialCall();
    };

    makePstnCall = number => {
        if (this.props.appState.network !== NETWORK_STATE.none) {
            const { contactSelected } = this.state;
            if (!contactSelected) {
                alert('Sorry, cannot make call!');
                return;
            }
            this.setContactVisible(false, null);
            Actions.dialler({
                call: true,
                number: number,
                contact: this.state.contactSelected,
                newCallScreen: true
            });
        } else {
            Alert.alert('No netwrok connection', 'Cannot make the call', [
                { text: 'OK' }
            ]);
        }
    };

    phoneNumbers = () => {
        const { contactSelected } = this.state;
        const phoneNumbers = contactSelected
            ? contactSelected.phoneNumbers
            : null;

        phoneNumbers.map(phoneNum => {
            return (
                <View style={styles.phoneContainer}>
                    <View style={styles.modalTextContainerImg}>
                        <Image
                            style={{
                                width: 16,
                                height: 16
                            }}
                            source={require('../../images/tabbar-contacts/phone-good.png')}
                            resizeMode="contain"
                        />
                        <Text style={styles.modalText}>Mobile</Text>
                    </View>
                    <View style={styles.modalNumberContainer}>
                        <Text
                            style={{
                                color: 'rgba(155,155,155,1)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {
                                (phoneNumlabel = 'mobile'
                                    ? phoneNum.number
                                    : 'Not Available')
                            }
                        </Text>
                    </View>
                    <View style={styles.modalCallButContainer}>
                        <TouchableOpacity
                            style={
                                contactSelected.phoneNumbers.length > 0
                                    ? styles.callButton
                                    : styles.callButtonDisabled
                            }
                            onPress={() =>
                                this.makePstnCall(phoneNumbers.mobile)
                            }
                            disabled={
                                !(
                                    contactSelected.phoneNumbers &&
                                    contactSelected.phoneNumbers.length > 0
                                )
                            }
                        >
                            {Icons.greenCallOutline({ size: 16 })}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        });
    };

    renderModal(contactSelected, phoneNumbers) {
        return (
            <Modal
                isVisible={this.state.contactVisible}
                onBackdropPress={() => {
                    this.setContactVisible(false, null);
                }}
                onBackButtonPress={() => this.setContactVisible(false, null)}
                onSwipe={() => this.setContactVisible(false, null)}
                swipeDirection="right"
            >
                {contactSelected ? (
                    <View style={styles.contactModal}>
                        <View style={styles.modalContainer}>
                            <ProfileImage
                                uuid={contactSelected.id}
                                placeholder={Images.user_image}
                                style={styles.avatarImageModal}
                                placeholderStyle={styles.avatarImageModal}
                                resizeMode="cover"
                            />
                            <View style={styles.nameContainer}>
                                <Text style={styles.modalContactName}>
                                    {contactSelected.name}
                                </Text>
                            </View>
                            {phoneNumbers.map((phoneNum, index, pNumbers) => {
                                return (
                                    <View
                                        style={
                                            pNumbers.length - 1 === index
                                                ? styles.phoneContainerNoBorder
                                                : styles.phoneContainer
                                        }
                                    >
                                        <View
                                            style={styles.modalTextContainerImg}
                                        >
                                            <Image
                                                style={{
                                                    width: 16,
                                                    height: 16
                                                }}
                                                source={require('../../images/tabbar-contacts/phone-good.png')}
                                                resizeMode="contain"
                                            />
                                            <Text style={styles.modalText}>
                                                {phoneNum.label}
                                            </Text>
                                        </View>
                                        <View
                                            style={styles.modalNumberContainer}
                                        >
                                            <Text
                                                style={{
                                                    color:
                                                        'rgba(155,155,155,1)',
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                {phoneNum.number &&
                                                phoneNum.number !== ''
                                                    ? phoneNum.number
                                                    : 'Not Available'}
                                            </Text>
                                        </View>
                                        <View
                                            style={styles.modalCallButContainer}
                                        >
                                            <TouchableOpacity
                                                style={
                                                    contactSelected.phoneNumbers
                                                        .length > 0
                                                        ? styles.callButton
                                                        : styles.callButtonDisabled
                                                }
                                                onPress={() =>
                                                    this.makePstnCall(
                                                        phoneNum.number
                                                    )
                                                }
                                                disabled={
                                                    !(
                                                        contactSelected.phoneNumbers &&
                                                        contactSelected
                                                            .phoneNumbers
                                                            .length > 0
                                                    )
                                                }
                                            >
                                                {Icons.greenCallOutline({
                                                    size: 16
                                                })}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                            <View />
                        </View>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: hp('9%')
                            }}
                        >
                            <Text style={{ marginLeft: 10 }}>
                                {' Current balance: '}
                                <Text>
                                    {this.state.updatingCallQuota
                                        ? '...'
                                        : this.state.callQuota}
                                </Text>
                            </Text>
                            <TouchableOpacity
                                style={{
                                    ...DStyles.callQuotaBuy
                                }}
                                onPress={this.getCredit.bind(this)}
                                disabled={this.state.updatingCallQuota}
                            >
                                <Text
                                    style={{
                                        color: GlobalColors.frontmLightBlue,
                                        fontSize: 18
                                    }}
                                >
                                    Get credit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View />
                )}
            </Modal>
        );
    }

    render() {
        const { contactSelected } = this.state;
        const phoneNumbers = contactSelected
            ? contactSelected.phoneNumbers
            : null;

        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    {this.renderSearchBar()}
                    {this.renderContactsList()}
                    {/* <TouchableOpacity
                        style={{
                            position: 'absolute',
                            width: 160,
                            height: 40,
                            backgroundColor: 'rgba(47,199,111,1)',
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            bottom: '5%',
                            alignSelf: 'center'
                        }}
                        onPress={() => this.onClickDialpad()}
                    >
                        <Image
                            style={{ width: 11, height: 16, marginRight: 10 }}
                            source={require('../../images/contact/tab-dialpad-icon-active.png')}
                        />
                        <Text style={{ color: '#fff' }}>DialPad</Text>
                    </TouchableOpacity> */}
                    {this.renderModal(contactSelected, phoneNumbers)}
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}
const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewCallContacts);
