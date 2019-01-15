import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Actions } from 'react-native-router-flux';
import RadioForm, {
    RadioButton,
    RadioButtonInput,
    RadioButtonLabel
} from 'react-native-simple-radio-button';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { Icons } from '../../config/icons';
import styles from './styles';
import I18n from '../../config/i18n/i18n';
import { Channel } from '../../lib/capability';
import Loader from '../Loader/Loader';
import images from '../../images';
import { connect } from 'react-redux';
import {
    setChannelParticipants,
    setChannelTeam
} from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import Store from '../../redux/store/configureStore';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Auth } from '../../lib/capability';
import { GlobalColors } from '../../config/styles';

const BUTTON_INNER = hp('1%');
const BUTTON_OUTER = hp('2.5%');
const DESC_LENGTH = 60;
class NewChannels extends React.Component {
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
                    onPress={() => {
                        state.params.onBack();
                    }}
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
            channelName: '',
            channelDescription: '',
            typeValue: 'platform',
            visibilityValue: 'public',
            loading: false,
            channelNameError: false,
            channelDescError: false,
            participantError: false,
            teamError: false
        };

        this.channelType_radio = [
            { label: 'Team', value: 'team' },
            { label: 'Platform', value: 'platform' }
        ];

        this.channelVisibility_radio = [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' }
        ];
        this.inputs = {};
    }

    componentDidMount() {
        if (this.props.edit) {
            this.setState({
                channelName: this.props.channel.channelName,
                channelDescription: this.props.channel.description
            });
        }

        this.props.navigation.setParams({ onBack: this.onBack });
    }

    static onEnter() {
        Store.dispatch(setCurrentScene(ROUTER_SCENE_KEYS.newChannels));
    }

    componentWillUnmount() {
        this.props.setParticipants([]);
        this.props.setTeam('');
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.appState.currentScene ===
                ROUTER_SCENE_KEYS.newChannels || this.state !== nextState
        );
    }

    onChangeChannelName(text) {
        this.setState({ channelName: text });
    }

    onBack = () => {
        Alert.alert(
            'Confirmation',
            'All data will be lost. Are you sure?',
            [
                {
                    text: 'Yes, I will create later',
                    onPress: () => setTimeout(() => Actions.pop(), 0)
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                }
            ],
            { cancelable: true }
        );
    };

    onChangeDescriptionText(text) {
        if (DESC_LENGTH - this.state.channelDescription <= 0) {
            return;
        }
        this.setState({ channelDescription: text });
    }

    focusTheField = id => {
        this.inputs[id].focus();
    };

    channelTypeSelected = value => {
        this.setState({ typeValue: value });
        if (value === 'team') {
            setTimeout(() => Actions.selectTeam(), 200);
        } else {
            this.props.setTeam('');
        }
    };

    validateChannel = () => {
        let validationFailed = false;
        if (this.state.channelName === '') {
            this.setState({ channelNameError: true });
            validationFailed = true;
        } else {
            this.setState({ channelNameError: false });
        }

        if (this.state.channelDescription === '') {
            validationFailed = true;
            this.setState({ channelDescError: true });
        } else {
            this.setState({ channelDescError: false });
        }

        const users = this.props.channels.participants.filter(
            user => user.selected === true
        );
        if (users.length === 0) {
            // validationFailed = true;
            this.setState({ participantError: false });
        } else {
            this.setState({ participantError: false });
        }

        if (
            this.state.typeValue === 'team' &&
            (!this.props.channels || this.props.channels.team === '')
        ) {
            validationFailed = true;
            this.setState({ teamError: true });
        } else {
            this.setState({ teamError: false });
        }

        return validationFailed;
    };
    async saveChannel() {
        if (this.validateChannel() === true) {
            return;
        }

        this.setState({ loading: true });
        // const user = await Auth.getUser()
        const channelName = this.state.channelName;
        const description = this.state.channelDescription;
        const discoverable = this.state.visibilityValue;
        const channelType = this.state.typeValue;
        let userDomain = '';
        if (channelType === 'platform') {
            userDomain = 'frontmai';
        } else {
            userDomain = this.props.channels.team;
        }
        const channelData = {
            channelName,
            description,
            discoverable,
            channelType,
            userDomain
        };

        Channel.create(channelData)
            .then(data => {
                const users = this.props.channels.participants.filter(
                    user => user.selected === true
                );
                const userIds = users.map(user => user.userId);
                if (users.length > 0) {
                    Channel.addUsers(
                        channelData.channelName,
                        channelData.userDomain,
                        userIds
                    ).then(data => {
                        this.setState({ loading: false });
                        setTimeout(() => Actions.pop(), 100);
                    });
                } else {
                    this.setState({ loading: false });
                    setTimeout(() => Actions.pop(), 100);
                }
            })
            .catch(err => {
                this.setState({ loading: false });
                console.log('err on creating channel', err);
            });
    }

    async saveChannelEdit() {
        this.setState({ loading: true });
        const channelName = this.state.channelName;
        const description = this.state.channelDescription;
        let userDomain = this.props.channel.userDomain;
        Channel.update(channelName, description, userDomain)
            .then(data => {
                console.log('success on creating channel ', data);
                this.setState({ loading: false });
                Actions.pop();
            })
            .catch(err => {
                console.log('err on creating channel', err);
            });
    }
    addParticipants() {
        Actions.addParticipants();
    }

    render() {
        const {
            channelNameError,
            channelDescError,
            participantError,
            teamError
        } = this.state;
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: GlobalColors.white }}
            >
                <Loader loading={this.state.loading} />
                <ScrollView style={styles.scrollViewCreate}>
                    <View style={styles.newChannelContainer}>
                        <View style={styles.channelInfoContainer}>
                            <View style={styles.entryFields}>
                                <TextInput
                                    style={styles.inputChannel}
                                    value={this.state.channelName}
                                    editable={!this.props.edit}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={this.onChangeChannelName.bind(
                                        this
                                    )}
                                    keyboardType="default"
                                    blurOnSubmit={false}
                                    returnKeyType={'next'}
                                    onSubmitEditing={() => {
                                        this.focusTheField('description');
                                    }}
                                    placeholder="Channel name"
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor="rgba(155,155,155,1)"
                                    clearButtonMode="always"
                                />
                                {channelNameError ? (
                                    <Text style={styles.errorText}>
                                        Channel Name is Required
                                    </Text>
                                ) : null}
                            </View>
                            <View style={styles.entryFields}>
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <TextInput
                                        style={styles.inputChannelDescription}
                                        value={this.state.channelDescription}
                                        keyboardType="default"
                                        blurOnSubmit={true}
                                        returnKeyType={'done'}
                                        ref={input => {
                                            this.inputs.description = input;
                                        }}
                                        onChangeText={this.onChangeDescriptionText.bind(
                                            this
                                        )}
                                        placeholder="Description about your channel"
                                        underlineColorAndroid={'transparent'}
                                        multiline={true}
                                        numberOfLines={4}
                                        maxLength={60}
                                        placeholderTextColor="rgba(155,155,155,1)"
                                        clearButtonMode="always"
                                    />
                                    <Text style={styles.channelDescText}>
                                        {`${
                                            DESC_LENGTH -
                                                this.state.channelDescription
                                                    .length >
                                            0
                                                ? DESC_LENGTH -
                                                  this.state.channelDescription
                                                      .length
                                                : 0
                                        } characters left`}
                                    </Text>
                                    {channelDescError ? (
                                        <Text style={styles.errorText}>
                                            Channel Description is Required
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                        {this.props.edit ? null : (
                            <View style={styles.channelInfoContainer}>
                                <Text style={styles.channelText}>
                                    Channel Type
                                </Text>
                                {/* <RadioForm
                                    radio_props={this.channelType_radio}
                                    initial={1}
                                    formHorizontal={true}
                                    onPress={this.channelTypeSelected}
                                /> */}
                                <RadioForm formHorizontal={true}>
                                    {this.channelType_radio.map((obj, i) => {
                                        return (
                                            <RadioButton
                                                labelHorizontal={true}
                                                key={i}
                                            >
                                                {/*  You can set RadioButtonLabel before RadioButtonInput */}
                                                <RadioButtonInput
                                                    obj={obj}
                                                    index={i}
                                                    isSelected={
                                                        this.state.typeValue ==
                                                        obj.value
                                                            ? true
                                                            : false
                                                    }
                                                    onPress={
                                                        this.channelTypeSelected
                                                    }
                                                    borderWidth={1}
                                                    buttonInnerColor={'#00BDF2'}
                                                    buttonOuterColor={
                                                        this.state.typeValue ==
                                                        obj.value
                                                            ? '#00BDF2'
                                                            : '#000'
                                                    }
                                                    buttonSize={BUTTON_INNER}
                                                    buttonOuterSize={
                                                        BUTTON_OUTER
                                                    }
                                                    buttonStyle={
                                                        i == 1
                                                            ? styles.radioButton
                                                            : {}
                                                    }
                                                    buttonWrapStyle={{}}
                                                />
                                                <RadioButtonLabel
                                                    obj={obj}
                                                    index={i}
                                                    labelHorizontal={true}
                                                    onPress={
                                                        this.channelTypeSelected
                                                    }
                                                    labelStyle={
                                                        styles.radioLabel
                                                    }
                                                    labelWrapStyle={{}}
                                                />
                                            </RadioButton>
                                        );
                                    })}
                                </RadioForm>
                                {teamError ? (
                                    <Text style={styles.errorText}>
                                        You need to select a Team
                                    </Text>
                                ) : null}
                            </View>
                        )}
                        {this.state.typeValue !== 'platform' &&
                        this.props.channels.team !== '' ? (
                                <Text
                                    style={{ marginVertical: 5 }}
                                >{`You selected Team ${this.props.channels.team.toUpperCase()}`}</Text>
                            ) : null}
                        {this.props.edit ? null : (
                            <View>
                                <View style={styles.channelInfoContainer}>
                                    <Text style={styles.channelText}>
                                        Channel visibility
                                    </Text>
                                    {/* <RadioForm
                                        radio_props={
                                            this.channelVisibility_radio
                                        }
                                        initial={0}
                                        formHorizontal={true}
                                        onPress={value => {
                                            this.setState({
                                                visibilityValue: value
                                            })
                                        }}
                                    /> */}
                                    <RadioForm formHorizontal={true}>
                                        {this.channelVisibility_radio.map(
                                            (obj, i) => {
                                                return (
                                                    <RadioButton
                                                        labelHorizontal={true}
                                                        key={i}
                                                    >
                                                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                                                        <RadioButtonInput
                                                            obj={obj}
                                                            index={i}
                                                            isSelected={
                                                                this.state
                                                                    .visibilityValue ==
                                                                obj.value
                                                                    ? true
                                                                    : false
                                                            }
                                                            onPress={value => {
                                                                this.setState({
                                                                    visibilityValue: value
                                                                });
                                                            }}
                                                            borderWidth={1}
                                                            buttonInnerColor={
                                                                '#00BDF2'
                                                            }
                                                            buttonOuterColor={
                                                                this.state
                                                                    .visibilityValue ==
                                                                obj.value
                                                                    ? '#00BDF2'
                                                                    : '#000'
                                                            }
                                                            buttonSize={
                                                                BUTTON_INNER
                                                            }
                                                            buttonOuterSize={
                                                                BUTTON_OUTER
                                                            }
                                                            buttonStyle={
                                                                i == 1
                                                                    ? styles.radioButton
                                                                    : {}
                                                            }
                                                            buttonWrapStyle={{}}
                                                        />
                                                        <RadioButtonLabel
                                                            obj={obj}
                                                            index={i}
                                                            labelHorizontal={
                                                                true
                                                            }
                                                            onPress={value => {
                                                                this.setState({
                                                                    visibilityValue: value
                                                                });
                                                            }}
                                                            labelStyle={
                                                                styles.radioLabel
                                                            }
                                                            labelWrapStyle={{}}
                                                        />
                                                    </RadioButton>
                                                );
                                            }
                                        )}
                                    </RadioForm>
                                </View>
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.addParticipants.bind(
                                            this
                                        )}
                                        style={styles.addParticipantContainer}
                                    >
                                        <Text style={styles.channelTextP}>
                                            Add participants
                                        </Text>

                                        <Image
                                            style={{
                                                marginHorizontal: 10,
                                                paddingTop: 6
                                            }}
                                            source={images.blue_arrow}
                                        />

                                        {/* <Text>{`You Have Selected ${
                                            this.props.channels.participants.filter(
                                                part => part.selected === true
                                            ).length
                                        } participants`}</Text> */}
                                    </TouchableOpacity>

                                    {participantError ? (
                                        <Text style={styles.errorText}>
                                            You need to add atleast one
                                            participant
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        )}
                        <View style={{ marginVertical: 20 }}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={
                                    this.props.edit
                                        ? this.saveChannelEdit.bind(this)
                                        : this.saveChannel.bind(this)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {this.props.edit
                                        ? 'Save Channel'
                                        : 'Create Channel'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
        setTeam: team => dispatch(setChannelTeam(team)),
        setCurrentScene: scene => dispatch(setCurrentScene(scene))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewChannels);
