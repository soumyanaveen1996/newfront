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
    Image
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
import Modal from 'react-native-modal';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { Icons } from '../../config/icons';
const R = require('ramda');

class NewCallContacts extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            contactsData: [],
            contactVisible: false,
            contactSelected: null
        };
    }

    async componentDidMount() {
        if (this.props.appState.contactsLoaded) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
            });
        }

        if (
            Actions.prevScene === ROUTER_SCENE_KEYS.dialler &&
            this.props.summary
        ) {
            Actions.callSummary({
                time: this.props.callTime,
                contact: this.props.dialContact,
                dialledNumber: this.props.dialledNumber
            });
            return;
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.contactsLoaded !==
            this.props.appState.contactsLoaded
        ) {
            // this.refresh()
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
            });
        }

        if (
            prevProps.appState.refreshContacts !==
            this.props.appState.refreshContacts
        ) {
            Contact.getAddedContacts().then(contacts => {
                this.refresh(contacts);
            });
        }
    }

    static onEnter() {
        const user = Store.getState().user;
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('Contacts_call'),
            I18n.t('Contacts')
        );
        Store.dispatch(refreshContacts(true));
    }

    static onExit() {
        Store.dispatch(refreshContacts(false));
        Store.dispatch(setCurrentScene('none'));
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Contacts_call');
    }

    setContactVisible = (value, contact) =>
        this.setState({ contactVisible: value, contactSelected: contact });

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
                        phoneNumbers: contact.phoneNumbers || undefined
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
        console.log('Call This Guy', contact);

        // TEmp Coding
        this.setContactVisible(true, contact);
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
                {/* {!this.props.appState.contactsLoaded ? (
                    <ActivityIndicator size="small" />
                ) : null} */}
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

    makeVoipCall = () => {
        console.log(this.state.contactSelected);
        const { contactSelected } = this.state;
        if (!contactSelected) {
            alert('Sorry, cannot make call!');
            return;
        }
        this.setContactVisible(false, null);
        let participants = [
            {
                userId: contactSelected.id,
                userName: contactSelected.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.peopleChat({
                bot: imBot,
                otherParticipants: participants,
                call: true
            });
        });
    };

    makePstnCall = () => {
        console.log(this.state.contactSelected);
        const { contactSelected } = this.state;
        if (!contactSelected) {
            alert('Sorry, cannot make call!');
            return;
        }
        this.setContactVisible(false, null);
        Actions.dialler({
            call: true,
            number: this.state.contactSelected.phoneNumbers.mobile,
            contact: this.state.contactSelected,
            newCallScreen: true
        });
    };

    render() {
        const { contactSelected } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                {this.renderContactsList()}
                <Modal
                    isVisible={this.state.contactVisible}
                    onBackdropPress={() => {
                        this.setContactVisible(false, null);
                    }}
                    onBackButtonPress={() =>
                        this.setContactVisible(false, null)
                    }
                    onSwipe={() => this.setContactVisible(false, null)}
                    swipeDirection="right"
                >
                    {contactSelected ? (
                        <View style={styles.contactModal}>
                            <View style={styles.modalContainer}>
                                <ProfileImage
                                    uuid={contactSelected.id}
                                    placeholder={Images.user_image}
                                    style={styles.avatarImageModal}
                                    placeholderStyle={styles.avatarImageModal}
                                    resizeMode="cover"
                                />
                                <View style={styles.nameContainer}>
                                    <Text style={styles.modalContactName}>
                                        {contactSelected.name}
                                    </Text>
                                </View>
                                {/* PSTN Phone */}
                                <View style={styles.phoneContainer}>
                                    <View style={styles.modalTextContainerImg}>
                                        <Image
                                            style={{ width: 16, height: 16 }}
                                            source={require('../../images/tabbar-contacts/phone-good.png')}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.modalText}>
                                            Mobile
                                        </Text>
                                    </View>
                                    <View style={styles.modalNumberContainer}>
                                        <Text
                                            style={{
                                                color: 'rgba(155,155,155,1)',
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            {contactSelected.phoneNumbers
                                                ? contactSelected.phoneNumbers
                                                    .mobile
                                                : 'Not Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.modalCallButContainer}>
                                        <TouchableOpacity
                                            style={
                                                contactSelected.phoneNumbers &&
                                                contactSelected.phoneNumbers
                                                    .mobile
                                                    ? styles.callButton
                                                    : styles.callButtonDisabled
                                            }
                                            onPress={this.makePstnCall}
                                            disabled={
                                                !(
                                                    contactSelected.phoneNumbers &&
                                                    contactSelected.phoneNumbers
                                                        .mobile
                                                )
                                            }
                                        >
                                            {Icons.greenCallOutline()}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* Satellite Call */}
                                <View style={styles.phoneContainer}>
                                    <View style={styles.modalTextContainerImg}>
                                        <Image
                                            style={styles.modalImage}
                                            source={require('../../images/tabbar-contacts/sat-phone-3.png')}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.modalText}>
                                            Satellite
                                        </Text>
                                    </View>
                                    <View style={styles.modalNumberContainer}>
                                        <Text
                                            style={{
                                                color: 'rgba(155,155,155,1)'
                                            }}
                                            ellipsizeMode="tail"
                                            numberOfLines={1}
                                        >
                                            Not Available
                                        </Text>
                                    </View>
                                    <View style={styles.modalCallButContainer}>
                                        <TouchableOpacity
                                            disabled={true}
                                            style={styles.callButtonDisabled}
                                            onPress={() =>
                                                console.log('Call Phone')
                                            }
                                        >
                                            {Icons.greenCallOutline()}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* VOIP Call */}
                                <View style={styles.phoneContainer}>
                                    <View style={styles.modalTextContainerImg}>
                                        <Image
                                            style={styles.modalImage}
                                            source={require('../../images/tabbar-marketplace/tabbar-marketplace.png')}
                                        />
                                        <Text style={styles.modalText}>
                                            FrontM
                                        </Text>
                                    </View>
                                    <View style={styles.modalNumberContainer}>
                                        <Text
                                            style={{
                                                color: 'rgba(47,199,111,1)'
                                            }}
                                        >
                                            *Free
                                        </Text>
                                    </View>
                                    <View style={styles.modalCallButContainer}>
                                        <TouchableOpacity
                                            style={styles.callButton}
                                            onPress={this.makeVoipCall}
                                        >
                                            {Icons.greenCallOutline()}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View />
                    )}
                </Modal>
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
)(NewCallContacts);
