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
    Alert,
    TouchableOpacity,
    InteractionManager,
    Image,
    RefreshControl
} from 'react-native';
import styles from './styles';
import { GlobalColors } from '../../config/styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import FrontMAddedContactsPickerDataSource from './FrontMAddedContactsPickerDataSource';
import ContactsPickerRow from './ContactsPickerRow';
import ContactsPickerIndexView from './ContactsPickerIndexView';
import ContactsPickerSectionHeader from './ContactsPickerSectionHeader';
import ContactsPickerItemSeparator from './ContactsPickerItemSeparator';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import _ from 'lodash';
import { HeaderRightIcon, HeaderBack } from '../Header';
import SystemBot from '../../lib/bot/SystemBot';
import {
    Contact,
    Settings,
    PollingStrategyTypes,
    Auth,
    Network
} from '../../lib/capability';
import { Icons } from '../../config/icons';
import { BackgroundImage } from '../BackgroundImage';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    completeContactsLoad,
    refreshContacts
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import { MainScreenStyles } from '../MainScreen/styles';
import Icon from 'react-native-vector-icons/Feather';
import CallModal from './CallModal';
import InviteModal from './InviteModal';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import images from '../../config/images';
import { EmptyContact } from '.';
import ProfileImage from '../ProfileImage';
import { MyProfileImage } from '../ProfileImage';
import config from '../../config/config';
import { blue } from 'ansi-colors';

import { NativeModules } from 'react-native';
import ImageCache from '../../lib/image_cache';
import utils from '../../lib/utils';
import NetworkButton from '../Header/NetworkButton';
const ContactsServiceClient = NativeModules.ContactsServiceClient;

