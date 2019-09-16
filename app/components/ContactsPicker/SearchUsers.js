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
    FlatList,
    InteractionManager
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
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import { MainScreenStyles } from '../MainScreen/styles';
import Icon from 'react-native-vector-icons/Feather';
import { Auth, Network, Contact } from '../../lib/capability';
import { Loader } from '../Loader';

import { NativeModules } from 'react-native';
import { synchronizePhoneBook } from '../../lib/UserData/SyncData';
import Icons from '../../config/icons';

const ContactsServiceClient = NativeModules.ContactsServiceClient;

export default class SearchUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            notSelectedContacts: [],
            selectedContacts: [],
            loading: false,
            userFilter: ''
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

    componentDidMount() {
        InteractionManager.runAfterInteractions(() =>
            this.text ? this.text.focus() : this
        );
    }

    grpcSearch(user, queryString) {
        return new Promise((resolve, reject) => {
            ContactsServiceClient.find(
                user.creds.sessionId,
                { queryString },
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

    search() {
        this.setState({ loading: true });
        Auth.getUser()
            .then(user => {
                return this.grpcSearch(user, this.state.userFilter.trim());
            })
            .then(res => {
                this.setState({
                    contactsData: res.data.content,
                    notSelectedContacts: _.differenceBy(
                        res.data.content.slice(),
                        this.state.selectedContacts,
                        'userId'
                    ),
                    loading: false,
                    userFilter: this.state.userFilter.trim()
                });
            });
    }

    onDone() {
        this.setState({ loading: true });
        this.props.onDone(this.state.selectedContacts).then(() => {
            Contact.refreshContacts();
            this.setState({ loading: false });
            Actions.pop();
            setTimeout(() => {
                Actions.refresh({
                    key: Math.random()
                });
            }, 100);
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
                {this.state.loading ? (
                    <ActivityIndicator size="small" />
                ) : (
                    Icons.search()
                )}
                <TextInput
                    ref={el => (this.text = el)}
                    style={styles.searchTextInput}
                    underlineColorAndroid="transparent"
                    placeholder="Search FrontM users by name or email"
                    autoFocus={true}
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    enablesReturnKeyAutomatically={true}
                    onSubmitEditing={this.search.bind(this)}
                    onChangeText={text => this.setState({ userFilter: text })}
                    clearButtonMode="always"
                    returnKeyType="search"
                    value={this.state.userFilter}
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

    renderSelectedContacts() {
        return (
            <View style={styles.selectedContactsListSU}>
                {this.state.selectedContacts.length > 0 ? (
                    <Text style={styles.searchUsersTitle}>
                        Selected contacts:
                    </Text>
                ) : null}
                <FlatList
                    ItemSeparatorComponent={ContactsPickerItemSeparator}
                    ref={flatlist => {
                        this.selectedContactList = flatlist;
                    }}
                    renderItem={this.renderItemGray.bind(this)}
                    data={this.state.selectedContacts}
                    extraData={this.state}
                    keyExtractor={(item, index) => item.id}
                />
            </View>
        );
    }

    renderContactsList() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.addressBookContainer}
            >
                {this.state.notSelectedContacts.length > 0 ? (
                    <Text style={styles.searchUsersTitle}>Search results:</Text>
                ) : null}
                <FlatList
                    ItemSeparatorComponent={ContactsPickerItemSeparator}
                    ref={sectionList => {
                        this.contactsList = sectionList;
                    }}
                    style={styles.addressBook}
                    renderItem={this.renderItem.bind(this)}
                    data={this.state.notSelectedContacts}
                    extraData={this.state}
                    keyExtractor={(item, index) => item.id}
                    // ListHeaderComponent={this.renderSelectedContacts.bind(this)}
                />
            </KeyboardAvoidingView>
        );
    }

    renderButton() {
        const disabled = this.state.selectedContacts.length <= 0;
        return (
            <View style={styles.buttonAreaSU}>
                <TouchableOpacity
                    disabled={disabled}
                    style={[
                        styles.doneButtonSU,
                        {
                            backgroundColor: disabled
                                ? GlobalColors.frontmLightBlueTransparent
                                : GlobalColors.frontmLightBlue
                        }
                    ]}
                    onPress={this.onDone.bind(this)}
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
                    {this.renderSelectedContacts()}
                    {this.renderContactsList()}
                </View>
                {this.renderButton()}
            </SafeAreaView>
        );
    }
}
