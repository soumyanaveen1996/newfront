import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator
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
import { setChannelTeam } from '../../redux/actions/ChannelActions';
import { setCurrentScene } from '../../redux/actions/UserActions';
import { Contact } from '../../lib/capability';
import images from '../../images';
import { RNChipView } from 'react-native-chip-view';
import ProfileImage from '../ProfileImage';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { GlobalColors } from '../../config/styles';
import { Auth } from '../../lib/capability';
import RadioForm, {
    RadioButton,
    RadioButtonInput,
    RadioButtonLabel
} from 'react-native-simple-radio-button';
const R = require('ramda');

class SelectTeam extends React.Component {
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
            teams: [],
            loading: false,
            myTeam: ''
        };
    }

    componentDidMount() {
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.selectTeam);
        this.setState({ loading: true });
        Auth.getUser()
            .then(user => {
                const domains = user.info.domains;
                let Teams;
                console.log('domains ', user, domains);

                Teams = domains
                    ? domains
                        .filter(domain => domain.domain !== 'frontmai')
                        .map(domain => ({
                            label: domain.domain.toUpperCase(),
                            value: domain.domain
                        }))
                    : [];

                this.setState({ teams: Teams, loading: false });
            })
            .catch(err => {
                console.log('Error Loading Domains', err);
                this.setState({ loading: false, teams: [] });
            });
    }

    componentWillUnmount() {
        this.props.setCurrentScene(ROUTER_SCENE_KEYS.newChannels);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === ROUTER_SCENE_KEYS.selectTeam;
    }

    selectContacts = () => {
        if (this.state.myTeam !== '') {
            this.props.setTeam(this.state.myTeam);
        }
        setTimeout(() => Actions.pop(), 100);
    };

    render() {
        const {
            marginVertical,
            height,
            ...styleButton
        } = styles.filterButtonContainer;

        // console.log('all teams data ', this.state.teams);

        if (this.state.loading) {
            return (
                <View style={{ position: 'absolute', top: 50, left: 50 }}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (
            <SafeAreaView style={styles.addContactsContainer}>
                <View style={styles.teamContainer}>
                    <ScrollView
                        style={{
                            backgroundColor: 'white'
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'white',
                                marginVertical: 10,
                                marginHorizontal: 20
                            }}
                        >
                            <RadioForm
                                radio_props={this.state.teams}
                                initial={-1}
                                onPress={value => {
                                    this.setState({ myTeam: value });
                                }}
                            />
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
        setTeam: team => dispatch(setChannelTeam(team)),
        setCurrentScene: scene => dispatch(setCurrentScene(scene))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SelectTeam);
