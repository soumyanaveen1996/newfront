import React from 'react';
import _ from 'lodash';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    RefreshControl,
    View,
    Alert,
    BackHandler,
    SafeAreaView,
    Platform
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import Promise from '../../lib/Promise';
import chatStyles from './styles';
import ChatInputBar from './ChatInputBar';
import ChatStatusBar from './ChatStatusBar';
import ChatMessage from './ChatMessage';
import CallModal from './CallModal';
import Slider from '../Slider/Slider';
import { BotContext } from '../../lib/botcontext';
import {
    Network,
    Message,
    Contact,
    MessageTypeConstants,
    Auth,
    ConversationContext,
    Media,
    Resource,
    ResourceTypes,
    Settings,
    PollingStrategyTypes
} from '../../lib/capability';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import Config, { BOT_LOAD_RETRIES } from './config';
import Constants from '../../config/constants';
import Utils from '../../lib/utils';
import moment from 'moment';
import Permissions from 'react-native-permissions';
import { BotInputBarCapabilities, SLIDER_HEIGHT } from './BotConstants';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { MessageHandler } from '../../lib/message';
import {
    NetworkHandler,
    AsyncResultEventEmitter,
    NETWORK_EVENTS_CONSTANTS,
    Queue
} from '../../lib/network';
var pageSize = Config.ChatMessageOptions.pageSize;
import appConfig from '../../config/config';
import { MessageCounter } from '../../lib/MessageCounter';
import {
    EventEmitter,
    SatelliteConnectionEvents,
    PollingStrategyEvents,
    MessageEvents
} from '../../lib/events';
import { Icons } from '../../config/icons';
import images from '../../images';
import VersionCheck from 'react-native-version-check';
import versionCompare from 'semver-compare';
import {
    GoogleAnalytics,
    GoogleAnalyticsCategories
} from '../../lib/GoogleAnalytics';
import {
    DocumentPicker,
    DocumentPickerUtil
} from 'react-native-document-picker';
import { SmartSuggestions } from '../SmartSuggestions';
import { WebCards } from '../WebCards';
import { BackgroundImage } from '../BackgroundImage';

const R = require('ramda');

