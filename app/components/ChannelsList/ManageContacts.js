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
import _ from 'lodash';

const R = require('ramda');
const cancelImg = require('../../images/channels/cross-deselect-participant.png');

class ManageContacts extends React.Component {
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
            searchText: ''
        };
    }

    componentDidMount() {
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.manageContacts);
        console.log(
            'all contacts from props ',
            this.props.allContacts,
            this.props.appState.contactsLoaded
        );

        if (this.props.allContacts) {
            const allContacts = _.map(this.props.allContacts, contact => {
                return {
                    ...contact,
                    selected: false,
                    disabled: this.props.disabledUserIds.includes(
                        contact.userId
                    )
                };
            });
            let participants;
            if (this.props.alreadySelected) {
                participants = _.map(this.props.alreadySelected, part => {
                    return {
                        ...part,
                        selected: true,
                        disabled: this.props.disabledUserIds.includes(
                            part.userId
                        )
                    };
                });
            }

            let contactsUniq = _.unionBy(participants, allContacts, 'userId');
            contactsUniq = _.sortBy(contactsUniq, 'userName');
            this.setState({ contacts: contactsUniq });
        } else if (this.props.appState.contactsLoaded) {
            Contact.getAddedContacts().then(contacts => {
                const localContacts = _.map(contacts, contact => {
                    return {
                        ...contact,
                        selected: false,
                        disabled: this.props.disabledUserIds.includes(
                            contact.userId
                        )
                    };
                });
                let participants;
                if (this.props.alreadySelected) {
                    participants = _.map(this.props.alreadySelected, part => {
                        return {
                            ...part,
                            selected: true,
                            disabled: this.props.disabledUserIds.includes(
                                part.userId
                            )
                        };
                    });
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
            !this.props.allContacts &&
            prevProps.appState.contactsLoaded !==
                this.props.appState.contactsLoaded
        ) {
            Contact.getAddedContacts().then(contacts => {
                const localContacts = _.map(contacts, contact => {
                    return {
                        ...contact,
                        selected: false,
                        disabled: this.props.disabledUserIds.includes(
                            contact.userId
                        )
                    };
                });
                let participants;
                if (this.props.alreadySelected) {
                    participants = _.map(this.props.alreadySelected, part => {
                        return {
                            ...part,
                            selected: true,
                            disabled: this.props.disabledUserIds.includes(
                                part.userId
                            )
                        };
                    });
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

    componentWillUnmount() {
        console.log('Unmount Participants');
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.newChannels);
    }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.appState.currentScene === ROUTER_SCENE_KEYS.manageContacts
        );
    }

    selectContacts = () => {
        if (this.props.onSelected) {
            const selectedContacts = _.filter(this.state.contacts, contact => {
                return contact.selected;
            });
            // const users = _.map(selectedContacts, contact => {
            //     return contact.userId;
            // });
            this.props.onSelected(selectedContacts);
        }
        this.props.setParticipants(this.state.contacts);
        Actions.pop();
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
            <View style={ContactStyles.searchBar}>
                <TextInput
                    style={ContactStyles.searchTextInput}
                    autoFocus={true}
                    underlineColorAndroid="transparent"
                    placeholder="Search"
                    selectionColor={GlobalColors.darkGray}
                    placeholderTextColor={searchBarConfig.placeholderTextColor}
                    onChangeText={text => this.setState({ searchText: text })}
                />
            </View>
        );
    };

    renderEmailAddress = email => {
        if (email !== '' && typeof email === 'string') {
            return email;
        }
        if (typeof email === 'object') {
            if (email.work && email.work !== '') {
                return email.work;
            }

            if (email.home && email.home !== '') {
                return email.home;
            }

            if (email.work !== '' && email.home !== '') {
                return email.work;
            }
        }
    };

    render() {
        const {
            marginVertical,
            height,
            ...styleButton
        } = styles.filterButtonContainer;

        const allContacts = this.state.contacts.filter(contact =>
            contact.userName
                .toLowerCase()
                .includes(this.state.searchText.toLowerCase())
        );

        return (
            <SafeAreaView style={styles.addContactsContainer}>
                {this.renderSearchBar()}
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
                    <ScrollView>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start'
                            }}
                        >
                            {this.state.contacts.map((elem, index) => {
                                return elem && elem.selected ? (
                                    <View
                                        key={index}
                                        style={styles.selectedChip}
                                    >
                                        <RNChipView
                                            title={elem.userName}
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
                                                    resizeMode="contain"
                                                />
                                            }
                                            avatarStyle={{ margin: 5 }}
                                            cancelable={
                                                <Image source={cancelImg} />
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
                <View style={styles.participantsContainer}>
                    <ScrollView
                        style={{
                            backgroundColor: 'white',
                            height: 500
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'white',
                                alignItems: 'center',
                                padding: 5
                            }}
                        >
                            {allContacts.map((elem, index) => {
                                return (
                                    <TouchableOpacity
                                        onPress={() =>
                                            this.toggleSelectContacts(elem)
                                        }
                                        style={styles.contactContainer}
                                        key={elem.userId}
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
                                            uuid={elem.userId}
                                            placeholder={images.user_image}
                                            style={
                                                ContactStyles.contactItemImage
                                            }
                                            placeholderStyle={
                                                ContactStyles.contactItemImage
                                            }
                                            resizeMode="cover"
                                        />
                                        <View
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flex: 1
                                            }}
                                        >
                                            <Text
                                                style={styles.participantName}
                                            >
                                                {elem.userName}
                                            </Text>
                                            <Text
                                                style={styles.participantEmail}
                                            >
                                                {elem.emailAddress
                                                    ? this.renderEmailAddress(
                                                        elem.emailAddress
                                                    )
                                                    : this.renderEmailAddress(
                                                        elem.emailAddresses
                                                    )}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
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
)(ManageContacts);
