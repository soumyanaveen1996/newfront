import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    ScrollView,
    PermissionsAndroid
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

export default class AddressBookScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            searchText: '',
            email: [],
            keyboard: false
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
            this.setState({ contactsData: [...contactArray] });
            // contacts returned
        });
    };

    onSearchQueryChange(text) {
        let contactsList = [];
        if (!text || text === '') {
            contactsList = this.dataSource.getData();
        } else {
            contactsList = this.dataSource.getFilteredData(text);
        }
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

    sendInvite() {
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
                        capability: 'InviteUsers',
                        botId: 'onboarding-bot',
                        emailIds: this.state.email
                    }
                };
                return Network(options);
            })
            .then(
                data => {
                    if (data.status === 200 && data.data.error === 0) {
                        console.log('invitation sent');
                    }
                },
                err => {
                    console.log('error in sending invitation', err);
                }
            );
    }

    sendInvitationToEmail = async () => {
        if (this.state.email && this.state.email.length > 0) {
            this.sendInvite();
        }
    };

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
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
                <View style={styles.buttonContainerDone}>
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => {
                            this.sendInvitationToEmail();
                        }}
                    >
                        <Text style={{ color: '#fff' }}>DONE</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
