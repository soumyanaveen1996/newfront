import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    NativeModules,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import ContactStyles from '../ContactsPicker/styles';
import { searchBarConfig } from '../ContactsPicker/config';
import I18n from '../../config/i18n/i18n';
import { connect } from 'react-redux';
import { setChannelParticipants } from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { Contact } from '../../lib/capability';
import images from '../../images';
import { RNChipView } from 'react-native-chip-view';
import ProfileImage from '../ProfileImage';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { GlobalColors } from '../../config/styles';
import { Auth } from '../../lib/capability';
import _ from 'lodash';

const R = require('ramda');
const cancelImg = require('../../images/channels/cross-deselect-participant.png');
const ContactsServiceClient = NativeModules.ContactsServiceClient;

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
            contacts: [],
            loading: false,
            searchText: '',
            selectedContacts: this.props.channels.participants
        };
    }

    componentDidMount() {
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.addParticipants);
    }

    componentWillUnmount() {
        console.log('Unmount Participants');
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.newChannels);
    }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.appState.currentScene ===
            ROUTER_SCENE_KEYS.addParticipants
        );
    }

    renderRow = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={() => this.addContact(item, index)}
                style={styles.contactContainer}
                key={index}
            >
                <Image
                    style={{ marginRight: 10 }}
                    source={
                        !item.selected
                            ? images.checkmark_normal
                            : images.checkmark_selected
                    }
                />
                <ProfileImage
                    uuid={item.userId}
                    placeholder={images.user_image}
                    style={ContactStyles.contactItemImage}
                    placeholderStyle={ContactStyles.contactItemImage}
                    resizeMode="cover"
                />
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1
                    }}
                >
                    <Text style={styles.participantName}>{item.userName}</Text>
                    <Text style={styles.participantEmail}>
                        {item.emailAddress}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    renderSelectedRow = ({ item, index }) => {
        return (
            <View style={styles.selectedChip}>
                <RNChipView
                    title={item.userName}
                    titleStyle={styles.chipFont}
                    avatar={
                        <ProfileImage
                            uuid={item.userId}
                            placeholder={images.user_image}
                            style={selectedAvatarStyle}
                            placeholderStyle={selectedAvatarStyle}
                            resizeMode="contain"
                        />
                    }
                    avatarStyle={{ margin: 5 }}
                    cancelable={<Image source={cancelImg} />}
                    // cancelableStyle={{
                    //     backgroundColor:
                    //         'rgba(255,255,255,1)'
                    // }}
                    backgroundColor={GlobalColors.transparent}
                    borderRadius={6}
                    height={30}
                    onPress={() => {
                        this.removeContact(item, index);
                    }}
                />
            </View>
        );
    };

    selectContacts = () => {
        this.props.setParticipants(this.state.selectedContacts);
        Actions.pop();
    };

    addContact = (elem, index) => {
        this.state.contacts[index].selected = true;
        this.state.selectedContacts.push(this.state.contacts[index]);
        this.setState({
            contacts: this.state.contacts,
            selectedContacts: this.state.selectedContacts
        });
    };

    removeContact = (elem, index) => {
        this.state.selectedContacts.splice(index, 1);
        const ind = _.findIndex(this.state.contacts, contact => {
            return contact.userId === elem.userId;
        });
        if (ind !== -1) {
            this.state.contacts[ind].selected = false;
        }
        this.setState({
            contacts: this.state.contacts,
            selectedContacts: this.state.selectedContacts
        });
    };

    renderSearchBar = () => {
        return (
            <View style={ContactStyles.searchBar}>
                <Icon
                    style={styles.searchIcon}
                    name="search"
                    size={24}
                    color="rgba(0, 189, 242, 1)"
                />
                <TextInput
                    style={ContactStyles.searchTextInput}
                    returnKeyType="search"
                    autoFocus={true}
                    underlineColorAndroid="transparent"
                    placeholder="Search"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onSubmitEditing={this.searchUsers.bind(this)}
                    // onChangeText={this.onSearchQueryChange.bind(this)}
                />
            </View>
        );
    };

    searchUsers(e) {
        const searchString = e.nativeEvent.text;
        Auth.getUser()
            .then(user => {
                return this.grpcSearch(user, searchString);
            })
            .then(users => {
                _.map(this.state.selectedContacts, contact => {
                    let found = _.find(users, user => {
                        return user.userId === contact.userId;
                    });
                    if (found) {
                        found.selected = true;
                    }
                });
                this.setState({ contacts: users });
            });
    }

    grpcSearch(user, queryString) {
        return new Promise((resolve, reject) => {
            ContactsServiceClient.find(
                user.creds.sessionId,
                { queryString },
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
                        resolve(result.data.content);
                    }
                }
            );
        });
    }

    render() {
        const {
            marginVertical,
            height,
            ...styleButton
        } = styles.filterButtonContainer;

        selectedAvatarStyle = {
            height: 30,
            width: 30,
            borderRadius: 15
        };
        const allContacts = this.state.contacts;
        const selectedContacts = this.state.selectedContacts;

        return (
            <SafeAreaView style={styles.addContactsContainer}>
                <View style={{ flex: 1, overflow: 'hidden' }}>
                    {this.renderSearchBar()}

                    {selectedContacts && selectedContacts.length > 0 ? (
                        <View style={styles.selectContactContainer}>
                            <Text
                                style={{
                                    paddingHorizontal: 10,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    color: '#4A4A4A'
                                }}
                            >
                                Selected
                            </Text>
                            <FlatList
                                data={selectedContacts}
                                renderItem={this.renderSelectedRow}
                                extraData={this.state}
                            />
                        </View>
                    ) : null}
                    <FlatList
                        data={allContacts}
                        renderItem={this.renderRow}
                        extraData={this.state}
                    />
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={this.selectContacts}
                    >
                        <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user,
    channels: state.channel
});

const mapDispatchToProps = dispatch => {
    return {
        setParticipants: participants =>
            dispatch(setChannelParticipants(participants)),
        setCurrentScene: scene => dispatch(setCurrentScene(scene))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddContacts);
