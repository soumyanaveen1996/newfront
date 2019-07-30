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

    onBotInstalled = async () => {
        Bot.getTimeLineBots().then(bots => {
            this.setState({ installedBots: bots });
            this.refs.toast.show(
                I18n.t('Bot_installed'),
                DURATION.LENGTH_SHORT
            );
        });
    };

    onBotInstallFailed = () => {
        this.refs.toast.show(
            I18n.t('Bot_install_failed'),
            DURATION.LENGTH_SHORT
        );
    };

    renderBot = bot => {
        return (
            <BotInstallListItem
                bot={bot}
                key={bot.botId}
                onBotInstalled={this.onBotInstalled}
                onBotInstallFailed={this.onBotInstallFailed}
                onBotClick={this.onBotClick.bind(this)}
                installedBots={this.state.installedBots}
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

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <FlatList
                        refreshControl={
                            Store.getState().user.network === 'full' ? (
                                <RefreshControl
                                    onRefresh={() => {
                                        this.setState(
                                            { refreshing: true },
                                            async () => {
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
                                            }
                                        );
                                    }}
                                    refreshing={this.state.refreshing}
                                />
                            ) : null
                        }
                        style={styles.flatList}
                        keyExtractor={(item, index) => item.botId}
                        data={this.state.botsData}
                        renderItem={this.renderGridItem.bind(this)}
                        extraData={this.state}
                    />
                    {this.renderToast()}
                </View>
            </ScrollView>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
