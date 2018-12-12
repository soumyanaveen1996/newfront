import React from 'react';
import { View, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import BotInstallListItem from '../BotInstallListItem';
import Bot from '../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';

export default class BotContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.botsData,
            allBots: [...this.props.allBots],
            title: this.props.name,
            botIds: [...this.props.botIds]
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

    onTileCilcked = title => {
        let selectedBots = this.state.allBots.filter(bot => {
            return this.state.botIds.indexOf(bot.botId) >= 0;
        });
        Actions.botList({ data: selectedBots, title: title });
    };

    render() {
        console.log('bots data ', this.props.imageForHeader);

        return (
            <View
                style={
                    this.props.currentIndex === 0
                        ? {
                            height: 295,
                            alignItems: 'center',
                            marginBottom: 20
                        }
                        : {
                            height: 185,
                            alignItems: 'center',
                            marginBottom: 20
                        }
                }
            >
                <View style={styles.titleBar}>
                    {this.props.tabStatus &&
                    this.props.tabStatus === 'provider' ? (
                            <View
                                style={{
                                    width: 45,
                                    height: 45,
                                    borderRadius: 1,
                                    borderRightColor: 'rgba(91,91,91,0.2)'
                                }}
                            >
                                <Image
                                    style={{
                                        width: 45,
                                        height: 45
                                    }}
                                    source={{ uri: this.props.imageForHeader }}
                                />
                            </View>
                        ) : null}
                    <Text style={styles.categoryTitleStyle}>
                        {this.state.title}
                    </Text>
                </View>
                <FlatList
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.state.botsData}
                    renderItem={this.renderGridItem.bind(this)}
                    extraData={this.state}
                    scrollEnabled={false}
                    verticalScrollingDisabled={true}
                    showsVerticalScrollIndicator={false}
                />
                <Toast ref="toast" positionValue={250} />
                <View style={styles.exploreAllFooter}>
                    <TouchableOpacity
                        onPress={() => this.onTileCilcked(this.state.title)}
                    >
                        <Text
                            style={{ color: 'rgba(0,189,242,1)', fontSize: 16 }}
                        >
                            Explore All
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
