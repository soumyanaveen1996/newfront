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
    TouchableOpacity
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
import { Contact } from '../../lib/capability';
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

class ContactsPicker extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            // headerLeft: <HeaderBack onPress={Actions.pop} />
        };
    }

    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],
            selectedContacts: []
        };
    }

    async componentDidMount() {
        this.props.navigation.setParams({
            handleAddContact: this.handleAddContact.bind(this),
            showDialler: this.showDialler
        });

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
                if (contacts.length === 0) {
                    //If no contacts are added then go directly to contacts bot
                    this.handleAddContact();
                } else {
                    this.refresh();
                }
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.contactsLoaded !==
            this.props.appState.contactsLoaded
        ) {
            // this.refresh()
            Contact.getAddedContacts().then(contacts => {
                if (contacts.length === 0) {
                    //If no contacts are added then go directly to contacts bot
                    this.handleAddContact();
                } else {
                    this.refresh();
                }
            });
        }

        if (
            prevProps.appState.refreshContacts !==
            this.props.appState.refreshContacts
        ) {
            this.refresh();
        }
    }

    static onEnter() {
        const user = Store.getState().user;
        // if (user.contactsLoaded === false) {
        //     Contact.refreshContacts()
        // }
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Contacts'));
        Store.dispatch(refreshContacts(true));
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
        if (!this.props.appState.contactsLoaded) {
            Contact.refreshContacts();
        }
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Contacts');
    }

    showDialler = () => {
        Actions.dialler();
    };

    handleAddContact = () => {
        SystemBot.get(SystemBot.contactsBotManifestName).then(contactBot => {
            Actions.botChat({ bot: contactBot, onBack: this.onBack });
        });
    };

    onBack = () => {
        // this.refresh()
    };

    refresh = () => {
        this.dataSource.loadData();
    };

    updateList = () => {
        this.setState({ contactsData: this.dataSource.getData() });
    };

    onDataUpdate() {
        this.updateList();
    }

    renderItem(info) {
        const contact = info.item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.id);
        }
        return (
            <ContactsPickerRow
                key={contact.id}
                contact={contact}
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
        this.setState({ contactsData: contactsList });
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
            //OPEN contact details
            Actions.contactDetailsScreen({ contact: contact });
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
    addContacts() {
        Actions.searchUsers({ multiSelect: true });
    }

    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <Icon
                    style={styles.searchIcon}
                    name="search"
                    size={18}
                    color={GlobalColors.sideButtons}
                />
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search contact"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={this.onSearchQueryChange.bind(this)}
                />
            </View>
        );
    }

    renderButtons = () => (
        <View>
            {this.renderSearchBar()}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: GlobalColors.sideButtons }
                    ]}
                >
                    <Icon
                        style={styles.buttonIcon}
                        name="mail"
                        size={22}
                        color={GlobalColors.white}
                    />
                    <Text style={styles.buttonText}>Invite contact</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: GlobalColors.green }
                    ]}
                    onPress={this.addContacts.bind(this)}
                >
                    <Icon
                        style={styles.buttonIcon}
                        name="user-plus"
                        size={22}
                        color={GlobalColors.white}
                    />
                    <Text style={styles.buttonText}>New contact</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        } else {
            return <ContactsPickerSectionHeader title={section.title} />;
        }
    }

    renderContactsList() {
        const sectionTitles = _.map(
            this.state.contactsData,
            section => section.title
        );

        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.addressBookContainer}
            >
                {/* {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null} */}
                <SectionList
                    ItemSeparatorComponent={ContactsPickerItemSeparator}
                    ref={sectionList => {
                        this.contactsList = sectionList;
                    }}
                    style={styles.addressBook}
                    renderItem={this.renderItem.bind(this)}
                    renderSectionHeader={this.sectionHeader.bind(this)}
                    sections={this.state.contactsData}
                    keyExtractor={(item, index) => item.id}
                    ListHeaderComponent={this.renderButtons}
                    stickySectionHeadersEnabled={false}
                />
                {/* <ContactsPickerIndexView
                    onItemPressed={this.onSideIndexItemPressed.bind(this)}
                    items={sectionTitles}
                /> */}
            </KeyboardAvoidingView>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    <NetworkStatusNotchBar />
                    {this.renderContactsList()}
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
