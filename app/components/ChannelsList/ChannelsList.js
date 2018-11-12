import React from 'react';
import { View, FlatList } from 'react-native';
import styles from './styles';
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
class ChannelsList extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerTitle: headerConfig.headerTitle,
            headerRight: (
                <HeaderRightIcon
                    config={addButtonConfig}
                    onPress={state.params.handleAddChannel}
                />
            )
            // headerLeft: (
            //     <HeaderBack
            //         onPress={
            //             state.params.onBack
            //                 ? () => {
            //                     Actions.pop();
            //                     state.params.onBack();
            //                 }
            //                 : Actions.pop
            //         }
            //         refresh={true}
            //     />
            // )
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            channels: []
        };
    }

    async componentDidMount() {
        this.props.navigation.setParams({
            handleAddChannel: this.handleAddChannel.bind(this)
        });
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
        this.refresh(false, true);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('Channels');
    }
    async componentDidUpdate(prevProps) {
        if (
            prevProps.appState.allChannelsLoaded !==
            this.props.appState.allChannelsLoaded
        ) {
            return this.refresh(true, false);
        }

        if (
            prevProps.appState.refreshChannels !==
            this.props.appState.refreshChannels
        ) {
            if (__DEV__) {
                console.tron('Refresh Channels');
            }

            return this.refresh(true, false);
        }
    }
    static onEnter() {
        EventEmitter.emit(AuthEvents.tabSelected, I18n.t('Channels'));
        Store.dispatch(refreshChannels(true));
    }

    static onExit() {
        Store.dispatch(refreshChannels(false));
        Store.dispatch(setCurrentScene('none'));
        const user = Store.getState().user;
        if (user.allChannelsLoaded === false) {
            Channel.refreshChannels();
        }
    }

    handleAddChannel = () => {
        SystemBot.get(SystemBot.channelsBotManifestName).then(channelsBot => {
            Actions.botChat({ bot: channelsBot, onBack: this.onBack });
        });
    };

    onBack = () => {
        // this.refresh()
    };

    async refresh(onback = false, handleEmptyChannels = true) {
        const channels = await Channel.getSubscribedChannels();

        if (handleEmptyChannels && channels.length == 0) {
            if (onback) {
                if (this.props.onBack) {
                    this.props.onBack();
                }
                Actions.pop();
            } else {
                this.handleAddChannel();
            }
        } else {
            this.setState({ channels: channels });
        }
    }

    onChannelUnsubscribe = async channel => {
        await this.refresh(false, false);
        this.refs.toast.show(
            I18n.t('Channel_unsubscribed'),
            DURATION.LENGTH_SHORT
        );
    };

    onChannelUnsubscribeFailed = (channel, message) => {
        if (message) {
            this.refs.toast.show(message, DURATION.LENGTH_LONG);
        } else {
            this.refs.toast.show(
                I18n.t('Channel_unsubscribe_failed'),
                DURATION.LENGTH_LONG
            );
        }
    };

    onChannelTapped = channel => {
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.channelChat({
                bot: imBot,
                channel: channel,
                onBack: this.props.onBack
            });
        });
    };

    renderRow = channel => {
        return (
            <ChannelsListItem
                channel={channel}
                onUnsubscribe={this.onChannelUnsubscribe.bind(this)}
                onUnsubscribeFailed={this.onChannelUnsubscribeFailed.bind(this)}
                onChannelTapped={this.onChannelTapped.bind(this)}
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

    render() {
        return (
            <BackgroundImage>
                <NetworkStatusNotchBar />
                <FlatList
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.id}
                    data={this.state.channels}
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                />
                <Toast ref="toast" positionValue={200} />
            </BackgroundImage>
        );
    }
}

const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChannelsList);
