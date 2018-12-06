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
    FlatList
} from 'react-native';
import styles from './styles';
import config from '../../config/config';
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
import { Auth, Network } from '../../lib/capability';

export default class SearchUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            selectedContacts: []
        };
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
            return item.userId === contact.userId;
        });
    }

    // onSearchQueryChange(text) {
    //     let contactsList = [];
    //     if (!text || text === '') {
    //         contactsList = this.dataSource.getData();
    //     } else {
    //         contactsList = this.dataSource.getFilteredData(text);
    //     }
    //     this.setState({ contactsData: contactsList });
    // }

    onContactSelected(contact) {
        if (this.props.multiSelect) {
            const selectedContact = this.findSelectedContact(contact);
            if (selectedContact) {
                const contacts = _.remove(this.state.selectedContacts, item => {
                    return item.userId !== contact.userId;
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
        }
    }

    search() {
        Auth.getUser()
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
                        capability: 'FindContacts',
                        botId: 'onboarding-bot',
                        queryString: this.state.userFilter
                    }
                };
                return Network(options);
            })
            .then(res => {
                this.setState({ contactsData: res.data.content });
            });
    }

    addContacts() {
        Contact.addContacts(this.state.selectedContacts).then(() => {
            Auth.getUser()
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
                            users: _.map(
                                this.state.selectedContacts,
                                contact => {
                                    return contact.userId;
                                }
                            )
                        }
                    };
                    return Network(options);
                })
                .then(() => {
                    Actions.pop();
                });
        });
    }

    renderSearchBar() {
        return (
            <View style={styles.searchBar}>
                <Icon
                    style={styles.searchIcon}
                    name="search"
                    size={24}
                    color={GlobalColors.sideButtons}
                />
                <TextInput
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search contact"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    enablesReturnKeyAutomatically={true}
                    onSubmitEditing={this.search.bind(this)}
                    onChangeText={text => this.setState({ userFilter: text })}
                />
            </View>
        );
    }

    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        } else {
            return <ContactsPickerSectionHeader title={section.title} />;
        }
    }

    renderContactsList() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.addressBookContainer}
            >
                <FlatList
                    ItemSeparatorComponent={ContactsPickerItemSeparator}
                    ref={sectionList => {
                        this.contactsList = sectionList;
                    }}
                    style={styles.addressBook}
                    renderItem={this.renderItem.bind(this)}
                    data={this.state.contactsData}
                    keyExtractor={(item, index) => item.id}
                    ListHeaderComponent={this.renderButtons}
                />
            </KeyboardAvoidingView>
        );
    }

    renderButton() {
        return (
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: GlobalColors.sideButtons }
                ]}
                onPress={this.addContacts.bind(this)}
            >
                <Icon
                    style={styles.buttonIcon}
                    name="user-plus"
                    size={24}
                    color={GlobalColors.white}
                />
                <Text style={styles.buttonText}>Add contacts</Text>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>
                    <NetworkStatusNotchBar />
                    {this.renderSearchBar()}
                    {this.renderContactsList()}
                    {this.renderButton()}
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}
