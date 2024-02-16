import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import styles from './styles';
import BotInstallListItem from '../../../../widgets/BotInstallListItem';
import Store from '../../../../redux/store/configureStore';
import { Auth } from '../../../../lib/capability';
import ErrorMessage from '../../../../widgets/ErrorMessage';
import NavigationAction from '../../../../navigation/NavigationAction';
import TimelineBuilder from '../../../../lib/TimelineBuilder/TimelineBuilder';
import GlobalColors from '../../../../config/styles';

export default class FeaturedTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botsData: this.props.featuredBots,
            isBotAccessible: this.props.isBotAccessible
        };
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isBotAccessible !== this.props.isBotAccessible) {
            if (this.props.isBotAccessible) {
                this.setState({ isBotAccessible: true });
            }
        }
    }

    onPullToRefresh = () => {
        this.setState({ refreshing: true }, () => {
            try {
                this.props.refresh(() => {
                    this.setState({
                        refreshing: false
                    });
                });
            } catch (e) {
                this.setState({
                    refreshing: false
                });
            }
        });
    };

    renderBot = (bot) => {
        return (
            <BotInstallListItem
                bot={bot}
                onBotClick={this.onBotClick.bind(this)}
                installedBots={this.props.installedBots}
                onBotInstalled={this.props.onBotInstalled}
                onBotInstallFailed={this.props.onBotInstallFailed}
                onBack={this.props.onBack}
                onAuth={this.props.onAuth}
                isBotAccessible={this.state.isBotAccessible}
                is2FaEnable={this.props.is2FaEnable}
            />
        );
    };

    async onBotClick(item) {
        const {
            provider: { name }
        } = Auth.getUserData();
        if (item.authorisedAccess) {
            this.props.onAuth({
                bot: item,
                onBack: this.props.onBack,
                botName: item?.botName,
                otherUserId: false,
                botLogoUrl: item?.logoUrl
            });
        } else if (item.authorisedAccess && name === 'FrontM') {
            this.props.onAuth({
                bot: item,
                onBack: this.props.onBack,
                botName: item?.botName,
                otherUserId: false,
                botLogoUrl: item?.logoUrl
            });
        } else {
            NavigationAction.push(NavigationAction.SCREENS.bot, {
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
    }

    renderGridItem = ({ item }) => {
        return this.renderBot(item);
    };

    itemSeparatorComponent = () => (
        <View
            style={{
                marginLeft: 60,
                marginRight: 12,
                height: 1,
                backgroundColor: GlobalColors.itemDevider
            }}
        />
    );

    render() {
        if (this.props.featuredBots && this.props.featuredBots.length > 0) {
            return (
                <FlatList
                    refreshControl={
                        Store.getState().user.network === 'full' && (
                            <RefreshControl
                                onRefresh={this.onPullToRefresh}
                                refreshing={this.state.refreshing}
                            />
                        )
                    }
                    contentContainerStyle={styles.flatList}
                    keyExtractor={(item, index) => item.botId}
                    data={this.props.featuredBots}
                    renderItem={this.renderGridItem}
                    extraData={this.props.featuredBots}
                    ItemSeparatorComponent={this.itemSeparatorComponent}
                />
            );
        }

        if (this.props.networkError)
            return (
                <ErrorMessage
                    onPress={() => {
                        this.props.refresh();
                    }}
                />
            );

        return (
            <ErrorMessage
                title={'No apps found'}
                message={
                    'There are no bots available at the moment. Please contact support or try after some time'
                }
                onPress={() => {
                    this.props.refresh();
                }}
            />
        );
    }

    _onFetch(pageNo, success, failure) {}
}
