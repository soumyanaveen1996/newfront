import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    Platform
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

export default class ContactsPicker extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerRight: ContactsPicker.rightHeaderView(state),
            headerLeft: <HeaderBack onPress={Actions.pop} />
        };
    }

    static rightHeaderView({ params }) {
        const callButton = (
            <HeaderRightIcon
                icon={Icons.call()}
                onPress={() => {
                    params.showDialler();
                }}
                style={{ marginRight: 0, paddingHorizontal: 0 }}
            />
        );
        return (
            <View style={styles.headerRightView}>
                {callButton}
                <HeaderRightIcon
                    config={addButtonConfig}
                    onPress={params.handleAddContact}
                />
            </View>
        );
    }

    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],
            selectedContacts: []
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({
            handleAddContact: this.handleAddContact.bind(this),
            showDialler: this.showDialler
        });
        Contact.getAddedContacts().then(contacts => {
            if (contacts.length === 0) {
                //If no contacts are added then go directly to contacts bot
                this.handleAddContact();
            }
        });
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
        this.refresh();
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
        if (!text || text === '') {
            this.setState({
                contactsData: this.dataSource.getData()
            });
        } else {
            this.setState({
                contactsData: this.dataSource.getFilteredData(text)
            });
        }
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
            let participants = [
                {
                    userId: contact.id,
                    userName: contact.name
                }
            ];
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

    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search"
                    selectionColor={GlobalColors.white}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={this.onSearchQueryChange.bind(this)}
                />
            </View>
        );
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
                <SectionList
                    ItemSeparatorComponent={ContactsPickerItemSeparator}
                    ref={sectionList => {
                        this.contactsList = sectionList;
                    }}
                    style={styles.addressBook}
                    renderItem={this.renderItem.bind(this)}
                    renderSectionHeader={({ section }) => (
                        <ContactsPickerSectionHeader title={section.title} />
                    )}
                    sections={this.state.contactsData}
                    keyExtractor={(item, index) => item.id}
                />
                <ContactsPickerIndexView
                    onItemPressed={this.onSideIndexItemPressed.bind(this)}
                    items={sectionTitles}
                />
            </KeyboardAvoidingView>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderSearchBar()}
                {this.renderContactsList()}
            </SafeAreaView>
        );
    }
}
