import React from 'react';
import {
    View,
    SafeAreaView,
    SectionList,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform
} from 'react-native';
import styles from './styles';
import { Actions, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';
import SystemBot from '../../lib/bot/SystemBot';
import { Contact } from '../../lib/capability';
import EventEmitter, { AuthEvents } from '../../lib/events';
import { connect } from 'react-redux';
import I18n from '../../config/i18n/i18n';
import Store from '../../redux/store/configureStore';
import {
    setCurrentScene,
    refreshContacts
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
import { Channel } from '../../lib/capability';
import CachedImage from '../CachedImage';
import Utils from '../../lib/utils';
import { EmptyChannel } from '../ChannelsList';
import { BackgroundImage } from '../BackgroundImage';
const R = require('ramda');

class NewChatContacts extends React.Component {
    constructor(props) {
        super(props);
        // this.dataSource = new FrontMAddedContactsPickerDataSource(this)
        this.state = {
            channelsData: []
        };
    }

    async componentDidMount() {
        if (this.props.appState.allChannelsLoaded) {
            Channel.getSubscribedChannels().then(channels => {
                this.refresh(channels);
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.appState.allChannelsLoaded !==
            this.props.appState.allChannelsLoaded
        ) {
            Channel.getSubscribedChannels().then(channels => {
                this.refresh(channels);
            });
        }

        if (
            prevProps.appState.refreshContacts !==
            this.props.appState.refreshContacts
        ) {
            Channel.getSubscribedChannels().then(channels => {
                this.refresh(channels);
            });
        }
    }

    static onEnter() {
        const user = Store.getState().user;
        EventEmitter.emit(
            AuthEvents.tabTopSelected,
            I18n.t('My_Channels'),
            I18n.t('Channels')
        );
        Store.dispatch(refreshChannels(true));
    }

    static onExit() {
        Store.dispatch(refreshChannels(false));
        Store.dispatch(setCurrentScene('none'));
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.appState.currentScene === I18n.t('My_Channels');
    }

    createChannelBook = channels => {
        const Alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
        const uniqId = R.eqProps('channelId');
        const channelsUniq = R.uniqWith(uniqId)(channels);
        // const phoneChannels = channelsUniq.map(channel => ({
        //     ...channel,
        //     channelName: channel.channelName
        //         ? channel.channelName
        //             .trim()
        //             .split(' ')
        //             .map(
        //                 word =>
        //                     `${word.charAt(0).toUpperCase()}${word.slice(1)}`
        //             )
        //             .join(' ')
        //         : ''
        // }))

        const phoneChannels = channelsUniq;
        const PhoneChannels = Alphabets.map(letter => {
            let channelBook = [];
            if (letter !== '#') {
                channelBook = phoneChannels
                    .filter(
                        channel =>
                            channel.channelName.charAt(0).toUpperCase() ===
                            letter.toUpperCase()
                    )
                    .map(channel => ({
                        id: channel.channelId,
                        name: channel.channelName,
                        description: channel.description,
                        ownerId: channel.ownerId,
                        ownerName: channel.ownerName,
                        channel
                    }));
            } else {
                channelBook = phoneChannels
                    .filter(
                        channel =>
                            !channel.channelName.charAt(0).match(/[a-z]/i)
                    )
                    .map(contact => ({
                        id: channel.channelId,
                        name: channel.channelName,
                        description: channel.description,
                        ownerId: channel.ownerId,
                        ownerName: channel.ownerName,
                        channel
                    }));
            }
            return {
                title: letter,
                data: channelBook
            };
        });
        // console.log(PhoneChannels);
        return PhoneChannels;
    };
    refresh = channels => {
        // this.dataSource.loadData()
        if (!channels) {
            return;
        }
        const subscribedChannels = channels.filter(
            channel => channel.subcription === 'true'
        );
        // console.log(channels);
        const ChannelBook = this.createChannelBook(subscribedChannels);
        let newChannelBook = ChannelBook.filter(elem => {
            return elem.data.length > 0;
        });
        this.setState({ channelsData: newChannelBook });
    };

    renderItem(info) {
        const channel = info.item;
        const Image = (
            <CachedImage
                imageTag="channelLogo"
                source={{ uri: Utils.channelLogoUrl(channel.channel.logo) }}
                style={styles.avatarImage}
                resizeMode="contain"
            />
        );
        return (
            <NewChatRow
                key={channel.id}
                image={Image}
                item={channel}
                title={channel.name}
                id={channel.id}
                onItemPressed={this.onChannelsSelected}
            />
        );
    }
    onChannelsSelected = channel => {
        SystemBot.get(SystemBot.imBotManifestName).then(imBot => {
            Actions.channelChat({
                bot: imBot,
                channel: channel.channel,
                type: ActionConst.REPLACE
            });
        });
    };

    onSideIndexItemPressed(item) {
        const sectionIndex = _.findIndex(
            this.state.channelsData,
            section => section.title === item
        );
        this.contactsList.scrollToLocation({
            sectionIndex: sectionIndex,
            itemIndex: 0,
            viewOffset: SECTION_HEADER_HEIGHT
        });
    }

    renderChannelsList() {
        const sectionTitles = _.map(
            this.state.channelsData,
            section => section.title
        );

        if (sectionTitles && sectionTitles.length > 0) {
            return (
                <View style={styles.addressBookContainer}>
                    <SectionList
                        ItemSeparatorComponent={NewChatItemSeparator}
                        ref={sectionList => {
                            this.contactsList = sectionList;
                        }}
                        style={styles.addressBook}
                        renderItem={this.renderItem.bind(this)}
                        renderSectionHeader={({ section }) => (
                            <NewChatSectionHeader title={section.title} />
                        )}
                        sections={this.state.channelsData}
                        keyExtractor={(item, index) => item.id}
                    />
                    {/* <NewChatIndexView
                        onItemPressed={this.onSideIndexItemPressed.bind(this)}
                        items={sectionTitles}
                    /> */}
                </View>
            );
        } else {
            return <EmptyChannel />;
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <BackgroundImage>{this.renderChannelsList()}</BackgroundImage>
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
