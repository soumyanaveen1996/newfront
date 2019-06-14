import React from 'react';
import {
    View,
    FlatList,
    TextInput,
    ScrollView,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    Platform,
    AlertIOS,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import { Icons } from '../../config/icons';
import { addButtonConfig, headerConfig } from './config';
import { Actions } from 'react-native-router-flux';
import { HeaderRightIcon, HeaderBack } from '../Header';
import ChannelsListItem from './ChannelsListItem';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import SystemBot from '../../lib/bot/SystemBot';
import { Channel } from '../../lib/capability';
import { BackgroundImage } from '../BackgroundImage';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshChannels
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import { Auth } from '../../lib/capability';
import { RNChipView } from 'react-native-chip-view';
import { PollingStrategyTypes, Settings, Network } from '../../lib/capability';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import _ from 'lodash';
import images from '../../images';

const debounce = () => new Promise(resolve => setTimeout(resolve, 1000));

class ChannelsList extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let headerLeft = null;
        if (state.params.button) {
            if (state.params.button === 'manual') {
                headerLeft = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                headerLeft = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                headerLeft = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                headerLeft = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }

        const headerRight = (
            <TouchableOpacity
                accessibilityLabel="new channel button"
                testID="new-channel-button"
                style={styles.headerRight}
                onPress={state.params.newChannel}
            >
                <Image
                    accessibilityLabel="new channel item"
                    testID="new-channel-item"
                    source={require('../../images/channels/plus-white-good.png')}
                    style={{ width: 15, height: 15 }}
                />
            </TouchableOpacity>
        );

        const headerTitle = (
            <Text
                style={
                    Platform.OS === 'android'
                        ? { marginLeft: wp('20%'), fontSize: 18 }
                        : { fontSize: 18 }
                }
            >
                {headerConfig.headerTitle}
            </Text>
        );

        return {
            headerTitle,
            headerLeft,
            headerRight
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            channels: [],
            allChannels: [],
            filter: [],
            searchString: '',
            user: null,
            wait: false,
            loaded: false,
            refreshing: false
        };
    }

    async componentDidMount() {
        EventEmitter.addListener(
            AuthEvents.tabSelected,
            this.tabSelected.bind(this)
        );
        // const channels = await Channel.getSubscribedChannels()
        // if (channels.length > 0) {
        //     return this.refresh()
        // }

        // Channel.refreshChannels().then(async () => {
        //     await this.wait()
        //     return this.refresh()
        // })
        // if (!this.props.appState.allChannelsLoaded) {
        //     if (__DEV__) {
        //         console.tron('Channels Not Loaded ... Load Again!')
        //     }

        //     return Channel.refreshChannels()
        // }
        // this.refresh();

        this.props.navigation.setParams({
            showConnectionMessage: this.showConnectionMessage,
            newChannel: this.createChannel.bind(this)
        });
        user = await Auth.getUser();
        if (user) {
            this.setState({ user });
        }
        this.refresh(false, false);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Channels');
    }
    async componentDidUpdate(prevProps) {
        if (
            prevProps.appState.network !== this.props.appState.network &&
            this.props.appState.network === 'full'
        ) {
            this.setState({ refreshing: false });
        }

        if (
            prevProps.appState.allChannelsLoaded !==
            this.props.appState.allChannelsLoaded
        ) {
            await debounce();
            return this.refresh(false, true);
        }

        if (
            prevProps.appState.refreshChannels !==
            this.props.appState.refreshChannels
        ) {
            return this.refresh(true, false);
        }
    }
    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Channels'));
        Store.dispatch(refreshChannels(true));
        // const user = Store.getState().user
        // if (user.allChannelsLoaded === false) {
        //     Channel.refreshChannels();
        // }
    }

    tabSelected(scene) {
        if (scene === 'Channels') {
            this.setState({ searchString: '' });
        }
    }

    static onExit() {
        Store.dispatch(refreshChannels(false));
        Store.dispatch(setCurrentScene('none'));
        // const reduxState = Store.getState();
        // if (!reduxState.user.allChannelsLoaded) {
        //     // setTimeout(() => Channel.refreshChannels(), 0);
        //     // setTimeout(() => Channel.refreshUnsubscribedChannels(), 500);
        // }
    }

    showConnectionMessage = connectionType => {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    };

    showButton = pollingStrategy => {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    };

    checkPollingStrategy = async () => {
        let pollingStrategy = await Settings.getPollingStrategy();
        this.showButton(pollingStrategy);
    };

    applyFilter = async channels => {
        const filters = this.props.channel.filters.filter(
            filter => filter.checked === true
        );
        const user = await Auth.getUser();

        const { userId } = user;

        let filteredChannels = channels;
        for (let filter of filters) {
            if (!filter) {
                continue;
            }
            const { value } = filter;
            if (value === 'subscribed') {
                filteredChannels = filteredChannels.filter(
                    channel => channel.subcription === 'true'
                );
            }

            if (value === 'created') {
                filteredChannels = filteredChannels.filter(
                    channel => channel.ownerId === userId
                );
            }

            if (value === 'unscubscribed') {
                filteredChannels = filteredChannels.filter(
                    channel => channel.subcription === 'false'
                );
            }
            if (value === 'public') {
                filteredChannels = filteredChannels.filter(
                    channel => channel.channelType === 'public'
                );
            }
            if (value === 'private') {
                filteredChannels = filteredChannels.filter(
                    channel => channel.channelType === 'private'
                );
            }
        }
        return filteredChannels;
    };
    onBack = (filter = null) => {
        // this.refresh()
        if (__DEV__) {
            console.tron('I am back', filter);
        }
    };

    async refresh(onback = false, handleEmptyChannels = false) {
        let channels = await Channel.getSubscribedChannels();

        console.log('all the data ========', channels);

        let filteredChannels = await this.applyFilter(channels);
        for (const channel of filteredChannels) {
            if (channel.subcription === 'true') {
                const admins = await Channel.getAdmins(
                    channel.channelName,
                    channel.userDomain
                );
                const isAdmin = _.find(admins, adm => {
                    return adm.userId === this.state.user.userId;
                });
                if (isAdmin) {
                    channel.isAdmin = true;
                }
            }
        }
        this.setState({
            channels: filteredChannels,
            allChannels: channels,
            loaded: true
        });
        this.checkPollingStrategy();
    }

    onChannelUnsubscribe = async channel => {
        await this.refresh(false, false);
        this.toast.show(I18n.t('Channel_unsubscribed'), DURATION.LENGTH_SHORT);
    };

    onChannelSubscribed = async channel => {
        await this.refresh(false, false);
        this.toast.show(I18n.t('Channel_subscribed'), DURATION.LENGTH_SHORT);
    };

    onChannelUnsubscribeFailed = (channel, message) => {
        if (message) {
            this.toast.show(message, DURATION.LENGTH_LONG);
        } else {
            this.toast.show(
                I18n.t('Channel_unsubscribe_failed'),
                DURATION.LENGTH_LONG
            );
        }
    };

    onChannelsubscribeFailed = (channel, message) => {
        if (message) {
            this.toast.show(message, DURATION.LENGTH_LONG);
        } else {
            this.toast.show(
                I18n.t('Channel_subscribe_failed'),
                DURATION.LENGTH_LONG
            );
        }
    };

    onChannelTapped = channel => {
        // AlertIOS.alert('Hello')

        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.channelChat({
                bot: imBot,
                channel: channel,
                onBack: this.onBack
            });
        });
    };

    setWait = wait => this.setState({ wait });
    renderRow = channel => {
        return (
            <ChannelsListItem
                channel={channel}
                user={this.state.user}
                wait={this.setWait}
                onUnsubscribe={this.onChannelUnsubscribe.bind(this)}
                onUnsubscribeFailed={this.onChannelUnsubscribeFailed.bind(this)}
                onSubscribed={this.onChannelSubscribed}
                onSubscribeFailed={this.onChannelsubscribeFailed}
                onChannelTapped={this.onChannelTapped.bind(this)}
                onChannelEdit={this.editChannel.bind(this)}
            />
        );
    };

    renderRowItem = ({ item }) => {
        return (
            <View key={item.id} style={styles.rowContainer}>
                <View style={styles.rowContent}>{this.renderRow(item)}</View>
            </View>
        );
    };

    createChannel() {
        setTimeout(
            () =>
                Actions.newChannels({
                    title: 'Create new channel',
                    edit: false,
                    user: this.state.user
                }),
            200
        );
    }

    editChannel(channel, onUnsubscribe) {
        const isOwner =
            channel.ownerId === this.state.user.userId ? true : false;
        Actions.channelAdminScreen({
            title: 'Edit Channel',
            channel: channel,
            onUnsubscribeChannel: onUnsubscribe,
            isOwner: isOwner
        });
    }

    onPressFilter() {
        Actions.channelsFilter({
            title: 'Filter',
            onBack: this.onBack
        });
    }

    render() {
        const filters = this.props.channel.filters.filter(
            filter => filter.checked === true
        );

        let channels;
        if (this.state.searchString.length > 0) {
            channels = this.state.allChannels.filter(channel =>
                channel.channelName
                    .toLowerCase()
                    .includes(this.state.searchString.toLowerCase())
            );
        } else {
            channels = this.state.allChannels.filter(
                channel => channel.subcription === 'true'
            );
        }

        return (
            <BackgroundImage>
                <NetworkStatusNotchBar />
                <ScrollView
                    refreshControl={
                        this.props.appState.network === 'full' ? (
                            <RefreshControl
                                onRefresh={() => {
                                    this.setState(
                                        { refreshing: true },
                                        async () => {
                                            await Channel.refreshChannels();
                                            await Channel.refreshUnsubscribedChannels();
                                            this.refresh();
                                            this.setState({
                                                refreshing: false
                                            });
                                        }
                                    );
                                }}
                                refreshing={this.state.refreshing}
                            />
                        ) : null
                    }
                >
                    <View style={styles.searchSection}>
                        <Icon
                            style={styles.searchIcon}
                            name="search"
                            size={24}
                            color="rgba(0, 189, 242, 1)"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Search Channel"
                            onChangeText={searchString => {
                                this.setState({ searchString });
                            }}
                            underlineColorAndroid="transparent"
                            value={this.state.searchString}
                        />
                    </View>

                    <View style={styles.createNewChannelContainer} />

                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterTextContainer}
                            onPress={this.onPressFilter.bind(this)}
                        >
                            <Text style={styles.filterText}>Filter</Text>
                            <Image
                                source={require('../../images/channels/filter-arrow-down.png')}
                                style={styles.filterImage}
                            />
                        </TouchableOpacity>
                        <ScrollView horizontal>
                            <View style={styles.filterArea}>
                                {filters.length > 0
                                    ? filters.map(filter => {
                                        return (
                                            <View
                                                style={styles.filterSelected}
                                            >
                                                <RNChipView
                                                    title={filter.title}
                                                    onPress={this.onPressFilter.bind(
                                                        this
                                                    )}
                                                    titleStyle={
                                                        styles.selectedFilterTitle
                                                    }
                                                    avatar={false}
                                                    backgroundColor="#424B5A"
                                                    borderRadius={6}
                                                    height={20}
                                                    cancelable={true}
                                                />
                                            </View>
                                        );
                                    })
                                    : null}
                            </View>
                        </ScrollView>
                    </View>
                    {channels.length > 0 || !this.state.loaded ? (
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <FlatList
                                style={styles.flatList}
                                keyExtractor={(item, index) =>
                                    item.id.toString()
                                }
                                data={channels}
                                renderItem={this.renderRowItem.bind(this)}
                                extraData={this.state}
                            />
                        </View>
                    ) : (
                        <View
                            style={{
                                marginTop: '20%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: hp('40%')
                            }}
                        >
                            <Image source={images.empty_channel} />
                            <Text>
                                {this.state.searchString.length > 0
                                    ? '\nNo channel has been found.'
                                    : '\nYou are not subscribed to any channel.\nSearch or create a new one.'}
                            </Text>
                        </View>
                    )}
                </ScrollView>
                {this.state.wait ? (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                ) : null}
                <Toast ref={elem => (this.toast = elem)} positionValue={250} />
            </BackgroundImage>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user,
    channel: state.channel
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChannelsList);
