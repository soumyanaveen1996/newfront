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
import { Loader } from '../Loader';

export default class SearchUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            notSelectedContacts: [],
            selectedContacts: [],
            loading: false
        };
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

    search() {
        this.setState({ loading: true });
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
                this.setState({
                    contactsData: res.data.content,
                    notSelectedContacts: _.differenceBy(
                        res.data.content.slice(),
                        this.state.selectedContacts,
                        'userId'
                    )
                });
                this.setState({ loading: false });
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

    onContactSelected(user) {
        const isAlreadySelected = this.findSelectedContact(user);
        if (isAlreadySelected) {
            _.remove(this.state.selectedContacts, item => {
                return item.userId === user.userId;
            });
            this.setState({
                notSelectedContacts: _.differenceBy(
                    this.state.contactsData,
                    this.state.selectedContacts,
                    'userId'
                ),
                selectedContacts: this.state.selectedContacts
            });
        } else {
            _.remove(this.state.notSelectedContacts, item => {
                return item.userId === user.userId;
            });
            this.state.selectedContacts.push(user);
            this.setState({
                notSelectedContacts: this.state.notSelectedContacts,
                selectedContacts: this.state.selectedContacts
            });
        }
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

    renderRow(item, color) {
        const contact = item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.userId);
        }
        return (
            <ContactsPickerRow
                key={contact.userId}
                contact={contact}
                selected={this.findSelectedContact(contact) !== undefined}
                checkBoxEnabled={!!this.props.multiSelect}
                onContactSelected={this.onContactSelected.bind(this)}
                color={color}
            />
        );
    }

    renderItem({ item }) {
        return this.renderRow(item);
    }
    renderItemGray({ item }) {
        return this.renderRow(item, GlobalColors.disabledGray);
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
                    data={this.state.notSelectedContacts}
                    extraData={this.state.selectedContacts}
                    keyExtractor={(item, index) => item.id}
                    ListHeaderComponent={this.renderSelectedContacts.bind(this)}
                />
            </KeyboardAvoidingView>
        );
    }

    renderSelectedContacts() {
        return (
            <FlatList
                ItemSeparatorComponent={ContactsPickerItemSeparator}
                ref={flatlist => {
                    this.selectedContactList = flatlist;
                }}
                renderItem={this.renderItemGray.bind(this)}
                data={this.state.selectedContacts}
                extraData={this.state.notSelectedContacts}
                keyExtractor={(item, index) => item.id}
                // style={styles.selectedContactsListSU}
            />
        );
    }

    renderButton() {
        return (
            <View style={styles.buttonAreaSU}>
                <TouchableOpacity
                    style={[
                        styles.doneButtonSU,
                        { backgroundColor: GlobalColors.sideButtons }
                    ]}
                    onPress={this.addContacts.bind(this)}
                >
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.containerSU}>
                <View style={styles.searchContainerSU}>
                    <NetworkStatusNotchBar />
                    {this.renderSearchBar()}
                    <Loader loading={this.state.loading} />
                    {this.renderContactsList()}
                </View>
                {this.renderButton()}
            </SafeAreaView>
        );
    }
}
