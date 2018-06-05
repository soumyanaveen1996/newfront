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

export default class ChannelsList extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        return {
            headerTitle: headerConfig.headerTitle,
            headerRight: <HeaderRightIcon config={addButtonConfig} onPress={state.params.handleAddChannel} />,
            headerLeft: <HeaderBack onPress={state.params.onBack ? () => { Actions.pop(); state.params.onBack() } : Actions.pop } refresh={true}/>,
        }
    }

    constructor(props){
        super(props);
        this.state = {
            channels: []
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleAddChannel: this.handleAddChannel.bind(this) });
        this.refresh();
    }

    handleAddChannel = () => {
        SystemBot.get(SystemBot.channelsBotManifestName)
            .then((channelsBot) => {
                Actions.botChat({ bot: channelsBot, onBack: this.onBack });
            });
    }

    onBack = () => {
        this.refresh();
    }


    async refresh() {
        const channels = await Channel.getSubscribedChannels();
        this.setState({
            channels: channels
        });
    }

    onChannelUnsubscribe = async (channel) => {
        await this.refresh();
        this.refs.toast.show(I18n.t('Channel_unsubscribed'), DURATION.LENGTH_SHORT);
    }

    onChannelUnsubscribeFailed = (channel) => {
        this.refs.toast.show(I18n.t('Channel_unsubscribe_failed'), DURATION.LENGTH_SHORT);
    }


    onChannelTapped = (channel) => {
        SystemBot.get(SystemBot.imBotManifestName)
            .then((imBot) => {
                Actions.channelChat({ bot: imBot, channel: channel, onBack: this.props.onBack });
            });
    }

    renderRow = (channel) => {
        return (
            <ChannelsListItem
                channel={channel}
                onUnsubscribe={this.onChannelUnsubscribe.bind(this)}
                onUnsubscribeFailed={this.onChannelUnsubscribeFailed.bind(this)}
                onChannelTapped={this.onChannelTapped.bind(this)}/>
        );
    }

    renderRowItem = ({item}) => {
        return (
            <View key={item.id} style={styles.rowContainer}>
                <View style={styles.rowContent}>
                    {this.renderRow(item)}
                </View>
            </View>
        )
    }

    render() {
        return (
            <View>
                <FlatList
                    style = {styles.flatList}
                    keyExtractor = {(item, index) => item.id}
                    data={this.state.channels}
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                />
                <Toast ref="toast"/>
            </View>
        )
    }
}

