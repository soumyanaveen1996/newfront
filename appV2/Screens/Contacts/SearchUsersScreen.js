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
    InteractionManager
} from 'react-native';
import _ from 'lodash';
import styles from './styles';
import GlobalColors from '../../config/styles';
import ContactsPickerSectionHeader from './ContactsPickerSectionHeader';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig,
    checkBoxConfig
} from './config';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import { MainScreenStyles } from '../MainScreen/styles';
import { Contact } from '../../lib/capability';

import Icons from '../../config/icons';
import I18n from '../../config/i18n/i18n';
import Images from '../../config/images';
import ProfileImage from '../ProfileImage';

import ContactServices from '../../apiV2/ContactServices';
import NavigationAction from '../../navigation/NavigationAction';

const R = require('ramda');

export default class SearchUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            notSelectedContacts: [],
            selectedContacts: [],
            loading: false,
            userFilter: '',
            searchExecuted: false,
            justSearched: false
        };
    }

    findSelectedContact(contact) {
        return _.find(
            this.state.selectedContacts,
            (item) => item.userId === contact.userId
        );
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() =>
            this.text ? this.text.focus() : this
        );
    }

    search() {
        this.setState({ loading: true });
        ContactServices.find(this.state.userFilter.trim()).then((res) => {
            const sortedArray = res.content.sort((a, b) =>
                a.userName.localeCompare(b.userName)
            );
            const alphabets = 'abcdefghijklmnopqrstuvwxyz#'.split('');
            const sectionDataWithHeader = [];
            alphabets.forEach((alphabet, index) => {
                const sectionData = [];
                console.log(`item: ${alphabet}`);
                sortedArray.forEach((data, index) => {
                    // let aa = data.userName.toLowerCase().indexOf(item.toLowerCase() === 0
                    if (
                        data.userName
                            .toLowerCase()
                            .indexOf(alphabet.toLowerCase()) === 0
                    ) {
                        sectionData.push(data);
                    }
                });
                if (sectionData && sectionData.length > 0) {
                    sectionDataWithHeader.push({
                        title: alphabet.toUpperCase(),
                        data: sectionData
                    });
                    console.log(
                        `sectionDataWithHeader: ${JSON.stringify(
                            sectionDataWithHeader
                        )}`
                    );
                }
            });
            // old
            // this.setState({
            //     contactsData: res.data.content,
            //     notSelectedContacts: _.differenceBy(
            //         res.data.content.slice(),
            //         this.state.selectedContacts,
            //         'userId'
            //     ),
            //     loading: false,
            //     userFilter: this.state.userFilter.trim(),
            //     searchExecuted: true,
            //     justSearched: true
            // });
            // new

            this.setState({
                contactsData: sectionDataWithHeader,
                notSelectedContacts: _.differenceBy(
                    sectionDataWithHeader.slice(),
                    this.state.selectedContacts,
                    'userId'
                ),
                loading: false,
                userFilter: this.state.userFilter.trim(),
                searchExecuted: true,
                justSearched: true
            });
        });
    }

    onDone() {
        this.setState({ loading: true });
        this.props.route.params.onDone(this.state.selectedContacts).then(() => {
            Contact.refreshContacts();
            this.setState({ loading: false });
            NavigationAction.pop();
        });
    }

    onContactSelected(user) {
        const isAlreadySelected = this.findSelectedContact(user);
        if (isAlreadySelected) {
            const contacts = _.remove(
                this.state.selectedContacts,
                (item) => item.userId !== user.userId
            );
            this.setState({
                selectedContacts: contacts,
                notSelectedContacts: this.state.notSelectedContacts
            });
            this.props.navigation.setParams({
                isContactSelected: contacts.length > 0,
                importContact: () => this.onDone()
            });
        } else {
            this.state.selectedContacts.push(user);
            this.setState({
                notSelectedContacts: this.state.notSelectedContacts,
                selectedContacts: this.state.selectedContacts,
                justSearched: false
            });
            this.props.navigation.setParams({
                isContactSelected: this.state.selectedContacts.length > 0,
                importContact: () => this.onDone()
            });
        }
    }

    renderSearchBar() {
        return (
            <View style={MainScreenStyles.searchArea}>
                {this.state.loading && <ActivityIndicator size="small" />}
                {Platform.OS === 'ios' ? (
                    <View style={MainScreenStyles.iosSearchArea}>
                        <View style={MainScreenStyles.iosSearchIcon}>
                            {Icons.timelineSearch({
                                color: '#a2a4ac',
                                size: 25
                            })}
                        </View>
                        <TextInput
                            style={MainScreenStyles.input}
                            ref={(el) => (this.text = el)}
                            underlineColorAndroid="transparent"
                            placeholder={I18n.t('SearchUsers')}
                            autoFocus
                            selectionColor={GlobalColors.cursorColor}
                            placeholderTextColor={
                                searchBarConfig.placeholderTextColor
                            }
                            enablesReturnKeyAutomatically
                            onSubmitEditing={this.search.bind(this)}
                            onChangeText={(text) =>
                                this.setState({ userFilter: text })
                            }
                            clearButtonMode="always"
                            returnKeyType="search"
                            value={this.state.userFilter}
                        />
                    </View>
                ) : (
                    <TextInput
                        inlineImageLeft="searchfield"
                        inlineImagePadding={12}
                        style={MainScreenStyles.input}
                        ref={(el) => (this.text = el)}
                        underlineColorAndroid="transparent"
                        placeholder={I18n.t('SearchUsers')}
                        autoFocus
                        selectionColor={GlobalColors.cursorColor}
                        placeholderTextColor={
                            searchBarConfig.placeholderTextColor
                        }
                        enablesReturnKeyAutomatically
                        onSubmitEditing={this.search.bind(this)}
                        onChangeText={(text) =>
                            this.setState({ userFilter: text })
                        }
                        clearButtonMode="always"
                        returnKeyType="search"
                        value={this.state.userFilter}
                    />
                )}
            </View>
        );
    }

    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        }
        return <ContactsPickerSectionHeader title={section.title} />;
    }

    getContactEmail = (contact) => {
        // console.log('emails ', contact);

        // https://ramdajs.com/docs/#pathOr

        const homeEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'home'],
            contact
        );
        const workEmail = R.pathOr(
            null,
            ['emails', 0, 'email', 'work'],
            contact
        );
        const generalEmail =
            typeof R.pathOr(null, ['emails', 0, 'email'], contact) === 'string'
                ? R.pathOr(null, ['emails', 0, 'email'], contact)
                : null;

        if (generalEmail) {
            return (
                <Text style={styles.contactItemEmail}>
                    {contact.emails[0].email}
                </Text>
            );
        }

        if (workEmail) {
            return <Text style={styles.contactItemEmail}>{workEmail}</Text>;
        }
        if (homeEmail) {
            return <Text style={styles.contactItemEmail}>{homeEmail}</Text>;
        }
    };

    getCityAndCompany = (contact) => {
        const city = R.pathOr(null, ['address', 'city'], contact);
        const text = [contact.userCompanyName, city].filter(Boolean).join(', ');
        if (text) return <Text style={styles.contactItemEmail}>{text}</Text>;
    };

    renderRow(item, color) {
        const contact = item;
        if (!contact.thumbnail && contact.imageAvailable) {
            this.dataSource.loadImage(contact.userId);
        }
        return (
            <View>
                <TouchableOpacity
                    // eslint-disable-next-line max-len
                    style={
                        this.findSelectedContact(item)
                            ? styles.selectedContactContainer
                            : styles.contactContainer
                    }
                    onPress={() => this.onContactSelected(contact)}
                >
                    <ProfileImage
                        accessibilityLabel="Profile Picture"
                        testID="profile-picture"
                        uuid={contact.id || contact.userId}
                        style={styles.contactItemImage}
                        placeholder={Images.user_image}
                        placeholderStyle={styles.contactItemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.contactNameContainer}>
                        <Text style={styles.participantName}>
                            {contact.name || contact.userName}
                        </Text>
                        {this.getContactEmail(contact)}
                        {this.getCityAndCompany(contact)}
                    </View>
                </TouchableOpacity>
                {/* <View style={styles.separateRowItems} /> */}
            </View>
        );
    }

    renderItem = ({ item }) => {
        return this.renderRow(item);
    };

    renderButton() {
        const disabled = this.state.selectedContacts.length <= 0;
        return (
            <View style={styles.buttonAreaSU}>
                <View style={{ flex: 3, marginHorizontal: 10 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'rgba(60, 60, 67, 0.6)'
                        }}
                    >
                        {`Add selected ${I18n.t(
                            'app'
                        )} users to your contact list`}
                    </Text>
                </View>
                <TouchableOpacity
                    disabled={disabled}
                    style={[
                        styles.doneButtonSU,
                        {
                            backgroundColor: disabled
                                ? GlobalColors.primaryButtonColorDisabled
                                : GlobalColors.frontmLightBlue
                        }
                    ]}
                    onPress={this.onDone.bind(this)}
                >
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={74}
            >
                <SafeAreaView style={styles.containerSU}>
                    <View style={styles.searchContainerSU}>
                        <NetworkStatusNotchBar />
                        {this.renderSearchBar()}
                        {this.state.searchExecuted &&
                        (!this.state.notSelectedContacts ||
                            this.state.notSelectedContacts.length < 1) &&
                        this.state.justSearched ? (
                            <Text
                                style={{
                                    textAlign: 'center',
                                    marginTop: 50,
                                    fontSize: 16
                                }}
                            >
                                No contacts found.
                            </Text>
                        ) : (
                            <View
                                style={{
                                    flex: 1
                                }}
                            >
                                <SectionList
                                    // ItemSeparatorComponent={
                                    //     ContactsPickerItemSeparator
                                    // }
                                    sections={this.state.contactsData}
                                    keyExtractor={(item, index) =>
                                        item.userId + index
                                    }
                                    renderItem={this.renderItem}
                                    // renderSectionHeader={this.sectionHeader.bind(
                                    //     this
                                    // )}
                                    extraData={this.state.contactsData}
                                    removeClippedSubviews={
                                        Platform.OS !== 'ios'
                                    } // Unmount components when outside of window
                                    initialNumToRender={2} // Reduce initial render amount
                                    maxToRenderPerBatch={1} // Reduce number in each render batch
                                    maxToRenderPerBatch={100} // Increase time between renders
                                    windowSize={7} // Reduce the window size
                                />
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}
