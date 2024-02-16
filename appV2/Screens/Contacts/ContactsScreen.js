import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Keyboard,
    UIManager,
    FlatList
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
import styles from './styles';
import GlobalColors from '../../config/styles';
import FrontMAddedContactsPickerDataSource from '../../lib/utils/FrontMAddedContactsPickerDataSource';
import ContactsPickerRow from './ContactComponents/ContactsPickerRow';
import ContactPickerRowRemoteSearch from './ContactComponents/ContactPickerRowRemoteSearch';
import ContactsPickerSectionHeader from './ContactComponents/ContactsPickerSectionHeader';
import InviteModal from './ContactComponents/InviteModal';
import EmptyContact from './ContactComponents/EmptyContact';
import { SECTION_HEADER_HEIGHT, searchBarConfig } from './config';
import SystemBot from '../../lib/bot/SystemBot';
import {
    Contact,
    Settings,
    PollingStrategyTypes,
    Auth
} from '../../lib/capability';
import Store from '../../redux/store/configureStore';
import EventEmitter, { AuthEvents } from '../../lib/events';
import I18n from '../../config/i18n/i18n';
import {
    setCurrentScene,
    refreshContacts,
    setNetwork,
    setNetworkMsgUI
} from '../../redux/actions/UserActions';
import { Icon } from '@rneui/themed';

import { NetworkStatusNotchBar } from '../../widgets';
import images from '../../config/images';
import ContactsEvents from '../../lib/events/Contacts';
import Icons from '../../config/icons';
import { HeaderTitle } from '../../widgets/Header';
import { ContactType } from '../../lib/capability/Contact';
import config from '../../config/config';

import { NETWORK_STATE } from '../../lib/network';
import Loader from '../../widgets/Loader';
import AsyncStorage from '@react-native-community/async-storage';
import ContactServices from '../../apiV2/ContactServices';
import NavigationAction from '../../navigation/NavigationAction';
import DomainEvents from '../../lib/events/DomainEvents';
import IconSearch from 'react-native-vector-icons/Ionicons';
import TimelineBuilder from '../../lib/TimelineBuilder/TimelineBuilder';
import { Conversation } from '../../lib/conversation';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import SearchBar from '../../widgets/SearchBar';
import configToUse from '../../config/config';
import AlertDialog from '../../lib/utils/AlertDialog';
import SimpleLoader, { FullScreenLoader } from '../../widgets/SimpleLoader';
import AppFonts from '../../config/fontConfig';

