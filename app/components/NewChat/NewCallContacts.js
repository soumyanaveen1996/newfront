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
    NativeModules,
    FlatList,
    LayoutAnimation,
    UIManager,
    TouchableWithoutFeedback
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import {
    Contact,
    Auth,
    Network,
    Message,
    MessageTypeConstants
} from '../../lib/capability';
import {
    EventEmitter,
    AuthEvents,
    CallQuotaEvents,
    TwilioEvents
} from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import NewChatItemSeparator from './NewChatItemSeparator';
import NewChatSectionHeader from './NewChatSectionHeader';
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
import config from '../../config/config';
import InviteModal from '../ContactsPicker/InviteModal';
import { BackgroundBotChat } from '../../lib/BackgroundTask';
import Bot from '../../lib/bot';
import Calls from '../../lib/calls';
import GlobalColors from '../../config/styles';

const R = require('ramda');

let EventListeners = [];
const UserServiceClient = NativeModules.UserServiceClient;

class NewCallContacts extends React.Component {
    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            contactVisible: false,
            inviteModalVisible: false,
            contactSelected: null,
            callQuota: 0,
            callQuotaUpdateError: false,
            updatingCallQuota: false,
            filters: ['All Contacts', 'People', 'Vessels'],
            selectedFilter: 0,
            showFilterMenu: false
        };
    }

    async componentDidMount() {
        this.initBackGroundBot();
        // Subscribe to Events

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

        this.gettingAllContactData();
        if (
            Actions.prevScene === ROUTER_SCENE_KEYS.dialler &&
            this.props.summary
        ) {
            Actions.callSummary({
                time: this.props.time,
                contact: this.props.dialContact,
                dialledNumber: this.props.dialledNumber
            });
            return;
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.contactsLoaded !==
            this.props.appState.contactsLoaded
        ) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
            });
        }

        if (
            prevProps.appState.refreshContacts !==
            this.props.appState.refreshContacts
        ) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
            });
        }
    }

    initBackGroundBot = async () => {
        const message = new Message({
            msg: {
                callQuotaUsed: 0
            },
            messageType: MessageTypeConstants.MESSAGE_TYPE_UPDATE_CALL_QUOTA
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

    gettingAllContactData = () => {
        Contact.getAddedContacts().then(contacts => {
            this.refresh(contacts);
        });
    };

    static onEnter() {
        const user = Store.getState().user;
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('Contacts_call'),
            I18n.t('Contacts')
        );
        Store.dispatch(refreshContacts(true));
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
    }

    shouldComponentUpdate(nextProps) {
        console.log(
            'Sourav Logging:::: Current Scene',
            nextProps.appState.currentScene
        );
        return nextProps.appState.currentScene === I18n.t('Contacts_call');
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
                ? contact.userName
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
                    .map(contact => ({
                        id: contact.userId,
                        name: contact.userName,
                        emails: [{ email: contact.emailAddress }],
                        phoneNumbers: contact.phoneNumbers || undefined,
                        waitingForConfirmation: contact.waitingForConfirmation,
                        type: contact.type
                    }));
            } else {
                contactBook = phoneContacts
                    .filter(
                        contact => !contact.userName.charAt(0).match(/[a-z]/i)
                    )
                    .map(contact => ({
                        id: contact.userId,
                        name: contact.userName,
                        emails: [{ email: contact.emailAddress }],
                        phoneNumbers: contact.phoneNumber || undefined,
                        waitingForConfirmation: contact.waitingForConfirmation,
                        type: contact.type
                    }));
            }
            return {
                title: letter,
                data: contactBook
            };
        });
        return PhoneContacts;
    };

    refresh = contacts => {
        // this.dataSource.loadData()
        if (!contacts) {
            return;
        }
        const FrontMContacts = contacts.filter(contact => !contact.contactType);
        const AddressBook = this.createAddressBook(FrontMContacts);
        let newAddressBook = AddressBook.filter(elem => {
            return elem.data.length > 0;
        });
        this.setState({ contactsData: newAddressBook });
    };

    getCredit() {
        Bot.getInstalledBots()
            .then(bots => {
                // console.log(bots);
                dwIndex = R.findIndex(R.propEq('botId', 'DigitalWallet'))(bots);
                if (dwIndex < 0) {
                    return Alert.alert(
                        'You have to download DigitalWallet Bot to buy Credits'
                    );
                }
                const DWBot = bots[dwIndex];
                this.setContactVisible(false, null);
                Actions.botChat({ bot: DWBot });
            })
            .catch(err => {
                console.log(err);
                Alert.alert('An error occured');
            });
    }

    renderItem(info) {
        const contact = info.item;
        const image = (
            <ProfileImage
                uuid={contact.id}
                placeholder={Images.user_image}
                style={styles.avatarImage}
                placeholderStyle={styles.avatarImage}
                resizeMode="cover"
            />
        );
        return (
            <NewChatRow
                key={contact.id}
                item={contact}
                title={contact.name}
                image={image}
                id={contact.id}
                onItemPressed={this.onContactSelected}
                email={contact.emails[0].email}
                waitingForConfirmation={contact.waitingForConfirmation}
            />
        );
    }

    onContactSelected = contact => {
        this.setContactVisible(true, contact);
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

    onClickDialpad = () => {
        Actions.dialCall();
    };

    renderContactsList() {
        // console.log('all contacts ', this.state.contactsData);

        const sectionTitles = _.map(
            this.state.contactsData,
            section => section.title
        );
        if (sectionTitles && sectionTitles.length > 0) {
            let filteredContactsData = this.state.contactsData;
            if (this.state.selectedFilter !== 0) {
                filteredContactsData = this.state.contactsData.map(section => {
                    return {
                        title: section.title,
                        data: section.data.filter(contact => {
                            return (
                                contact.type ===
                                this.state.filters[this.state.selectedFilter]
                            );
                        })
                    };
                });
                filteredContactsData = filteredContactsData.filter(section => {
                    return section.data.length > 0;
                });
            }
            return (
                <View style={styles.addressBookContainer}>
                    {/* {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null} */}
                    <SectionList
                        ItemSeparatorComponent={NewChatItemSeparator}
                        ref={sectionList => {
                            this.contactsList = sectionList;
                        }}
                        style={[styles.addressBook, { marginTop: 65 }]}
                        renderItem={this.renderItem.bind(this)}
                        renderSectionHeader={({ section }) => (
                            <NewChatSectionHeader title={section.title} />
                        )}
                        sections={filteredContactsData}
                        keyExtractor={(item, index) => item.id}
                    />
                    {this.renderFilterMenu()}
                    {/* <NewChatIndexView
                        onItemPressed={this.onSideIndexItemPressed.bind(this)}
                        items={sectionTitles}
                    /> */}
                </View>
            );
        } else {
            return <EmptyContact inviteUser={this.inviteUser.bind(this)} />;
        }
    }

    renderFilterMenu() {
        return (
            <View style={styles.filterMenu}>
                <TouchableOpacity
                    style={styles.selectedFilter}
                    activeOpacity={1}
                    onPress={() => {
                        LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.easeInEaseOut
                        );
                        this.setState({
                            showFilterMenu: !this.state.showFilterMenu
                        });
                    }}
                >
                    <Text style={styles.filterText}>
                        Sort by:{' '}
                        <Text style={{ fontWeight: '500' }}>
                            {this.state.filters[this.state.selectedFilter]}
                        </Text>
                    </Text>
                    {this.state.showFilterMenu
                        ? Icons.arrowUp({ color: GlobalColors.textBlack })
                        : Icons.arrowDown({ color: GlobalColors.textBlack })}
                </TouchableOpacity>
                <View
                    style={[
                        styles.filterList,
                        { maxHeight: this.state.showFilterMenu ? 250 : 0 }
                    ]}
                >
                    <FlatList
                        data={this.state.filters}
                        extraData={this.state.selectedFilter}
                        renderItem={this.renderFilterRow.bind(this)}
                    />
                </View>
            </View>
        );
    }

    renderFilterRow({ item, index }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.setState({
                        selectedFilter: index,
                        showFilterMenu: false
                    });
                }}
                style={[
                    styles.selectedFilter,
                    {
                        backgroundColor:
                            index === this.state.selectedFilter
                                ? GlobalColors.frontmLightBlueTransparent
                                : 'transparent'
                    }
                ]}
            >
                <Text
                    style={[
                        styles.filterText,
                        {
                            fontWeight:
                                index === this.state.selectedFilter
                                    ? '500'
                                    : '200'
                        }
                    ]}
                >
                    {'           ' + item}
                </Text>
            </TouchableOpacity>
        );
    }

    inviteUser() {
        this.setInviteVisible(true);
    }

    setInviteVisible(value, sent = null) {
        this.setState(
            {
                inviteModalVisible: value
            },
            () => {
                if (sent !== null) {
                    setTimeout(() => {
                        this.invitationSent();
                    }, 500);
                }
            }
        );
    }

    addContacts(selectedContacts) {
        return new Promise((resolve, reject) => {
            Contact.addContacts(selectedContacts)
                .then(() => {
                    return Auth.getUser();
                })
                .then(user => {
                    const options = {
                        method: 'post',
                        url:
                            config.proxy.protocol +
                            config.proxy.host +
                            '/contactsActions',
                        headers: {
                            sessionId: user.creds.sessionId
                        },
                        data: {
                            capability: 'AddContact',
                            botId: 'onboarding-bot',
                            users: _.map(selectedContacts, contact => {
                                return contact.userId;
                            })
                        }
                    };
                    return Network(options);
                })
                .then(() => {
                    resolve();
                });
        });
    }

    invitationSent = () => {
        return Alert.alert(
            'Invitation sent successfully',
            '',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        console.log('OK Pressed');
                    }
                }
            ],
            { cancelable: false }
        );
    };

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

    makePstnCall = number => {
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
    };

    renderPSTNPhoneModal(contactSelected, phoneNumbers) {
        if (phoneNumbers && phoneNumbers.mobile) {
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
                        <Text style={styles.modalText}>Mobile </Text>
                    </View>
                    <View style={styles.modalNumberContainer}>
                        <Text
                            style={{
                                color: 'rgba(155,155,155,1)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {phoneNumbers.mobile
                                ? phoneNumbers.mobile
                                : 'Not Available'}
                        </Text>
                    </View>
                    <View style={styles.modalCallButContainer}>
                        <TouchableOpacity
                            style={
                                contactSelected.phoneNumbers
                                    ? styles.callButton
                                    : styles.callButtonDisabled
                            }
                            onPress={() =>
                                this.makePstnCall(phoneNumbers.mobile)
                            }
                            disabled={
                                !(
                                    contactSelected.phoneNumbers &&
                                    contactSelected.phoneNumbers.mobile
                                )
                            }
                        >
                            {Icons.greenCallOutline({ size: 16 })}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    renderLocalPhoneModal(contactSelected, phoneNumbers) {
        if (phoneNumbers && phoneNumbers.local) {
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
                        <Text style={styles.modalText}>Phone*</Text>
                    </View>
                    <View style={styles.modalNumberContainer}>
                        <Text
                            style={{
                                color: 'rgba(155,155,155,1)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {phoneNumbers.local
                                ? phoneNumbers.local
                                : 'Not Available'}
                        </Text>
                    </View>
                    <View style={styles.modalCallButContainer}>
                        <TouchableOpacity
                            style={
                                contactSelected.phoneNumbers
                                    ? styles.callButton
                                    : styles.callButtonDisabled
                            }
                            onPress={() =>
                                this.makePstnCall(phoneNumbers.local)
                            }
                            disabled={
                                !(
                                    contactSelected.phoneNumbers &&
                                    contactSelected.phoneNumbers.local
                                )
                            }
                        >
                            {Icons.greenCallOutline({ size: 16 })}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    renderSatelliteModal(contactSelected, phoneNumbers) {
        if (phoneNumbers && phoneNumbers.satellite) {
            return (
                <View style={styles.phoneContainer}>
                    <View style={styles.modalTextContainerImg}>
                        <Image
                            style={styles.modalImage}
                            source={require('../../images/tabbar-contacts/sat-phone-3.png')}
                            resizeMode="contain"
                        />
                        <Text style={styles.modalText}>Satellite</Text>
                    </View>
                    <View style={styles.modalNumberContainer}>
                        <Text
                            style={{
                                color: 'rgba(155,155,155,1)'
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                        >
                            {phoneNumbers.satellite
                                ? phoneNumbers.satellite
                                : 'Not Available'}
                        </Text>
                    </View>
                    <View style={styles.modalCallButContainer}>
                        <TouchableOpacity
                            disabled={phoneNumbers.satellite ? false : true}
                            style={
                                phoneNumbers.satellite
                                    ? styles.callButton
                                    : styles.callButtonDisabled
                            }
                            onPress={() =>
                                this.makePstnCall(phoneNumbers.satellite)
                            }
                        >
                            {Icons.greenCallOutline({ size: 16 })}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    renderVoipModal(contactSelected, phoneNumbers) {
        return (
            <View style={styles.phoneContainer}>
                <View style={styles.modalTextContainerImg}>
                    <Image
                        style={styles.modalImage}
                        source={require('../../images/tabbar-marketplace/tabbar-marketplace.png')}
                    />
                    <Text style={styles.modalText}>FrontM</Text>
                </View>
                <View style={styles.modalNumberContainer}>
                    <Text style={{ color: 'rgba(47,199,111,1)' }}>*Free</Text>
                </View>
                <View style={styles.modalCallButContainer}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={this.makeVoipCall}
                    >
                        {Icons.greenCallOutline({ size: 16 })}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderCallModal(contactSelected, phoneNumbers) {
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
                            {this.renderPSTNPhoneModal(
                                contactSelected,
                                phoneNumbers
                            )}
                            {this.renderLocalPhoneModal(
                                contactSelected,
                                phoneNumbers
                            )}
                            {this.renderSatelliteModal(
                                contactSelected,
                                phoneNumbers
                            )}
                            {this.renderVoipModal(
                                contactSelected,
                                phoneNumbers
                            )}
                        </View>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceText}>
                                Current Balance:{' '}
                                <Text style={{ color: 'black' }}>
                                    {' '}
                                    ${this.state.callQuota}
                                </Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.getCretidButton}
                                onPress={this.getCredit.bind(this)}
                                disabled={this.state.updatingCallQuota}
                            >
                                <Text style={styles.getCreditText}>
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
                    {this.renderContactsList()}
                    <InviteModal
                        isVisible={this.state.inviteModalVisible}
                        setVisible={this.setInviteVisible.bind(this)}
                        addContacts={this.addContacts.bind(this)}
                    />
                    <TouchableOpacity
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
                    </TouchableOpacity>
                    {this.renderCallModal(contactSelected, phoneNumbers)}
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
