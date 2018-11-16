import React from 'react';
import { View, FlatList } from 'react-native';
import styles from './styles';
import { headerConfig } from './config';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';
import BotInstallListItem from '../BotInstallListItem';
import Bot from '../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';

export default class BotListScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        return {
            headerTitle:
                navigation.state.params.title || headerConfig.headerTitle,
            headerLeft: <HeaderBack onPress={Actions.pop} />
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.data
        };
    }

    async componentWillMount() {
        this.refresh();
    }

    async refresh() {
        const bots = await Bot.getTimeLineBots();
        this.setState({
            installedBots: bots
        });
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

    renderRow = bot => {
        const botStatus = this.checkBotStatus(bot);
        return (
            <BotInstallListItem
                bot={bot}
                onBotInstalled={this.onBotInstalled}
                installed={botStatus.installed}
                onBotClick={this.onBotClick.bind(this)}
                update={botStatus.update}
            />
        );
    };

    onBotClick(item) {
        Actions.botChat({ bot: item });
    }

    renderRowItem = ({ item }) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                <View style={styles.rowContent}>{this.renderRow(item)}</View>
            </View>
        );
    };

    render() {
        return (
            <View>
                <FlatList
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.state.botsData}
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                />
                <Toast ref="toast" positionValue={250} />
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
