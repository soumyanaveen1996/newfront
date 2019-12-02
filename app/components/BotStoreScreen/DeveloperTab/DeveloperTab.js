import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    ScrollView,
    Platform,
    RefreshControl
} from 'react-native';
import styles from './styles';
import images from '../../../config/images';
import I18n from '../../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
import CachedImage from '../../CachedImage';
import _ from 'lodash';
import { SYSTEM_BOT_MANIFEST } from '../../../lib/bot/SystemBot';
import { scrollViewConfig } from './config';
import BotContainer from '../../BotContainer';
import Toast, { DURATION } from 'react-native-easy-toast';
import Store from '../../../redux/store/configureStore';

export default class DeveloperTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            developerData: [...this.props.developerData],
            collapseIndex: 0
        };
    }

    onCollapse = i => {
        this.setState({ collapseIndex: i });
    };

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

    renderCategoryBots = () => {
        return this.props.developerData.map((data, index) => {
            if (data.botIds) {
                let developerData = this.props.botsData.filter(bot => {
                    return (
                        data.botIds.indexOf(bot.botId) >= 0 && !bot.systemBot
                    );
                });

                let newdeveloperData = [];
                let indexBot = 0;
                if (developerData.length === 1) {
                    newdeveloperData.push(developerData[0]);
                } else if (developerData.length > 1) {
                    while (indexBot < 2) {
                        newdeveloperData.push(developerData[indexBot]);
                        indexBot++;
                    }
                }

                return (
                    <BotContainer
                        style={{ flex: 1 }}
                        key={index}
                        allBots={this.props.botsData}
                        botsData={newdeveloperData}
                        name={data.name}
                        botIds={data.botIds}
                        currentIndex={index}
                        imageForHeader={data.logoUrl}
                        tabStatus="provider"
                        clickedIndex={this.state.collapseIndex}
                        handleCollapse={this.onCollapse}
                        refresh={this.props.refresh.bind(this)}
                        installedBots={this.props.installedBots}
                        onBotInstalled={this.props.onBotInstalled}
                        onBotInstallFailed={this.props.onBotInstallFailed}
                    />
                );
            }
        });
    };

    newProvider = () => {
        this.props.onChange(true);
    };

    render() {
        return (
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    Store.getState().user.network === 'full' ? (
                        <RefreshControl
                            onRefresh={this.onPullToRefresh.bind(this)}
                            refreshing={this.state.refreshing}
                        />
                    ) : null
                }
            >
                <View
                    style={{
                        width: '100%',
                        height: 80,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={styles.newProvider}
                        onPress={this.newProvider}
                    >
                        <Text style={styles.newProviderText}>
                            + Activate Premium Apps
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.renderCategoryBots()}
            </ScrollView>
        );
    }
}