export default class ChatBotScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.bot.botName
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={() => {
                        if (state.params.botDone) {
                            state.params.botDone();
                        }
                        if (state.params.onBack) {
                            Actions.pop();
                            state.params.onBack();
                        } else {
                            Actions.pop();
                        }
                    }}
                />
            );
        }

        if (state.params.button) {
            if (state.params.button === 'manual') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        onPress={() => {
                            state.params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (state.params.button === 'gsm') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            state.params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (state.params.button === 'satellite') {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            state.params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                navigationOptions.headerRight = (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            state.params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);

        this.bot = props.bot;
        this.loadedBot = undefined;
        this.botLoaded = false;
        this.messageQueue = [];
        this.processingMessageQueue = false;
        this.camera = null;
        this.allLocalMessagesLoaded = false;

        this.state = {
            smartSuggesions: [],
            messages: [],
            typing: '',
            showSlider: false,
            refreshing: false,
            sliderClosed: false
        };
        this.botState = {}; // Will be mutated by the bot to keep any state
        this.scrollToBottom = false;
        this.firstUnreadIndex = -1;

        // Create a new botcontext with this as the bot
        this.botContext = new BotContext(this, this.bot);

        // Susbscribe to async result handler
        this.eventSubscription = null;

        this.dce_bot = dce.bot(this.bot, this.botContext);
        this.user = null;
        this.conversationContext = null;
    }

    loadBot = async () => {
        let botResp = await this.dce_bot.Load(this.botContext);
        return botResp;
    };

    goBack = () => {
        Actions.pop();
        if (this.props.onBack) {
            this.props.onBack();
        }
    };

    async componentDidMount() {
        // TODO: Remove mounted instance variable when we add some state mangement to our app.
        this.mounted = true;
        let self = this;

        // 0. load the bot
        for (let i = 0; i < BOT_LOAD_RETRIES; i++) {
            try {
                let botResponse = await this.loadBot();
                self.loadedBot = botResponse;
                break;
            } catch (error) {
                console.error('Bot load error', error);
            }
        }

        if (!self.loadedBot) {
            Alert.alert(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_load_failed'),
                [{ text: 'OK', onPress: this.goBack }],
                { cancelable: false }
            );
            return;
        }

        if (
            this.bot.maxRequiredPlatformVersion &&
            versionCompare(
                VersionCheck.getCurrentVersion(),
                this.bot.maxRequiredPlatformVersion
            ) === 1
        ) {
            Alert.alert(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_max_version_error'),
                [{ text: 'OK', onPress: this.goBack }],
                { cancelable: false }
            );
            return;
        }

        try {
            // The order if calls is critical so that all resources are loaded correctly

            if (this.props.navigation) {
                this.props.navigation.setParams({ botName: this.bot.name });
            }
            if (this.props.onBack) {
                this.props.navigation.setParams({ onBack: this.props.onBack });
            }

            // 1. Get the user
            self.user = await Promise.resolve(Auth.getUser());

            // 2. Get the conversation context
            self.conversationContext = await this.getConversationContext(
                this.botContext,
                this.user
            );

            // 3. Get messages for this bot / chat
            let messages = await this.loadMessages();

            // Find the first non-read message and use scrollToIndex.
            let index = -1;
            for (let i = 0; i < messages.length; i++) {
                let msg = messages[i];

                if (!msg.message.isRead()) {
                    index = i;
                    break;
                }
            }
            this.firstUnreadIndex = index;
            if (index === -1) {
                this.scrollToBottom = true;
            }

            if (!this.mounted) {
                return;
            }

            // 4. Update the state of the bot with the messages we have
            this.setState(
                {
                    messages: this.addSessionStartMessages(messages),
                    typing: '',
                    showSlider: false
                },
                function(err, res) {
                    if (!err) {
                        self.botLoaded = true;
                        // 5. Kick things off by calling init on the bot
                        this.loadedBot.init(
                            this.botState,
                            this.state.messages,
                            this.botContext
                        );

                        // 6. If there are async results waiting - pass them on to the bot
                        self.flushPendingAsyncResults();

                        // 7. Now that bot is open - add a listener for async results coming in
                        self.eventSubscription = EventEmitter.addListener(
                            MessageEvents.messageProcessed,
                            this.handleMessageEvents.bind(this)
                        );

                        // 8. Mark new messages as read
                        MessageHandler.markUnreadMessagesAsRead(
                            this.getBotKey()
                        );

                        // 9. Stash the bot for nav back for on exit
                        this.props.navigation.setParams({
                            botDone: this.botDone.bind(this)
                        });
                    } else {
                        console.log('Error setting state with messages', err);
                    }
                }
            );
        } catch (e) {
            console.log('Error occurred during componentDidMount; ', e);
            // TODO: handle errors
            self.botLoaded = false;
        }

        this.keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            this.keyboardWillShow.bind(this)
        );
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow.bind(this)
        );

        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.keyboardDidHide.bind(this)
        );

        Network.addConnectionChangeEventListener(this.handleConnectionChange);
        EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );

        console.log('Checking polling strategy');

        this.props.navigation.setParams({
            refresh: this.readLambdaQueue.bind(this),
            showConnectionMessage: this.showConnectionMessage.bind(this)
        });
        this.checkPollingStrategy();
        EventEmitter.addListener(
            PollingStrategyEvents.changed,
            this.checkPollingStrategy.bind(this)
        );
        GoogleAnalytics.logEvents(
            GoogleAnalyticsCategories.BOT_OPENED,
            this.props.bot.botName,
            null,
            0,
            null
        );
    }

    botDone = () => {
        this.loadedBot.done(
            null,
            this.botState,
            this.state.messages,
            this.botContext
        );
    };

    showConnectionMessage(connectionType) {
        let message = I18n.t('Auto_Message');
        if (connectionType === 'gsm') {
            message = I18n.t('Gsm_Message');
        } else if (connectionType === 'satellite') {
            message = I18n.t('Satellite_Message');
        }
        Alert.alert(
            I18n.t('Connection_Type'),
            message,
            [{ text: I18n.t('Ok'), style: 'cancel' }],
            { cancelable: false }
        );
    }

    sessionStartMessageForDate = momentObject => {
        let sMessage = new Message({
            addedByBot: true,
            messageDate: momentObject.valueOf()
        });
        sMessage.sessionStartMessage();
        return sMessage.toBotDisplay();
    };

    addSessionStartMessages(messages) {
        let filteredMessages = _.filter(
            messages,
            item =>
                item.message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_SESSION_START
        );

        if (filteredMessages.length > 0) {
            for (var i = 0; i < filteredMessages.length; i++) {
                var showTime = false;
                if (i < filteredMessages.length - 1) {
                    const currentMessage = filteredMessages[i].message;
                    const nextMessage = filteredMessages[i + 1].message;
                    const currentDate = moment(currentMessage.getMessageDate());
                    const nextDate = moment(nextMessage.getMessageDate());
                    if (
                        !(
                            (nextDate.valueOf() - currentDate.valueOf()) /
                                1000 <
                            60
                        ) ||
                        nextMessage.isMessageByBot() !==
                            currentMessage.isMessageByBot()
                    ) {
                        showTime = true;
                    }
                } else if (i === filteredMessages.length - 1) {
                    showTime = true;
                }
                filteredMessages[i].showTime = showTime;
            }
        }

        let resultMessages = [];
        if (filteredMessages.length > 0) {
            let currentDate = moment(
                filteredMessages[0].message.getMessageDate()
            );
            resultMessages.push(this.sessionStartMessageForDate(currentDate));
            for (var i = 0; i < filteredMessages.length; i++) {
                const botMessage = filteredMessages[i];
                const message = botMessage.message;
                const date = moment(message.getMessageDate());
                if (
                    date.dayOfYear() !== currentDate.dayOfYear() ||
                    date.year() !== currentDate.year()
                ) {
                    resultMessages.push(this.sessionStartMessageForDate(date));
                    currentDate = date;
                }
                resultMessages.push(botMessage);
            }
            if (
                currentDate.dayOfYear() !== moment().dayOfYear() &&
                moment().year() !== currentDate.year()
            ) {
                resultMessages.push(this.sessionStartMessageForDate(moment()));
            }
        } else {
            let currentDate = moment();
            resultMessages.push(this.sessionStartMessageForDate(currentDate));
        }
        return resultMessages;
    }

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

    showButton(pollingStrategy) {
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.props.navigation.setParams({ button: 'manual' });
        } else if (pollingStrategy === PollingStrategyTypes.automatic) {
            this.props.navigation.setParams({ button: 'none' });
        } else if (pollingStrategy === PollingStrategyTypes.gsm) {
            this.props.navigation.setParams({ button: 'gsm' });
        } else if (pollingStrategy === PollingStrategyTypes.satellite) {
            this.props.navigation.setParams({ button: 'satellite' });
        }
    }

    async checkPollingStrategy() {
        let pollingStrategy = await Settings.getPollingStrategy();
        console.log('Polling strategy changed : ', pollingStrategy);
        this.showButton(pollingStrategy);
    }

    async componentWillUnmount() {
        this.mounted = false;
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardDidShowListener) {
            this.keyboardDidShowListener.remove();
        }
        if (this.keyboardDidHideListener) {
            this.keyboardDidHideListener.remove();
        }
        Network.removeConnectionChangeEventListener(
            this.handleConnectionChange
        );
        EventEmitter.removeListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        EventEmitter.removeListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );
        EventEmitter.removeListener(
            PollingStrategyEvents.changed,
            this.checkPollingStrategy.bind(this)
        );
    }

    satelliteConnectionHandler = () => {
        if (this.state.network !== 'satellite') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'satellite'
            });
        }
    };

    satelliteDisconnectHandler = () => {
        if (this.state.network === 'satellite') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    handleConnectionChange = connection => {
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else {
            if (this.state.network === 'none') {
                this.setState({
                    showNetworkStatusBar: false,
                    network: 'connected'
                });
            }
        }
    };

    getBotId() {
        return this.props.bot.botId;
    }

    keyboardWillShow = () => {
        if (this.slider) {
            this.slider.close(undefined, true);
            this.setState({ sliderClosed: true });
        } else {
            this.setState({ sliderClosed: false });
        }
    };

    keyboardDidShow = () => {
        this.scrollToBottomIfNeeded();
        if (Platform.OS === 'android' && this.slider) {
            this.slider.close(undefined, true);
            this.setState({ sliderClosed: true });
        } else {
            this.setState({ sliderClosed: false });
        }
    };

    keyboardDidHide = () => {
        this.scrollToBottomIfNeeded();
        if (Platform.OS === 'android' && this.state.sliderClosed) {
            this.setState({ showSlider: true });
        }
    };

    handleMessageEvents(event) {
        if (!event || event.botId !== this.getBotId()) {
            return;
        }
        this.loadedBot.asyncResult(
            event.message,
            this.botState,
            this.state.messages,
            this.botContext
        );
    }

    handleAsyncMessageResult(event) {
        // Don't handle events that are not for this bot
        if (!event || event.key !== this.getBotKey()) {
            return;
        }
        this.loadedBot.asyncResult(
            event.result,
            this.botState,
            this.state.messages,
            this.botContext
        );
        // Delete the network result now
        return Queue.deleteNetworkRequest(event.id);
    }

    // Clear out any pending network asyn results that need to become messages
    async flushPendingAsyncResults() {
        let self = this;
        Queue.selectCompletedNetworkRequests(this.getBotKey()).then(
            pendingAsyncResults => {
                pendingAsyncResults = pendingAsyncResults || [];
                pendingAsyncResults.forEach(pendingAsyncResult => {
                    self.handleAsyncMessageResult(pendingAsyncResult);
                });
            }
        );
    }

    wait = shouldWait => {
        if (shouldWait) {
            let msg = new Message({ addedByBot: true });
            msg.waitMessage();
            this.queueMessage(msg);
        } else {
            this.stopWaiting();
        }
    };

    stopWaiting = () => {
        this.messageQueue = _.filter(
            this.messageQueue,
            message =>
                message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_WAIT
        );
        let messages = _.filter(
            this.state.messages,
            item =>
                item.message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_WAIT
        );
        this.updateMessages(messages);
    };

    isMessageBeforeToday = message => {
        return moment(message.getMessageDate()).isBefore(moment(), 'day');
    };

    addSessionStartMessage = messages =>
        new Promise(resolve => {
            if (
                messages.length === 0 ||
                this.isMessageBeforeToday(messages[messages.length - 1].message)
            ) {
                let sMessage = new Message({
                    addedByBot: true,
                    messageDate: moment().valueOf()
                });
                sMessage.sessionStartMessage();
                // TODO: Should we do it in a timeout so that its displayed first?
                this.persistMessage(sMessage)
                    .then(() => {
                        this.queueMessage(sMessage);
                        resolve();
                    })
                    .catch(err => {
                        console.log('Error persisting session message::', err);
                        resolve();
                    });
            } else {
                resolve();
            }
        });

    tell = message => {
        // Removing the waiting message.

        this.stopWaiting();
        this.countMessage(message);

        // Update the bot interface
        // Push a new message to the end
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SMART_SUGGESTIONS
        ) {
            this.updateSmartSuggestions(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_WEB_CARD
        ) {
            this.updateChat(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SLIDER
        ) {
            if (this.slider) {
                this.slider.close(() => {
                    this.fireSlider(message);
                }, false);
            } else {
                this.fireSlider(message);
            }
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MAP
        ) {
            this.openMap(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_BUTTON
        ) {
            this.queueMessage(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML
        ) {
            this.updateChat(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_CHART
        ) {
            this.openChart(message);
        } else {
            this.updateChat(message);
        }
    };

    done = () => {
        // Done with the bot - navigate away?

        console.log('Done called from bot code');
    };

    // Retrun when the message has been persisted
    persistMessage = message => {
        return MessageHandler.persistOnDevice(this.getBotKey(), message);
    };

    // Promise based since setState is async
    updateChat(message) {
        this.persistMessage(message).then(() => {
            this.queueMessage(message);
        });
        // Has to be Immutable for react
    }

    updateSmartSuggestions(message) {
        // Suggestions
        this.smartSuggestionsArea.update([]);
        this.smartSuggestionsArea.update(message.getMessage());
    }

    fireSlider(message) {
        // Slider
        Keyboard.dismiss();
        this.setState({ showSlider: true, message: message });
    }

    openMap(message) {
        Keyboard.dismiss();
        Actions.mapView({ mapData: message.getMessage() });
    }

    openChart(message) {
        Keyboard.dismiss();
        Actions.SNRChart({
            chartData: message.getMessage(),
            chartTitle: I18n.t('SNR_Chart_title')
        });
    }

    // picked from Smart Suggestions
    sendSmartReply(selectedSuggestion) {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        // message.sliderResponseMessage(selectedRows);
        return this.sendMessage(message);
    }

    sendSliderResponseMessage(selectedRows) {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.sliderResponseMessage(selectedRows);
        return this.sendMessage(message);
    }

    // optionalCb is passed by slider if it needs to run some cleanup
    onSliderClose = (optionalCb, scroll = true) => {
        this.setState({ showSlider: false }, function(err, res) {
            if (!err && _.isFunction(optionalCb)) {
                return optionalCb();
            }
        });
        this.slider = null;
        if (scroll) {
            this.scrollToBottomIfNeeded();
        }
    };

    onSliderOpen() {
        this.scrollToBottomIfNeeded();
    }

    onScrollToIndexFailed() {
        if (this.chatList) {
            this.chatList.scrollToEnd({ animated: true });
        }
    }

    checkForScrolling() {
        setTimeout(() => {
            //if (!this.initialScrollDone) {
            //    return;
            //}
            if (this.firstUnreadIndex !== -1) {
                if (this.chatList) {
                    this.chatList.scrollToIndex({
                        index: this.firstUnreadIndex,
                        animated: true
                    });
                }
                this.firstUnreadIndex = -1;
            } else {
                if (this.chatList) {
                    this.chatList.scrollToEnd({ animated: true });
                }
            }
            this.initialScrollDone = true;
        }, 300);
    }

    scrollToBottomIfNeeded() {
        if (this.chatList) {
            if (this.chatList) {
                this.chatList.scrollToEnd({ animated: true });
            }
            this.initialScrollDone = true;
        }
    }

    onSliderDone = selectedRows => {
        this.sendSliderResponseMessage(selectedRows);
    };

    onSliderCancel = () => {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.sliderCancelMessage();
        return this.sendMessage(message);
    };

    onSliderTap = selectedRow => {
        this.sendSliderTapResponseMessage(selectedRow);
    };

    sendSliderTapResponseMessage(selectedRow) {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.stringMessage(selectedRow.title);
        return this.sendMessage(message);
    }

    sendButtonResponseMessage(selectedItem) {
        let message = new Message({ addedByBot: false });
        message.buttonResponseMessage(selectedItem);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    }

    onButtonDone = selectedItem => {
        this.sendButtonResponseMessage(selectedItem);
    };

    replaceUpdatedMessage = updatedMessage => {
        const index = _.findIndex(
            this.state.messages,
            item =>
                item.message.getMessageId() === updatedMessage.getMessageId()
        );
        if (index !== -1) {
            const messages = this.state.messages.slice();
            messages[index] = updatedMessage.toBotDisplay();
            this.setState({
                messages: this.addSessionStartMessages(messages)
            });
        }
    };

    onFormDone = (formItems, formMessage) => {
        formMessage.setCompleted(true);
        formMessage.formMessage(formItems);
        formMessage.setRead(true);
        this.persistMessage(formMessage).then(() => {
            this.replaceUpdatedMessage(formMessage);
            let message = new Message({ addedByBot: false });
            message.formResponseMessage(formItems);
            message.setCreatedBy(this.getUserId());
            return this.sendMessage(message);
        });
    };

    onFormOpen = formMessage => {
        let message = new Message({ addedByBot: false });
        message.formOpenMessage();
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    onFormCancel = formMessage => {
        let message = new Message({ addedByBot: false });
        message.formCancelMessage(formMessage);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    updateMessages = (messages, callback) => {
        if (this.mounted) {
            this.setState(
                {
                    typing: '',
                    messages: this.addSessionStartMessages(messages),
                    overrideDoneFn: null
                },
                () => {
                    //this.scrollToBottomIfNeeded();
                    if (callback) {
                        callback();
                    }
                }
            );
        }
    };

    appendMessageToChat(message, immediate = false) {
        return new Promise(resolve => {
            if (this.addMessage && this.setState) {
                let msgs = this.addMessage(message);
                this.updateMessages(msgs, (err, res) => {
                    if (!err) {
                        //this.scrollToBottomIfNeeded();
                    }
                    resolve(res);
                });
            }
        });
    }

    sleep(waitTime) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, waitTime);
        });
    }

    processMessageQueue() {
        var message = this.messageQueue.shift();
        if (message) {
            this.processingMessageQueue = true;
            this.appendMessageToChat(message)
                .then(() => {
                    return this.sleep(
                        Config.ChatMessageOptions.messageTransitionTime
                    );
                })
                .then(() => {
                    this.processMessageQueue();
                });
        } else {
            this.processingMessageQueue = false;
        }
    }

    queueMessage(message) {
        this.messageQueue.push(message);
        if (this.processingMessageQueue === false) {
            this.processMessageQueue();
        }
    }

    addMessage(message) {
        const { messages } = this.state;
        const incomingMessage = message.toBotDisplay();
        const messageIndex = R.findIndex(R.propEq('key', incomingMessage.key))(
            this.state.messages
        );
        if (messageIndex > 0) {
            const updatedMessage = R.update(
                messageIndex,
                incomingMessage,
                this.state.messages
            );
            return updatedMessage;
        } else {
            return [...this.state.messages, incomingMessage];
        }
        // let msgs = this.state.messages.slice();
        // msgs.push(message.toBotDisplay());
        // return msgs;
    }

    isUserChat() {
        return false;
    }

    shouldShowUserName() {
        return false;
    }

    onChatListLayout = event => {
        const { height } = event.nativeEvent.layout;
        this.chatListHeight = height;
        //this.chatList.scrollToBottom({animated : true});
    };

    /*
    onMessageItemLayout = (event, message) => {
        const key = message.getMessageId();
        if (!this.scrollHeight) {
            this.scrollHeight = 0;
            this.itemHeights = {};
        }
        const { height } = event.nativeEvent.layout;
        this.scrollHeight += height - (this.itemHeights[key] || 0);
        this.itemHeights[key] = height;
        if (_.keys(this.itemHeights).length === this.state.messages.length &&
            this.scrollToBottom) {
            this.scrollToBottomIfNeeded();
        }
    } */

    renderItem({ item }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_WEB_CARD
            ) {
                return (
                    <WebCards
                        webCardsList={message.getMessage()}
                        previews={message.getMessageOptions()}
                    />
                );
            } else {
                return (
                    <ChatMessage
                        message={message}
                        isUserChat={this.isUserChat()}
                        shouldShowUserName={this.shouldShowUserName()}
                        user={this.user}
                        imageSource={{ uri: this.bot.logoUrl }}
                        onDoneBtnClick={this.onButtonDone.bind()}
                        onFormCTAClick={this.onFormDone.bind(this)}
                        onFormCancel={this.onFormCancel.bind(this)}
                        onFormOpen={this.onFormOpen.bind(this)}
                        showTime={item.showTime}
                    />
                );
            }
        } else {
            return (
                <ChatMessage
                    showTime={item.showTime}
                    message={message}
                    alignRight
                    user={this.user}
                />
            );
        }
    }

    waitForQueueProcessing() {
        return new Promise((resolve, reject) => {
            var self = this;
            let interval = setInterval(function() {
                if (self.processingMessageQueue === false) {
                    clearInterval(interval);
                    resolve();
                }
            }, Config.ChatMessageOptions.messageTransitionTime / 2);
        });
    }

    countMessage = message => {
        if (!message.isEmptyMessage()) {
            MessageCounter.addCount(this.getBotId(), 1);
        }
    };

    sendMessage = async message => {
        this.countMessage(message);
        this.updateChat(message);
        this.scrollToBottom = true;
        await this.waitForQueueProcessing();
        const getNext = this.loadedBot.next(
            message,
            this.botState,
            this.state.messages,
            this.botContext
        );
        const isPromise = getNext instanceof Promise;
        console.log('[FrontM] Is Promise?', isPromise);
        if (isPromise) {
            getNext.then(response => {
                console.log('Acknowledgement from BOT is...', response);
                console.log(this.state.messages);
                if (response.status === 200) {
                    message.setStatus(1);
                    this.updateChat(message);
                }
            });
        } else {
            return getNext;
        }

        //     //this.scrollToBottomIfNeeded();
        // this.waitForQueueProcessing().then(() => {
        //     console.log('Sending my mESSSSAGE', message);
        //     this.loadedBot.next(
        //         message,
        //         this.botState,
        //         this.state.messages,
        //         this.botContext
        //     );
        //     // .then(response => {
        //     //     console.log('Acknowledgement from BOT is...', response);
        //     //     console.log(this.state.messages);
        //     //     if (response.status === 200) {
        //     //         message.setStatus(1);
        //     //         this.updateChat(message);
        //     //     }
        //     // });
        //     //this.scrollToBottomIfNeeded();
        // });
    };

    async onSendMessage(messageStr) {
        let self = this;
        // read message from component state
        let message = new Message();
        message.setCreatedBy(this.getUserId());
        message.stringMessage(messageStr);

        return self.sendMessage(message);
    }

    getUserId = () => {
        return this.user.userId;
    };

    async sendImage(imageUri, base64) {
        const toUri = await Utils.copyFileAsync(
            imageUri,
            Constants.IMAGES_DIRECTORY
        );
        let message = new Message();
        message.setCreatedBy(this.getUserId());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await Resource.uploadFile(
            base64,
            toUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            ResourceTypes.Image,
            this.user
        );
        message.imageMessage(uploadedUrl);

        return this.sendMessage(message);
    }

    onSendAudio = audioURI => {
        this.sendAudio(audioURI);
    };

    sendAudio = async audioURI => {
        const toUri = await Utils.copyFileAsync(
            audioURI,
            Constants.AUDIO_DIRECTORY
        );

        // TODO(amal): Upload Audio file
        let message = new Message();
        message.setCreatedBy(this.getUserId());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await Resource.uploadFile(
            null,
            toUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            ResourceTypes.Audio,
            this.user
        );

        message.audioMessage(uploadedUrl);
        return this.sendMessage(message);
    };

    sendVideo = async videoFileURL => {
        // TODO(amal): Copy the file to videos directory
        //const toPath = await Utils.copyFileInPathAsync(videoPath, Utils.fileUriToPath(Constants.VIDEO_DIRECTORY));
        const toUri = videoFileURL;

        let message = new Message();
        message.setCreatedBy(this.getUserId());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await Resource.uploadFile(
            null,
            toUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            ResourceTypes.Video,
            this.user
        );
        message.videoMessage(uploadedUrl);
        return this.sendMessage(message);
    };

    async takePicture() {
        Keyboard.dismiss();
        let result = await Media.takePicture(Config.CameraOptions);
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    onVideoCaptured = videoFileURL => {
        this.sendVideo(videoFileURL);
    };

    recordVideo() {
        Media.recordVideo().then(result => {
            if (!result.cancelled) {
                console.log('Recorded video : ', result);
                this.onVideoCaptured(result.uri);
            }
        });
    }

    requestCameraPermissions(callback) {
        return Permissions.request('camera').then(response => {
            if (response === 'authorized') {
                callback();
            }
        });
    }

    requestAudioPermissions(callback) {
        return Permissions.request('microphone').then(response => {
            if (response === 'authorized') {
                callback();
            }
        });
    }

    requestStoragePermissions(callback) {
        return Permissions.request('storage').then(response => {
            if (response === 'authorized') {
                callback();
            }
        });
    }

    alertForRecordingPermission() {
        Alert.alert(
            undefined,
            'We need microphone, camera and storage permission so we can record your video.',
            [
                {
                    text: 'cancel',
                    onPress: () => console.log('Permission denied'),
                    style: 'cancel'
                },
                { text: 'Open Settings', onPress: Permissions.openSettings }
            ]
        );
    }

    async takeVideo() {
        Keyboard.dismiss();
        const response = await this._hasRecordVideoPermission();
        const recordVideoCallback = () => {
            this.recordVideo();
        };

        const requestStoragePermissionsCallback = () => {
            this.requestStoragePermissions(recordVideoCallback);
        };

        const requestAudioPermissionCallback = () => {
            if (Platform.OS === 'ios') {
                this.requestAudioPermissions(recordVideoCallback);
            } else {
                this.requestAudioPermissions(requestStoragePermissionsCallback);
            }
        };
        if (
            response.camera === 'authorized' &&
            response.microphone === 'authorized' &&
            (Platform.OS === 'ios' || response.storage === 'authorized')
        ) {
            this.recordVideo();
        } else if (
            response.camera === 'denied' ||
            response.camera === 'denied' ||
            response.storage === 'denied'
        ) {
            this.alertForRecordingPermission();
        } else {
            if (response.camera === 'undetermined') {
                this.requestCameraPermissions(requestAudioPermissionCallback);
            } else if (response.microphone === 'undetermined') {
                if (Platform.OS === 'ios') {
                    this.requestAudioPermissions(recordVideoCallback);
                } else {
                    this.requestAudioPermissions(
                        requestStoragePermissionsCallback
                    );
                }
            } else if (response.storage === 'undetermined') {
                this.requestStoragePermissions(recordVideoCallback);
            }
        }
    }

    _hasRecordVideoPermission() {
        if (Platform.OS === 'ios') {
            return Permissions.checkMultiple(['camera', 'microphone']);
        } else {
            return Permissions.checkMultiple([
                'camera',
                'microphone',
                'storage'
            ]);
        }
    }

    async pickImage() {
        Keyboard.dismiss();
        let result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }
    async uploadFile(uri) {
        let message = new Message();
        message.setCreatedBy(this.getUserId());

        const uploadedUrl = await Resource.uploadFile(
            null,
            toUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            ResourceTypes.Audio,
            this.user
        );
    }

    async pickFile() {
        Keyboard.dismiss();
        DocumentPicker.show(
            {
                filetype: [DocumentPickerUtil.allFiles()]
            },
            (error, res) => {
                this.uploadFile();
                console.log(res.uri, res.type, res.fileName, res.fileSize);
            }
        );
    }

    onBarcodeRead(barCodeData) {
        let message = new Message();
        message.setCreatedBy(this.getUserId());
        message.barcodeMessage(barCodeData);
        return this.sendMessage(message);
    }

    async readBarCode() {
        Keyboard.dismiss();
        let result = await Media.readBarcode();
        if (!result.cancelled) {
            this.onBarcodeRead(result.data);
        }
    }

    addContactsToBot() {
        Keyboard.dismiss();
        Contact.getAddedContacts().then(contacts => {
            let message = Contact.asSliderMessage(contacts);
            this.setState({
                showSlider: true,
                message,
                overrideDoneFn: this.addSelectedContactsToBot
            });
        });
    }

    async updateConversationContextId(newConversationId) {}

    resetConversation() {
        Keyboard.dismiss();
        // TODO: should the first parameter be message even?
        // Maybe this should return a promise so we can chain things?
        this.loadedBot.done(
            null,
            this.botState,
            this.state.messages,
            this.botContext
        );
        ConversationContext.createAndSaveNewConversationContext(
            this.botContext,
            this.user
        )
            .then(context => {
                this.conversationContext = context;
                this.loadedBot.init(
                    this.botState,
                    this.state.messages,
                    this.botContext
                );
            })
            .catch(err => {
                console.log('Error resetting coversation ', err);
            });
    }

    addSelectedContactsToBot = selectedRows => {
        if (selectedRows.length > 0) {
            try {
                const uuids = _.map(selectedRows, row => {
                    let uuid = _.find(row.data.contact_info, function(m) {
                        return m.key === 'userId';
                    });
                    return uuid.value;
                });
                const names = _.map(selectedRows, row => {
                    return row.title;
                });
                ConversationContext.addParticipants(
                    uuids,
                    this.botContext
                ).then(context => {
                    this.conversationContext = context;
                    let message = new Message();
                    message.stringMessage(
                        I18n.t('Slider_Response', { lines: names.join('\n') })
                    );
                    message.setCreatedBy(this.getUserId());
                    return this.sendMessage(message);
                });
            } catch (error) {
                // Ignore
            }
        } else {
        }
    };

    pickLocation() {
        Keyboard.dismiss();
        Actions.locationPicker({
            onLocationPicked: this.onLocationPicked.bind(this)
        });
    }

    onLocationPicked(locationData) {
        console.log(locationData);
    }

    onOptionSelected(key) {
        if (key === BotInputBarCapabilities.camera) {
            this.takePicture();
        } else if (key === BotInputBarCapabilities.video) {
            this.takeVideo();
        } else if (key === BotInputBarCapabilities.bar_code_scanner) {
            this.readBarCode();
        } else if (key === BotInputBarCapabilities.photo_library) {
            this.pickImage();
        } else if (key === BotInputBarCapabilities.add_contact) {
            this.addContactsToBot();
        } else if (key === BotInputBarCapabilities.reset_conversation) {
            this.resetConversation();
        } else if (key === BotInputBarCapabilities.pick_location) {
            this.pickLocation();
        } else if (key === BotInputBarCapabilities.file) {
            this.pickFile();
        }
    }

    async loadMessages() {
        let messages = await MessageHandler.fetchDeviceMessagesBeforeDate(
            this.getBotKey(),
            pageSize,
            this.oldestLoadedDate()
        );
        console.log('[FrontM]-- Bot Messages', messages);

        return messages;
    }

    async onRefresh() {
        this.setState({
            refreshing: true
        });
        let messages = await this.loadMessages();
        let combinedMsgs = messages.concat(this.state.messages);
        if (this.mounted) {
            this.setState({
                messages: this.addSessionStartMessages(combinedMsgs),
                refreshing: false
            });
        }
    }

    oldestLoadedDate() {
        let date = moment().valueOf();
        if (this.state.messages.length > 0) {
            const message = this.state.messages[0];
            date = moment(message.message.getMessageDate()).valueOf();
        }
        return date;
    }

    async loadOldMessagesFromServer() {
        let messages = await NetworkHandler.fetchOldMessagesBeforeDate(
            this.conversationContext.conversationId,
            this.getBotId(),
            this.oldestLoadedDate()
        );
        return messages;
    }

    onSliderResize() {
        this.scrollToBottomIfNeeded();
    }

    addBotMessage = message =>
        new Promise(resolve => {
            // TODO: Adding bot messages directly seems a bad choice. May be should have a new
            // Message type (Echo message) that contains a internal message for bot to process
            // and echo it back.
            this.persistMessage(message)
                .then(() => {
                    this.queueMessage(message);
                    resolve();
                })
                .catch(err => {
                    console.error('Error persisting session message::', err);
                    resolve();
                });
        });

    renderSmartSuggestions() {
        return (
            <SmartSuggestions
                ref={smartSuggestionsArea => {
                    this.smartSuggestionsArea = smartSuggestionsArea;
                }}
                suggestions={this.state.smartSuggesions}
                onReplySelected={this.onSendMessage.bind(this)}
            />
        );
    }

    renderSlider() {
        const message = this.state.message;
        const doneFn = this.state.overrideDoneFn
            ? this.state.overrideDoneFn.bind(this)
            : this.onSliderDone.bind(this);
        const options = _.extend({}, message.getMessageOptions(), {
            doneFunction: doneFn,
            cancelFunction: this.onSliderCancel.bind(this)
        });
        // If smart reply - the taps are sent back to the bot
        const tapFn =
            options.smartReply === true ? this.onSliderTap.bind(this) : null;

        if (tapFn) {
            options.tapFunction = tapFn;
        }
        return (
            <Slider
                ref={slider => {
                    this.slider = slider;
                }}
                onClose={this.onSliderClose.bind(this)}
                message={message.getMessage()}
                options={options}
                containerStyle={chatStyles.slider}
                onResize={this.onSliderResize.bind(this)}
                onSliderOpen={this.onSliderOpen.bind(this)}
                maxHeight={SLIDER_HEIGHT}
            />
        );
    }

    renderChatInputBar() {
        const moreOptions = [
            {
                key: BotInputBarCapabilities.camera,
                label: I18n.t('Chat_Input_Camera')
            },
            // { key: BotInputBarCapabilities.video, label: I18n.t('Chat_Input_Video') },
            // { key: BotInputBarCapabilities.file, label: I18n.t('Chat_Input_File') },
            {
                key: BotInputBarCapabilities.photo_library,
                label: I18n.t('Chat_Input_Photo_Library')
            },
            {
                key: BotInputBarCapabilities.bar_code_scanner,
                label: I18n.t('Chat_Input_BarCode')
            },
            {
                key: BotInputBarCapabilities.pick_location,
                label: I18n.t('Pick_Location')
            }
        ];

        if (this.bot.allowResetConversation) {
            moreOptions.push({
                key: BotInputBarCapabilities.reset_conversation,
                label: I18n.t('Reset_Conversation')
            });
        }
        if (appConfig.app.hideAddContacts !== true) {
            moreOptions.push({
                key: BotInputBarCapabilities.add_contact,
                label: I18n.t('Add_Contact')
            });
        }

        return (
            <ChatInputBar
                accessibilityLabel="Chat Input Bar"
                testID="chat-input-bar"
                network={this.state.network}
                onSend={this.onSendMessage.bind(this)}
                onSendAudio={this.onSendAudio.bind(this)}
                options={moreOptions}
                botId={this.getBotId()}
                onOptionSelected={this.onOptionSelected.bind(this)}
            />
        );
    }

    onChatStatusBarClose = () => {
        this.setState({
            showNetworkStatusBar: false
        });
    };

    renderNetworkStatusBar = () => {
        const { network, showNetworkStatusBar } = this.state;
        if (
            showNetworkStatusBar &&
            (network === 'none' || network === 'satellite')
        ) {
            return (
                <ChatStatusBar
                    network={this.state.network}
                    onChatStatusBarClose={this.onChatStatusBarClose}
                />
            );
        }
    };

    renderCallModal = () => {
        return (
            <CallModal
                ref={'callModal'}
                parentFlatList={this}
                isVisible={false}
            />
        );
    };

    render() {
        if (!this.botLoaded) {
            return (
                <View style={chatStyles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        // react-native-router-flux header seems to intefere with padding. So
        // we need a offset as per the header size
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <BackgroundImage
                    accessibilityLabel="Messages List"
                    testID="messages-list"
                >
                    <KeyboardAvoidingView
                        style={chatStyles.container}
                        behavior={Platform.OS === 'ios' ? 'padding' : null}
                        keyboardVerticalOffset={
                            Constants.DEFAULT_HEADER_HEIGHT +
                            (Utils.isiPhoneX() ? 24 : 0)
                        }
                    >
                        <FlatList
                            style={chatStyles.messagesList}
                            ListFooterComponent={this.renderSmartSuggestions()}
                            accessibilityLabel="Messages List"
                            testID="messages-list"
                            ref={list => {
                                this.chatList = list;
                                this.checkForScrolling();
                            }}
                            data={this.state.messages}
                            renderItem={this.renderItem.bind(this)}
                            onLayout={this.onChatListLayout.bind(this)}
                            refreshControl={
                                <RefreshControl
                                    colors={['#9Bd35A', '#689F38']}
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.onRefresh.bind(this)}
                                />
                            }
                            onScrollToIndexFailed={this.onScrollToIndexFailed.bind(
                                this
                            )}
                        />
                        {this.state.showSlider ? this.renderSlider() : null}
                        {/* {this.renderSmartSuggestions()} */}
                        <View style={{ alignItems: 'center' }}>
                            {this.renderChatInputBar()}
                        </View>

                        {this.renderNetworkStatusBar()}
                        {this.renderCallModal()}
                    </KeyboardAvoidingView>
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}
