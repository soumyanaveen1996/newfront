import React from 'react';
import {
    Text,
    View,
    FlatList,
    TextInput,
    Platform,
    RefreshControl
} from 'react-native';
import styles from './styles';
import BotInstallListItem from '../../../../widgets/BotInstallListItem';
import I18n from '../../../../config/i18n/i18n';
import Store from '../../../../redux/store/configureStore';
import NavigationAction from '../../../../navigation/NavigationAction';
import TimelineBuilder from '../../../../lib/TimelineBuilder/TimelineBuilder';
import GlobalColors from '../../../../config/styles';
import SearchBar from '../../../../widgets/SearchBar';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

let backTimer = null;

export default class BotListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.route.params.data,
            searchString: this.props.route.params.searchText || '',
            countResults: this.props.route.params.count
        };
    }

    componentDidMount() {
        if (this.state.searchString) {
            this.updateText(this.state.searchString);
        }
        // Bot.getTimeLineBots().then(bots => {
        //     this.setState({ installedBots: bots });
        // });
        this.mounted = true;
    }

    onBotInstalled = async () => {
        this.props.route.params.onBotInstalled();
        Toast.show({ text1: I18n.t('Bot_installed'), type: 'success' });
    };

    onBotInstallFailed = () => {
        Toast.show({ text1: I18n.t('Bot_install_failed') });
    };

    renderRow = (bot) => (
        <BotInstallListItem
            bot={bot}
            key={bot.botId}
            onBotInstalled={this.onBotInstalled}
            onBotInstallFailed={this.onBotInstallFailed}
            onBotClick={this.onBotClick.bind(this)}
            installedBots={this.props.route.params.installedBots}
        />
    );

    onBotClick(item) {
        NavigationAction.goToBotChat({
            bot: item,
            botName: item?.botName,
            otherUserId: false,
            botLogoUrl: item?.logoUrl,
            comingFromNotif: {
                notificationFor: 'bot',
                isFavorite: 0,
                botId: item?.botId,
                userDomain: item?.userDomain,
                onRefresh: () => TimelineBuilder.buildTiimeline()
            }
        });
    }

    async updateText(searchString) {
        const searchBot = this.props.route.params.data.filter((bot) =>
            bot.botName.toLowerCase().includes(searchString.toLowerCase())
        );

        const count = searchBot.length;
        this.setState({
            searchString,
            botsData: searchBot,
            countResults: count
        });
    }

    renderRowItem = ({ item }) => (
        <View key={item.botId} style={styles.rowContainer}>
            {this.renderRow(item)}
        </View>
    );

    searchBotFields = () => {
        if (this.props.route.params.searchMode) {
            return (
                <View style={styles.searchSection}>
                    <SearchBar
                        placeholder="Search conversation"
                        value={this.props.searchString}
                        onChangeText={(searchString) => {
                            this.updateText(searchString);
                        }}
                    />
                </View>
            );
        }

        return null;
    };

    renderAppsCount() {
        if (this.state.countResults > 0 && this.state.searchString.length > 0) {
            return (
                <View>
                    <Text style={styles.appsCount}>
                        {this.state.countResults}
                        <Text style={styles.appsCountSlim}>
                            {' '}
                            apps found for search{' '}
                        </Text>
                        {this.state.searchString}
                    </Text>
                </View>
            );
        }
    }

    itemSeparatorComponent = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: GlobalColors.itemDevider
                }}
            />
        );
    };
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                {this.searchBotFields()}
                <FlatList
                    refreshControl={
                        Store.getState().user.network === 'full' &&
                        !this.props.route.params.searchMode && (
                            <RefreshControl
                                onRefresh={() => {
                                    this.setState(
                                        { refreshing: true },
                                        async () => {
                                            try {
                                                await this.props.route.params.refresh();
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
                        )
                    }
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.state.botsData}
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                    ItemSeparatorComponent={this.itemSeparatorComponent}
                    ListHeaderComponent={this.renderAppsCount()}
                />
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
