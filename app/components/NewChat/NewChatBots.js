import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    Text,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import { Contact } from '../../lib/capability';
import Bot from '../../lib/bot';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts,
    refreshTimeline
} from '../../redux/actions/UserActions';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';
import NewChatItemSeparator from './NewChatItemSeparator';
import NewChatSectionHeader from './NewChatSectionHeader';
import NewChatIndexView from './NewChatIndexView';
import NewChatRow from './NewChatRow';
import {
    SECTION_HEADER_HEIGHT,
    searchBarConfig,
    addButtonConfig
} from './config';
import CachedImage from '../CachedImage';
import { BackgroundImage } from '../BackgroundImage';
const R = require('ramda');

class NewChatContacts extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            botsData: []
        };
    }

    async componentDidMount() {
        if (this.props.appState.remoteBotsInstalled) {
            Bot.getInstalledBots().then(bots => this.refresh(bots));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.remoteBotsInstalled !== this.props.remoteBotsInstalled) {
            Bot.getInstalledBots().then(bots => this.refresh(bots));
        }

        if (
            prevProps.appState.refreshTimeline !==
            this.props.appState.refreshTimeline
        ) {
            Bot.getInstalledBots().then(bots => this.refresh(bots));
        }
    }

    static onEnter() {
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('My_Bots'),
            I18n.t('Bots')
        );
        Store.dispatch(refreshTimeline(true));
    }

    static onExit() {
        Store.dispatch(setCurrentScene('none'));
        Store.dispatch(refreshTimeline(false));
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('My_Bots');
    }

    createAddressBook = bots => {
        const Alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
        const uniqId = R.eqProps('botId');
        const botsUniq = R.uniqWith(uniqId)(bots);
        // const phoneContacts = botsUniq.map(bot => ({
        //     ...contact,
        //     userName: contact.userName
        //         ? contact.userName
        //             .trim()
        //             .split(' ')
        //             .map(
        //                 word =>
        //                     `${word.charAt(0).toUpperCase()}${word.slice(1)}`
        //             )
        //             .join(' ')
        //         : ''
        // }))

        const InstalledBots = Alphabets.map(letter => {
            let botsBook = [];
            if (letter !== '#') {
                botsBook = botsUniq
                    .filter(
                        bot =>
                            bot.botName.charAt(0).toUpperCase() ===
                            letter.toUpperCase()
                    )
                    .map(bot => ({
                        id: bot.botId,
                        name: bot.botName,
                        bot
                    }));
            } else {
                botsBook = botsUniq
                    .filter(bot => !bot.botName.charAt(0).match(/[a-z]/i))
                    .map(bot => ({
                        id: bot.botId,
                        name: bot.botName,
                        bot
                    }));
            }
            return {
                title: letter,
                data: botsBook
            };
        });
        // console.log(InstalledBots);
        return InstalledBots;
    };
    refresh = bots => {
        // this.dataSource.loadData()
        if (!bots) {
            return;
        }
        const AddressBook = this.createAddressBook(bots);
        let newAddressBook = AddressBook.filter(elem => {
            return elem.data.length > 0;
        });
        this.setState({ botsData: newAddressBook });
    };

    renderItem(info) {
        const bot = info.item;
        const Image = (
            <CachedImage
                imageTag="botLogo"
                source={{ uri: bot.bot.logoUrl }}
                style={styles.avatarImage}
            />
        );

        return (
            <NewChatRow
                key={bot.id}
                image={Image}
                item={bot}
                title={bot.name}
                id={bot.id}
                onItemPressed={this.onBotSelected}
            />
        );
    }
    onBotSelected = bot => {
        // console.log(bot);
        Actions.botChat({
            bot: bot.bot,
            type: ActionConst.REPLACE
        });
    };

    onSideIndexItemPressed(item) {
        const sectionIndex = _.findIndex(
            this.state.botsData,
            section => section.title === item
        );
        this.botsList.scrollToLocation({
            sectionIndex: sectionIndex,
            itemIndex: 0,
            viewOffset: SECTION_HEADER_HEIGHT + 5
        });
    }

    renderBotList() {
        const sectionTitles = _.map(
            this.state.botsData,
            section => section.title
        );

        return (
            <BackgroundImage style={{ flex: 1 }}>
                <View style={styles.addressBookContainer}>
                    <SectionList
                        ItemSeparatorComponent={NewChatItemSeparator}
                        ref={sectionList => {
                            this.botsList = sectionList;
                        }}
                        style={styles.addressBook}
                        renderItem={this.renderItem.bind(this)}
                        renderSectionHeader={({ section }) => (
                            <NewChatSectionHeader title={section.title} />
                        )}
                        sections={this.state.botsData}
                        keyExtractor={(item, index) => item.id}
                    />
                    {/* <NewChatIndexView
                    onItemPressed={this.onSideIndexItemPressed.bind(this)}
                    items={sectionTitles}
                /> */}
                </View>
            </BackgroundImage>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderBotList()}
            </SafeAreaView>
        );
    }
}
const mapStateToProps = state => ({
    appState: state.user
});

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewChatContacts);
