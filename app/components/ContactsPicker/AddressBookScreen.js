import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    Keyboard,
    ScrollView
} from 'react-native';
import styles from './styles';
import config from '../../config/config';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import SystemBot from '../../lib/bot/SystemBot';
import { Auth, Network } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';
import FrontMAddedContactsPickerDataSource from './FrontMAddedContactsPickerDataSource';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import Icon from 'react-native-vector-icons/Feather';

export default class AddressBookScreen extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new FrontMAddedContactsPickerDataSource(this);
        this.state = {
            contactsData: [],

            keyboard: false
        };
    }

    updateList = () => {
        this.setState({ contactsData: this.dataSource.getData() });
    };

    onDataUpdate() {
        this.updateList();
    }

    onSearchQueryChange(text) {
        let contactsList = [];
        if (!text || text === '') {
            contactsList = this.dataSource.getData();
        } else {
            contactsList = this.dataSource.getFilteredData(text);
        }
        this.setState({ contactsData: contactsList }, () => {
            console.log(this.state.contactsData);
        });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
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
                    <View style={{ flex: 1, padding: 20 }}>
                        <Text>Selected</Text>
                        <ScrollView>
                            <Text>Conatct</Text>
                        </ScrollView>
                    </View>
                    <View style={{ flex: 3, backgroundColor: '#fff' }}>
                        <ScrollView>
                            <Text>Contacts</Text>
                        </ScrollView>
                    </View>
                    <View style={{ height: 70, width: '100%', padding: 20 }}>
                        <Text>DONE</Text>
                    </View>
                </View>
            </View>
        );
    }
}
