import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    Alert,
    ScrollView,
    PermissionsAndroid,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import styles from './styles';
import config from '../../config/config';
import { Actions } from 'react-native-router-flux';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import Contacts from 'react-native-contacts';
import { searchBarConfig } from './config';
import Icon from 'react-native-vector-icons/Feather';
import ProfileImage from '../ProfileImage';
import images from '../../images';
import I18n from '../../config/i18n/i18n';
import { Loader } from '../Loader';
import { NativeModules } from 'react-native';
import _ from 'lodash';
const ContactsServiceClient = NativeModules.ContactsServiceClient;

export default class AddressBookScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            searchContact: [],
            searchText: '',
            email: [],
            keyboard: false,
            loading: false
        };
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    title: 'Contacts',
                    message: 'Grant access for contacts to display in FrontM'
                }
            )
                .then(granted => {
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        this.gettingAllCOntactData();
                    } else {
                        Actions.pop();
                    }
                })
                .catch(err => {
                    console.log('PermissionsAndroid', err);
                });
        } else {
            this.gettingAllCOntactData();
        }
    }

    gettingAllCOntactData = () => {
        let contactArray = [];
        Contacts.getAll((err, contacts) => {
            if (err) {
                throw err;
            }

            contacts.forEach((data, index) => {
                let contactName = '';
                if (data.emailAddresses && data.emailAddresses.length > 0) {
                    if (data.givenName && data.familyName) {
                        contactName = data.givenName + ' ' + data.familyName;
                    } else {
                        contactName = data.givenName;
                    }
                    let contactObj = {
                        idTemp: index,
                        emails: [...data.emailAddresses],
                        profileImage: data.thumbnailPath,
                        userName: data.givenName.toLowerCase(),
                        name: contactName,
                        phoneNumbers: [...data.phoneNumbers],
                        selected: false
                    };
                    contactArray.push(contactObj);
                }
            });
            this.setState({
                contactsData: [...contactArray],
                searchContact: [...contactArray]
            });
            // contacts returned
        });
    };

    onSearchQueryChange(text) {
        let searchContactList = [...this.state.searchContact];
        let contactsList = [...this.state.contactsData];
        let keyword = text.toLowerCase();

        if (!text && text === '') {
            contactsList = [...searchContactList];
        }

        contactsList = searchContactList.filter(user => {
            user = user.name.toLowerCase();
            return user.indexOf(keyword) > -1;
        });

        this.setState({ contactsData: contactsList }, () => {
            console.log('searching ', this.state.contactsData);
        });
    }

    toggleSelectContacts = index => {
        let array = [...this.state.contactsData];
        let emailArray = [];
        array[index].selected = !array[index].selected;

        this.setState(
            {
                contactsData: array
            },
            () => {
                this.state.contactsData.forEach(elem => {
                    if (elem.selected) {
                        emailArray.push(elem.emails[0].email);
                    }
                });

                this.setState({ email: [...emailArray] });
            }
        );
    };

    renderProfileImage = profileImageSource => {
        if (profileImageSource && profileImageSource !== '') {
            return (
                <Image
                    style={styles.profileImageStyle}
                    source={{ uri: 'file://' + profileImageSource }}
                />
            );
        } else {
            return (
                <View style={styles.emptyProfileContainer}>
                    <Image
                        source={images.smile_contact_placeholder}
                        style={styles.emptyContactItemImage}
                    />
                </View>
            );
        }
    };

    renderSelectedContacts = () => {
        return this.state.contactsData.map((elem, index) => {
            return elem && elem.selected ? (
                <View style={styles.contactSelectedContainer} key={index}>
                    <TouchableOpacity
                        onPress={() => this.toggleSelectContacts(index)}
                    >
                        <Image
                            style={{ width: 24, height: 24, marginRight: 10 }}
                            source={images.cross_deselect}
                        />
                    </TouchableOpacity>
                    {this.renderProfileImage(elem.profileImage)}
                    <View style={styles.contactNameContainer}>
                        <Text style={styles.participantName}>{elem.name}</Text>
                    </View>
                </View>
            ) : null;
        });
    };

    renderContacts = () => {
        if (this.state.contactsData && this.state.contactsData.length > 0) {
            return this.state.contactsData.map((elem, index) => {
                return (
                    <TouchableOpacity
                        onPress={() => this.toggleSelectContacts(index)}
                        style={styles.contactContainer}
                        key={index}
                    >
                        <Image
                            style={{ marginRight: 10 }}
                            source={
                                !elem.selected
                                    ? images.checkmark_normal
                                    : images.checkmark_selected
                            }
                        />
                        {this.renderProfileImage(elem.profileImage)}
                        <View style={styles.contactNameContainer}>
                            <Text style={styles.participantName}>
                                {elem.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            });
        } else {
            return null;
        }
    };

    grpcInvite(user, emailIds) {
        return new Promise((resolve, reject) => {
            ContactsServiceClient.invite(
                user.creds.sessionId,
                { emailIds },
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

    sendInvite() {
        // console.log('send invitation');
        this.setState({ loading: true });
        Auth.getUser()
            .then(user => {
                if (_.isArray(this.state.email)) {
                    return this.grpcInvite(user, this.state.email);
                } else {
                    return this.grpcInvite(user, [this.state.email]);
                }
            })
            .then(
                data => {
                    if (ata.data.error === 0) {
                        console.log('invitation sent');
                        this.setState({ loading: false }, () => {
                            if (!this.state.loading) {
                                console.log(' show alert ');
                                setTimeout(() => {
                                    this.invitationSent();
                                }, 500);
                            }
                        });
                    }
                },
                err => {
                    console.log('error in sending invitation', err);
                    this.setState({ loading: false });
                }
            );
    }

    invitationSent = () => {
        return Alert.alert(
            'Invitation Sent',
            '',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        console.log('OK Pressed');
                        Actions.pop();
                    }
                }
            ],
            { cancelable: false }
        );
    };

    sendInvitationToEmail = async () => {
        if (this.state.email && this.state.email.length > 0) {
            this.sendInvite();
        }
    };

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Loader loading={this.state.loading} />
                <View style={styles.searchBar}>
                    <Icon
                        style={styles.searchIcon}
                        name="search"
                        size={18}
                        color={GlobalColors.sideButtons}
                    />
                    <TextInput
                        style={styles.searchTextInput}
                        underlineColorAndroid="transparent"
                        placeholder="Search contact"
                        selectionColor={GlobalColors.darkGray}
                        placeholderTextColor={
                            searchBarConfig.placeholderTextColor
                        }
                        onChangeText={this.onSearchQueryChange.bind(this)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            flex: 2,
                            backgroundColor: 'rgba(244,244,244,1)'
                        }}
                    >
                        <ScrollView>
                            <View style={styles.allSelectedContacts}>
                                {this.renderSelectedContacts()}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={{ flex: 3, backgroundColor: '#fff' }}>
                        <ScrollView>
                            <View style={styles.allContacts}>
                                {this.renderContacts()}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <TouchableWithoutFeedback
                    onPress={() => {
                        this.sendInvitationToEmail();
                    }}
                >
                    <View style={styles.buttonContainerDone}>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => {
                                this.sendInvitationToEmail();
                            }}
                        >
                            <Text style={{ color: '#fff' }}>
                                {I18n.t('Done_caps')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        );
    }
}
