import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './manageContactsStyles';
import { connect } from 'react-redux';
import { setChannelParticipants } from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { Contact } from '../../lib/capability';
import images from '../../images';
import { RNChipView } from 'react-native-chip-view';
import ProfileImage from '../../widgets/ProfileImage';
import GlobalColors from '../../config/styles';
import _ from 'lodash';
import NavigationAction from '../../navigation/NavigationAction';
import SearchBar from '../../widgets/SearchBar';
import { FlatList } from 'react-native-gesture-handler';
import { Icon } from '@rneui/themed';
const SCREEN_HEIGHT = Dimensions.get('window').height;

const R = require('ramda');

class ManageContacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            loading: false,
            searchText: ''
        };
    }

    componentDidMount() {
        this.props.setCurrentScene(NavigationAction.SCREENS.manageContacts);

        if (this.props.route.params.allContacts) {
            const allContacts = _.map(
                this.props.route.params.allContacts,
                (contact) => {
                    return {
                        ...contact,
                        selected: false,
                        disabled:
                            this.props.route.params.disabledUserIds.includes(
                                contact.userId
                            )
                    };
                }
            );
            let participants;
            if (this.props.route.params.alreadySelected) {
                participants = _.map(
                    this.props.route.params.alreadySelected,
                    (part) => {
                        return {
                            ...part,
                            selected: true,
                            disabled:
                                this.props.route.params.disabledUserIds.includes(
                                    part.userId
                                )
                        };
                    }
                );
            }

            let contactsUniq = _.unionBy(participants, allContacts, 'userId');
            contactsUniq = _.sortBy(contactsUniq, 'userName');
            this.setState({ contacts: contactsUniq });
        } else if (this.props.appState.contactsLoaded) {
            Contact.getAddedContacts().then((contacts) => {
                const localContacts = _.map(contacts, (contact) => {
                    return {
                        ...contact,
                        selected: false,
                        disabled:
                            this.props.route.params.disabledUserIds.includes(
                                contact.userId
                            )
                    };
                });
                let participants;
                if (this.props.route.params.alreadySelected) {
                    participants = _.map(
                        this.props.route.params.alreadySelected,
                        (part) => {
                            return {
                                ...part,
                                selected: true,
                                disabled:
                                    this.props.route.params.disabledUserIds.includes(
                                        part.userId
                                    )
                            };
                        }
                    );
                }
                let contactsUniq = _.unionBy(
                    participants,
                    localContacts,
                    'userId'
                );
                contactsUniq = _.sortBy(contactsUniq, 'userName');
                // const uniqId = R.eqProps('userId');
                // const contactsUniq = R.uniqWith(uniqId)(allContacts);
                this.setState({ contacts: contactsUniq });
            });
        } else {
            Contact.refreshContacts();
        }
    }

    componentDidUpdate(prevProps) {
        if (
            !this.props.route.params.allContacts &&
            prevProps.appState.contactsLoaded !==
                this.props.appState.contactsLoaded
        ) {
            Contact.getAddedContacts().then((contacts) => {
                const localContacts = _.map(contacts, (contact) => {
                    return {
                        ...contact,
                        selected: false,
                        disabled:
                            this.props.route.params.disabledUserIds.includes(
                                contact.userId
                            )
                    };
                });
                let participants;
                if (this.props.route.params.alreadySelected) {
                    participants = _.map(
                        this.props.route.params.alreadySelected,
                        (part) => {
                            return {
                                ...part,
                                selected: true,
                                disabled:
                                    this.props.route.params.disabledUserIds.includes(
                                        part.userId
                                    )
                            };
                        }
                    );
                }
                let contactsUniq = _.unionBy(
                    participants,
                    localContacts,
                    'userId'
                );
                contactsUniq = _.sortBy(contactsUniq, 'userName');
                // const uniqId = R.eqProps('userId');
                // const contactsUniq = R.uniqWith(uniqId)(allContacts);
                this.setState({ contacts: contactsUniq });
            });
        }
    }

    selectContacts = () => {
        if (this.props.route.params.onSelected) {
            const selectedContacts = _.filter(
                this.state.contacts,
                (contact) => {
                    return contact.selected;
                }
            );

            this.props.route.params.onSelected(selectedContacts);
        }
        this.props.route.params.setParticipants?.(this.state.contacts);
        NavigationAction.pop();
    };

    toggleSelectContacts(elem) {
        if (!elem.disabled) {
            let array = [...this.state.contacts];
            const index = R.findIndex(R.propEq('userId', elem.userId))(array);
            array[index].selected = !array[index].selected;
            this.setState({
                contacts: array
            });
        }
    }

    renderSearchBar = () => {
        return (
            <View style={styles.searchBar}>
                <SearchBar
                    onChangeText={(text) => this.setState({ searchText: text })}
                    placeholder="Search"
                />
            </View>
        );
    };

    renderEmailAddress = (email) => {
        let emailDisplay = null;
        if (email !== '' && typeof email === 'string') {
            emailDisplay = email;
        }
        if (typeof email === 'object') {
            if (email.home && email.home !== '') {
                emailDisplay = email.home;
            }
            if (email.work && email.work !== '') {
                emailDisplay = email.work;
            }
        }
        if (emailDisplay) {
            return <Text style={styles.participantEmail}>{emailDisplay}</Text>;
        }
        return null;
    };

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => this.toggleSelectContacts(item)}
                style={styles.contactContainer}
                key={item.userId}
            >
                <Icon
                    style={{ marginRight: 10 }}
                    type="material"
                    color={GlobalColors.primaryButtonColor}
                    name={
                        !item.selected ? 'check-box-outline-blank' : 'check-box'
                    }
                />
                <ProfileImage
                    uuid={item.userId}
                    placeholder={images.user_image}
                    style={styles.contactItemImage}
                    placeholderStyle={styles.contactItemImage}
                    resizeMode="cover"
                />
                <View
                    style={{
                        // display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1
                    }}
                >
                    <Text style={styles.participantName}>{item.userName}</Text>
                    {item.emailAddress
                        ? this.renderEmailAddress(item.emailAddress)
                        : item.emailAddresses
                        ? this.renderEmailAddress(item.emailAddresses)
                        : null}
                </View>
            </TouchableOpacity>
        );
    };
    render() {
        const { marginVertical, height, ...styleButton } =
            styles.filterButtonContainer;

        const allContacts = this.state.contacts.filter((contact) =>
            contact.userName
                .toLowerCase()
                .includes(this.state.searchText.toLowerCase())
        );

        return (
            <SafeAreaView style={styles.addContactsContainer}>
                {this.renderSearchBar()}
                <View
                    style={{
                        maxHeight: (SCREEN_HEIGHT / 100) * 30,
                        overflow: 'scroll',
                        backgroundColor: GlobalColors.appBackground
                    }}
                >
                    <Text
                        style={{
                            paddingHorizontal: 10,
                            paddingTop: 10,
                            paddingBottom: 10,
                            color: GlobalColors.primaryTextColor
                        }}
                    >
                        Selected
                    </Text>
                    <ScrollView>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                paddingHorizontal: 40
                            }}
                        >
                            {this.state.contacts.map((elem) => {
                                return elem && elem.selected ? (
                                    <View
                                        key={elem.userId}
                                        style={styles.selectedChip}
                                    >
                                        <RNChipView
                                            title={
                                                elem.userName.length > 20
                                                    ? elem.userName.substring(
                                                          0,
                                                          19
                                                      )
                                                    : elem.userName
                                            }
                                            titleStyle={styles.chipFont}
                                            avatar={
                                                <ProfileImage
                                                    uuid={elem.userId}
                                                    placeholder={
                                                        images.user_image
                                                    }
                                                    style={styles.propic}
                                                    placeholderStyle={
                                                        styles.propic
                                                    }
                                                    resizeMode="cover"
                                                />
                                            }
                                            avatarStyle={{ margin: 5 }}
                                            cancelable={
                                                <Image
                                                    source={
                                                        images.cross_deselect
                                                    }
                                                />
                                            }
                                            // cancelableStyle={{
                                            //     backgroundColor:
                                            //         'rgba(255,255,255,1)'
                                            // }}
                                            backgroundColor={
                                                GlobalColors.transparent
                                            }
                                            borderRadius={6}
                                            height={30}
                                            onPress={() => {
                                                this.toggleSelectContacts(elem);
                                            }}
                                        />
                                    </View>
                                ) : null;
                            })}
                        </View>
                    </ScrollView>
                </View>
                <View style={styles.contactPickerListContainer}>
                    <FlatList renderItem={this.renderItem} data={allContacts} />
                </View>
                <View
                    style={{
                        ...styleButton
                    }}
                >
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

const mapStateToProps = (state) => ({
    appState: state.user,
    channels: state.channel
});

const mapDispatchToProps = (dispatch) => {
    return {
        setParticipants: (participants) =>
            dispatch(setChannelParticipants(participants)),
        setCurrentScene: (scene) => dispatch(setCurrentScene(scene))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageContacts);
