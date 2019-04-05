import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    PermissionsAndroid
} from 'react-native';
import styles from './styles';
import Contacts from 'react-native-contacts';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import images from '../../images';

export default class LocalContactModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsList: [],
            searchContact: [],
            selectedContact: {}
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
                        this.gettingAllContactData();
                    } else {
                        Actions.pop();
                    }
                })
                .catch(err => {
                    console.log('PermissionsAndroid', err);
                });
        } else {
            this.gettingAllContactData();
        }
    }

    gettingAllContactData = () => {
        let contactArray = [];
        Contacts.getAll((err, contacts) => {
            if (err) {
                contacts = [];
            }

            contacts.forEach((data, index) => {
                let contactName = '';

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
            });
            this.setState({
                contactsList: [...contactArray],
                searchContact: [...contactArray]
            });
        });
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

    toggleSelectContacts = (data, index) => {
        let array = [...this.state.contactsList];

        let emailArray = [];
        array[index].selected = !array[index].selected;

        array.map((elem, elemIndex) => {
            if (index !== elemIndex) {
                elem.selected = false;
            }
        });

        this.setState(
            { contactsList: [...array], selectedContact: { ...array[index] } },
            () => {
                console.log('new array ', this.state.selectedContact);
            }
        );
    };

    renderContacts = () => {
        if (this.state.contactsList && this.state.contactsList.length > 0) {
            return this.state.contactsList.map((elem, index) => {
                return (
                    <TouchableOpacity
                        onPress={() => this.toggleSelectContacts(elem, index)}
                        style={{
                            flexDirection: 'row',
                            width: '90%',
                            height: 40,
                            marginBottom: 10,
                            alignItems: 'center',
                            padding: 5
                        }}
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
                        <View
                            style={{
                                textAlign: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: 'rgba(0,0,0,0.6)'
                                }}
                            >
                                {elem.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            });
        } else {
            return (
                <View>
                    <Text>There are no contacts</Text>
                </View>
            );
        }
    };

    importSelectedContact = () => {
        let selectedContact = { ...this.state.selectedContact };
        this.props.selectedContact(selectedContact);
        this.props.setVisible(false);
    };

    render() {
        return (
            <Modal
                isVisible={this.props.isVisible}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                onSwipe={() => this.props.setVisible(false)}
                swipeDirection="right"
            >
                <View style={styles.localContactModal}>
                    <Text
                        style={{
                            marginVertical: 5,
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}
                    >
                        Your contacts{' '}
                    </Text>
                    <View
                        style={{ width: '100%', height: 450, marginBottom: 20 }}
                    >
                        <ScrollView>
                            <View style={styles.allContacts}>
                                {this.renderContacts()}
                            </View>
                        </ScrollView>
                    </View>
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                this.importSelectedContact();
                            }}
                            style={{
                                width: 200,
                                height: 40,
                                backgroundColor: 'rgba(0,189,242,1)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 6
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(255,255,255,1)'
                                }}
                            >
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}
