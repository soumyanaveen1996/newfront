import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import BotList from './BotList';
import FloatingButton from '../FloatingButton';
import { MainScreenStyles } from './styles';
import images from '../../config/images';
import I18n from '../../config/i18n/i18n';
import { Actions } from 'react-native-router-flux';
// import CenterComponent from './header/CenterComponent';
import { HeaderLeftIcon } from '../Header';
import Config from './config';
import appConfig from '../../config/config';
import { AsyncResultEventEmitter, NETWORK_EVENTS_CONSTANTS } from '../../lib/network';
import Auth from '../../lib/capability/Auth';
import Bot from '../../lib/bot';
import SystemBot from '../../lib/bot/SystemBot';

const MainScreenStates = {
    notLoaded: 'notLoaded',
    authenticated: 'authenticated',
    unauthenticated: 'unauthenticated',
}

export default class MainScreen extends React.Component {

    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let ret = {
            //headerTitle: <CenterComponent />
        }
        if (appConfig.app.hideFilter !== true) {
            ret.headerLeft = <HeaderLeftIcon config={Config.filterButtonConfig} onPress={state.params.openBotFilter} />;
        }
        return ret;
    }

    constructor(props) {
        super(props);
        // Susbscribe to async result handler
        this.eventSubscription = null;
        this.state = {
            screenState: MainScreenStates.notLoaded
        };
    }

    async componentDidMount() {
        if (this.props.navigation) {
            this.props.navigation.setParams({ openBotFilter: this.openBotFilter.bind(this) });
        }
        this.eventSubscription = AsyncResultEventEmitter.addListener(NETWORK_EVENTS_CONSTANTS.result, this.handleAsyncMessageResult.bind(this));
        this.update();
    }

    update = async () => {
        const userLoggedIn = await Auth.isUserLoggedIn();
        const botsList = userLoggedIn ? await Bot.getInstalledBots() : await Promise.resolve(SystemBot.getDefaultBots());
        const authStatus = userLoggedIn ? MainScreenStates.authenticated : MainScreenStates.unauthenticated;
        this.setState({ screenState: authStatus, bots: botsList });
        this.refs.botList.refresh();
    }

    componentWillUnmount = () => {
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
    }

    openContacts() {
        this.floatingButton.reset(true);
        Actions.addContacts({ onBack: this.onBack.bind(this) })
    }

    async onBack() {
        this.update();
    }

    // Use this when favorites is ready
    openFavorites() {
        this.floatingButton.reset(true);
        Actions.favoriteMessage({ onBack: this.onBack.bind(this) });
    }

    handleAsyncMessageResult(event) {
        if (event) {
            this.refs.botList.refresh();
        }
    }

    openBotStore() {
        this.floatingButton.reset(true);
        Actions.installedBots({ onBack: this.onBack.bind(this) });
        //Actions.botStore()
    }

    openConversations() {
        this.floatingButton.reset(true);
        Actions.conversations();
    }

    openChannels() {
        this.floatingButton.reset(true);
        Actions.channelsList({ onBack: this.onBack.bind(this) });
    }

    openBotFilter() {
        Actions.botFilter();
    }

    openConfigure() {
        this.floatingButton.reset(true);
        SystemBot.get(SystemBot.onboardingBotManifestName)
            .then((onboardingBot) => {
                Actions.onboarding({ bot: onboardingBot, onBack: this.onBack.bind(this) });
            });
    }

    renderFloatingButton() {
        if (this.state.screenState === MainScreenStates.authenticated) {
            return (
                <FloatingButton ref={(button) => { this.floatingButton = button }} style={MainScreenStyles.floatingButton}>
                    {/* <FloatingButton.Item title={I18n.t('Favorites')} image={images.icn_fav} onPress={() => console.log('Favorites tapped!')} /> */}
                    <FloatingButton.Item title={I18n.t('Contacts')} image={images.icn_contact} onPress={this.openContacts.bind(this)} />
                    <FloatingButton.Item title={I18n.t('Channels')} image={images.icn_channel} onPress={this.openChannels.bind(this)} />
                    <FloatingButton.Item title={I18n.t('ChatBots')} image={images.icn_chatbot} onPress={this.openBotStore.bind(this)} />
                    <FloatingButton.Item title={I18n.t('Configure')} image={images.icn_configure} onPress={this.openConfigure.bind(this)} />
                </FloatingButton>
            );
        }
    }

    renderMain() {
        if (this.state.screenState === MainScreenStates.notLoaded) {
            return <ActivityIndicator size="small" style={MainScreenStyles.activityIndicator}/>;
        } else {
            return (
                <View style={MainScreenStyles.botListContainer}>
                    <BotList ref="botList"
                        onBack={this.onBack.bind(this)}
                        bots={this.state.bots} />
                    {this.renderFloatingButton()}
                </View>
            );
        }
    }

    render() {
        return (
            <View style={MainScreenStyles.container}>
                {this.renderMain()}
            </View>
        );
    }
}
