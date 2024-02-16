import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TextInput,
    FlatList
} from 'react-native';
import styles from './styles';
import GlobalColors from '../../config/styles';
import ProfileImage from '../../widgets/ProfileImage/ProfileImage';
import Images from '../../config/images';
import Contact, { ContactType } from '../../lib/capability/Contact';
import config from '../../config/config';
import SystemBot from '../../lib/bot/SystemBot';
import CallModal from './ContactComponents/CallModal';
import images from '../../images';
import { Icon } from '@rneui/themed';
import { Conversation } from '../../lib/conversation';
import { ConversationDAO } from '../../lib/persistence';
import Loader from '../../widgets/Loader';
import Store from '../../redux/store/configureStore';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { NETWORK_STATE } from '../../lib/network';
import Icons from '../../config/icons';
import I18n from '../../config/i18n/i18n';
import { Auth } from '../../lib/capability';
import ContactServices from '../../apiV2/ContactServices';
import NavigationAction from '../../navigation/NavigationAction';
import TimelineBuilder from '../../lib/TimelineBuilder/TimelineBuilder';
import countries from '../../lib/utils/ListOfCountries';
import { getContactRankImage } from './config';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import configToUse from '../../config/config';
import AlertDialog from '../../lib/utils/AlertDialog';
import AppFonts from '../../config/fontConfig';

