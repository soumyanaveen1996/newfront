import React from 'react';
import _ from 'lodash';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    RefreshControl,
    View,
    Alert,
    Image,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Platform,
    PermissionsAndroid,
    LayoutAnimation,
    UIManager,
    NativeModules
} from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import Promise from '../../lib/Promise';
import chatStyles from './styles';
import ChatInputBar from './ChatInputBar';
import ChatStatusBar from './ChatStatusBar';
import ChatMessage from './ChatMessage';
import CallModal from './CallModal';
import ChatModal from './ChatModal';
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
    PollingStrategyTypes,
    Notification
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
    Queue,
    NETWORK_STATE
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
    GoogleAnalyticsCategories,
    GoogleAnalyticsEvents
} from '../../lib/GoogleAnalytics';
import DocumentPicker from 'react-native-document-picker';
import { SmartSuggestions } from '../SmartSuggestions';
import { WebCards } from '../WebCards';
import { MapMessage } from '../MapMessage';
import { BackgroundImage } from '../BackgroundImage';
import { setLoadedBot } from '../../redux/actions/BotActions';
import { setFirstLogin, setCurrentForm } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import { connect } from 'react-redux';
import { ButtonMessage } from '../ButtonMessage';
import { Form2Message } from '../Form2Message';
import {
    formStatus,
    formAction,
    formUpdateAction
} from '../Form2Message/config';
import { Datacard } from '../Datacard';
import PushNotification from 'react-native-push-notification';
import {
    setCurrentConversationId,
    setCurrentMap
} from '../../redux/actions/UserActions';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import { MarkerIconTypes } from '../MapView/config';
import ReduxStore from '../../redux/store/configureStore';
import {
    SearchBox,
    SearchBoxUserAction,
    SearchBoxBotAction
} from './SearchBox';
import { ControlDAO } from '../../lib/persistence';
import Cards from '../Cards/Cards';
import ChartMessage from '../ChartMessage';
import { Conversation } from '../../lib/conversation';
import ImageResizer from 'react-native-image-resizer';
import ImageMessage from '../ImageMessage/ImageMessage';
import NetworkButton from '../Header/NetworkButton';

const ConversationServiceClient = NativeModules.ConversationServiceClient;
const QueueServiceClient = NativeModules.QueueServiceClient;
const R = require('ramda');

var backTimer = null;
const timeout = Platform.OS === 'android' ? 500 : 400;

