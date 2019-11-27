import React from 'react';
import {
    Text,
    View,
    FlatList,
    TextInput,
    Platform,
    RefreshControl
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import styles from './styles';
import { headerConfig } from './config';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';
import BotInstallListItem from '../BotInstallListItem';
import Bot from '../../lib/bot';
import Toast, { DURATION } from 'react-native-easy-toast';
import I18n from '../../config/i18n/i18n';
import utils from '../../lib/utils';
import Store from '../../redux/store/configureStore';

var backTimer = null;

export default class BotListScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        return {
            headerTitle:
                navigation.state.params.title || headerConfig.headerTitle,
            headerLeft: (
                <HeaderBack
                    onPress={() => {
                        clearTimeout(backTimer);
                        backTimer = setTimeout(() => Actions.pop(), 500);
                    }}
                />
            )
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.data,
            searchString: this.props.searchText || '',
            countResults: this.props.count
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
        this.props.onBotInstalled();
        this.refs.toast.show(I18n.t('Bot_installed'), DURATION.LENGTH_SHORT);
    };

    onBotInstallFailed = () => {
        this.refs.toast.show(
            I18n.t('Bot_install_failed'),
            DURATION.LENGTH_SHORT
        );
    };

    renderRow = bot => {
        return (
            <BotInstallListItem
                bot={bot}
                key={bot.botId}
                onBotInstalled={this.onBotInstalled}
                onBotInstallFailed={this.onBotInstallFailed}
                onBotClick={this.onBotClick.bind(this)}
                installedBots={this.props.installedBots}
            />
        );
    };

    onBotClick(item) {
        Actions.botChat({ bot: item });
    }

    async updateText(searchString) {
        const searchBot = this.props.data.filter(bot => {
            return bot.botName.startsWith(searchString);
        });

        let count = searchBot.length;
        this.setState({
            searchString: searchString,
            botsData: searchBot,
            countResults: count
        });
    }

    renderRowItem = ({ item }) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                {this.renderRow(item)}
            </View>
        );
    };

    searchBotFields = () => {
        if (this.props.searchMode) {
            return (
                <View style={styles.searchSection}>
                    <Icon
                        style={styles.searchIcon}
                        name="search"
                        size={24}
                        color="rgba(0, 189, 242, 1)"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Search apps"
                        value={this.state.searchString}
                        onChangeText={searchString => {
                            this.updateText(searchString);
                        }}
                        underlineColorAndroid="transparent"
                        value={this.state.searchString}
                    />
                </View>
            );
        } else {
            return null;
        }
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

    renderToast() {
        if (Platform.OS === 'ios') {
            return <Toast ref="toast" position="bottom" positionValue={350} />;
        } else {
            return <Toast ref="toast" position="center" />;
        }
    }

    render() {
        return (
            <View
                style={{ flex: 1, alignItems: 'center', paddingHorizontal: 10 }}
            >
                {this.searchBotFields()}
                <FlatList
                    refreshControl={
                        Store.getState().user.network === 'full' &&
                        !this.props.searchMode ? (
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
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                    ListHeaderComponent={this.renderAppsCount()}
                />
                {this.renderToast()}
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
