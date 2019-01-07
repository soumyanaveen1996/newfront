import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Keyboard,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import styles from './styles';
import config from '../../config/config';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import FrontMAddedContactsPickerDataSource from './FrontMAddedContactsPickerDataSource';
import Contacts from 'react-native-contacts';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import Icon from 'react-native-vector-icons/Feather';
import ProfileImage from '../ProfileImage';
import images from '../../images';
import { RNChipView } from 'react-native-chip-view';
const cancelImg = require('../../images/channels/cross-deselect-participant.png');

export default class AddressBookScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsData: [],
            searchText: '',
            keyboard: false
        };
    }

    componentWillMount() {
        let contactArray = [];
        Contacts.getAll((err, contacts) => {
            if (err) {
                throw err;
            }

            contacts.forEach((data, index) => {
                console.log('data for image ', data);

                let contactObj = {
                    idTemp: index,
                    emails: [...data.emailAddresses],
                    profileImage: data.thumbnailPath,
                    userName: data.givenName.toLowerCase(),
                    name: data.givenName + ' ' + data.familyName,
                    phoneNumbers: [...data.phoneNumbers],
                    selected: false
                };

                if (data.emailAddresses && data.emailAddresses.length > 0) {
                    contactArray.push(contactObj);
                }
            });
            this.setState({ contactsData: [...contactArray] }, () => {
                console.log('al contacts ', this.state.contactsData);
            });
            // contacts returned
        });
    }

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

    sendInvitation = () => {
        console.log('inivitation sent');
    };

    toggleSelectContacts = index => {
        let array = [...this.state.contactsData];
        array[index].selected = !array[index].selected;
        this.setState({
            contactsData: array
        });
    };

    renderSelectedContacts = () => {
        return this.state.contactsData.map((elem, index) => {
            return elem && elem.selected ? (
                <View style={styles.contactSelectedContainer} key={index}>
                    <TouchableOpacity
                        onPress={() => this.toggleSelectContacts(index)}
                    >
                        <Image style={{ marginRight: 10 }} source={cancelImg} />
                    </TouchableOpacity>
                    <ProfileImage
                        placeholder={
                            elem.profileImage && elem.profileImage !== ''
                                ? elem.profileImage
                                : images.user_image
                        }
                        style={styles.contactItemImage}
                        placeholderStyle={styles.contactItemImage}
                        resizeMode="cover"
                    />
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                        }}
                    >
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
                        <ProfileImage
                            placeholder={
                                elem.profileImage && elem.profileImage !== ''
                                    ? elem.profileImage
                                    : images.user_image
                            }
                            style={styles.contactItemImage}
                            placeholderStyle={styles.contactItemImage}
                            resizeMode="cover"
                        />
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1
                            }}
                        >
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
                    <View style={{ flex: 2 }}>
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
                        onPress={this.sendInvitation()}
                    >
                        <Text style={{ color: '#fff' }}>DONE</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