export default class ContactDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        const dataContact = props.route.params.contact;
        this.contactData = props.route.params.contact;
        this.state = {
            modalVisible: false,
            isFavourite: props.route.params.contact.isFavourite,
            loading: false,
            isDeleteModalVisible: false,
            addressLine1:
                (dataContact.address && dataContact.address.addressLine1) || '',
            city: (dataContact.address && dataContact.address.city) || '',
            state: (dataContact.address && dataContact.address.state) || '',
            postCode:
                (dataContact.address && dataContact.address.postCode) || '',
            country: (dataContact.address && dataContact.address.country) || ''
        };

        this.userInfo = Auth.getUserData();
        console.log('the full detail of contact in CD -', this.contactData);
    }

    componentDidMount() {
        this.props.navigation.setParams({
            isEditEnable:
                this.props.route.params.contact.contactType ===
                ContactType.LOCAL,
            onEditClick: this.onEditClick
        });
    }

    onEditClick = () => {
        NavigationAction.push(NavigationAction.SCREENS.newContactScreen, {
            title: 'Edit Contact',
            contact: this.props.route.params.contact,
            updateContact: this.updateContact
        });
    };

    static onEnter() {
        const { user } = Store.getState();
        if (user.contactsLoaded === false) {
            Contact.refreshContacts();
        }
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Contacts'));
        Store.dispatch(refreshContacts(true));
    }

    startChat() {
        // console.log('ID ' + this.props.route.params.contact.id);
        const participants = [
            {
                userId: this.props.route.params.contact.id,
                userName: this.props.route.params.contact.name
            }
        ];
        SystemBot.get(SystemBot.imBotManifestName).then((imBot) => {
            const conversationId = Conversation.getIMConversationId(
                this.userInfo.userId,
                this.props.route.params.contact.id
            );
            NavigationAction.goToUsersChat({
                bot: imBot,
                otherParticipants: participants,
                onBack: this.props.route.params.onBack,
                otherUserId: participants[0].userId,
                otherUserName: participants[0].userName,
                comingFromNotif: {
                    notificationFor: 'peopleChat',
                    getConversation: true,
                    otherUserId: participants[0].userId,
                    conversationId,
                    userDomain: imBot?.userDomain,
                    onRefresh: () => TimelineBuilder.buildTiimeline()
                }
            });
        });
    }

    updateContact = () => {
        this.forceUpdate();
    };

    onDirectCall = () => {
        const { phoneNumbers, contactType } = this.props.route.params.contact;
        if (contactType !== ContactType.LOCAL) {
            const user = Auth.getUserData();
            if (user) {
                NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                    voipCallData: {
                        otherUserId: this.props.route.params.contact.id,
                        otherUserName: this.props.route.params.contact.name
                    },
                    userId: user.userId,
                    title: this.props.route.params.contact.name,
                    isVideoCall: false
                });
            }
            return;
        }
        if (phoneNumbers) {
            if (phoneNumbers.mobile && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.mobile);
            } else if (phoneNumbers.land && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.land);
            } else if (phoneNumbers.satellite && config.showPSTNCalls) {
                this.makePhoneCall(phoneNumbers.satellite);
            }
        }
    };

    makePhoneCall = (number) => {
        if (Store.getState().user.network !== NETWORK_STATE.none) {
            NavigationAction.push(NavigationAction.SCREENS.dialler, {
                call: true,
                number: number.replace(' ', ''),
                contact: this.props.route.params.contact,
                newCallScreen: true
            });
        } else {
            AlertDialog.show('No network connection', 'Cannot make the call');
        }
    };

    checkAvailableContacts(phoneNumbers) {
        let availableContacts = 0;
        for (const key in phoneNumbers) {
            if (phoneNumbers[key] !== null && phoneNumbers[key] !== '') {
                availableContacts++;
            }
        }
        return availableContacts;
    }

    renderNameArea() {
        const contactGroupByRank = Store.getState().user.roleL2Colors;
        return (
            <View style={styles.topContainerCD}>
                <View style={styles.topAreaCD}>
                    <ProfileImage
                        uuid={this.props.route.params.contact.id}
                        placeholder={Images.user_image}
                        style={styles.propicCD}
                        placeholderStyle={styles.propicCD}
                        resizeMode="cover"
                        textSize={38}
                        userName={this.props.route.params.contact.name}
                    />
                    {this.contactData.rankLevel3 ||
                    this.contactData.rankLevel1 ? (
                        <View style={styles.rankLogoCD}>
                            <Image
                                style={{
                                    height: 24,
                                    width: 24,
                                    borderRadius: 12
                                }}
                                resizeMode="cover"
                                source={getContactRankImage(this.contactData)}
                            />
                        </View>
                    ) : null}
                </View>
                <View
                    style={{
                        marginTop: 18,
                        marginBottom: 22,
                        alignItems: 'center'
                    }}
                >
                    <View>
                        <Text style={styles.nameCD}>
                            {this.props.route.params.contact.name}
                        </Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            {this.contactData.rankLevel2 ? (
                                <View
                                    style={[
                                        {
                                            backgroundColor:
                                                contactGroupByRank[
                                                    `${this.contactData.rankLevel1}`
                                                ]['lightColor']
                                        },
                                        styles.rankColorContainer
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.aboutUserCD,
                                            {
                                                color: contactGroupByRank[
                                                    `${this.contactData.rankLevel1}`
                                                ]['darkColor']
                                            }
                                        ]}
                                    >
                                        {this.contactData?.rankLevel2}
                                    </Text>
                                </View>
                            ) : null}
                            {this.contactData.rankLevel3 ? (
                                <View style={{ marginLeft: 10 }}>
                                    <Text
                                        style={[
                                            styles.aboutUserCD,
                                            { color: 'rgb(68,72,90)' }
                                        ]}
                                    >
                                        {this.contactData?.rankLevel3}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>

                {this.props.route.params.contact.isWaitingForConfirmation ? (
                    <Text
                        style={{
                            textAlign: 'center',
                            color: GlobalColors.descriptionText,
                            fontSize: 14
                        }}
                    >
                        Awaiting for authorization
                    </Text>
                ) : null}
            </View>
        );
    }

    addToFavourite = () => {
        console.log('contacts details ', this.props.route.params.contact);
        this.setState({ loading: true });
        const data = {
            type: 'contacts',
            userId: this.props.route.params.contact.id,
            action: 'add',
            userDomain: 'frontmai'
        };

        Conversation.setFavorite(data)
            .then((value) => {
                // console.log('contacts Set as favorite', value);
                Contact.getAddedContacts().then((contactsData) => {
                    const updateContacts = contactsData.map((elem) => {
                        if (elem.userId === value.otherUserId) {
                            elem.isFavourite = true;
                        }

                        return elem;
                    });
                    Contact.saveContacts(updateContacts).then(() => {
                        this.props.route.params.updateContactScreen();
                        this.setState({ isFavourite: true });
                    });
                });

                const conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );

                if (conversationId) {
                    ConversationDAO.updateConvFavorite(conversationId, 1)
                        .then(() => {
                            // Conversation.downloadRemoteConversations(true);
                            console.log('Updated db>>>>>>>');
                            TimelineBuilder.buildTiimeline(true);
                        })
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }
                this.setState({ loading: false });
            })
            .catch((err) => {
                this.setState({ loading: false });
                console.log('Cannot set favorite', err);
                Toast.show({
                    text1: 'Cannot set favorite!'
                });
            });
    };

    removeFavourite = () => {
        // console.log('contacts details ', this.props.route.params.contact);
        this.setState({ loading: true });
        const data = {
            type: 'contacts',
            userId: this.props.route.params.contact.id,
            action: 'remove',
            userDomain: 'frontmai'
        };

        Conversation.setFavorite(data)
            .then((value) => {
                console.log('contacts Set as unfavorite', value);
                Contact.getAddedContacts().then((contactsData) => {
                    const updateContacts = contactsData.map((elem) => {
                        if (elem.userId === value.otherUserId) {
                            elem.isFavourite = false;
                        }

                        return elem;
                    });

                    Contact.saveContacts(updateContacts).then(() => {
                        this.props.route.params.updateContactScreen();
                        this.setState({ isFavourite: false });
                    });
                });
                const conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );
                if (conversationId) {
                    ConversationDAO.updateConvFavorite(conversationId, 0)
                        .then(() => {
                            console.log('Updated db>>>>>>>');
                            // Conversation.downloadRemoteConversations(true);
                            TimelineBuilder.buildTiimeline(true);
                        })
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }

                // console.log('conversation ID', conversationId);
                this.setState({ loading: false });
            })
            .catch((err) => {
                this.setState({ loading: false });
                console.log('Cannot remove favorite', err);
            });
    };

    checkFavourite = () => {
        if (
            this.props.route.params.contact.contactType &&
            this.props.route.params.contact.contactType !== ContactType.LOCAL
        ) {
            if (this.state.isFavourite) {
                return (
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={() => {
                            this.removeFavourite();
                        }}
                    >
                        <View style={[styles.actionIconCD]}>
                            <Image
                                source={images.contactFav}
                                style={{ width: 32, height: 32 }}
                            />
                        </View>
                        <Text style={styles.contactDSactiontext}>
                            Favourite
                        </Text>
                    </TouchableOpacity>
                );
            }
            return (
                <TouchableOpacity
                    style={styles.actionButtonCD}
                    onPress={() => {
                        this.addToFavourite();
                    }}
                >
                    <View style={[styles.actionIconCD]}>
                        <Image
                            source={images.favBgRound}
                            style={{ width: 32, height: 32 }}
                        />
                    </View>
                    <Text style={styles.contactDSactiontext}>Favourite</Text>
                </TouchableOpacity>
            );
        }
    };

    renderActionButtons() {
        const items = [];
        if (
            this.props.route.params.contact.contactType &&
            this.props.route.params.contact.contactType !== ContactType.LOCAL &&
            this.props.route.params.contact.type !== 'Vessels'
        ) {
            items.push(
                <TouchableOpacity
                    style={styles.actionButtonCD}
                    onPress={this.startChat.bind(this)}
                >
                    <Image
                        resizeMode="contain"
                        style={[
                            styles.actionIconCD,
                            {
                                tintColor: GlobalColors.primaryButtonColor
                            }
                        ]}
                        source={Images.contactChat}
                    />
                    <Text style={styles.contactDSactiontext}>Chat</Text>
                </TouchableOpacity>
            );
        }
        {
            this.props.route.params.contact.contactType === ContactType.LOCAL &&
            config.showPSTNCalls &&
            (!this.props.route.params.contact.phoneNumbers ||
                !Object.values(
                    this.props.route.params.contact.phoneNumbers
                ).find((number) => number))
                ? null
                : items.push(
                      <TouchableOpacity
                          style={styles.actionButtonCD}
                          onPress={this.onDirectCall}
                      >
                          <Image
                              resizeMode="cover"
                              style={styles.actionIconCD}
                              source={Images.contactCall}
                          />
                          <Text style={styles.contactDSactiontext}>Call</Text>
                      </TouchableOpacity>
                  );
        }
        {
            this.props.route.params.contact.contactType === ContactType.LOCAL
                ? null
                : items.push(
                      <TouchableOpacity
                          style={styles.actionButtonCD}
                          onPress={this.makeVideoCall}
                      >
                          <Image
                              resizeMode="cover"
                              style={styles.actionIconCD}
                              source={Images.contactVideoCall}
                          />
                          <Text style={styles.contactDSactiontext}>
                              Videocall
                          </Text>
                      </TouchableOpacity>
                  );
        }

        if (
            this.props.route.params.contact.contactType &&
            this.props.route.params.contact.contactType !== ContactType.LOCAL
        ) {
            if (this.state.isFavourite) {
                items.push(
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={() => {
                            this.removeFavourite();
                        }}
                    >
                        <View style={[styles.actionIconCD]}>
                            <Image
                                source={images.contactFav}
                                style={{ width: 32, height: 32 }}
                            />
                        </View>
                        <Text style={styles.contactDSactiontext}>
                            Favourite
                        </Text>
                    </TouchableOpacity>
                );
            } else {
                items.push(
                    <TouchableOpacity
                        style={styles.actionButtonCD}
                        onPress={() => {
                            this.addToFavourite();
                        }}
                    >
                        <View style={[styles.actionIconCD]}>
                            <Image
                                source={images.favBgRound}
                                style={{ width: 32, height: 32 }}
                            />
                        </View>
                        <Text style={styles.contactDSactiontext}>
                            Favourite
                        </Text>
                    </TouchableOpacity>
                );
            }
        }
        return (
            <View style={styles.actionAreaCD}>
                <FlatList
                    data={items}
                    extraData={items}
                    contentContainerStyle={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        width: '100%'
                    }}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                width: 1,
                                backgroundColor: GlobalColors.itemDevider
                            }}
                        />
                    )}
                    keyExtractor={({ index }) => {
                        return index;
                    }}
                    renderItem={({ item }) => {
                        return item;
                    }}
                    horizontal={true}
                />
            </View>
        );
    }

    renderSmallDevider = () => (
        <View
            style={{
                height: 1,
                backgroundColor: GlobalColors.itemDevider
            }}
        />
    );
    renderBigDevider = () => (
        <View
            style={{
                height: 10,
                backgroundColor: GlobalColors.itemDevider2
            }}
        />
    );

    renderDetails() {
        if (!this.props.route.params.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.renderNumbers()}
                    {this.renderSmallDevider()}
                    {this.renderEmails()}
                    {this.renderBigDevider()}
                    {this.renderCompanyInfo()}
                </View>
            );
        }
        return null;
    }

    deletePersonalContact = () => {
        this.setState({ loading: true });
        const { name, phoneNumbers, emails, id } =
            this.props.route.params.contact;
        const localContactObj = {
            userId: id,
            emailAddresses: {
                home: '',
                work: ''
            },
            phoneNumbers: {
                land: '',
                mobile: '',
                satellite: ''
            },
            userName: name
        };

        const bodyParse = {
            localContacts: [localContactObj]
        };

        Conversation.deleteLocalContacts(bodyParse)
            .then((res) => {
                if (res.error === 0) {
                    Contact.getAddedContacts().then((contactsData) => {
                        const updateContacts = contactsData.filter(
                            (elem) =>
                                elem.userId !==
                                this.props.route.params.contact.id
                        );

                        // console.log('on deleting contacts ', updateContacts);

                        Contact.saveContacts(updateContacts).then(
                            (allNewContact) => {
                                this.props.route.params.updateContactScreen();
                            }
                        );
                    });
                    this.setState({ loading: false });
                    NavigationAction.pop();
                } else {
                    this.setState({ loading: false });
                    console.log('Cannot delete local conatcts', err);
                }
            })
            .catch((err) => {
                this.setState({ loading: false });
                console.log('Cannot delete local conatcts', err);
            });
    };

    deleteContact = () => {
        this.setState({ loading: true });
        const bodyParse = {
            capability: 'RemoveContact',
            botId: 'onboarding-bot',
            users: []
        };

        if (
            this.props.route.params.contact &&
            this.props.route.params.contact.id
        ) {
            bodyParse.users.push(this.props.route.params.contact.id);
        }

        this.setState({ loading: true });
        Conversation.deleteContacts(bodyParse)
            .then((value) => {
                Contact.getAddedContacts().then((contactsData) => {
                    // eslint-disable-next-line max-len
                    const updateContacts = contactsData.filter(
                        (elem) =>
                            elem.userId !== this.props.route.params.contact.id
                    );

                    // console.log('on deleting contacts ', updateContacts);

                    Contact.saveContacts(updateContacts).then(
                        (allNewContact) => {
                            this.props.route.params.updateContactScreen();
                        }
                    );
                });
                const conversationId = Conversation.getIMConversationId(
                    value.otherUserId,
                    value.currentUserId
                );
                if (conversationId) {
                    Conversation.deleteConversation(conversationId)
                        .then(() => console.log('Updated db>>>>>>>'))
                        .catch(() => console.log('DB Update Failed>>>>>>'));
                }

                this.setState({ loading: false });
                NavigationAction.pop();
            })
            .catch((err) => {
                this.setState({ loading: false });
                console.log('Cannot delete conatcts', err);
            });
    };

    renderDetailRow = (icon, label, content) => {
        let iconImage;
        let startIcon;
        let placeholder;
        let lastIconCondition = content;
        if (icon === 'smartphone') {
            startIcon = (
                <Image
                    source={images.mobileCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter number';
        } else if (icon === 'phone') {
            startIcon = (
                <Image
                    source={images.callLeft}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter number';
        } else if (icon === 'satellite') {
            startIcon = (
                <Image
                    source={images.satelliteCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter number';
        } else if (icon === 'email') {
            startIcon = (
                <Image
                    source={images.mailCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter email address';
        } else if (icon === 'company') {
            startIcon = (
                <Image
                    source={images.companyCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter email address';
            lastIconCondition = false;
        } else if (icon === 'shipname') {
            startIcon = (
                <Image
                    source={images.shipCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter email address';
            lastIconCondition = false;
        } else if (icon === 'shipimo') {
            startIcon = (
                <Image
                    source={images.shipImoCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter email address';
            lastIconCondition = false;
        } else if (icon === 'nationality') {
            startIcon = (
                <Image
                    source={images.flagCD}
                    style={styles.leftIconCD}
                    resizeMode="cover"
                />
            );
            placeholder = 'enter email address';
            lastIconCondition = false;
        }
        if (icon === 'smartphone' || icon === 'phone' || icon === 'satellite') {
            iconImage = Icons.contactCall({ color: '#2fc76f' });
        } else if (icon === 'email') {
            iconImage = (
                <Image
                    source={images.mailCD}
                    style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'cover',
                        tintColor: GlobalColors.primaryButtonColor
                    }}
                    resizeMode="cover"
                />
            );
        }
        return (
            <View style={[styles.detailMainInfoRenderContainerCD]}>
                <View
                    style={[
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                        },
                        { flex: 3.5 }
                    ]}
                >
                    <View style={{ width: 24, alignItems: 'center' }}>
                        {startIcon}
                    </View>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.labelStyleNewCD}>{label}</Text>
                    </View>
                </View>
                <View style={[styles.infoContainerCD]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputNumberCD}>{content}</Text>
                    </View>
                    <View>
                        {lastIconCondition ? (
                            <TouchableOpacity
                                style={{ alignSelf: 'center' }}
                                onPress={() => {
                                    this.onIconClick(icon);
                                }}
                            >
                                {iconImage}
                            </TouchableOpacity>
                        ) : (
                            <View />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    renderEmails() {
        if (!this.props.route.params.contact.isWaitingForConfirmation) {
            if (
                this.props.route.params.contact.contactType ===
                    ContactType.LOCAL &&
                this.props.route.params.contact.emailAddresses
            ) {
                return (
                    <View>
                        {this.renderDetailRow(
                            'email',
                            'Home',
                            this.props.route.params.contact.emailAddresses?.home
                        )}
                        {this.renderDetailRow(
                            'email',
                            'Work',
                            this.props.route.params.contact.emailAddresses?.work
                        )}
                    </View>
                );
            }
            return (
                <View>
                    {this.renderDetailRow(
                        'email',
                        'Email',
                        this.props.route.params.contact?.emailAddress
                    )}
                </View>
            );
        }
        return null;
    }

    renderCompanyInfo() {
        if (!this.props.route.params.contact.isWaitingForConfirmation) {
            if (
                this.props.route.params.contact.contactType !==
                ContactType.LOCAL
            ) {
                return (
                    <View>
                        {this.renderDetailRow(
                            'company',
                            'Company',
                            this.props.route.params.contact.userCompanyName
                        )}
                        {this.renderBigDevider()}
                        {this.renderDetailRow(
                            'shipname',
                            'Ship name',
                            this.props.route.params.contact.sailingStatus
                                ? this.props.route.params.contact.shipName
                                : ''
                        )}
                        {this.renderDetailRow(
                            'shipimo',
                            'Ship IMO',
                            this.props.route.params.contact.sailingStatus
                                ? this.props.route.params.contact.shipIMO
                                : ''
                        )}
                        {this.renderBigDevider()}
                        {this.renderAddress()}
                        {this.renderDetailRow(
                            'nationality',
                            'Nationality',
                            this.props.route.params.contact.nationality
                        )}
                    </View>
                );
            }
        }
    }

    showCountry = () => {
        if (this.state.country.length > 0)
            return countries.find(
                (country) => country.code === this.state.country
            )?.name;
        return '';
    };

    renderAddress() {
        let checkFlag =
            this.state.addressLine1 ||
            this.state.city ||
            this.state.state ||
            this.state.country ||
            this.state.postCode
                ? true
                : false;
        return (
            <View
                style={{
                    width: '100%',
                    // height: 55,
                    flexDirection: 'row',
                    paddingLeft: 20,
                    paddingRight: 26,

                    // alignItems: 'stretch',
                    paddingVertical: 16
                }}
            >
                <View
                    style={[
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                        },
                        { flex: 3.5 }
                    ]}
                >
                    <View style={{ width: 24, alignItems: 'center' }}>
                        <Image
                            source={images.homeCD}
                            style={styles.leftIconCD}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.labelStyleNewCD}>{'Address'}</Text>
                    </View>
                </View>
                <View
                    style={{
                        flex: 6,
                        // marginLeft: 12,
                        // paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <View style={{ flex: 8 }}>
                        <TextInput
                            style={[
                                {
                                    flex: 6,
                                    // marginLeft: 12,
                                    // paddingHorizontal: 8,
                                    flexDirection: 'row',
                                    alignItems: 'stretch',
                                    justifyContent: 'flex-start'
                                },
                                { ...styles.inputValueNewUI }
                            ]}
                            autoCorrect={false}
                            // returnKeyType="next"
                            multiline={true}
                            editable={false}
                            value={
                                checkFlag
                                    ? `${this.state.addressLine1} ${
                                          this.state.city
                                      } ${this.state.postCode} ${
                                          this.state.state
                                      } ${
                                          this.state.country &&
                                          this.state.country !==
                                              'Select Country'
                                              ? this.showCountry()
                                              : ''
                                      }`
                                    : ''
                            }
                            placeholder=""
                            placeholderTextColor={
                                GlobalColors.formPlaceholderText
                            }
                        />
                    </View>
                    <View>
                        <Text>
                            <Icon
                                name="location-outline"
                                size={20}
                                type="ionicon"
                                color={GlobalColors.primaryButtonColor}
                            />
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    renderNumbers() {
        if (!this.props.route.params.contact.isWaitingForConfirmation) {
            return (
                <View>
                    {this.renderDetailRow(
                        'smartphone',
                        'Mobile',
                        this.props.route.params.contact.phoneNumbers?.mobile
                    )}

                    {this.renderDetailRow(
                        'phone',
                        'Land',
                        this.props.route.params.contact.phoneNumbers?.land
                    )}

                    {this.renderDetailRow(
                        'satellite',
                        'Satellite',
                        this.props.route.params.contact.phoneNumbers?.satellite
                        // 'Unavailable'
                    )}
                </View>
            );
        }
        return null;
    }

    onIconClick = (icon) => {
        const { phoneNumbers } = this.props.route.params.contact;
        if (phoneNumbers) {
            if (
                icon === 'smartphone' &&
                phoneNumbers.mobile &&
                config.showPSTNCalls
            ) {
                this.makePhoneCall(phoneNumbers.mobile);
            } else if (
                icon === 'phone' &&
                phoneNumbers.land &&
                config.showPSTNCalls
            ) {
                this.makePhoneCall(phoneNumbers.land);
            } else if (
                icon === 'satellite' &&
                phoneNumbers.satellite &&
                config.showPSTNCalls
            ) {
                this.makePhoneCall(phoneNumbers.satellite);
            }
        }
    };

    setModalVisible(value) {
        this.setState({ modalVisible: value });
    }

    makeVideoCall = () => {
        const user = Auth.getUserData();
        if (user) {
            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                voipCallData: {
                    otherUserId: this.props.route.params.contact.id,
                    otherUserName: this.props.route.params.contact.name
                },
                title: this.props.route.params.contact.name,
                userId: user.userId,
                isVideoCall: true
            });
        }
    };

    sendInvite = () => {
        const emails = [];
        const { contact } = this.props.route.params;
        if (contact.emailAddresses && contact.emailAddresses.home !== '') {
            emails.push(contact.emailAddresses.home);
        }
        if (contact.emailAddresses && contact.emailAddresses.work !== '') {
            emails.push(contact.emailAddresses.work);
        }
        if (emails && emails.length === 0) {
            NavigationAction.push(
                NavigationAction.SCREENS.contactEmailInviteScreen,
                {
                    title: 'Invite People'
                }
            );
            return;
        }
        this.setState({ loading: true });
        const user = Auth.getUserData();
        if (user) {
            this.grpcInvite(user, emails).then(
                (data) => {
                    if (data.error === 0) {
                        this.setState({ loading: false }, () => {
                            if (!this.state.loading) {
                                setTimeout(() => {
                                    this.emailInvitationSent();
                                }, 500);
                            }
                        });
                    } else {
                        this.setState({ loading: false });
                    }
                },
                (err) => {
                    console.log('error in sending invitation', err);
                    this.setState({ loading: false });
                }
            );
        }
    };

    emailInvitationSent = () =>
        Toast.show({ text1: 'Invitation Sent', type: 'success' });

    grpcInvite = (user, emailIds) => ContactServices.invite(emailIds);

    confirmContactDelete = () => {
        AlertDialog.showCritical(
            'Are you sure you want to delete this contact?',
            'This action cannot be undone',
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        if (
                            this.props.route.params.contact.contactType &&
                            this.props.route.params.contact.contactType ===
                                ContactType.LOCAL
                        ) {
                            this.deletePersonalContact();
                        } else {
                            this.deleteContact();
                        }
                    }
                }
            ]
        );
    };
    render() {
        if (!this.props.route.params.contact) {
            return <View />;
        }
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                <ScrollView style={styles.containerCD}>
                    <Loader loading={this.state.loading} />
                    {this.renderNameArea()}
                    {this.renderSmallDevider()}
                    {this.renderActionButtons()}
                    {this.renderBigDevider()}
                    {this.renderDetails()}
                    {this.props.route.params.contact.contactType &&
                        this.props.route.params.contact.contactType !==
                            ContactType.LOCAL &&
                        this.props.route.params.contact.type !== 'Vessels' && (
                            <View style={styles.deleteContainer}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        marginVertical: 20
                                    }}
                                    onPress={this.confirmContactDelete}
                                >
                                    <Text style={styles.deleteText}>
                                        Delete contact
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    {this.props.route.params.contact.contactType &&
                        this.props.route.params.contact.contactType ===
                            ContactType.LOCAL && (
                            <View style={styles.deleteContainer}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        marginVertical: 20
                                    }}
                                    onPress={this.confirmContactDelete}
                                >
                                    <Text style={styles.deleteText}>
                                        Delete contact
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    {this.props.route.params.contact.contactType &&
                        this.props.route.params.contact.contactType ===
                            ContactType.LOCAL &&
                        configToUse.signUpEnabled && (
                            <View style={styles.invitationBlock}>
                                <Text
                                    style={{
                                        alignSelf: 'center',
                                        color: GlobalColors.primaryTextColor
                                    }}
                                >
                                    Do you want to start a conversation?
                                </Text>
                                <TouchableOpacity
                                    style={styles.sendInvBtn}
                                    onPress={() => this.sendInvite()}
                                >
                                    {Icons.contactEmail({
                                        color: GlobalColors.primaryButtonText
                                    })}
                                    <Text
                                        style={{
                                            color: GlobalColors.primaryButtonText,
                                            fontWeight: AppFonts.BOLD,
                                            fontSize: 14,
                                            alignSelf: 'center',
                                            paddingLeft: 5
                                        }}
                                    >
                                        Send invitation to join the app
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                </ScrollView>
                {this.state.modalVisible && (
                    <View style={[StyleSheet.absoluteFill]}>
                        <CallModal
                            ref={(ref) => {
                                this.callModal = ref;
                            }}
                            isVisible={this.state.modalVisible}
                            setVisible={this.setModalVisible.bind(this)}
                            contact={this.props.route.params.contact}
                        />
                    </View>
                )}
            </SafeAreaView>
        );
    }
}
