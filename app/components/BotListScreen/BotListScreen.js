import React from 'react';
import { Text, View, FlatList, TextInput } from 'react-native';
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
            botsData: this.props.data,
            type: this.props.typeScreen,
            searchString: this.props.searchText || '',
            countResults: this.props.count
        };
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

    renderRow = bot => {
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

    async updateText() {
        const searchBot = await Bot.searchBots(this.state.searchString);
        const filteredSearchBot = [];

        for (var arr in this.props.allBotsData) {
            for (var filter in searchBot) {
                if (
                    this.props.allBotsData[arr].botId ===
                    searchBot[filter].botId
                ) {
                    filteredSearchBot.push(this.props.allBotsData[arr]);
                }
            }
        }

        let count = searchBot.length;
        this.setState({
            botsData: [...filteredSearchBot],
            countResults: count
        });
    }

    renderRowItem = ({ item }) => {
        return (
            <View key={item.botId} style={styles.rowContainer}>
                <View style={styles.rowContent}>{this.renderRow(item)}</View>
            </View>
        );
    };

    searchBotFields = () => {
        if (this.state.type && this.state.type === 'search') {
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
                            this.setState({ searchString, countResults: 0 });
                        }}
                        underlineColorAndroid="transparent"
                        onSubmitEditing={() => this.updateText()}
                    />
                </View>
            );
        } else {
            return null;
        }
    };

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 10 }}>
                {this.searchBotFields()}
                {this.state.countResults > 0 &&
                    this.state.searchString.length > 0 && (
                    <View>
                        <Text
                            style={{
                                color: 'rgba(74, 74, 74, 1)',
                                fontSize: 22,
                                fontWeight: '600',
                                marginBottom: 20
                            }}
                        >
                            {this.state.countResults} apps found for search{' '}
                            {this.state.searchString}
                        </Text>
                    </View>
                )}
                <FlatList
                    style={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.state.botsData}
                    renderItem={this.renderRowItem.bind(this)}
                    extraData={this.state}
                />
                <Toast ref="toast" position="bottom" positionValue={350} />
            </View>
        );
    }

    _onFetch(pageNo, success, failure) {}
}