class ChatBotScreen extends React.Component {
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
                            if (Actions.currentScene === 'botChat') {
                                Actions.pop();
                                state.params.onBack();
                            }
                        } else {
                            if (Actions.currentScene === 'botChat') {
                                Actions.pop();
                            }
                        }
                    }}
                />
            );
        }

        navigationOptions.headerRight = (
            <View style={{ marginHorizontal: 17 }}>
                <NetworkButton
                    manualAction={() => {
                        state.params.refresh();
                    }}
                    gsmAction={() => {
                        state.params.showConnectionMessage('gsm');
                    }}
                    satelliteAction={() => {
                        state.params.showConnectionMessage('satellite');
                    }}
                    disconnectedAction={() => {}}
                />
            </View>
        );
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        UIManager.setLayoutAnimationEnabledExperimental &&
            UIManager.setLayoutAnimationEnabledExperimental(true);
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
            sliderClosed: false,
            chatModalContent: {},
            isModalVisible: false,
            showOptions: false,
            showSearchBox: false,
            searchBoxData: null,
            currentMap: null,
            currentUser: null,
            allContacts: [],
            bottomRefresh: false
        };
        this.botState = {}; // Will be mutated by the bot to keep any state
        this.chatState = {
            updatingChat: false
        };
        this.scrollToBottom = false;
        this.firstUnreadIndex = -1;

        // Create a new botcontext with this as the bot
        this.botContext = new BotContext(this, this.bot);

        // Susbscribe to async result handler
        this.eventSubscription = null;

        this.dce_bot = dce.bot(this.bot, this.botContext);
        this.user = null;
        this.conversationContext = null;
        this.sliderPreviousState = false;
        this.currentMapId = null;
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
        Store.dispatch(setLoadedBot(this.bot.botId));
        Store.dispatch(setFirstLogin(false));
        this.mounted = true;
        let self = this;

        //Ask to activate push notifications
        this.askNotificationPermission();

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
            self.user = await Auth.getUser();
            this.setState({ currentUser: self.user });

            const contacts = await Contact.getAddedContacts();
            const contactIds = contacts.map(contact => contact.userId);
            this.setState({ allContacts: contactIds });

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

            let serverMessages = [];
            if (messages.length < 20) {
                serverMessages = await this.loadOldMessagesFromServer();
            }

            let allMessages = R.uniqWith(R.eqProps('key'), [
                ...serverMessages,
                ...messages
            ]);
            allMessages = allMessages.slice(0, pageSize);
            // 4. Update the state of the bot with the messages we have
            this.setState(
                {
                    messages: this.addSessionStartMessages(allMessages),
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
                        self.eventSendSubscription = EventEmitter.addListener(
                            MessageEvents.messageSend,
                            this.handleMessageEventsSend.bind(this)
                        );
                        // 8. Mark new messages as read
                        MessageHandler.markUnreadMessagesAsRead(
                            this.getBotKey()
                        );
                        // 9. Stash the bot for nav back for on exit
                        this.props.navigation.setParams({
                            botDone: this.botDone.bind(this)
                        });
                        if (this.props.call) {
                            this.showCallMessage();
                        }
                    } else {
                    }
                }
            );
        } catch (e) {
            // TODO: handle errors
            self.botLoaded = false;
        }

        this.checkForScrolling();

        this.keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            this.keyboardWillShow.bind(this)
        );
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow.bind(this)
        );

        this.keyboardWillHideListener = Keyboard.addListener(
            'keyboardWillHide',
            this.keyboardWillHide.bind(this)
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
        Store.dispatch(
            setCurrentConversationId(this.conversationContext.conversationId)
        );
    }

    async askNotificationPermission() {
        const notificationInfo = await Notification.deviceInfo();
        if (!(notificationInfo && notificationInfo.isRegistered)) {
            Notification.register();
        }
    }

    static onEnter({ navigation, screenProps }) {
        const shouldPop =
            Actions.refs.peopleChat &&
            Actions.refs.peopleChat.props.call &&
            Actions.prevScene === 'phone';
        if (shouldPop) {
            Actions.pop();
        }
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
            I18n.t('Automatic_Network'),
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
        this.showButton(pollingStrategy);
    }

    async componentWillUnmount() {
        this.mounted = false;
        Store.dispatch(setCurrentConversationId(''));
        Store.dispatch(setLoadedBot(null));
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.eventSendSubscription) {
            this.eventSendSubscription.remove();
        }
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardDidShowListener) {
            this.keyboardDidShowListener.remove();
        }
        if (this.keyboardWillHideListener) {
            this.keyboardWillHideListener.remove();
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
        //     if (this.slider) {
        //         this.slider.close(undefined, true);
        //         this.setState({ sliderClosed: true });
        //     } else {
        //         this.setState({ sliderClosed: false });
        //     }
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // this.sliderPreviousState = this.state.showSlider || false;
        // this.setState({ showOptions: false, showSlider: false },this.scrollToBottomIfNeeded())
    };

    keyboardDidShow = () => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        // if (Platform.OS === 'android' && this.slider) {
        //     this.slider.close(undefined, true);
        //     this.setState({ sliderClosed: true, showOptions: false });
        // } else {
        //     this.setState({ sliderClosed: false, showOptions: false });
        // }
        this.setState(
            { showOptions: false, showSlider: false },
            this.scrollToBottomIfNeeded()
        );
    };

    keyboardWillHide = () => {
        // this.scrollToBottomIfNeeded();
        // this.setState({ showSlider: this.sliderPreviousState || false });
        // if (Platform.OS === 'android' && this.state.sliderClosed) {
        //     this.setState({ showSlider: true });
        // }
        // if (!this.state.showOptions) {
        //     this.setState({ showSlider: this.sliderPreviousState || false })
        // }
    };

    keyboardDidHide = () => {
        this.setState(
            {
                showSlider: this.state.showOptions
                    ? false
                    : this.sliderPreviousState
            },
            this.scrollToBottomIfNeeded()
        );
    };

    handleMessageEventsSend(event) {
        if (!event || event.botId !== this.getBotId()) {
            return;
        }
        this.sendMessage(event.message);
        // this.loadedBot.asyncResult(
        //     event.message,
        //     this.botState,
        //     this.state.messages,
        //     this.botContext
        // );
    }

    handleMessageEvents(event) {
        if (!event || event.botId !== this.getBotId()) {
            return;
        }
        console.log(
            'Sourav Logging:::: Message Event-------------> Message Received'
        );
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

    invokeWait = () => {
        let msg = new Message({ addedByBot: true });
        msg.waitMessage();
        this.queueMessage(msg);
    };

    wait = shouldWait => {
        if (shouldWait) {
            setTimeout(() => this.invokeWait(), 0);
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
                        resolve();
                    });
            } else {
                resolve();
            }
        });

    tell = message => {
        // console.log('>>>>>>>MSG', message.getMessage())
        // Removing the waiting message.
        this.stopWaiting();
        this.countMessage(message);

        // Update the bot interface
        // Push a new message to the end
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SMART_SUGGESTIONS
        ) {
            if (this.chatState.updatingChat) {
                this.chatState.nextSmartSuggestion = message;
            } else {
                this.updateSmartSuggestions(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SEARCH_BOX
        ) {
            const data = message.getMessage();

            if (data.action !== SearchBoxBotAction.CLOSE) {
                this.setState({ showSearchBox: true, searchBoxData: data });
                if (this.searchBox) {
                    this.searchBox.onResponseReceived();
                }
            } else {
                this.setState({ showSearchBox: false, searchBoxData: null });
            }
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_WAIT
        ) {
            this.wait(true);
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
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_BUTTON
        ) {
            this.updateChat(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_CHART
        ) {
            const foundIndex = this.state.messages.findIndex(element => {
                const options = element.message.getMessageOptions();
                return (
                    options &&
                    element.message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_CHART &&
                    options.chartId === message.getMessageOptions().chartId
                );
            });
            if (foundIndex >= 0) {
                this.state.messages[foundIndex].message.chartMessage(
                    message.getMessage(),
                    { ...message.getMessageOptions(), update: true }
                );
                this.setState({ messages: this.state.messages });
                this.updateChat(message);
            } else {
                this.updateChat(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CLOSE_FORM
        ) {
            this.closeForm(message.getMessage().formId);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MAP
        ) {
            if (
                this.currentMapId &&
                message.getMessageOptions().mapId === this.currentMapId
            ) {
                Store.dispatch(setCurrentMap(message.getMessage()));
            }
            this.updateChat(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_FORM2
        ) {
            if (
                message.getMessageOptions().action === formUpdateAction.RESULTS
            ) {
                const currentForm = Store.getState().user.currentForm;
                if (
                    message.getMessageOptions().formId ===
                    currentForm.formMessage.formId
                ) {
                    Store.dispatch(
                        setCurrentForm({
                            ...currentForm,
                            currentResults: message.getMessage()
                        })
                    );
                }
            } else if (
                message.getMessageOptions().action === formUpdateAction.CHANGE
            ) {
                const currentForm = Store.getState().user.currentForm;
                if (
                    message.getMessageOptions().formId ===
                    currentForm.formMessage.formId
                ) {
                    Store.dispatch(
                        setCurrentForm({
                            ...currentForm,
                            change: message.getMessage()
                        })
                    );
                }
            } else if (
                message.getMessageOptions().action ===
                formUpdateAction.VALIDATION
            ) {
                const currentForm = Store.getState().user.currentForm;
                if (
                    message.getMessageOptions().formId ===
                    currentForm.formMessage.formId
                ) {
                    Store.dispatch(
                        setCurrentForm({
                            ...currentForm,
                            validation: message.getMessage()
                        })
                    );
                }
            } else {
                this.updateChat(message);
            }
        } else {
            this.updateChat(message);
        }
    };

    done = () => {
        // Done with the bot - navigate away?
    };

    /** Retrun when the message has been persisted*/
    persistMessage = message => {
        return MessageHandler.persistOnDevice(this.getBotKey(), message);
    };

    // Promise based since setState is async
    updateChat(message) {
        return new Promise((resolve, reject) => {
            this.chatState.updatingChat = true;
            this.persistMessage(message)
                .then(queue => {
                    if (queue) {
                        return this.queueMessage(message);
                    } else {
                        return;
                    }
                })
                .then(res => {
                    if (!res) {
                        this.chatState.updatingChat = false;
                        if (this.chatState.nextSmartSuggestion) {
                            this.updateSmartSuggestions(
                                this.chatState.nextSmartSuggestion
                            );
                            this.chatState.nextSmartSuggestion = undefined;
                        }
                    }
                    resolve();
                })
                .catch(e => {
                    resolve();
                });
            // Has to be Immutable for react
        });
    }

    updateSmartSuggestions(message) {
        // Suggestions
        this.smartSuggestionsArea
            .update(message.getMessage())
            .then(() => this.checkForScrolling());
    }

    fireSlider(message) {
        // Slider
        Keyboard.dismiss();
        this.sliderPreviousState = true;
        this.setState({ showSlider: true, message: message });
    }

    openMap(mapId, title) {
        ControlDAO.getContentById(mapId).then(content => {
            Keyboard.dismiss();
            this.currentMapId = mapId;
            Store.dispatch(setCurrentMap(content));
            Actions.mapView({
                title: title || 'Map',
                mapId: mapId,
                onAction: this.sendMapResponse.bind(this),
                onClosing: () => {
                    Store.dispatch(setCurrentMap(null));
                    this.currentMap = null;
                }
                // TEST: () => {
                //     let msg = new Message()
                //     msg.mapMessage({}, {
                //         mapId: 'nQVFDWLbEZ6CAe7Yw7cXDb',
                //         title: 'Title',
                //         description: 'Description'
                //     })
                //     msg.messageByBot(true)
                //     this.tell(msg)
                // }
            });
        });
    }

    openLocationMessage(content, mapId, title) {
        Keyboard.dismiss();
        this.currentMapId = mapId;
        Store.dispatch(setCurrentMap(content));
        Actions.mapView({
            title: title || 'Map',
            mapId: mapId,
            onClosing: () => {
                Store.dispatch(setCurrentMap(null));
                this.currentMap = null;
            }
        });
    }

    // openChart(message) {
    //     Keyboard.dismiss();
    //     Actions.SNRChart({
    //         chartData: message.getMessage(),
    //         chartTitle: I18n.t('SNR_Chart_title')
    //     });
    // }

    // picked from Smart Suggestions
    sendSmartReply(selectedSuggestion) {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        // message.sliderResponseMessage(selectedRows);
        return this.sendMessage(message);
    }

    sendCardAction(action) {
        let message = new Message();
        message.setCreatedBy(this.getUserId());
        // message.cardAction(action);
        message.stringMessage(action);
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
        this.sliderPreviousState = false;
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
        if (selectedItem.action === 'AcceptContact') {
            setTimeout(() => Contact.refreshContacts(), 5000);
        }
        let message = new Message({ addedByBot: false });
        message.buttonResponseMessage(selectedItem);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    }

    onButtonDone = (messageIndex, selectedItem) => {
        MessageHandler.deleteMessage(
            this.state.messages[messageIndex].message.getMessageId()
        );
        this.state.messages.splice(messageIndex, 1);
        this.setState({ messages: this.state.messages }, () => {
            this.sendButtonResponseMessage(selectedItem);
        });
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

    sendSearchBoxResponse(response) {
        message = new Message();
        message.searchBoxResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message);
        this.setState({ showSearchBox: false, searchBoxData: null });
    }

    sendSearchBoxQuery(query) {
        message = new Message();
        message.searchBoxResponseMessage(query);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message);
    }

    sendMapResponse(response) {
        message = new Message();
        message.mapResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    }

    onFormDone(response) {
        let message = new Message();
        message.messageByBot(false);
        message.formResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    }

    closeForm(formId) {
        let validFormMessages = [];
        //ON SCREEN
        const newScreenMessages = _.map(this.state.messages, screenMessage => {
            let message = screenMessage.message;
            if (
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_FORM2 &&
                message.getMessageOptions().formId === formId
            ) {
                validFormMessages.push(message);
                let newOptions = message.getMessageOptions();
                newOptions.stage = formStatus.COMPLETED;
                message.form2Message(message.getMessage(), newOptions);
                screenMessage.message = message;
            }
            return screenMessage;
        });
        this.setState({ messages: newScreenMessages });

        //RESPONSE
        let lastForm = validFormMessages[validFormMessages.length - 1];
        response = {
            formId: formId,
            action: formAction.CANCEL,
            fields: _.map(lastForm.getMessage(), field => {
                res = {
                    id: field.id,
                    value: field.value
                };
                return res;
            })
        };
        this.onFormDone(response);

        //PERSISTENCE
        MessageHandler.fetchDeviceMessagesOfType(
            this.getBotKey(),
            MessageTypeConstants.MESSAGE_TYPE_FORM2
        ).then(messages => {
            let forms = _.filter(messages, msg => {
                return msg.getMessageOptions().formId === formId;
            });
            _.map(forms, form => {
                let newOptions = form.getMessageOptions();
                newOptions.stage = formStatus.COMPLETED;
                form.form2Message(form.getMessage(), newOptions);
                this.persistMessage(form);
            });
        });
    }

    /**Render the new message on screen */
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

    /** Update message list and screen */
    appendMessageToChat(message, immediate = false) {
        return new Promise(resolve => {
            if (this.addMessage && this.setState) {
                let updatedMessageList = this.addMessage(message);
                this.updateMessages(updatedMessageList, (err, res) => {
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
        return new Promise(async resolve => {
            this.processingMessageQueue = true;
            while (this.messageQueue.length > 0) {
                if (Platform.OS === 'ios') {
                    LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                    );
                }
                await this.appendMessageToChat(this.messageQueue.shift());
            }
            this.processingMessageQueue = false;
            resolve(this.processingMessageQueue);
        });

        // var message = this.messageQueue.shift();
        // if (message) {
        //     this.processingMessageQueue = true;
        //     LayoutAnimation.configureNext(
        //         LayoutAnimation.Presets.easeInEaseOut
        //     );
        //     this.appendMessageToChat(message)
        //         .then(() => {
        //             return this.sleep(
        //                 Config.ChatMessageOptions.messageTransitionTime
        //             );
        //         })
        //         .then(() => {
        //             this.processMessageQueue();
        //         });
        // } else {
        //     this.processingMessageQueue = false;
        // }
    }

    /** Returns true if queue processing is running, false if it's ended */
    queueMessage(message) {
        return new Promise(async resolve => {
            this.messageQueue.push(message);
            if (this.processingMessageQueue === false) {
                await this.processMessageQueue();
                this.checkForScrolling();
                resolve(false);
            } else {
                resolve(true);
            }
        });
    }

    /**Add the new message to message list and return the updated messagelist */
    addMessage(message) {
        const { messages } = this.state;
        const incomingMessage = message.toBotDisplay();
        const messageIndex = R.findIndex(R.propEq('key', incomingMessage.key))(
            this.state.messages
        );
        if (messageIndex > 0) {
            const updatedMessages = R.update(
                messageIndex,
                incomingMessage,
                this.state.messages
            );
            return updatedMessages;
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

    renderItem({ item, index }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_MAP
            ) {
                return (
                    <MapMessage
                        isFromUser={false}
                        isFromBot={true}
                        openMap={this.openMap.bind(this)}
                        mapOptions={message.getMessageOptions()}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_IMAGE
            ) {
                return (
                    <ImageMessage
                        fileName={message.getMessage()}
                        conversationContext={this.conversationContext}
                        isFromUser={false}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_LOCATION
            ) {
                return (
                    <MapMessage
                        isFromUser={false}
                        isFromBot={false}
                        openMap={this.openLocationMessage.bind(this)}
                        mapOptions={message.getMessageOptions()}
                        mapData={message.getMessage()}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_WEB_CARD
            ) {
                return (
                    <WebCards
                        webCardsList={message.getMessage()}
                        previews={message.getMessageOptions()}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_DATA_CARD
            ) {
                return (
                    <Datacard
                        datacardList={message.getMessage()}
                        onCardSelected={this.openModalWithContent.bind(this)}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CARDS
            ) {
                return (
                    <Cards
                        cards={message.getMessage()}
                        onCardSelected={this.openModalWithContent.bind(this)}
                        hideModal={this.hideChatModal.bind(this)}
                        sendCardAction={this.sendCardAction.bind(this)}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_BUTTON
            ) {
                return (
                    <ButtonMessage
                        title={message.getMessage().title}
                        body={message.getMessage().body}
                        buttons={message.getMessage().buttons}
                        onButtonClick={this.onButtonDone.bind(this, index)}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_FORM2
            ) {
                return (
                    <Form2Message
                        formData={message.getMessage()}
                        messageData={message.getMessageOptions()}
                        message={message}
                        saveMessage={this.persistMessage.bind(this)}
                        onSubmit={this.onFormDone.bind(this)}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CHART
            ) {
                return (
                    <ChartMessage
                        chartOptions={message.getMessageOptions()}
                        chartData={message.getMessage()}
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
                        showTime={item.showTime}
                        openModalWithContent={this.openModalWithContent.bind(
                            this
                        )}
                        hideChatModal={this.hideChatModal.bind(this)}
                        onFormCTAClick={this.onFormDone.bind(this)}
                        onFormCancel={this.onFormCancel.bind(this)}
                        onFormOpen={this.onFormOpen.bind(this)}
                        conversationContext={this.conversationContext}
                    />
                );
            }
        } else {
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_MAP
            ) {
                return (
                    <MapMessage
                        isFromUser={true}
                        isFromBot={false}
                        openMap={this.openMap.bind(this)}
                        mapOptions={message.getMessageOptions()}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_IMAGE
            ) {
                return (
                    <ImageMessage
                        fileName={message.getMessage()}
                        conversationContext={this.conversationContext}
                        isFromUser={true}
                    />
                );
            } else if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_LOCATION
            ) {
                return (
                    <MapMessage
                        isFromUser={true}
                        isFromBot={false}
                        openMap={this.openLocationMessage.bind(this)}
                        mapOptions={message.getMessageOptions()}
                        mapData={message.getMessage()}
                    />
                );
            } else {
                return (
                    <View>
                        <ChatMessage
                            showTime={item.showTime}
                            message={message}
                            alignRight
                            user={this.user}
                            openModalWithContent={this.openModalWithContent.bind(
                                this
                            )}
                            hideChatModal={this.hideChatModal.bind(this)}
                            conversationContext={this.conversationContext}
                        />
                        {this.state.messages.length == 2 ? (
                            <View style={{ height: 0 }} />
                        ) : null}
                    </View>
                );
            }
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
        // console.log('>>>>>>sendmessage', message)
        this.countMessage(message);

        GoogleAnalytics.logEvents(
            GoogleAnalyticsEvents.SEND_MESSAGE,
            'Message',
            this.props.bot.botName,
            0,
            null
        );

        await this.updateChat(message);
        this.scrollToBottom = true;

        await this.waitForQueueProcessing();
        const getNext = this.loadedBot.next(
            message,
            this.botState,
            this.state.messages,
            this.botContext
        );
        if (message.getMessageType() === 'background_event') {
            return getNext;
        }
        const isPromise = getNext instanceof Promise;
        if (isPromise) {
            getNext.then(response => {
                const status = R.pathOr(1, ['data', 'error'], response);
                if (status == 0) {
                    message.setStatus(1);
                    this.updateChat(message);
                }
            });
        } else {
            return getNext;
        }

        //     //this.scrollToBottomIfNeeded();
        // this.waitForQueueProcessing().then(() => {
        //     this.loadedBot.next(
        //         message,
        //         this.botState,
        //         this.state.messages,
        //         this.botContext
        //     );
        //     // .then(response => {
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
        message.setRead(true);

        return self.sendMessage(message);
    }

    getUserId = () => {
        return this.user.userId;
    };

    async pickImage() {
        Keyboard.dismiss();
        let result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    async pickFile() {
        Keyboard.dismiss();
        DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles]
        }).then(res => {
            this.sendFile(res.uri, res.type, res.name);
        });
    }

    async sendImage(imageUri, base64) {
        let message = new Message();
        message.setCreatedBy(this.getUserId());

        let imageResizeResponse = await ImageResizer.createResizedImage(
            imageUri,
            800,
            800,
            'PNG',
            50,
            0,
            'images'
        );
        const newUri =
            Constants.IMAGES_DIRECTORY + '/' + message.getMessageId() + '.png';
        await RNFS.moveFile(imageResizeResponse.uri, newUri);

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await Resource.uploadFile(
            newUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            this.user,
            ResourceTypes.Image
        );
        message.imageMessage(uploadedUrl.split('/').pop());
        return this.sendMessage(message);
    }

    /**
     * Async method that copy a file in a local directory. Can Also rename it.
     *
     * @param fileLocalUri uri of the local file
     * @param fileMIMEType MIME type of the file
     * @param fileName file name with extension
     *
     */
    async sendFile(fileLocalUri, fileMIMEType, fileName) {
        let message = new Message();
        message.setCreatedBy(this.getUserId());
        // COPY THE FILE
        await RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
        let rename =
            message.getMessageId() + '.' + mime.extension(fileMIMEType);
        const newFileUri = await Utils.copyFileAsync(
            decodeURI(fileLocalUri),
            Constants.OTHER_FILE_DIRECTORY,
            rename
        );

        // UPLOAD THE FILE
        const uploadedUrl = await Resource.uploadFile(
            newFileUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            this.user,
            ResourceTypes.OtherFile,
            fileMIMEType
        );

        //SEND MESSAGE
        message.otherFileMessage(uploadedUrl.split('/').pop(), {
            type: fileMIMEType,
            fileName: fileName
        });
        return this.sendMessage(message);
    }

    onSendAudio = audioURI => {
        this.sendAudio(audioURI);
    };

    sendAudio = async audioURI => {
        let rename = message.getMessageId() + '.aac';
        const toUri = await Utils.copyFileAsync(
            audioURI,
            Constants.AUDIO_DIRECTORY,
            rename
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
            this.user,
            ResourceTypes.Audio
        );
        message.audioMessage(uploadedUrl.split('/').pop());
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
            toUri,
            this.conversationContext.conversationId,
            message.getMessageId(),
            this.user,
            ResourceTypes.Video
        );
        message.videoMessage(uploadedUrl.split('/').pop());
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
            .catch(err => {});
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
        const map = {
            region: {
                longitude: locationData.coordinate[0],
                latitude: locationData.coordinate[1]
            },
            markers: [
                {
                    id: this.getUserId(),
                    title: 'position',
                    description: 'shared position',
                    draggable: false,
                    iconType: MarkerIconTypes.POI,
                    coordinate: {
                        longitude: locationData.coordinate[0],
                        latitude: locationData.coordinate[1]
                    }
                }
            ]
        };
        const options = {
            mapId: 'location_share',
            title: this.user.userName || 'Map'
        };
        message = new Message();
        message.locationMessage(map, options);
        message.messageByBot(false);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message);
    }

    pickContact() {
        Keyboard.dismiss();
        Contact.getAddedContacts().then(contacts => {
            Actions.manageContacts({
                title: 'Share contacts',
                allContacts: contacts,
                onSelected: this.shareContacts.bind(this),
                disabledUserIds: []
            });
        });
    }

    shareContacts(selectedContacts) {
        _.map(selectedContacts, contact => {
            message = new Message();
            message.contactCard(contact.userId);
            message.messageByBot(false);
            message.setCreatedBy(this.getUserId());
            this.sendMessage(message);
        });
    }

    onPlusButtonPressed() {
        if (this.state.showOptions === false) {
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                );
            }
            this.setState(
                {
                    showOptions: true,
                    showSlider: false
                },
                () => Keyboard.dismiss()
            );
        } else {
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                );
            }
            this.setState({
                showOptions: false,
                showSlider: this.sliderPreviousState
            });
        }
    }

    onRandomTap() {
        // if (this.state.showOptions === false) {
        //     LayoutAnimation.configureNext(
        //         LayoutAnimation.Presets.easeInEaseOut
        //     );
        //     Keyboard.dismiss();
        //     this.sliderPreviousState = this.state.showSlider || false;
        //     this.setState({
        //         showOptions: true,
        //         showSlider: false
        //     });
        // } else {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        this.setState({
            showOptions: false,
            showSlider: this.sliderPreviousState
        });
        // }
    }

    selectOption = key => {
        this.setState({ showOptions: false });
        if (key === BotInputBarCapabilities.camera) {
            this.takePicture();
        } else if (key === BotInputBarCapabilities.video) {
            this.takeVideo();
        } else if (key === BotInputBarCapabilities.bar_code_scanner) {
            this.readBarCode();
        } else if (key === BotInputBarCapabilities.photo_library) {
            this.pickImage();
        } else if (key === BotInputBarCapabilities.share_contact) {
            this.pickContact();
        } else if (key === BotInputBarCapabilities.reset_conversation) {
            this.resetConversation();
        } else if (key === BotInputBarCapabilities.pick_location) {
            this.pickLocation();
        } else if (key === BotInputBarCapabilities.file) {
            this.pickFile();
        }
    };

    async loadMessages() {
        let messages = await MessageHandler.fetchDeviceMessagesBeforeDate(
            this.getBotKey(),
            pageSize,
            this.oldestLoadedDate()
        );

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
        // return [];
        try {
            const messages = await NetworkHandler.getArchivedMessages(
                this.getBotId(),
                this.conversationContext.conversationId
            );

            // let messages = await NetworkHandler.fetchOldMessagesBeforeDate(
            //     this.conversationContext.conversationId,
            //     this.getBotId(),
            //     this.oldestLoadedDate()
            // );

            return messages;
        } catch (error) {
            return [];
        }
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

    renderOptionsMenu(options) {
        return (
            <View style={chatStyles.moreOptionContainer}>
                {options.map((elem, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            disabled={
                                elem.key ===
                                BotInputBarCapabilities.share_contact
                            }
                            onPress={() => {
                                this.selectOption(elem.key);
                            }}
                            style={chatStyles.optionContainer}
                        >
                            <View
                                style={
                                    elem.key ===
                                    BotInputBarCapabilities.share_contact
                                        ? chatStyles.moreOptionImageContainerHide
                                        : chatStyles.moreOptionImageContainer
                                }
                            >
                                <Image
                                    style={elem.imageStyle}
                                    source={elem.imageSource}
                                />
                            </View>
                            <Text style={chatStyles.optionText}>
                                {elem.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    renderSearchBox() {
        return (
            <SearchBox
                ref={searchBox => {
                    this.searchBox = searchBox;
                }}
                data={this.state.searchBoxData}
                sendResponse={this.sendSearchBoxResponse.bind(this)}
                sendSearchQuery={this.sendSearchBoxQuery.bind(this)}
                onOpenInfo={this.openModalWithContent.bind(this)}
            />
        );
    }

    renderChatInputBar() {
        const moreOptions = [
            {
                key: BotInputBarCapabilities.camera,
                imageStyle: { width: 16, height: 14 },
                imageSource: images.share_camera,
                label: I18n.t('Camera_option')
            },
            {
                key: BotInputBarCapabilities.photo_library,
                imageStyle: { width: 16, height: 14 },
                imageSource: images.share_photo_library,
                label: I18n.t('Gallery_option')
            },
            {
                key: BotInputBarCapabilities.bar_code_scanner,
                imageStyle: { width: 16, height: 14 },
                imageSource: images.share_code,
                label: I18n.t('Bar_code_option')
            },
            {
                key: BotInputBarCapabilities.file,
                imageStyle: { width: 14, height: 16 },
                imageSource: images.share_file,
                label: I18n.t('File_option')
            },
            {
                key: BotInputBarCapabilities.share_contact,
                imageStyle: { width: 16, height: 16 },
                imageSource: images.share_contact,
                label: I18n.t('Contact')
            },
            {
                key: BotInputBarCapabilities.pick_location,
                imageStyle: { width: 14, height: 16 },
                imageSource: images.share_location,
                label: I18n.t('Pick_Location')
            }
        ];

        return (
            // <KeyboardAvoidingView></KeyboardAvoidingView>
            <View>
                {this.state.showOptions && (
                    <View style={chatStyles.moreOptionContainer}>
                        {moreOptions.map((elem, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        this.selectOption(elem.key);
                                    }}
                                    style={chatStyles.optionContainer}
                                >
                                    <View
                                        style={
                                            chatStyles.moreOptionImageContainer
                                        }
                                    >
                                        <Image
                                            style={elem.imageStyle}
                                            source={elem.imageSource}
                                        />
                                    </View>
                                    <Text style={chatStyles.optionText}>
                                        {elem.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <ChatInputBar
                    accessibilityLabel="Chat Input Bar"
                    testID="chat-input-bar"
                    network={this.state.network}
                    onSend={this.onSendMessage.bind(this)}
                    onSendAudio={this.onSendAudio.bind(this)}
                    options={moreOptions}
                    botId={this.getBotId()}
                    onPlusButtonPressed={this.onPlusButtonPressed.bind(this)}
                    showMoreOption={this.state.showOptions}
                    closeShowOptions={() => {
                        if (Platform.OS === 'ios') {
                            LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                            );
                        }
                        this.setState({ showOptions: false });
                    }}
                />
            </View>
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
            (network === NETWORK_STATE.none ||
                network === NETWORK_STATE.satellite)
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

    renderChatModal() {
        return (
            <ChatModal
                content={this.state.chatModalContent}
                isVisible={this.state.isModalVisible}
                backdropOpacity={0.1}
                onBackButtonPress={this.hideChatModal.bind(this)}
                onBackdropPress={() => this.setState({ isModalVisible: false })}
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 0
                }}
            />
        );
    }

    hideChatModal() {
        this.setState({ isModalVisible: false });
    }

    openModalWithContent(content) {
        this.setState({
            chatModalContent: content,
            isModalVisible: true
        });
    }

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

    render() {
        if (!this.botLoaded) {
            return (
                <View style={chatStyles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        if (this.props.call) {
            return <View />;
        }
        // react-native-router-flux header seems to intefere with padding. So
        // we need a offset as per the header size
        return (
            <SafeAreaView style={chatStyles.safeArea}>
                <BackgroundImage
                    accessibilityLabel="Messages List"
                    testID="messages-list"
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : null}
                        keyboardVerticalOffset={
                            Constants.DEFAULT_HEADER_HEIGHT +
                            (Utils.isiPhoneX() ? 24 : 0)
                        }
                        enabled
                    >
                        <TouchableWithoutFeedback
                            style={{ flex: 1 }}
                            disabled={!this.state.showOptions}
                            onPress={this.onRandomTap.bind(this)}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <FlatList
                                    // onEndReached={() => {
                                    //     this.readLambdaQueue();
                                    // }}
                                    // onEndReachedThreshold={-0.2}
                                    extraData={this.state.messages}
                                    style={chatStyles.messagesList}
                                    keyboardShouldPersistTaps="handled"
                                    ListFooterComponent={this.renderSmartSuggestions()}
                                    accessibilityLabel="Messages List"
                                    testID="messages-list"
                                    ref={list => {
                                        this.chatList = list;
                                        // this.checkForScrolling();
                                    }}
                                    data={this.state.messages}
                                    renderItem={this.renderItem.bind(this)}
                                    onLayout={this.onChatListLayout.bind(this)}
                                    refreshControl={
                                        <RefreshControl
                                            colors={['#9Bd35A', '#689F38']}
                                            refreshing={this.state.refreshing}
                                            onRefresh={this.onRefresh.bind(
                                                this
                                            )}
                                        />
                                    }
                                    onScrollToIndexFailed={this.onScrollToIndexFailed.bind(
                                        this
                                    )}
                                />
                                {this.state.showSlider
                                    ? this.renderSlider()
                                    : null}
                                {this.state.showSearchBox
                                    ? this.renderSearchBox()
                                    : this.renderChatInputBar()}
                                {this.renderNetworkStatusBar()}
                                {/* {this.renderCallModal()} */}
                                {this.renderChatModal()}
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </BackgroundImage>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    botState: state.bots
});
const mapDispatchToProps = dispatch => {
    return {
        setLoadedBot: bot => dispatch(setLoadedBot(bot))
    };
};

export default ChatBotScreen;
