import React from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';
import styles from './styles';
import BotInstallListItem from '../BotInstallListItem';
import Bot from '../../lib/bot';
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

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        Bot.getTimeLineBots().then(bots => {
            this.setState({ installedBots: bots });
        });
        this.mounted = true;
    }

    // componentDidUpdate() {
    //     Bot.getTimeLineBots().then(bots => {
    //         if (bots !== this.state.installedBots) {
    //             this.setState({ installedBots: bots });
    //         }
    //     });
    // }

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
                <View style={styles.rowContent}>{this.renderBot(item)}</View>
            </View>
        );
    };

    onTileCilcked = title => {
        let selectedBots = this.state.allBots.filter(bot => {
            return this.state.botIds.indexOf(bot.botId) >= 0;
        });
        let count = selectedBots.length;

        Actions.botListScreen({
            data: selectedBots,
            count: count,
            title: title,
            refresh: this.props.refresh,
            installedBots: this.props.installedBots,
            onBotInstalled: this.props.onBotInstalled,
            onBotInstallFailed: this.props.onBotInstallFailed
        });
    };

    collapseCurrent = () => {
        this.setState(prevState => ({
            collapseTab: !prevState.collapseTab
        }));
        this.props.handleCollapse(this.props.currentIndex);
    };

    render() {
        if (this.props.botsData && this.props.botsData.length > 0) {
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
                        <ScrollView>
                            {this.props.botsData.map(item => {
                                return (
                                    <View key={item.botId}>
                                        {this.renderGridItem({ item })}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    ) : null}
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
