import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import { Contact } from '../../lib/capability';
import EventEmitter, { AuthEvents } from '../../lib/events';
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
const R = require('ramda');

class NewChatContacts extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: []
        };
    }

    async componentDidMount() {
        if (this.props.appState.contactsLoaded) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
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
                this.refresh();
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
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('My_Contacts'),
            I18n.t('My_Contacts')
        );
        Store.dispatch(refreshContacts(true));
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('My_Contacts');
    }

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
                        phoneNumbers: contact.phoneNumber || undefined
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
                        phoneNumbers: contact.phoneNumber || undefined
                    }));
            }
            return {
                title: letter,
                data: contactBook
            };
        });
        console.log(PhoneContacts);
        return PhoneContacts;
    };
    refresh = contacts => {
        // this.dataSource.loadData()
        if (!contacts) {
            return;
        }
        console.log(contacts);
        const AddressBook = this.createAddressBook(contacts);
        this.setState({ contactsData: AddressBook });
    };

    renderItem(info) {
        const contact = info.item;
        const Image = (
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
                image={Image}
                id={contact.id}
                onItemPressed={this.onContactSelected}
                email={contact.emails[0].email}
            />
        );
    }
    onContactSelected = contact => {
        console.log(contact);
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
                type: ActionConst.REPLACE
            });
        });
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

    renderContactsList() {
        const sectionTitles = _.map(
            this.state.contactsData,
            section => section.title
        );

        return (
            <View style={styles.addressBookContainer}>
                {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null}
                <SectionList
                    ItemSeparatorComponent={NewChatItemSeparator}
                    ref={sectionList => {
                        this.contactsList = sectionList;
                    }}
                    style={styles.addressBook}
                    renderItem={this.renderItem.bind(this)}
                    renderSectionHeader={({ section }) => (
                        <NewChatSectionHeader title={section.title} />
                    )}
                    sections={this.state.contactsData}
                    keyExtractor={(item, index) => item.id}
                />
                <NewChatIndexView
                    onItemPressed={this.onSideIndexItemPressed.bind(this)}
                    items={sectionTitles}
                />
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderContactsList()}
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
)(NewChatContacts);