class ContactsPicker extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],
            myContacts: [],
            selectedContacts: [],
            inviteModalVisible: false,
            userInfo: {},
            userId: '',
            searchString: '',
            refreshing: false,
            titleText: 'Selected',
            profileImageRefreshToggle: true,
            isConnectionRequest: false,
            isSearchPresent: true,
            remoteUserData: [],
            remoteUsersExists: false,
            searchExecuted: false,
            mainLoading: true,
            tabScene: 'Contacts',
            newRquestsAndRejectedObj: {},
            newContactRequestLength: 0,
            showBadge: false
        };
        this.goToMyProfile = debounce(this.goToMyProfile.bind(this), 300);
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        this.viewabilityConfig = {
            waitForInteraction: true,
            viewAreaCoveragePercentThreshold: 95
        };
        this.countM = 0;
    }
    onChatStatusBarClose = () => {
        Store.dispatch(setNetworkMsgUI(false));
    };

    gettingUserDetails = () => {
        const userDetails = Auth.getUserData();
        const info = { ...userDetails.info };
        this.setState({
            userInfo: info,
            userId: info.userId,
            profileID: info.userId
        });
    };

    onProfileImageUpdate = () => {
        // TODO
        this.setState({ profileID: undefined }, () => {
            this.setState({ profileID: this.state.userInfo.userId });
        });
    };

    async componentDidMount() {
        this.gettingUserDetails();
        EventEmitter.addListener(
            AuthEvents.tabSelected,
            this.tabSelected.bind(this)
        );
        EventEmitter.addListener(ContactsEvents.contactsRefreshed, async () => {
            this.refresh();
            this.updateList();
        });
        this.domainEventLister = EventEmitter.addListener(
            DomainEvents.domainChanged,
            async () => {
                try {
                    await Contact.refreshContacts();
                    this.updateList();
                    this.setState({
                        refreshing: false
                    });
                } catch (e) {
                    this.setState({
                        refreshing: false
                    });
                }
            }
        );
        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage,
            inviteUser: this.inviteUser.bind(this)
        });

        if (this.props.appState.contactsLoaded) {
            this.refresh();
        }
        this.mounted = true;
        Contact.refreshContacts();
    }
    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.appState.filteredContactNewReqPending !==
                this.props.appState.filteredContactNewReqPending &&
            this.props.appState.filteredContactNewReqPending
        ) {
            this.updateStatesForPendingAndNewReq(
                this.props.appState.filteredContactNewReqPending
            );
        }
    }
    componentWillUnmount() {
        this.domainEventLister?.remove();
    }

    static onEnter() {
        const { user } = Store.getState();
        if (user.contactsLoaded === false) {
            Contact.refreshContacts();
        }
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Contacts'));
        Store.dispatch(refreshContacts(true));
    }

    async tabSelected(scene) {
        this.setState({
            contactsData: [],
            selectedContacts: [],
            inviteModalVisible: false,
            userInfo: {},
            userId: '',
            searchString: '',
            refreshing: false,
            titleText: 'Selected',
            profileImageRefreshToggle: true,
            isConnectionRequest: false,
            isSearchPresent: true,
            remoteUserData: [],
            searchExecuted: false,
            mainLoading: false
        });
    }

    callRefreshAndUpdate = () => {
        this.onEnter();
    };

    showConnectionMessage = (connectionType) => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        AlertDialog.show(I18n.t('Automatic_Network'), message);
    };

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

    async checkPollingStrategy() {
        const pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
        console.log('On Focus Exit !!!!!!!!!!!!!!');
    }

    showDialler = () => {
        NavigationAction.push(NavigationAction.SCREENS.dialler);
    };

    handleAddContact = () => {};

    onBack = () => {
        this.onDataUpdate();
    };

    refresh = () => {
        this.dataSource.loadData();
        this.checkPollingStrategy();
    };

    updateList = () => {
        this.setState({
            contactsData: this.dataSource.getData().slice(),
            mainLoading: false
        });
    };

    // for getting fresh list and updating state related to pending and new request.

    checkForNewReqAndPendingReq = async () => {
        await Contact.getNewRequestAndIgnoredContact()
            .then((res) => {
                if (res) {
                    // console.log(
                    //     'THE DATA IS getNewRequestAndIgnoredContact IN',
                    //     res
                    // );
                    this.updateStatesForPendingAndNewReq(res);
                }
            })
            .catch((err) => {
                this.setState({
                    isConnectionRequest: false,
                    newContactRequestLength: 0,
                    newRquestsAndRejectedObj: {}
                });
            });
    };

    updateStatesForPendingAndNewReq = (res) => {
        if (res) {
            const { newRequests, newRequestsList, ignored, ignoredList } = res;
            if (newRequests || ignored) {
                this.setState({
                    isConnectionRequest: true,
                    newContactRequestLength: newRequestsList.length,
                    newRquestsAndRejectedObj: {
                        newRequests,
                        newRequestsList,
                        ignored,
                        ignoredList
                    }
                });
                if (newRequests) {
                    this.cheackForBadge(newRequestsList);
                }
            } else {
                this.setState({
                    isConnectionRequest: false,
                    newContactRequestLength: 0,
                    newRquestsAndRejectedObj: {}
                });
            }
        } else {
            this.setState({
                isConnectionRequest: false,
                newContactRequestLength: 0,
                newRquestsAndRejectedObj: {}
            });
        }
    };

    cheackForBadge = async (data) => {
        await AsyncStorage.getItem('BADGE_NEW_CONTACT_REQUEST')
            .then((res) => {
                if (res) {
                    const { count, showBadge } = JSON.parse(res);
                    if (count === data.length) {
                        this.setState({ showBadge: false });
                    } else if (count < data.length) {
                        AsyncStorage.setItem(
                            'BADGE_NEW_CONTACT_REQUEST',
                            JSON.stringify({
                                count: count,
                                showBadge: data.length - count
                            })
                        );
                        this.setState({ showBadge: data.length - count });
                    }
                } else {
                    AsyncStorage.setItem(
                        'BADGE_NEW_CONTACT_REQUEST',
                        JSON.stringify({
                            count: 0,
                            showBadge: data.length
                        })
                    );
                    this.setState({ showBadge: data.length });
                }
            })
            .catch((err) => {
                // console.log(
                //     'got error in fetch async for badge----------> eror',
                //     err
                // );
            });
    };
    upDateBadge = () => {
        this.setState({ showBadge: false });
    };

    onDataUpdate() {
        this.updateList();
    }
    updateLayout = async (title) => {
        let array = this.state.contactsData.filter((i) => i.data.length > 0);
        array.map((value, placeindex) =>
            value.title === title
                ? (array[placeindex]['isExpanded'] =
                      !array[placeindex]['isExpanded'])
                : array[placeindex]['isExpanded']
        );
        await this.setState({ contactsData: array });
        // for ios dont know need to use or not
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    sectionHeaderGroup({ section }) {
        const RankGroups = Store.getState().user.roleL2Colors;
        // console.log("the rank groups",RankGroups);
        if (
            section.data.length === 0 ||
            RankGroups[`${section.title}`] === undefined
        ) {
            return null;
        }
        return (
            <View style={{ marginTop: 11 }}>
                <TouchableOpacity
                    onPress={() => {
                        this.updateLayout(section.title);
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginHorizontal: 13,
                            paddingRight: 8
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                            }}
                        >
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Icon
                                        name={'square'}
                                        type="ionicon"
                                        size={22}
                                        color={
                                            RankGroups[`${section.title}`]
                                                .lightColor
                                        }
                                    />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            alignSelf: 'center'
                                        }}
                                    >
                                        <Icon
                                            name={'dot-single'}
                                            type={'entypo'}
                                            size={22}
                                            color={
                                                RankGroups[`${section.title}`]
                                                    .darkColor
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.shGTitle}>
                                {RankGroups[`${section.title}`].name}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={styles.shGCount}>
                                {section.data.length}
                            </Text>
                            <Icon
                                name={
                                    section.isExpanded
                                        ? 'keyboard-arrow-up'
                                        : 'keyboard-arrow-down'
                                }
                                type="material"
                                color={GlobalColors.descriptionText}
                                size={20}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    renderItemGroup = (info) => {
        if (!info.section.isExpanded) {
            return null;
        }
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }
        return (
            <View
                style={{
                    overflow: 'hidden'
                    // height: !info.section.isExpanded ? 0 : null
                }}
            >
                <ContactsPickerRow
                    gpName={info.section.title}
                    key={contact.id}
                    contact={info.item}
                    selected={this.findSelectedContact(contact) !== undefined}
                    checkBoxEnabled={!!this.props.route.params?.multiSelect}
                    // eslint-disable-next-line react/jsx-no-bind
                    onContactSelected={this.onContactSelected.bind(this)}
                    startChat={() => this.startChat(contact)}
                    onDirectCall={() => this.onDirectCall(contact)}
                    makeVideoCall={() => this.makeVideoCall(contact)}
                />
            </View>
        );
    };

    sectionHeaderGroupForSearchLocal = ({ section }) => {
        return <View />;
    };

    renderItemGroupForSearch = (info) => {
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }
        return (
            <View
                style={{
                    overflow: 'hidden'
                }}
            >
                <ContactsPickerRow
                    gpName={info.section.title}
                    key={contact.id}
                    contact={info.item}
                    selected={this.findSelectedContact(contact) !== undefined}
                    checkBoxEnabled={!!this.props.route.params?.multiSelect}
                    // eslint-disable-next-line react/jsx-no-bind
                    onContactSelected={this.onContactSelected.bind(this)}
                    startChat={() => this.startChat(contact)}
                    onDirectCall={() => this.onDirectCall(contact)}
                    makeVideoCall={() => this.makeVideoCall(contact)}
                />
            </View>
        );
    };

    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        }
        return <ContactsPickerSectionHeader title={section.title} />;
    }
    renderItem = (info) => {
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }
        return (
            <ContactsPickerRow
                key={contact.id}
                contact={info.item}
                selected={this.findSelectedContact(contact) !== undefined}
                checkBoxEnabled={!!this.props.route.params?.multiSelect}
                // eslint-disable-next-line react/jsx-no-bind
                onContactSelected={this.onContactSelected.bind(this)}
                startChat={() => this.startChat(contact)}
                onDirectCall={() => this.onDirectCall(contact)}
                makeVideoCall={() => this.makeVideoCall(contact)}
            />
        );
    };

    renderSearchItem = (info) => {
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }
        return (
            <ContactPickerRowRemoteSearch
                key={contact.id}
                contact={info.item}
                selected={this.findSelectedContact(contact) !== undefined}
                checkBoxEnabled={!!this.props.route.params?.multiSelect}
                // eslint-disable-next-line react/jsx-no-bind
                onContactSelected={this.onContactSelected.bind(this)}
                startChat={() => this.startChat(contact)}
                onDirectCall={() => this.onDirectCall(contact)}
                makeVideoCall={() => this.makeVideoCall(contact)}
                isFromSearch
                onConnect={() => this.onDone(contact)}
            />
        );
    };

    onDirectCall = (contact) => {
        const { phoneNumbers, contactType } = contact;
        if (contactType !== ContactType.LOCAL) {
            const user = Auth.getUserData();
            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                voipCallData: {
                    otherUserId: contact.id,
                    otherUserName: contact.name
                },
                userId: user.userId,
                title: contact.name,
                isVideoCall: false
            });
            return;
        }
        if (
            phoneNumbers &&
            (phoneNumbers.mobile || phoneNumbers.land || phoneNumbers.satellite)
        ) {
            if (phoneNumbers.mobile && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.mobile, contact);
            } else if (phoneNumbers.land && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.land, contact);
            } else if (phoneNumbers.satellite && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.satellite, contact);
            }
        } else {
            Toast.show({
                text1: 'No phone numbers!'
            });
        }
    };

    makePhoneCall = (number, contact) => {
        if (Store.getState().user.network !== NETWORK_STATE.none) {
            NavigationAction.push(NavigationAction.SCREENS.dialler, {
                call: true,
                number: number.replace(' ', ''),
                contact,
                newCallScreen: true
            });
        } else {
            Toast.show({
                text1: 'No network connection, Cannot make the call'
            });
        }
    };

    makeVideoCall = (contact) => {
        const user = Auth.getUserData();
        NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
            voipCallData: {
                otherUserId: contact.id,
                otherUserName: contact.name
            },
            title: contact.name,
            userId: user.userId,
            isVideoCall: true
        });
    };

    findSelectedContact(contact) {
        return _.find(
            this.state.selectedContacts,
            (item) => item.id === contact.id
        );
    }

    onSearchQueryChange = async () => {
        const { searchString } = this.state;
        let contactsList = [];
        let isSearchPresent = [];
        if (!searchString || searchString === '') {
            contactsList = this.dataSource.getData();
            isSearchPresent = ['0'];
        } else {
            contactsList = this.dataSource.getFilteredData(searchString);
            isSearchPresent = contactsList.filter((i) => i.data.length > 0);
        }
        this.search(isSearchPresent);
        this.setState(
            {
                contactsData: contactsList,
                // searchString: searchString,
                titleText: 'Search results'
                // isSearchPresent: isSearchPresent.length > 0
            },
            () => {
                if (
                    this.state.searchString === '' ||
                    this.state.searchString.length === 0
                ) {
                    this.setState({
                        titleText: 'Selected'
                    });
                }
            }
        );
    };

    search = (isSearchPresent) => {
        const { searchString } = this.state;
        this.setState({ loading: true });

        ContactServices.find(this.state.searchString.trim()).then((res) => {
            // console.log(res)
            AsyncStorage.removeItem('searchData');
            const sortedArray = res.content.sort((a, b) =>
                a.userName.localeCompare(b.userName)
            );
            this.setState({
                isSearchPresent:
                    isSearchPresent.length > 0 || sortedArray.length > 0,
                remoteUserData: sortedArray,
                loading: false,
                searchExecuted:
                    searchString !== '' || searchString.length !== 0,
                justSearched: true
            });
        });
    };

    onClearSearch = () => {
        {
            this.setState({
                searchString: '',
                searchExecuted: false,
                remoteUsersExist: false,
                contactsData: this.dataSource.getData(),
                remoteUserData: [],
                isSearchPresent: true
            });
        }
    };

    async onContactSelected(contact) {
        if (this.props.route.params?.multiSelect) {
            const selectedContact = this.findSelectedContact(contact);
            if (selectedContact) {
                const contacts = _.remove(
                    this.state.selectedContacts,
                    (item) => item.id !== contact.id
                );
                this.setState({
                    selectedContacts: contacts
                });
            } else {
                this.state.selectedContacts.push(contact);
                this.setState({
                    selectedContacts: this.state.selectedContacts
                });
            }
        } else {
            // OPEN contact details
            if (this.state.searchString) {
                // console.log("SEARCH STRING EXIST........... ")
                await AsyncStorage.setItem(
                    'searchData',
                    this.state.searchString
                );
            }

            if (contact.contactType) {
                NavigationAction.push(
                    NavigationAction.SCREENS.contactDetailsScreen,
                    {
                        contact,
                        // searchData: this.state.searchString,
                        updateList: this.onDataUpdate.bind(this),
                        updateContactScreen: this.updateList.bind(this)
                    },
                    () => {}
                );
            }
        }
    }

    onContactsPicked() {
        const contacts = this.state.selectedContacts || [];

        const participants = contacts.map((contact) => ({
            name: contact.screenName,
            userId: contact.id
        }));

        if (participants.length > 0) {
            SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
                NavigationAction.replace(NavigationAction.SCREENS.peopleChat, {
                    bot: imBot,
                    otherParticipants: participants,
                    onBack: this.props.onBack
                });
            });
        }
    }

    onSideIndexItemPressed(item) {
        const sectionIndex = _.findIndex(
            this.state.contactsData,
            (section) => section.title === item
        );
        this.contactsList.scrollToLocation({
            sectionIndex,
            itemIndex: 0,
            viewOffset: SECTION_HEADER_HEIGHT
        });
    }

    addContacts = (selectedContacts) =>
        new Promise((resolve, reject) => {
            Contact.addContacts(selectedContacts)

                .then(() =>
                    ContactServices.add(
                        _.map(selectedContacts, (contact) => contact.userId)
                    )
                )
                .then((result) => {
                    if (result.error === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch((error) => {
                    reject();
                });
        });

    onDone = (contact) => {
        this.setState({ mainLoading: true, searchExecuted: false });
        this.addContacts([contact]).then(async () => {
            await Contact.refreshContacts();
            this.setState({
                mainLoading: false,
                searchString: '',
                searchExecuted: false,
                isSearchPresent: true
            });
            Toast.show({
                text1: 'Contact added successfully',
                type: 'success'
            });
        });
    };

    renderSearchBar() {
        return (
            <View style={styles.searchArea}>
                <SearchBar
                    onChangeText={(text) => {
                        if (text === '' || text.length === 0) {
                            this.setState({
                                searchExecuted: false,
                                isSearchPresent: true
                            });
                            this.updateList();
                            Keyboard.dismiss();
                        }
                        this.setState({ searchString: text });
                    }}
                    placeholder="Search contacts"
                    onSubmitEditing={() => this.onSearchQueryChange()}
                    value={this.state.searchString}
                />
            </View>
        );
    }

    goToMyProfile = () => {
        NavigationAction.push(
            config.app.newProfileScreen
                ? NavigationAction.SCREENS.myProfileScreenOnship
                : NavigationAction.SCREENS.myProfileScreen,
            {
                userId: this.state.userInfo.userId,
                updateContactScreen: this.updateList.bind(this),
                updateMyProfile: this.onProfileImageUpdate
            }
        );
    };

    renderButtons = () => (
        <>
            {this.state.isConnectionRequest && (
                <TouchableOpacity
                    onPress={() =>
                        NavigationAction.push(
                            NavigationAction.SCREENS.contactPendingNewReqScreen,
                            {
                                multiSelect: true,
                                // onDone: this.addContacts.bind(this),
                                updateContactScreen: this.updateList.bind(this),
                                newRquestsAndRejectedObj:
                                    this.state.newRquestsAndRejectedObj,
                                onDone: this.updateStatesForPendingAndNewReq.bind(
                                    this
                                ),
                                upDateBadge: this.upDateBadge()
                            }
                        )
                    }
                    style={{
                        backgroundColor:
                            GlobalColors.contentBackgroundColorSecondary,
                        paddingHorizontal: 12,
                        height: 60,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row'
                        }}
                    >
                        <View>
                            <Image
                                source={images.tabIconContacts}
                                style={{
                                    height: 38,
                                    width: 38
                                }}
                            />
                            {this.state.showBadge ? (
                                <View
                                    style={{
                                        backgroundColor: GlobalColors.red,
                                        top: 10,
                                        right: -3,
                                        borderRadius: 50,
                                        padding: 2,
                                        zIndex: 2,
                                        // alignSelf: 'flex-end',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        position: 'absolute'
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontSize: 10,
                                            fontWeight: AppFonts.SEMIBOLD,
                                            minWidth: 14,
                                            height: 14,
                                            textAlign: 'center'
                                        }}
                                    >
                                        {this.state.showBadge}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                        <Text
                            style={{
                                alignSelf: 'center',
                                marginLeft: 10,
                                fontSize: 12,
                                color: GlobalColors.descriptionText
                            }}
                        >
                            Connection requests
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            style={{
                                alignSelf: 'center',
                                color: GlobalColors.primaryButtonColor,
                                marginRight: 8,
                                fontSize: 12
                            }}
                        >
                            See all
                        </Text>
                        <View style={{ alignSelf: 'center' }}>
                            {Icons.arrowRight({
                                color: GlobalColors.primaryButtonColor
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            <View
                style={{
                    minHeight:
                        !this.state.searchString &&
                        !(
                            (this.state.contactsData &&
                                this.state.contactsData.length > 0) ||
                            (this.state.searchExecuted &&
                                this.state.remoteUserData &&
                                this.state.remoteUserData.length > 0)
                        )
                            ? '60%'
                            : 1,
                    width: '100%'
                }}
            >
                {!this.state.searchString &&
                !(
                    (this.state.contactsData &&
                        this.state.contactsData.length > 0) ||
                    (this.state.searchExecuted &&
                        this.state.remoteUserData &&
                        this.state.remoteUserData.length > 0)
                ) ? (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignSelf: 'center',
                            position: 'absolute',
                            bottom: 0,
                            backgroundColor: GlobalColors.transparent
                        }}
                    >
                        <View
                            style={{
                                textAlign: 'center',
                                alignItems: 'center',
                                paddingHorizontal: 20
                            }}
                        >
                            <Image
                                style={{ marginBottom: 20 }}
                                source={images.empty_new_contact}
                                resizeMode="contain"
                            />
                            <Text style={styles.noContactText}>
                                Connect with family, friends and colleagues
                            </Text>
                            <Text style={styles.noContactSubText}>
                                {/* eslint-disable-next-line max-len */}
                                Search contacts or click on the plus button to
                                import from your phone directory.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>
            {this.renderSearchBar()}
            <View>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <EmptyContact
                        showAddContactsOption
                        inviteUser={this.inviteUser.bind(this)}
                    />
                </View>
            </View>
        </>
    );

    startChat = (contact) => {
        const participants = [
            {
                userId: contact.id,
                userName: contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(async (imBot) => {
            const conversationId = Conversation.getIMConversationId(
                this.state.userInfo.userId,
                contact.id
            );
            NavigationAction.goToUsersChat({
                bot: imBot,
                otherParticipants: participants,
                otherUserId: participants[0].userId,
                otherUserName: participants[0].userName,
                comingFromNotif: {
                    notificationFor: 'peopleChat',
                    getConversation: true,
                    otherUserId: participants[0].userId,
                    conversationId,
                    userDomain: imBot?.userDomain,
                    onRefresh: () => TimelineBuilder.buildTiimeline()
                }
            });
        });
    };

    renderContactsList = () => {
        const allContacts = this.state.contactsData.filter(
            (i) => i.data.length > 0
        );

        const { remoteUserData, searchExecuted, loading, myContacts } =
            this.state;
        const isData = this.state.contactsData.filter((i) => i.data.length > 0);
        if (
            (this.state.contactsData && this.state.contactsData.length > 0) ||
            (searchExecuted && remoteUserData && remoteUserData.length > 0)
        ) {
            return (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                    style={styles.addressBookContainer}
                >
                    {isData.length > 0 ? (
                        searchExecuted ? (
                            <SectionList
                                refreshControl={
                                    this.props.appState.network === 'full' && (
                                        <RefreshControl
                                            onRefresh={() => {
                                                this.setState(
                                                    { refreshing: true },
                                                    async () => {
                                                        try {
                                                            await Contact.refreshContacts();
                                                            this.updateList();
                                                            this.setState({
                                                                refreshing: false
                                                            });
                                                        } catch (e) {
                                                            this.setState({
                                                                refreshing: false
                                                            });
                                                        }
                                                    }
                                                );
                                            }}
                                            refreshing={this.state.refreshing}
                                        />
                                    )
                                }
                                ListHeaderComponent={() =>
                                    searchExecuted && (
                                        <View
                                            style={{
                                                paddingHorizontal: 10,
                                                paddingVertical: 10
                                            }}
                                        >
                                            <Text>My Contacts</Text>
                                        </View>
                                    )
                                }
                                ref={(sectionList1) => {
                                    this.contactsList = sectionList1;
                                }}
                                style={styles.addressBook}
                                renderItem={this.renderItemGroupForSearch} // just hack
                                renderSectionHeader={(section) =>
                                    this.sectionHeaderGroupForSearchLocal(
                                        section
                                    )
                                }
                                sections={allContacts}
                                extraData={this.state.contactsData}
                                keyExtractor={(item, index) => item.id}
                                stickySectionHeadersEnabled={false}
                                removeClippedSubviews={Platform.OS !== 'ios'} // Unmount components when outside of window
                                maxToRenderPerBatch={10} // Increase time between renders
                                windowSize={20}
                                viewabilityConfig={this.viewabilityConfig}
                            />
                        ) : (
                            <SectionList
                                refreshControl={
                                    this.props.appState.network === 'full' && (
                                        <RefreshControl
                                            onRefresh={() => {
                                                this.setState(
                                                    { refreshing: true },
                                                    async () => {
                                                        try {
                                                            await Contact.refreshContacts();
                                                            this.updateList();
                                                            this.setState({
                                                                refreshing: false
                                                            });
                                                        } catch (e) {
                                                            this.setState({
                                                                refreshing: false
                                                            });
                                                        }
                                                    }
                                                );
                                            }}
                                            refreshing={this.state.refreshing}
                                        />
                                    )
                                }
                                // ItemSeparatorComponent={ContactsPickerItemSeparator}
                                ref={(sectionList) => {
                                    this.contactsList = sectionList;
                                }}
                                style={styles.addressBook}
                                renderItem={this.renderItemGroup}
                                renderSectionHeader={(section) =>
                                    this.sectionHeaderGroup(section)
                                }
                                sections={allContacts}
                                extraData={this.state.contactsData}
                                keyExtractor={(item, index) => item.id}
                                stickySectionHeadersEnabled={false}
                                removeClippedSubviews={Platform.OS !== 'ios'} // Unmount components when outside of window
                                maxToRenderPerBatch={10} // Increase time between renders
                                windowSize={20}
                                viewabilityConfig={this.viewabilityConfig}
                            />
                        )
                    ) : null}
                    {loading && <ActivityIndicator size="small" />}
                    {searchExecuted && remoteUserData.length > 0 && (
                        <>
                            <View
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 10
                                }}
                            >
                                <Text>{I18n.t('app')} contacts</Text>
                            </View>
                            <FlatList
                                style={styles.addressBook}
                                renderItem={this.renderSearchItem}
                                data={remoteUserData}
                                extraData={remoteUserData}
                                keyExtractor={(item, index) => item.id}
                                stickySectionHeadersEnabled={false}
                                removeClippedSubviews={Platform.OS !== 'ios'} // Unmount components when outside of window
                                maxToRenderPerBatch={20}
                                windowSize={40}
                            />
                        </>
                    )}
                </KeyboardAvoidingView>
            );
        }
    };

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

    invitationSent = () =>
        Toast.show({ text1: 'Invitaion sent successfully', type: 'success' });

    noSearchResult = () => (
        <View style={styles.noContactContainer}>
            <Image
                style={{ marginBottom: 20 }}
                source={images.empty_new_contact}
                resizeMode="contain"
            />
            <Text style={styles.noContactText}>
                No results found for “{this.state.searchString}”
            </Text>
            <Text style={[styles.noContactSubText, { paddingHorizontal: 20 }]}>
                {/* eslint-disable-next-line max-len */}
                Please check and try a new search or send an invitation
            </Text>
            {configToUse.signUpEnabled && (
                <TouchableOpacity
                    style={[styles.sendInvBtn, { marginTop: 10 }]}
                    onPress={() => {
                        NavigationAction.push(
                            NavigationAction.SCREENS.contactEmailInviteScreen,
                            {
                                title: 'Invite People'
                            }
                        );
                    }}
                >
                    {Icons.contactEmail({ color: '#ffffff' })}
                    <Text
                        style={{
                            color: '#ffffff',
                            alignSelf: 'center',
                            paddingLeft: 5
                        }}
                    >
                        Send invitation to join the app
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    render() {
        const { mainLoading, isSearchPresent, searchExecuted, remoteUserData } =
            this.state;
        return (
            <SafeAreaView style={styles.container}>
                {this.props.appState.networkMsgUI && (
                    <NetworkStatusNotchBar
                        onChatStatusBarClose={this.onChatStatusBarClose}
                    />
                )}
                {this.renderButtons()}
                {isSearchPresent
                    ? this.renderContactsList()
                    : this.noSearchResult()}
                <InviteModal
                    isVisible={this.state.inviteModalVisible}
                    setVisible={this.setInviteVisible.bind(this)}
                    addContacts={this.addContacts.bind(this)}
                />

                {mainLoading && <FullScreenLoader />}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    appState: state.user
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ContactsPicker);
