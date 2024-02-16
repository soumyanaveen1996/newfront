import React from 'react';
import {
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    BackHandler
} from 'react-native';
import FrontMAddedContactsPickerDataSource from '../../../lib/utils/FrontMAddedContactsPickerDataSource';
import { HeaderBack, HeaderTitle } from '../../../widgets/Header';
import Images from '../../../config/images';
import ProfileImage from '../../../widgets/ProfileImage';
import styles from './styles';
import Icons from '../../../config/icons';
import I18n from '../../../config/i18n/i18n';
import { MainScreenStyles } from '../../Home/HomeTab/styles';
import NavigationAction from '../../../navigation/NavigationAction';
import SearchBar from '../../../widgets/SearchBar';
import AlertDialog from '../../../lib/utils/AlertDialog';

class NewGroup extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],
            searchString: '',
            selectedContact: []
        };
        console.log('the nav is 123336', this.props.navigation);
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            this.backHandler1 = BackHandler.addEventListener(
                'hardwareBackPress',
                this.onBack
            );
        }
        this.props.navigation.setParams({ onBack: this.onBack });
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') this.backHandler1?.remove();
    }

    onBack = () => {
        console.log('PRADDY21');
        const { selectedContact } = this.state;
        if (selectedContact.length > 0) {
            console.log('PRADDY21 5');

            this.confirmExit();
            return true;
        } else {
            console.log('PRADDY21 6');

            NavigationAction.pop();
        }
    };

    confirmExit = () => {
        AlertDialog.showCritical(
            'Are you sure you want to exit the group creation process?',
            ' You will loose the selection made',
            [
                { text: 'Cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        setTimeout(() => {
                            NavigationAction.popToFirst();
                        }, 500);
                    }
                }
            ]
        );
    };

    updateList = () => {
        let contacts = this.dataSource.getSortedData();
        console.log(contacts);
        contacts = contacts.filter((item) => item.contactType !== 'local');
        contacts = contacts.filter((item) => !item.isWaitingForConfirmation);
        console.log('filtered first', contacts);
        const { fromSelectedContact } = this.props.route.params;
        if (fromSelectedContact) {
            const initialData = this.props.route.params.fromSelectedContact;
            const ids = new Set(initialData.map((d) => d.id));
            contacts = [
                ...initialData,
                ...contacts.filter((d) => !ids.has(d.id))
            ];
        }
        this.setState({
            contactsData: contacts,
            selectedContact: fromSelectedContact || []
        });
    };

    onDataUpdate() {
        this.updateList();
    }

    renderItem = ({ item }) => {
        const {
            id,
            name,
            thumbnail,
            imageAvailable,
            userId,
            isSelected
        } = item;
        const { selectedContact, removeParticipants } = this.state;
        if (!thumbnail && imageAvailable) {
            this.dataSource.loadImage(id);
        }
        return (
            <TouchableOpacity
                onPress={() => this.onContactSelect(item)}
                style={[
                    styles.item,
                    selectedContact &&
                        selectedContact.includes(item) &&
                        styles.selectedItemContainer
                ]}
            >
                <View style={styles.groupInnerContainer}>
                    <ProfileImage
                        accessibilityLabel="Profile Picture"
                        testID="profile-picture"
                        uuid={id || userId}
                        userName={name}
                        style={styles.contactItemImage}
                        placeholder={Images.empty_user_image}
                        placeholderStyle={styles.contactItemImage}
                        resizeMode="cover"
                    />
                    <Text style={[styles.contactName]}>{name}</Text>
                </View>
                {selectedContact && selectedContact.includes(item) && (
                    <View style={styles.selectedIcon}>
                        {Icons.userSelected({ size: 20 })}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    onContactSelect = (item) => {
        const { selectedContact } = this.state;
        const { fromSelectedContact } = this.props.route.params;
        let contactArray = selectedContact;
        if (selectedContact && selectedContact.includes(item)) {
            const index = selectedContact.indexOf(item);
            contactArray.splice(index, 1);
        } else {
            contactArray = [...selectedContact, item];
        }
        this.setState({
            selectedContact: contactArray
        });

        this.props.navigation.setParams({
            isGroupCreate: contactArray.length > 0,
            createNewGroup: () => this.onDoneClick()
        });
    };

    onDoneClick = async () => {
        const {
            fromSelectedContact,
            channel,
            fromInfo
        } = this.props.route.params;
        const { removeParticipants, selectedContact } = this.state;

        if (fromInfo) {
            channel.logo = channel.logo || this.props.route.params.logo;
            this.props.route.params.onContactSelection?.(selectedContact);
            NavigationAction.pop();
        } else {
            NavigationAction.push(NavigationAction.SCREENS.createNewGroup, {
                selectedContact: this.state.selectedContact
            });
        }
    };

    onSearchQueryChange = (text) => {
        let contactsList = [];
        if (!text || text === '') {
            contactsList = this.dataSource.getSortedData();
        } else {
            contactsList = this.dataSource.getSortedFilteredData(text);
        }
        let contactsData = contactsList.filter(
            (item) => item.contactType !== 'local'
        );
        contactsData = contactsData.filter(
            (item) => !item.isWaitingForConfirmation
        );

        this.setState(
            {
                contactsData,
                searchString: text
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

    renderSearchBar = () => (
        <View style={MainScreenStyles.searchArea}>
            <SearchBar
                placeholder={I18n.t('Search_conv')}
                onChangeText={(searchString) =>
                    this.onSearchQueryChange(searchString)
                }
            />
        </View>
    );

    renderSelectedItem = ({ item }) => {
        const { id, userId, name, isSelected } = item;
        const firstName = name.split(' ')[0];
        return (
            <View style={styles.selectedItem}>
                <ProfileImage
                    accessibilityLabel="Profile Picture"
                    testID="profile-picture"
                    userName={name}
                    uuid={id || userId}
                    style={styles.contactItemImage}
                    placeholder={Images.empty_user_image}
                    placeholderStyle={styles.contactItemImage}
                    resizeMode="cover"
                />
                <Text style={styles.selectedName}>{firstName}</Text>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => this.removeSelectedContact(item)}
                >
                    {Icons.userCancel({ size: 20 })}
                </TouchableOpacity>
            </View>
        );
    };

    removeSelectedContact = (item) => {
        const { selectedContact } = this.state;
        const index = selectedContact.indexOf(item);
        selectedContact.splice(index, 1);
        this.setState({ selectedContact });

        this.props.navigation.setParams({
            isGroupCreate: selectedContact.length > 0,
            createNewGroup: () => this.onDoneClick()
        });
    };

    renderSelectedContact = () => {
        const { selectedContact } = this.state;
        return (
            <View style={styles.selectedContainer}>
                <FlatList
                    horizontal
                    data={selectedContact}
                    renderItem={this.renderSelectedItem}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    };

    render() {
        const { contactsData, searchString, selectedContact } = this.state;
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.addressBookContainer}
            >
                {this.renderSearchBar()}
                {selectedContact &&
                    selectedContact.length > 0 &&
                    this.renderSelectedContact()}
                <SafeAreaView style={styles.container}>
                    {contactsData &&
                    contactsData.length === 0 &&
                    searchString !== '' ? (
                        <View style={styles.noSearchFound}>
                            {Icons.userIcon({
                                size: 100,
                                color: 'rgb(232,232,232)'
                            })}
                            <Text style={styles.noSearchText}>
                                No results found for “{searchString}”
                            </Text>
                            <Text style={styles.noSearchSubText}>
                                Please check and try a new search
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={contactsData}
                            renderItem={this.renderItem}
                            keyExtractor={(item) => item.id}
                        />
                    )}
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }
}

export default NewGroup;
