import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput
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

const BUTTON_INNER = hp('2%');
const BUTTON_OUTER = hp('3%');
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
                        setTimeout(() => Actions.pop(), 200);
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
            loading: false
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
    }

    static onEnter() {
        Store.dispatch(setCurrentScene(ROUTER_SCENE_KEYS.newChannels));
    }

    componentWillUnmount() {
        this.props.setParticipants([]);
        this.props.setTeam('');
    }

    shouldComponentUpdate(nextProps) {
        return (
            this.props.appState.currentScene === ROUTER_SCENE_KEYS.newChannels
        );
    }

    onChangeChannelName(text) {
        this.setState({ channelName: text });
    }

    onChangeDescriptionText(text) {
        this.setState({ channelDescription: text });
    }

    focusTheField = id => {
        this.inputs[id].focus();
    };

    channelTypeSelected = value => {
        this.setState({ typeValue: value });
        if (value === 'team') {
            setTimeout(() => Actions.selectTeam(), 200);
        }
    };

    async saveChannel() {
        this.setState({ loading: true });
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
        console.log('save channels', channelData);

        Channel.create(channelData)
            .then(data => {
                console.log('success on creating channel ', data);
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
        return (
            <SafeAreaView style={{ flex: 1 }}>
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
                            </View>
                            <View style={styles.entryFields}>
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
                            </View>
                        )}
                        {this.props.channels.team !== '' ? (
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
                                                                    .typeValue ==
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
                                <View style={styles.channelInfoContainer}>
                                    <TouchableOpacity
                                        onPress={this.addParticipants.bind(
                                            this
                                        )}
                                    >
                                        <Text style={styles.channelText}>
                                            Add participants
                                        </Text>
                                        <Text>{`You Have Selected ${
                                            this.props.channels.participants.filter(
                                                part => part.selected === true
                                            ).length
                                        } participants`}</Text>
                                    </TouchableOpacity>
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
