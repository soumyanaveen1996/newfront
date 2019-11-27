import React from 'react';
import {
    View,
    FlatList,
    ScrollView,
    Platform,
    RefreshControl
} from 'react-native';
import styles from './styles';
import BotInstallListItem from '../../BotInstallListItem';
import Bot from '../../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../../config/i18n/i18n';
import utils from '../../../lib/utils';
import { Actions } from 'react-native-router-flux';
import Store from '../../../redux/store/configureStore';

export default class FeaturedTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.featuredBots
        };
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        Bot.getTimeLineBots().then(bots => {
            this.setState({ installedBots: bots });
        });
        this.mounted = true;
    }

    onPullToRefresh() {
        this.setState({ refreshing: true }, async () => {
            try {
                await this.props.refresh();
                this.setState({
                    refreshing: false
                });
            } catch (e) {
                this.setState({
                    refreshing: false
                });
            }
        });
    }

    renderBot = bot => {
        return (
            <BotInstallListItem
                bot={bot}
                key={bot.botId}
                onBotClick={this.onBotClick.bind(this)}
                installedBots={this.props.installedBots}
                onBotInstalled={this.props.onBotInstalled}
                onBotInstallFailed={this.props.onBotInstallFailed}
            />
        );
    };

    onBotClick(item) {
        Actions.botChat({ bot: item });
    }

    renderGridItem = ({ item }) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                {this.renderBot(item)}
            </View>
        );
    };

    render() {
        return (
            <FlatList
                refreshControl={
                    Store.getState().user.network === 'full' ? (
                        <RefreshControl
                            onRefresh={this.onPullToRefresh.bind(this)}
                            refreshing={this.state.refreshing}
                        />
                    ) : null
                }
                contentContainerStyle={styles.flatList}
                keyExtractor={(item, index) => item.botId}
                data={this.state.botsData}
                renderItem={this.renderGridItem.bind(this)}
                extraData={this.state}
            />
        );
    }

    _onFetch(pageNo, success, failure) {}
}
