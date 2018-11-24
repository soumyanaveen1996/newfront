import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import styles from './styles';
import I18n from '../../config/i18n/i18n';

import images from '../../images';

class AddContacts extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={
                        state.params.onBack
                            ? () => {
                                Actions.pop();
                                state.params.onBack();
                            }
                            : Actions.pop
                    }
                    refresh={true}
                />
            );
        }
        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }
    constructor(props) {
        super(props);
        this.state = {
            contact: [
                {
                    contactId: '123',
                    contactName: 'Sid',
                    contactImage: 'dsa'
                },
                {
                    contactId: '124',
                    contactName: 'Sid',
                    contactImage: 'dsa'
                }
            ],
            addedContact: [
                {
                    contactId: '124',
                    contactName: 'dif',
                    contactImage: 'dsa'
                }
            ]
        };
    }

    renderContact = () => {
        console.log('rendering');

        this.state.contact.map((elem, index) => {
            return (
                <View style={styles.contactContainer}>
                    <Image source={images.tabbar_marketplace} />
                    <Text>{elem.contactName}</Text>
                </View>
            );
        });
    };

    render() {
        return (
            <SafeAreaView style={styles.addContactsContainer}>
                <ScrollView style={{ backgroundColor: '#f4f4f4', flex: 1 }}>
                    <View
                        style={{
                            alignItems: 'center',
                            padding: 5
                        }}
                    >
                        {this.state.addedContact.map((elem, index) => {
                            return (
                                <View style={styles.contactAddedContainer}>
                                    <Image
                                        style={{ marginRight: 10 }}
                                        source={images.close_btn}
                                    />
                                    <Image
                                        style={styles.contactImage}
                                        source={images.tabbar_marketplace}
                                    />
                                    <Text>{elem.contactName}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
                <ScrollView
                    style={{
                        flex: 2,
                        backgroundColor: 'white'
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            alignItems: 'center',
                            padding: 5
                        }}
                    >
                        {this.state.contact.map((elem, index) => {
                            return (
                                <View style={styles.contactContainer}>
                                    <Image
                                        style={{ marginRight: 10 }}
                                        source={images.checkmark_normal}
                                    />
                                    <Image
                                        style={styles.contactImage}
                                        source={images.tabbar_marketplace}
                                    />
                                    <Text>{elem.contactName}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default AddContacts;
