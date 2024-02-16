import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    FlatList,
    ActivityIndicator,
    KeyboardAvoidingView,
    RefreshControl,
    Keyboardm,
    Keyboard,
    SafeAreaView,
    Dimensions
} from 'react-native';
import _ from 'lodash';
import { CheckBox } from '@rneui/themed';
import styles from './styles';
import { Auth, Contact } from '../../lib/capability';
import GlobalColors from '../../config/styles';
import {
    searchBarConfig,
    importCheckBoxConfig,
    SelectedCheckBoxConfig
} from './config';
import IconSearch from 'react-native-vector-icons/Ionicons';
import images from '../../images';
import I18n from '../../config/i18n/i18n';
import { HeaderBack, HeaderTitle } from '../../widgets/Header';
import ContactsPickerSectionHeader from './ContactComponents/ContactsPickerSectionHeader';
import EventEmitter from '../../lib/events';
import ContactsEvents from '../../lib/events/Contacts';
import { MainScreenStyles } from '../../Screens/Home/HomeTab/styles';
import Icons from '../../config/icons';
import { ImportConfirmModal } from './ContactComponents/ImportConfirmationModal';
import ContactServices from '../../apiV2/ContactServices';
import reactNativePermissions from 'react-native-permissions';
import PermissionList from '../../lib/utils/PermissionList';
import NavigationAction from '../../navigation/NavigationAction';
import SearchBar from '../../widgets/SearchBar';
import AlertDialog from '../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export default class AddressBookScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contactsData: [],
            searchContact: [],
            selectedData: [],
            searchText: '',
            email: [],
            keyboard: false,
            loading: false,
            upperHeight: 0,
            inviteButtonDisabled: true,
            selectAllCheck: false,
            isModalVisible: false
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({ onBack: this.onBack });
        this.contactListener = EventEmitter.addListener(
            ContactsEvents.phoneContactRefresh,
            this.onPhoneContactRefreshed
        );
        reactNativePermissions
            .check(PermissionList.CONTACTS)
            .then((response) => {
                if (response === reactNativePermissions.RESULTS.GRANTED) {
                    this.onPhoneContactRefreshed();
                } else if (response === reactNativePermissions.RESULTS.DENIED) {
                    reactNativePermissions
                        .request(PermissionList.CONTACTS)
                        .then((response) => {
                            if (
                                response ===
                                reactNativePermissions.RESULTS.GRANTED
                            ) {
                                this.onPhoneContactRefreshed();
                            } else {
                                Contact.alertForContactSPermission(
                                    NavigationAction.pop
                                );
                            }
                        });
                } else {
                    Contact.alertForContactSPermission(NavigationAction.pop);
                }
            });
    }

    componentWillUnmount() {
        if (this.contactListener) this.contactListener.remove();
    }

    onPhoneContactRefreshed = () => {
        // TODO: selct only contacts with email for invite
        console.log('|||||||||| lets get conatcts from DB:');
        if (this.state.contactsData.length > 1) {
            Contact.getContactsFromDatabase(
                !this.props.route.params.contactImport
            ).then((contacts) => {
                console.log('|||||||||| incoming contacts from DB:');
                this.setState({
                    contactsData: contacts,
                    searchContact: contacts,
                    loading: false,
                    refreshing: false
                });
            });
        } else {
            this.setState({ loading: true }, () => {
                Contact.getContactsFromDatabase(
                    !this.props.route.params.contactImport
                ).then((contacts) => {
                    console.log(
                        '|||||||||| incoming contacts from DB:',
                        contacts
                    );
                    this.setState({
                        contactsData: contacts,
                        searchContact: contacts,

                        loading: false,
                        refreshing: false
                    });
                });
            });
        }
    };

    onSearchQueryChange = (text) => {
        this.setState({ searchString: text });
        const searchContactList = [...this.state.searchContact];
        let contactsList = [...this.state.contactsData];
        const keyword = text.toLowerCase();

        if (!text && text === '') {
            contactsList = [...searchContactList];
        } else {
            contactsList = searchContactList.filter((element) =>
                element.userName.toLowerCase().includes(keyword.toLowerCase())
            );
        }
        this.setState({ contactsData: contactsList });
    };

    toggleSelectContacts = (index, type) => {
        const array = [...this.state.contactsData];
        const selectedData = [...this.state.selectedData];

        switch (type) {
            case 'add':
                selectedData.selected = !selectedData.selected;
                selectedData.push(array[index]);
                // array.splice(index, 1);
                break;
            default:
                array.push(selectedData[index]);
                selectedData.splice(index, 1);
                break;
        }

        this.setState({
            contactsData: array,
            searchContact: array,
            selectedData
        });
    };

    renderProfileImage = (profileImageSource) => {
        if (profileImageSource && profileImageSource !== '') {
            return (
                <Image
                    style={styles.profileImageStyle}
                    source={{
                        uri: `${profileImageSource}`
                    }}
                />
            );
        }
        return (
            <View>
                <Image
                    source={images.user_image}
                    style={styles.emptyContactItemImage}
                    resizeMode="contain"
                />
            </View>
        );
    };

    // will be using it while changing the layout to section List
    sectionHeader({ section }) {
        if (section.data.length === 0) {
            return <View style={{ height: 0 }} />;
        }
        return <ContactsPickerSectionHeader title={section.title} />;
    }

    findSelectedContact(contact) {
        return _.find(
            this.state.selectedData,
            (item) => item.contact_id === contact.contact_id
        );
    }

    onContactSelected = (contact) => {
        const selectedContact = this.findSelectedContact(contact);
        if (selectedContact) {
            const { selectedData } = this.state;
            // const contacts = _.remove(
            //     this.state.selectedData,
            //     item => item.contact_id !== contact.contact_id
            // );
            const contacts = selectedData.filter(
                (item) => item.contact_id !== contact.contact_id
            );

            this.setState({
                selectedData: contacts,
                inviteButtonDisabled: !(contacts.length > 0),
                selectAllCheck:
                    this.state.selectedData.length ===
                    this.state.searchContact.length
            });
            this.props.navigation.setParams({
                isContactSelected: contacts.length > 0,
                importContact: () => this.importContacts()
            });
        } else {
            this.state.selectedData.push(contact);
            this.setState({
                selectedData: this.state.selectedData,
                inviteButtonDisabled: false,
                selectAllCheck:
                    this.state.selectedData.length ===
                    this.state.searchContact.length
            });
            this.props.navigation.setParams({
                isContactSelected: true,
                importContact: () => this.importContacts()
            });
        }
    };

    onAllContactSelect = () => {
        const { contactsData, selectAllCheck, searchContact } = this.state;
        Keyboard.dismiss();
        if (!selectAllCheck) {
            this.setState({
                selectedData: searchContact,
                contactsData: searchContact,
                selectAllCheck: true
                // searchString: ''
            });
            this.props.navigation.setParams({
                isContactSelected: true,
                importContact: () => this.importContacts()
            });
        } else {
            this.setState({
                selectedData: [],
                selectAllCheck: false
            });
            this.props.navigation.setParams({
                isContactSelected: false,
                importContact: () => this.importContacts()
            });
        }
    };

    grpcInvite(user, emailIds) {
        return ContactServices.invite(emailIds);
    }

    formatContactsForAPICall = (contact) => ({
        phoneNumbers: {
            mobile: contact.phoneNumbers_mob,
            land: contact.phoneNumbers_land,
            satellite: contact.phoneNumbers_sat
        },
        profileImage: contact.profileImage,
        userName: contact.userName,
        emailAddresses: {
            home: contact.emailAddresses_home,
            work: contact.emailAddresses_work
        },
        userId: contact.contact_id
    });

    importContacts = () => {
        const formattedContacts = this.state.selectedData.map((item) =>
            this.formatContactsForAPICall(item)
        );

        const saveLocalContactData = {
            localContacts: formattedContacts
        };
        this.setState({ loading: true });
        ContactServices.add(saveLocalContactData)
            .then((result) => {
                if (result.error === 0) {
                    Toast.show({
                        text1: 'Import successful, Your Contacts will be refreshed shortly.',
                        type: 'success'
                    });
                    this.setState({ loading: false });
                    return Contact.refreshContacts();
                } else {
                    console.log(
                        'error on saving local contact ',
                        result.message
                    );
                    this.setState({ loading: false });
                    Toast.show({
                        text1: 'Something went wrong, please try again later'
                    });
                }
            })
            .catch((err) => {
                console.log('error on saving local contact ', err);
                this.setState({ loading: false });
                Toast.show({
                    text1: 'Something went wrong, please try again later'
                });
            });
    };

    renderName = (contact) => {
        const name = contact.name || contact.userName;

        return (
            <Text style={styles.contactItemName}>
                {name.length > 20 ? `${name.substring(0, 19)}...` : name}
            </Text>
        );
    };

    renderContactNumber = (contact) => {
        if (this.props.route.params.contactImport) {
            return (
                <Text style={styles.importContactPhoneNumber}>
                    {contact.phoneNumbers_mob ||
                        contact.phoneNumbers_land ||
                        contact.phoneNumbers_sat}
                </Text>
            );
        }
        return (
            <Text style={styles.importContactPhoneNumber}>
                {contact.emailAddresses_home || contact.phoneNumbers_work}
            </Text>
        );
    };

    renderItem = ({ item }) => (
        // eslint-disable-next-line max-len
        <TouchableOpacity
            style={
                this.findSelectedContact(item)
                    ? styles.selectedContactItemContainer
                    : styles.contactItemContainer
            }
            onPress={() => this.onContactSelected(item)}
        >
            <View style={styles.contactPickerRowContainer}>
                {this.renderProfileImage(item.profileImage)}
                <View style={styles.contactItemDetailsContainer}>
                    {this.renderName(item)}
                    {/* eslint-disable-next-line max-len */}
                    {this.findSelectedContact(item) && (
                        <View style={styles.selectedIcon}>
                            {Icons.userSelected({ size: 20 })}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    getDisplayText = () => {
        if (this.props.route.params.contactImport) {
            return `Import your selected phone contacts into ${I18n.t(
                'app'
            )} platform`;
        }
        return `Invite your selected phone contacts into ${I18n.t(
            'app'
        )} platform`;
    };

    renderSearchBar() {
        return (
            <View style={MainScreenStyles.searchArea}>
                <SearchBar
                    onChangeText={(text) => this.onSearchQueryChange(text)}
                    value={this.state.searchString}
                />
            </View>
        );
    }

    renderSelectedContact = () => {
        const { selectedData } = this.state;
        return (
            <View style={styles.selectedContainer}>
                <FlatList
                    horizontal
                    data={selectedData}
                    renderItem={this.renderSelectedItem}
                    keyExtractor={(item) => 'i' + item.contact_id}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    };

    renderSelectedItem = ({ item }) => {
        const { contact_id, userName } = item;
        const firstName = userName.split(' ')[0];

        return (
            <View style={styles.selectedItem}>
                {this.renderSelectedProfileImage(item.profileImage)}
                <Text style={styles.selectedName} numberOfLines={1}>
                    {firstName}
                </Text>
                {/* eslint-disable-next-line max-len */}
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => this.onContactSelected(item)}
                >
                    {Icons.userCancel({ size: 20 })}
                </TouchableOpacity>
            </View>
        );
    };

    renderSelectedProfileImage = (profileImageSource) => {
        if (profileImageSource && profileImageSource !== '') {
            return (
                <Image
                    style={styles.selectedContactItemImage}
                    source={{
                        uri: `${profileImageSource}`
                    }}
                />
            );
        }
        return (
            <View>
                <Image
                    source={images.user_image}
                    style={styles.selectedContactItemImage}
                    resizeMode="contain"
                />
            </View>
        );
    };

    toggleConfirmModal = (flag) => {
        if (flag) {
            this.setState({ isModalVisible: false });
            NavigationAction.pop();
        } else {
            this.setState({ isModalVisible: flag });
        }
    };

    onBack = () => {
        const { selectedData } = this.state;
        if (selectedData.length > 0) {
            this.setState({ isModalVisible: true });
        } else {
            NavigationAction.pop();
        }
    };

    render() {
        const {
            selectAllCheck,
            selectedData,
            contactsData,
            searchContact,
            isModalVisible
        } = this.state;
        // eslint-disable-next-line max-len
        const contacts = _.sortBy(contactsData, (contact) => contact.userName);
        const isSelected =
            selectedData &&
            searchContact &&
            selectedData.length !== 0 &&
            selectedData.length < searchContact.length;
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={60}
                style={{ flex: 1, backgroundColor: GlobalColors.appBackground }}
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.innerContainer}>
                        <View
                            style={{
                                backgroundColor:
                                    GlobalColors.contentBackgroundColor,
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                flexDirection: 'row'
                            }}
                        >
                            <CheckBox
                                uncheckedIcon={
                                    importCheckBoxConfig.uncheckedIcon
                                }
                                // eslint-disable-next-line max-len
                                checkedIcon={
                                    isSelected
                                        ? SelectedCheckBoxConfig.checkedIcon
                                        : importCheckBoxConfig.checkedIcon
                                }
                                checkedColor={importCheckBoxConfig.checkedColor}
                                // eslint-disable-next-line max-len
                                iconType={
                                    isSelected
                                        ? SelectedCheckBoxConfig.iconType
                                        : importCheckBoxConfig.iconType
                                }
                                checked={isSelected || selectAllCheck}
                                onPress={() => this.onAllContactSelect()}
                                size={24}
                                containerStyle={styles.checkboxIconStyle}
                            />

                            <Text
                                style={{
                                    alignSelf: 'center',
                                    fontSize: 16,
                                    color: GlobalColors.primaryButtonColor
                                }}
                            >
                                {isSelected
                                    ? `${selectedData.length} selected`
                                    : 'Select All'}
                            </Text>
                        </View>
                        {this.renderSearchBar()}
                        {selectedData && this.renderSelectedContact()}
                        <View
                            style={{
                                marginBottom: 20
                            }}
                        >
                            <FlatList
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={() => {
                                            this.setState(
                                                { refreshing: true },
                                                () => {
                                                    Contact.syncPhoneContacts();
                                                }
                                            );
                                        }}
                                        refreshing={this.state.refreshing}
                                    />
                                }
                                keyboardShouldPersistTaps="handled"
                                data={contacts}
                                renderItem={this.renderItem}
                                keyExtractor={(item) => item.contact_id}
                                extraData={this.state.contactsData}
                                removeClippedSubviews={Platform.OS !== 'ios'} // Unmount components when outside of window
                                initialNumToRender={2} // Reduce initial render amount
                                maxToRenderPerBatch={100} // Increase time between renders
                                windowSize={7} // Reduce the window size
                            />
                        </View>
                    </View>

                    <ImportConfirmModal
                        isModalVisible={isModalVisible}
                        toggleModal={this.toggleConfirmModal}
                    />

                    {this.state.loading && (
                        <ActivityIndicator
                            size="large"
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                alignItems: 'center',
                                backgroundColor: GlobalColors.appBackground,
                                alignSelf: 'center',
                                justifyContent: 'center'
                            }}
                            color={GlobalColors.primaryTextColor}
                        />
                    )}
                    {/* </BackgroundImage> */}
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}