class ContactsPicker extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;

        let navigationOptions = {
            headerTitle: (
                <Text
                    style={
                        Platform.OS === 'android'
                            ? { marginLeft: wp('20%'), fontSize: 18 }
                            : { fontSize: 18 }
                    }
                >
                    {state.params.title}
                </Text>
            )
        };
        navigationOptions.headerLeft = (
            <View style={{ marginHorizontal: 17 }}>
                <NetworkButton
                    manualAction={() => {
                        state.params.refresh();
                    }}
                    gsmAction={() => {
                        state.params.showConnectionMessage('gsm');
                    }}
                    satelliteAction={() => {
                        state.params.showConnectionMessage('satellite');
                    }}
                    disconnectedAction={() => {}}
                />
            </View>
        );

        navigationOptions.headerRight = (
            <TouchableOpacity
                accessibilityLabel="Add Contact Button"
                testID="add-contact-button"
                style={styles.headerRight}
                onPress={state.params.inviteUser}
            >
                <Image
                    accessibilityLabel="Add Contact Icon"
                    testID="add-contact-icon"
                    source={require('../../images/channels/plus-white-good.png')}
                    style={{ width: 15, height: 15 }}
                />
            </TouchableOpacity>
        );
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],
            selectedContacts: [],
            inviteModalVisible: false,
            userInfo: {},
            userId: '',
            searchString: '',
            refreshing: false,
            titleText: 'Selected'
        };
    }

    componentWillMount() {
        this.gettingUserDetails();
    }

    gettingUserDetails() {
        Auth.getUser()
            .then(userDetails => {
                const info = { ...userDetails.info };
                this.setState({ userInfo: info, userId: info.userId });
            })
            .catch(err => {
                console.log('Error Loading User details', err);
            });
    }

    async componentDidMount() {
        EventEmitter.addListener(
            AuthEvents.tabSelected,
            this.tabSelected.bind(this)
        );
        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage,
            inviteUser: this.inviteUser.bind(this)
        });
        // this.checkPollingStrategy()

        // const loadedContacts = await Contact.getAddedContacts()
        // if (loadedContacts.length > 0) {
        //     this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        //     return
        // }
        // Contact.refreshContacts().then(() => {
        //     Contact.getAddedContacts().then(contacts => {
        //         this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        //         if (contacts.length === 0) {
        //             //If no contacts are added then go directly to contacts bot
        //             this.handleAddContact()
        //         }
        //     })
        // })

        // if (!this.props.appState.contactsLoaded) {
        //     Contact.refreshContacts();
        //     return;
        // }
        if (this.props.appState.contactsLoaded) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh();
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.network !== this.props.appState.network &&
            this.props.appState.network === 'full'
        ) {
            this.setState({ refreshing: false });
        }

        if (
            prevProps.appState.contactsLoaded !==
            this.props.appState.contactsLoaded
        ) {
            // this.refresh()
            Contact.getAddedContacts().then(contacts => {
                if (contacts.length === 0) {
                    //If no contacts are added then go directly to contacts bot
                    // this.handleAddContact();
                } else {
                    this.refresh();
                }
            });
        }

        if (
            prevProps.appState.refreshContacts !==
            this.props.appState.refreshContacts
        ) {
            this.gettingUserDetails();
            this.refresh();
        }
    }

    static onEnter() {
        const user = Store.getState().user;
        if (user.contactsLoaded === false) {
            Contact.refreshContacts();
        }
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Contacts'));
        Store.dispatch(refreshContacts(true));
    }

    tabSelected(scene) {
        if (scene === 'Contacts') {
            this.setState({ searchString: '' });
        }
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Automatic_Network'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
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
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
        // if (!Store.getState().user.contactsLoaded) {
        //     InteractionManager.runAfterInteractions(() =>
        //         Contact.refreshContacts()
        //     );
        // }
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Contacts');
    }

    showDialler = () => {
        Actions.dialler();
    };

    handleAddContact = () => {
        return;
    };

    onBack = () => {
        this.onDataUpdate();
    };

    refresh = () => {
        // console.log('is it happening again ===============================');
        this.dataSource.loadData();
        this.checkPollingStrategy();
    };

    updateList = () => {
        // console.log('clicked on fav', this.dataSource.getData());
        this.setState({ contactsData: this.dataSource.getData() });
    };

    onDataUpdate() {
        this.updateList();
    }

    renderItem(info) {
        // console.log('data for contact ', info);
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }

        return (
            <ContactsPickerRow
                key={contact.id}
                contact={info.item}
                selected={this.findSelectedContact(contact) !== undefined}
                checkBoxEnabled={!!this.props.multiSelect}
                onContactSelected={this.onContactSelected.bind(this)}
            />
        );
    }

    findSelectedContact(contact) {
        return _.find(this.state.selectedContacts, item => {
            return item.id === contact.id;
        });
    }

    onSearchQueryChange(text) {
        let contactsList = [];
        if (!text || text === '') {
            contactsList = this.dataSource.getData();
        } else {
            contactsList = this.dataSource.getFilteredData(text);
        }

        this.setState(
            {
                contactsData: contactsList,
                searchString: text,
                titleText: 'Search results'
            },
            () => {
                console.log('text ', this.state.searchString);
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
    }

    onContactSelected(contact) {
        if (this.props.multiSelect) {
            const selectedContact = this.findSelectedContact(contact);
            if (selectedContact) {
                const contacts = _.remove(this.state.selectedContacts, item => {
                    return item.id !== contact.id;
                });
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
            // console.log('contact details', contact);

            //OPEN contact details
            Actions.contactDetailsScreen({
                contact: contact,
                updateList: this.onDataUpdate.bind(this),
                updateContactScreen: this.updateList.bind(this)
            });
            //OPEN a chat with the contact
            // let participants = [
            //     {
            //         userId: contact.id,
            //         userName: contact.name
            //     }
            // ];
            // SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            //     Actions.peopleChat({
            //         bot: imBot,
            //         otherParticipants: participants,
            //         // type: ActionConst.REPLACE,
            //         onBack: this.props.onBack
            //     });
            // });
        }
    }

    onContactsPicked() {
        // Format of contact:
        // [{
        //     'emails': [{
        //         'email': 'Guillermo@frontm.com',
        //     }, ],
        //     'firstName': 'G',
        //     'id': '00A2A680-7E76-4154-A811-2A6BAB2A3BF9',
        //     'imageAvailable': true,
        //     'lastName': 'Acilu',
        //     'middleName': undefined,
        //     'name': 'Guillermo Acilu',
        //     'phoneNumbers': undefined,
        //     'screenName': 'GuillermoAcilu',
        //     'thumbnail': 55,
        // }, {
        //     'emails': [{
        //         'email': 'rashmi@frontm.com',
        //     }, ],
        //     'firstName': 'Rashmi',
        //     'id': '8FE70FC5-4B3C-4A62-A9CD-F2319C941375',
        //     'imageAvailable': true,
        //     'lastName': 'Kamath',
        //     'middleName': undefined,
        //     'name': 'Rashmi Kamath',
        //     'phoneNumbers': undefined,
        //     'screenName': 'rush',
        //     'thumbnail': 55,
        // }]
        const contacts = this.state.selectedContacts || [];

        let participants = contacts.map(contact => {
            return {
                name: contact.screenName,
                userId: contact.id
            };
        });

        if (participants.length > 0) {
            SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
                Actions.peopleChat({
                    bot: imBot,
                    otherParticipants: participants,
                    type: ActionConst.REPLACE,
                    onBack: this.props.onBack
                });
            });
        }
    }

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

    grpcAddContacts(user, userIds) {
        if (!userIds || userIds.length === 0) {
            return;
        }
        return new Promise((resolve, reject) => {
            ContactsServiceClient.add(
                user.creds.sessionId,
                { userIds },
                (error, result) => {
                    console.log(
                        'GRPC:::ContactsServiceClient::find : ',
                        error,
                        result
                    );
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    addContacts(selectedContacts) {
        return new Promise((resolve, reject) => {
            Contact.addContacts(selectedContacts)
                .then(() => {
                    return Auth.getUser();
                })
                .then(user => {
                    return this.grpcAddContacts(
                        user,
                        _.map(selectedContacts, contact => {
                            return contact.userId;
                        })
                    );
                })
                .then(() => {
                    resolve();
                });
        });
    }

    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <Icon
                    accessibilityLabel="Search Icon"
                    testID="searc-icon"
                    style={styles.searchIcon}
                    name="search"
                    size={18}
                    color={GlobalColors.sideButtons}
                />
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Filter my contacts"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={this.onSearchQueryChange.bind(this)}
                    value={this.state.searchString}
                    clearButtonMode="always"
                />
            </View>
        );
    }

    goToMyProfile = () => {
        // console.log('go to profile page using ', this.state.userInfo);
        Actions.myProfileScreen({
            userId: this.state.userInfo.userId,
            updateContactScreen: this.updateList.bind(this)
        });
    };

    renderButtons = () => {
        let length = this.state.contactsData.length;
        return (
            <View>
                {this.renderSearchBar()}
                <View style={styles.myProfileContainer}>
                    <View style={styles.myProfileItemContainer}>
                        <MyProfileImage
                            accessibilityLabel="My Profile Image"
                            testID="my-profile-image"
                            uuid={this.state.userId}
                            placeholder={images.user_image}
                            style={styles.myProfileItemImage}
                            placeholderStyle={styles.myProfilePlaceholderImage}
                            resizeMode="cover"
                        />
                        <View style={styles.contactItemDetailsContainer}>
                            <Text style={styles.myProfileName}>
                                {this.state.userInfo.userName}
                            </Text>
                            <Text style={styles.contactItemEmail}>
                                My Profile
                            </Text>
                        </View>
                        <View style={{ position: 'absolute', right: 10 }}>
                            <TouchableOpacity
                                accessibilityLabel="More Button"
                                onPress={() => {
                                    this.goToMyProfile();
                                }}
                            >
                                <Image
                                    style={{
                                        width: 40,
                                        height: 40
                                    }}
                                    source={images.edit_btn}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View>
                    {length > 0 ? null : (
                        <View
                            style={{
                                height: hp('60%'),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <EmptyContact
                                inviteUser={this.inviteUser.bind(this)}
                            />
                        </View>
                    )}
                </View>
                {/* <View
                    style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4
                    }}
                >
                    <Text style={{ fontSize: 14, color: 'rgba(74,74,74,1)' }}>
                        {this.state.titleText}
                    </Text>
                </View> */}
            </View>
        );
    };

    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        } else {
            return <ContactsPickerSectionHeader title={section.title} />;
        }
    }

    renderContactsList() {
        // const sectionTitles = _.map(
        //     this.state.contactsData,
        //     section => section.title
        // );

        const allContacts = this.state.contactsData;
        // console.log('contact list ', allContacts);
        if (this.state.contactsData) {
            return (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                    style={styles.addressBookContainer}
                >
                    {/* {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null} */}

                    <SectionList
                        refreshControl={
                            this.props.appState.network === 'full' ? (
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
                            ) : null
                        }
                        ItemSeparatorComponent={ContactsPickerItemSeparator}
                        ref={sectionList => {
                            this.contactsList = sectionList;
                        }}
                        style={styles.addressBook}
                        renderItem={this.renderItem.bind(this)}
                        renderSectionHeader={this.sectionHeader.bind(this)}
                        sections={allContacts}
                        extraData={this.state.contactsData}
                        keyExtractor={(item, index) => item.id}
                        ListHeaderComponent={this.renderButtons}
                        stickySectionHeadersEnabled={false}
                        // Performance settings

                        removeClippedSubviews={
                            Platform.OS === 'ios' ? false : true
                        } // Unmount components when outside of window
                        initialNumToRender={2} // Reduce initial render amount
                        maxToRenderPerBatch={1} // Reduce number in each render batch
                        maxToRenderPerBatch={100} // Increase time between renders
                        windowSize={7} // Reduce the window size
                    />
                    {/* <ContactsPickerIndexView
                    onItemPressed={this.onSideIndexItemPressed.bind(this)}
                    items={sectionTitles}
                /> */}
                </KeyboardAvoidingView>
            );
        } else {
            return <EmptyContact />;
        }
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
    render() {
        // console.log('all contact data', this.state.contactsData);
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    <NetworkStatusNotchBar />
                    {this.renderContactsList()}
                    <InviteModal
                        isVisible={this.state.inviteModalVisible}
                        setVisible={this.setInviteVisible.bind(this)}
                        addContacts={this.addContacts.bind(this)}
                    />
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
)(ContactsPicker);
