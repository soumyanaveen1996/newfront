import React from 'react';
import { View, FlatList } from 'react-native';
import styles from './styles';
import BotInstallListItem from '../../BotInstallListItem';
import Bot from '../../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../../config/i18n/i18n';
import utils from '../../../lib/utils';
import { Actions } from 'react-native-router-flux';

export default class FeaturedTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.featuredBots
        };
    }

    async componentWillMount() {
        this.refresh();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    async refresh() {
        const bots = await Bot.getTimeLineBots();
        if (this.mounted) {
            this.setState({ installedBots: bots });
        }
    }

    onBotInstalled = async () => {
        await this.refresh();
        this.refs.toast.show(I18n.t('Bot_installed'), DURATION.LENGTH_SHORT);
    };

    onBotInstallFailed = () => {
        this.refs.toast.show(
            I18n.t('Bot_install_failed'),
            DURATION.LENGTH_SHORT
        );
    };

    checkBotStatus = bot => {
        return utils.checkBotStatus(this.state.installedBots, bot);
    };

    renderBot = bot => {
        const botStatus = this.checkBotStatus(bot);

        return (
            <BotInstallListItem
                bot={bot}
                key={bot.botId}
                onBotInstalled={this.onBotInstalled}
                onBotInstallFailed={this.onBotInstallFailed}
                installed={botStatus.installed}
                onBotClick={this.onBotClick.bind(this)}
                update={botStatus.update}
            />
        );
    };

    onBotClick(item) {
        Actions.botChat({ bot: item });
    }

    renderGridItem = ({ item }) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                <View style={styles.rowContent}>{this.renderBot(item)}</View>
            </View>
        );
    };

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <FlatList
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.state.botsData}
                    renderItem={this.renderGridItem.bind(this)}
                    extraData={this.state}
                />
                <Toast ref="toast" positionValue={250} />
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
