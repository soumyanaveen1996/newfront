import React from 'react';
import { View, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import BotInstallListItem from '../BotInstallListItem';
import Bot from '../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';
import { Actions } from 'react-native-router-flux';
import images from '../../images';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default class BotContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.botsData,
            allBots: [...this.props.allBots],
            title: this.props.name,
            botIds: [...this.props.botIds],
            collapseTab: false
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

    collapseCurrent = () => {
        this.setState(prevState => ({
            collapseTab: !prevState.collapseTab
        }));
    };

    render() {
        let limitedBotData = [];

        let indexBot = 0;

        if (this.state.botsData.length > 1) {
            while (indexBot < 2) {
                limitedBotData.push(this.state.botsData[indexBot]);
                indexBot++;
            }
        }
        if (this.state.botsData.length === 1) {
            limitedBotData.push(this.state.botsData[0]);
        }

        if (limitedBotData.length > 0) {
            return (
                <View
                    style={{
                        alignItems: 'center',
                        marginBottom: 20
                    }}
                >
                    <View style={styles.titleBar}>
                        <View
                            style={{
                                flex: 3,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            {this.props.tabStatus &&
                            this.props.tabStatus === 'provider' ? (
                                    <View
                                        style={{
                                            width: 45,
                                            height: 45,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRightWidth: 1,
                                            borderRightColor: 'rgba(91,91,91,0.2)'
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 35,
                                                height: 35
                                            }}
                                            source={{
                                                uri: this.props.imageForHeader
                                            }}
                                        />
                                    </View>
                                ) : null}
                            <Text style={styles.categoryTitleStyle}>
                                {this.state.title}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={this.collapseCurrent}
                            >
                                {!this.state.collapseTab ? (
                                    <Image
                                        style={{ width: 10, height: 10 }}
                                        source={images.collapse_gray_arrow_down}
                                    />
                                ) : (
                                    <Image
                                        style={{ width: 10, height: 10 }}
                                        source={images.collapse_gray_arrow_up}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    {!this.state.collapseTab ? (
                        <FlatList
                            style={styles.flatList}
                            keyExtractor={(item, index) => item.botId}
                            data={limitedBotData}
                            renderItem={this.renderGridItem.bind(this)}
                            extraData={this.state}
                            scrollEnabled={false}
                            verticalScrollingDisabled={true}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : null}

                    <Toast ref="toast" positionValue={250} />
                    <View style={styles.exploreAllFooter}>
                        <TouchableOpacity
                            onPress={() => this.onTileCilcked(this.state.title)}
                        >
                            <Text
                                style={{
                                    color: 'rgba(0,189,242,1)',
                                    fontSize: 16
                                }}
                            >
                                Explore All
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }

    _onFetch(pageNo, success, failure) {}
}
