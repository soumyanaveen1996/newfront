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
import {
    SECTION_HEADER_HEIGHT,
    SCREEN_WIDTH,
    scrollViewConfig
} from './config';

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
        console.log('Sourav Logging:::: Loading Local Contacts...');
        this.setState({ selectedContact: {} });
        let array = [...this.state.contactsList];

        if (array && array.length > 0) {
            array.map(elem => {
                elem.selected = false;
            });
        }

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
                let userName;
                if (data.givenName) {
                    userName = data.givenName;
                    if (data.familyName) {
                        contactName = data.givenName + ' ' + data.familyName;
                    } else {
                        contactName = data.givenName;
                    }
                } else if (data.familyName) {
                    contactName = data.familyName;
                    userName = data.familyName;
                } else if (data.emails && data.emails[0]) {
                    userName = data.emails[0];
                }
                if (userName) {
                    let contactObj = {
                        idTemp: index,
                        emails: [...data.emailAddresses],
                        profileImage: data.thumbnailPath,
                        userName: userName,
                        name: contactName,
                        phoneNumbers: [...data.phoneNumbers],
                        selected: false
                    };
                    contactArray.push(contactObj);
                }
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

        array[index].selected = !array[index].selected;

        array.map((elem, elemIndex) => {
            if (index !== elemIndex) {
                elem.selected = false;
            }
        });

        this.setState({
            contactsList: [...array],
            selectedContact: { ...array[index] }
        });
    };

    renderContacts = () => {
        if (this.state.contactsList && this.state.contactsList.length > 0) {
            return this.state.contactsList.map((elem, index) => {
                return (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            backgroundColor: '#fff',
                            padding: 5,
                            margin: 5
                        }}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                this.toggleSelectContacts(elem, index)
                            }
                            style={{
                                flexDirection: 'row',
                                height: 30,
                                alignItems: 'center'
                            }}
                            key={index}
                        >
                            <Image
                                style={{ marginRight: 5 }}
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
                    </View>
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

        // console.log('mapping contact labels ', selectedContact);

        if (selectedContact && Object.keys(selectedContact).length > 0) {
            selectedContact.phoneNumbers.map(elem => {
                if (elem.label === 'home') {
                    elem.label = 'land';
                }
            });
            this.props.selectedContact(selectedContact);
        }
        this.props.setVisible(false);
    };

    render() {
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeArea={50}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                // onSwipe={() => this.props.setVisible(false)}
                // swipeDirection="right"
                swipeToClose={false}
            >
                <View style={styles.localContactModal}>
                    <View style={{ position: 'absolute', right: 10, top: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.setVisible(false);
                            }}
                        >
                            <Image
                                style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: 'center',
                                    padding: 5
                                }}
                                source={require('../../images/remove-icon/popup-close.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={{
                            marginBottom: 10,
                            fontSize: 18,
                            height: 45
                        }}
                    >
                        Your contacts{' '}
                    </Text>

                    <ScrollView
                        style={{
                            width: '100%',
                            height: 200,
                            backgroundColor: '#fff',
                            marginBottom: 10,
                            paddingHorizontal: 45
                        }}
                    >
                        {this.renderContacts()}
                    </ScrollView>

                    <View
                        style={{
                            justifyContent: 'flex-end',
                            height: 45
                        }}
                    >
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
