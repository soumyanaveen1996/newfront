import React from 'react';
import _ from 'lodash';
import {
    Keyboard,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    View,
    Image,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Platform,
    LayoutAnimation,
    UIManager,
    FlatList,
    RefreshControl,
    TouchableHighlight
} from 'react-native';
import moment from 'moment';
import Orientation from 'react-native-orientation-locker';

import Permissions from 'react-native-permissions';
import VersionCheck from 'react-native-version-check';
import versionCompare from 'semver-compare';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import mime from 'react-native-mime-types';
import {
    BarIndicator,
    PulseIndicator,
    WaveIndicator
} from 'react-native-indicators';
import Modal from 'react-native-modal';
import { WebView } from 'react-native-webview';
import Promise from '../../lib/Promise';
import chatStyles from './styles';
import RBSheet from 'react-native-raw-bottom-sheet';
import ChatInputBar from './ChatComponents/ChatInputBar';
import ChatStatusBar from '../../widgets/ChatStatusBar';
import ChatMessage from './ChatComponents/ChatMessage';
import CallModal from './ChatComponents/CallModal';
import ChatModal from './ChatComponents/ChatModal';
import { Slider } from './ChatComponents/Widgets/Slider';
import { BotContext } from '../../lib/botcontext';
import DeviceInfo from 'react-native-device-info';
const hasNotch = DeviceInfo.hasNotch();

import {
    Message,
    Contact,
    MessageTypeConstants,
    Auth,
    ConversationContext,
    Media,
    Resource,
    ResourceTypes,
    Utils as UtilsCapability,
    TCPClient,
    TCP
} from '../../lib/capability';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import Config, { BOT_LOAD_RETRIES } from './config';
import Constants from '../../config/constants';
import Utils from '../../lib/utils';
import { BotInputBarCapabilities, SLIDER_HEIGHT } from './config/BotConstants';
import { MessageHandler } from '../../lib/message';
import { NetworkHandler, Queue, NETWORK_STATE } from '../../lib/network';
// import { MessageCounter } from '../../lib/MessageCounter';
import {
    EventEmitter,
    SatelliteConnectionEvents,
    MessageEvents,
    TablesEvents,
    TrackerEvents,
    CallsEvents,
    TimelineEvents
} from '../../lib/events';
import images from '../../images';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import { SmartSuggestions } from './ChatComponents/SmartSuggestions';
import { MapMessage } from './ChatComponents/ConversationalMapMessage';
import { BackgroundImage } from '../../widgets/BackgroundImage';
import {
    setLoadedBot,
    setDebugEnabledByBot,
    messageBroadcastByBot
} from '../../redux/actions/BotActions';
import {
    setFirstLogin,
    updateNonConvChat,
    updateNonConvControlsList,
    setCurrentConversationId,
    setCurrentMap,
    setNetwork,
    setNetworkMsgUI
} from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';
import { ButtonMessage } from './ChatComponents/ButtonMessage';
import { Form2Message } from './ChatComponents/Form2Message';
import {
    formStatus,
    formUpdateAction,
    videoCallActions,
    tableActions
} from './ChatComponents/Form2Message/config';

import { MarkerIconTypes } from './ChatComponents/MapView/config';
import { SearchBox, SearchBoxBotAction } from './ChatComponents/SearchBox';
import { ControlDAO, ConversationDAO } from '../../lib/persistence';
import ChartMessage from './ChatComponents/ChartMessage';
import NetworkButton from '../../widgets/Header/NetworkButton';
import MessageManager from '../../lib/conversation/MessageManager';
import { MapView } from './ChatComponents/MapView';
import {
    ChatNotificationBar,
    NonConversationalControlsList
} from './ChatComponents/NonConversationalControl';
import FormsEvents from '../../lib/events/Forms';
import Icons from '../../config/icons';

import GlobalColors from '../../config/styles';
import Bugsnag from '../../config/ErrorMonitoring';
import ContactsEvents from '../../lib/events/Contacts';
import ConversationServices from '../../apiV2/ConversationServices';
import FullScreenMessage from './ChatComponents/FullScreenMessage/FullScreenMessage';
import ContainersEvents from '../../lib/events/Containers';
import MenusEvents from '../../lib/events/Menus';
import { htmlMessagesEvents } from '../../lib/events/MessageEvents';
import ChatBubblesOverlay from './ChatComponents/FullScreenMessage/ChatBubblesOverlay';
import { setWaitingForMessage } from '../../redux/actions/MessageStateActions';
import { Conversation } from '../../lib/conversation';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import UserInactivity from 'react-native-user-inactivity';
import BackgroundTimer from 'react-native-user-inactivity/lib/BackgroundTimer';
import { Connection } from '../../lib/events/Connection';
import PermissionList from '../../lib/utils/PermissionList';
import NavigationAction from '../../navigation/NavigationAction';
import TimelineBuilder from '../../lib/TimelineBuilder/TimelineBuilder';
import WebsocketQueueClient from '../../lib/network/WebsocketQueueClient';
import SocketStatus from '../../widgets/Header/SocketStatus';
import BotDownloadStatus from '../../widgets/Header/BotDownloadStatus';
import TCPConnectionHandler from '../../lib/network/TCPConnectionHandler';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AlertDialog from '../../lib/utils/AlertDialog';
import SimpleLoader from '../../widgets/SimpleLoader';
import NetwokStatusBar from '../../widgets/NetworkStatusBar/NetwokStatusBar';
const { pageSize } = Config.ChatMessageOptions;
import * as Progress from 'react-native-progress';

const R = require('ramda');
//TODO: review for optimization

const chatInputMoreOptions = [
    {
        key: BotInputBarCapabilities.camera,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareCamera({ color: 'rgb(99,141,255)' }),
        label: 'Camera'
    },
    // TODO
    // {
    //     key: BotInputBarCapabilities.video,
    //     imageStyle: { width: 16, height: 14, resizeMode: 'contain', backgroundColor: 'green' },
    //     imageSource: images.take_video,
    //     label: I18n.t('Video_option')
    // },

    // now used in input filed icons
    {
        key: BotInputBarCapabilities.photo_library,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareImageNew({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Gallery_option')
    },
    {
        key: BotInputBarCapabilities.video_library,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareVideo({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Video_gallery_option')
    },
    {
        key: BotInputBarCapabilities.share_contact,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareContact({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Contact')
    },
    {
        key: BotInputBarCapabilities.pick_location,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareLocation({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Pick_Location')
    },
    {
        key: BotInputBarCapabilities.file,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareFile({
            color: 'rgb(99,141,255)',
            size: 22
        }),
        label: I18n.t('File_option')
    }
];

const chatInputMoreOptionsWithQR = [
    {
        key: BotInputBarCapabilities.camera,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareCamera({ color: 'rgb(99,141,255)' }),
        label: 'Camera'
    },
    // TODO
    // {
    //     key: BotInputBarCapabilities.video,
    //     imageStyle: { width: 16, height: 14, resizeMode: 'contain', backgroundColor: 'green' },
    //     imageSource: images.take_video,
    //     label: I18n.t('Video_option')
    // },

    // now used in input filed icons
    {
        key: BotInputBarCapabilities.photo_library,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareImageNew({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Gallery_option')
    },
    {
        key: BotInputBarCapabilities.video_library,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareVideo({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Video_gallery_option')
    },
    {
        key: BotInputBarCapabilities.share_contact,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareContact({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Contact')
    },
    {
        key: BotInputBarCapabilities.pick_location,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareLocation({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Pick_Location')
    },
    {
        key: BotInputBarCapabilities.file,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareFile({
            color: 'rgb(99,141,255)',
            size: 22
        }),
        label: I18n.t('File_option')
    },
    {
        key: BotInputBarCapabilities.bar_code_scanner,
        imageStyle: { width: 24, height: 24 },
        imageSource: Icons.shareBarcode({ color: 'rgb(99,141,255)' }),
        label: I18n.t('Bar_code_option')
    }
];

class ChatBotScreen extends React.Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'ios') {
            UIManager.setLayoutAnimationEnabledExperimental &&
                UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        console.log('xxxxxxxxx ChatBotScreen ', props);
        this.bot = props.route.params.bot;
        this.conversational = this.bot.conversational;
        this.loadedBot = undefined;
        this.messageQueue = [];
        this.persistMessageQueue = [];
        this.processingMessageQueue = false;
        this.processingpersistMessageQueue = false;
        this.camera = null;
        this.allLocalMessagesLoaded = false;
        this.totalEntries = 0;
        this.otherUserName = props.route.params.otherUserName;
        if (!this.otherUserName && props.route.params.channelId === undefined) {
            this.otherUserName = props.route.params?.bot.botName;
        }
        this.instanceId = Date.now();
        this.state = {
            botLoaded: false,
            conversational: undefined,
            smartSuggesions: [],
            messages: [],
            nonConversationalChatList: [],
            nonConversationalScreenList: [],
            // typing: '',
            showSlider: false,
            fetchingNewMessages: false,
            sliderClosed: false,
            chatModalContent: null,
            isModalVisible: false,
            showOptions: false,
            showSearchBox: false,
            searchBoxData: null,
            currentMap: null,
            currentUser: null,
            allContacts: [],
            bottomLoaded: true,
            isWaiting: false,
            loadActivity: false,
            isModalViewVisibile: false,
            modalMessage: null,
            modalUrl: null,
            isNonConversationalModal: undefined,
            nonConversationalFullScreenLoaded: false,
            isTimeOutModalVisible: false,
            providerName: null,
            softwareMfaEnabled: null,
            forBotChatScreenBotName: null,
            forPeoplechatOtherUserName: null,
            forPeopleChatMineUserName: null,
            network: 'none',
            currentConvContact: null,
            upDateForMsgStatus: false,
            botLoading: true
        };
        this.defaultInputHeight = 105;

        this.moreMessagesExist = true;
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
        this.disableScannerOptionForIMbot = false;
        this.botImageAndName = null;
        this.RBUserOptions = null;
        this.checkForOrientation = 'force-portrait'; // 'auto-rotate'|| 'force-portrait', 'force-landscape',
    }
    // orientation  = { 'auto-rotate'|| 'force-portrait', 'force-landscape', will came from bot side
    loadBot = async () => {
        try {
            const botResp = await this.dce_bot.Load(this.botContext);
            return botResp;
        } catch (e) {
            console.log('Bot: load error', e);
            return null;
        }
    };

    goBack = () => {
        NavigationAction.pop();
    };
    shouldComponentUpdate(nextProps, nextState) {
        // if(this.state.botLoaded)
        if (this.state.conversational) {
            if (
                nextState.messages &&
                nextState.messages.length !== this.state.messages.length
            ) {
                return true;
            }
            if (nextState.isModalVisible !== this.state.isModalVisible) {
                return true;
            }
            if (
                nextState.upDateForMsgStatus !== this.state.upDateForMsgStatus
            ) {
                return true;
            }
            if (
                nextState.currentConvContact !== this.state.currentConvContact
            ) {
                return true;
            }
            if (nextState.loadActivity !== this.state.loadActivity) {
                return true;
            }
            if (nextState.showOptions !== this.state.showOptions) {
                return true;
            }
            if (
                nextState.fetchingNewMessages !== this.state.fetchingNewMessages
            ) {
                return true;
            }
            if (nextState.showSearchBox !== this.state.showSearchBox) {
                return true;
            }
            if (nextState.modalUrl !== this.state.modalUrl) {
                return true;
            }
            if (nextState.modalMessage !== this.state.modalMessage) {
                return true;
            }
            if (
                nextState.isModalViewVisibile !== this.state.isModalViewVisibile
            ) {
                return true;
            }
            return false;
        } else if (this.state.conversational == false) {
            return true;
        } else {
            return true;
        }
    }

    async componentDidMount() {
        // TODO: Remove mounted instance variable when we add some state mangement to our app.
        this.chatOpenTime = moment().valueOf();
        this.authData();
        console.log('DID MOUNT: .......................', this.bot);
        Store.dispatch(
            setLoadedBot({
                sourceBot: this.bot.botId,
                newBotId: this.bot.botId,
                domain: this.bot.userDomain,
                instanceId: this.instanceId
            })
        );
        Store.dispatch(setFirstLogin(false));
        this.mounted = true;
        const self = this;

        // Ask to activate push notifications
        this.askNotificationPermission();

        if (this.conversational === undefined && this.bot.botId === 'im-bot')
            this.conversational = true;
        if (this.bot.botId === 'im-bot') {
            this.disableScannerOptionForIMbot = true;
        }

        // 0. load the bot
        for (let i = 0; i < BOT_LOAD_RETRIES; i++) {
            try {
                const botResponse = await this.loadBot();
                self.loadedBot = botResponse;
                this.setState({ botLoading: false });
                console.log('~~~~~~~~~~~~~~ bot loaded ~~~~~~~~~~~~~~');
                break;
            } catch (error) {
                console.error('Bot load error', error);
                Bugsnag.notify(error, (report) => {
                    report.context = 'ChatBotScreen boat load';
                });
            }
        }

        if (!self.loadedBot) {
            AlertDialog.show(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_load_failed'),
                [{ text: 'OK', onPress: this.goBack }]
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
            AlertDialog.show(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_max_version_error'),
                [{ text: 'OK', onPress: this.goBack }]
            );
            return;
        }

        try {
            // The order if calls is critical so that all resources are loaded correctly

            //TODO: ====== chek and mplemet this
            // if (this.props.navigation) {
            //     this.props.navigation.setParams({
            //         conversational: this.conversational,
            //         botName: this.bot.name,
            //         openNonConvChat: this.openNonConvChat.bind(this),
            //         closeBot: () => this.closeBot(this.botDone)
            //     });
            // }

            // if (this.props.onBack) {
            //     this.props.navigation.setParams({ onBack: this.props.onBack });
            // =======}

            // 1. Get the user                                          //NOT USED
            self.user = Auth.getUserData();
            // 2. Get the conversation context from parent
            self.conversationContext = await this.getConversationContext(
                this.botContext,
                this.user
            );

            if (this.conversational !== undefined) {
                this.setState({ botLoaded: true });
            }
            console.log('caling init on bot');
            // 5. Kick things off by calling init on the bot
            this.sendInitialMessage();

            // 6. If there are async results waiting - pass them on to the bot
            self.flushPendingAsyncResults();
            // 7. Now that bot is open - add a listener for async results coming in
            self.eventSubscription = EventEmitter.addListener(
                MessageEvents.messageProcessed,
                this.handleMessageEvents
            );
            self.TCPeventSubscription = EventEmitter.addListener(
                MessageEvents.TCPmessageRecieved,
                this.handleMessageEvents
            );
            self.eventSendSubscription = EventEmitter.addListener(
                MessageEvents.messageSend,
                this.handleMessageEventsSend
            );
            self.eventBackgroundSendSubscription = EventEmitter.addListener(
                MessageEvents.backgroundMessageSend,
                this.handleBackgroundSend
            );
            self.sendMessageSubscribtion = EventEmitter.addListener(
                'SendBotMessage',
                (message) => {
                    this.sendMessage(message);
                }
            );
            self.locationUpdate = EventEmitter.addListener(
                MessageEvents.LocationUpdate,
                (locationEvent) => {
                    this.sendMessage(locationEvent.message);
                }
            );

            self.fullScreenMessageUpdateListener = EventEmitter.addListener(
                'RefreshFullScreenMessage',
                () => {
                    this.forceUpdate();
                }
            );

            if (this.props.route.params.videoCallData) {
                NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                    data: this.props.route.params.videoCallData,
                    userId: this.getUserId(),
                    sendMessage: this.sendMessage
                });
            }

            this.markMessagesAsRead();
            // 8. Mark new messages as read

            // 9. Stash the bot for nav back for on exit
            //TODO:
            // this.props.navigation.setParams({
            //     botDone: this.botDone.bind(this)
            // });

            // 3. Get messages for this bot / chat
            console.log(' Get messages for this bot / chat');
            const messages = await this.loadMessages(true);
            console.log(' got messages ');
            // Find the first non-read message and use scrollToIndex.
            let index = 0;
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];

                if (msg.message.isRead()) {
                    index = i;
                    break;
                }
            }
            this.firstUnreadIndex = index;
            if (index !== 0 && this.chatList) {
                this.chatList.scrollToIndex({ index });
                // this.scrollToBottom = true;
            }

            if (!this.mounted) {
                return;
            }
            console.log('reading contacts ');
            await Contact.getAddedContacts().then(async (contacts) => {
                // eslint-disable-next-line max-len
                const otherUserId = ConversationContext.getOtherUserId(
                    this.conversationContext,
                    this.user
                );
                this.setState(
                    {
                        currentConvContact:
                            contacts &&
                            contacts.find(
                                (contact) => contact.userId === otherUserId
                            )
                    },
                    console.log(
                        'chatbotscreen: chatbotscreen: currentConvContact',
                        this.state.currentConvContact
                    )
                );
            });

            let allMessages = messages;
            allMessages = allMessages.slice(0, pageSize);
            if (this.state.messages && this.state.messages.length > 0) {
                const newMessages = [];
                let currentMsgData = this.state.messages;
                currentMsgData.forEach((currentMessage) => {
                    if (
                        allMessages.find(
                            (message) => message.key === currentMessage.key
                        ) === undefined
                    ) {
                        newMessages.push(currentMessage);
                    } else {
                    }
                });
                allMessages = newMessages.concat(allMessages);
            }

            // 4. Update the state of the bot with the messages we have
            // let convertedGroupByDate = this.addSessionStartMessages(
            //     allMessages
            // );
            let newFormattedData = this.addSessionStartMessages(allMessages);
            this.setState({
                messages: newFormattedData
            });
            this.setState({
                showSlider: false,
                conversational: this.conversational
            });
        } catch (e) {
            // TODO: handle errors
            console.log(e);
            self.setState({ botLoaded: false });
            Bugsnag.notify(e, (report) => {
                report.context = 'ChatBotScreen boat load2';
            });
        }

        // this.keyboardWillShowListener = Keyboard.addListener(
        //     'keyboardWillShow',
        //     this.keyboardWillShow.bind(this)
        // );
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow
        );

        // this.keyboardWillHideListener = Keyboard.addListener(
        //     'keyboardWillHide',
        //     this.keyboardWillHide.bind(this)
        // );

        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.keyboardDidHide
        );

        // this.removeEventListener = Network.addConnectionChangeEventListener(
        //     this.handleConnectionChange
        // );
        this.networkListener = EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleConnectionChange
        );
        this.satelliteConnectedListener = EventEmitter.addListener(
            SatelliteConnectionEvents.connectedToSatellite,
            this.satelliteConnectionHandler
        );
        this.satelliteNotConnectedListener = EventEmitter.addListener(
            SatelliteConnectionEvents.notConnectedToSatellite,
            this.satelliteDisconnectHandler
        );

        //TODO:
        // this.props.navigation.setParams({
        //     refresh: this.readLambdaQueue.bind(this)
        // });

        Store.dispatch(
            setCurrentConversationId(this.conversationContext.conversationId)
        );

        // TCP.sendMessage({
        //     dest_port: 1337,
        //     dest_ip: '52.20.47.203',
        //     msg: '1234567890,01,N13.02920E77.70326'
        // });
    }

    markMessagesAsRead = () => {
        MessageHandler.markUnreadMessagesAsRead(
            this.conversationContext.conversationId
        ).then(() => {
            ConversationServices.updateMessageStatus(
                this.conversationContext.conversationId,
                undefined,
                'opened',
                this.user,
                this.bot.userDomain
            ).then((_) => {});

            ConversationDAO.resetUnreadCount(
                this.conversationContext.conversationId
            );
        });
    };

    sendInitialMessage = () => {
        if (
            WebsocketQueueClient.isConnected() ||
            Store.getState().user.socketAlive != 'starting'
        ) {
            this.loadedBot.init(
                this.botState,
                this.state.messages,
                this.botContext
            );
            this.setState({ waitingForMessage: true });
        } else {
            const socketListener = EventEmitter.addListener(
                TimelineEvents.socketConnected,
                () => {
                    this.loadedBot.init(
                        this.botState,
                        this.state.messages,
                        this.botContext
                    );
                    this.setState({ waitingForMessage: true });
                    socketListener.remove();
                }
            );
            console.log('Launching:::: socket not ready launch bot wait');
        }

        // Reading the queue 3 times just to wait till socket connects.
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.readLambdaQueue();
            }, i * 10000);
        }
    };

    authData = () => {
        const {
            info: { softwareMfaEnabled },
            provider: { name }
        } = Auth.getUserData();
        this.setState({
            providerName: name,
            softwareMfaEnabled: softwareMfaEnabled
        });
    };

    async askNotificationPermission() {
        // try {
        //     Notification.checkPermissions(res => {
        //         if (!(res && res.registered && res.registered.isRegistered)) {
        //             Notification.requestPermission();
        //         }
        //     });
        // } catch (e) {
        //     console.log('error', e);
        // }
    }

    static async onEnter() {
        await Contact.getAddedContacts().then(async (contacts) => {
            // eslint-disable-next-line max-len
            const otherUserId = ConversationContext.getOtherUserId(
                this.conversationContext,
                this.user
            );

            this.setState({
                currentConvContact:
                    contacts &&
                    contacts.find((contact) => contact.userId === otherUserId)
            });
        });
        //TODO: implemet pop for this logic
        // const shouldPop =
        //     Actions.refs.peopleChat &&
        //     Actions.refs.peopleChat.props.call &&
        //     Actions.prevScene === 'phone';
        // if (shouldPop) {
        //     Actions.pop();
        // }
    }

    openNonConvChat() {
        NavigationAction.push(NavigationAction.SCREENS.nonConversationalChat, {
            onSend: this.onSendMessage,
            sendMessage: this.sendMessage,
            bot: this.bot,
            conversationContext: this.conversationContext
        });
    }

    botDone = () => {
        // const types = this.state.messages.map((message) =>
        //     message.message.getMessageType()
        // );
        const all_messages = this.state.messages.filter(
            (message) => message.message.getMessageType() !== 'background_event'
        );
        this.loadedBot.done(
            null,
            this.botState,
            all_messages,
            // this.state.messages,
            this.botContext
        );
    };

    closeBot(paramsBotDone) {
        const botDone = this.botDone || paramsBotDone;
        if (botDone) botDone();
        if (
            NavigationAction.currentScreen() === 'botChat' ||
            NavigationAction.currentScreen() === 'onboarding'
        ) {
            NavigationAction.pop();
        }
    }

    sessionStartMessageForDate = (momentObject) => {
        const sMessage = new Message({
            addedByBot: true,
            messageDate: momentObject.valueOf()
        });
        sMessage.sessionStartMessage();
        return sMessage.toBotDisplay();
    };

    addSessionStartMessages(messages) {
        const filteredMessages = _.filter(
            messages,
            (item) =>
                item.message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_SESSION_START
        );

        _.sortBy(filteredMessages, (msg) => {
            return new Date(msg.message.getMessageDate()).getTime();
        });

        if (filteredMessages.length > 0) {
            for (var i = 0; i < filteredMessages.length; i++) {
                let showTime = false;
                if (i < filteredMessages.length - 1) {
                    const currentMessage = filteredMessages[i].message;
                    const nextMessage = filteredMessages[i + 1].message;
                    const currentDate = moment(currentMessage.getMessageDate());
                    const nextDate = moment(nextMessage.getMessageDate());
                    if (
                        currentMessage.getCreatedBy() !=
                        nextMessage.getCreatedBy()
                    ) {
                        showTime = true;
                    } else {
                        if (
                            !(
                                (currentDate.valueOf() - nextDate.valueOf()) /
                                    1000 <
                                60
                            ) ||
                            nextMessage.isMessageByBot() !==
                                currentMessage.isMessageByBot()
                        ) {
                            showTime = true;
                        } else if (i === filteredMessages.length - 1) {
                            showTime = true;
                        }
                    }
                } else {
                    showTime = true;
                }
                filteredMessages[i].showTime = showTime;
            }
        }

        const resultMessages = [];
        if (filteredMessages.length > 0) {
            let currentDate = moment(
                filteredMessages[0].message.getMessageDate()
            );
            if (
                currentDate.dayOfYear() !== moment().dayOfYear() &&
                moment().year() !== currentDate.year()
            ) {
                resultMessages.push(this.sessionStartMessageForDate(moment()));
            }
            for (var i = 0; i < filteredMessages.length; i++) {
                const botMessage = filteredMessages[i];
                const { message } = botMessage;
                const date = moment(message.getMessageDate());
                if (
                    date.dayOfYear() !== currentDate.dayOfYear() ||
                    date.year() !== currentDate.year()
                ) {
                    resultMessages.push(
                        this.sessionStartMessageForDate(currentDate)
                    );
                    currentDate = date;
                }
                resultMessages.push(botMessage);
            }
            resultMessages.push(this.sessionStartMessageForDate(currentDate));
        } else {
            // for removing Today date if no msgs in chat for today
            // console.log('i m here -----123---123');

            const currentDate = moment();
            resultMessages.push(this.sessionStartMessageForDate(currentDate));
        }

        return resultMessages;
    }

    readLambdaQueue() {
        NetworkHandler.readLambda();
    }

    async componentWillUnmount() {
        TCPConnectionHandler.destroy();
        // console.log('~~~~~~~ setLoadedBot to null');
        Store.dispatch(
            setLoadedBot({
                sourceBot: this.bot.botId,
                newBotId: null,
                instanceId: this.instanceId
            })
        );
        if (this.checkForOrientation === 'force-landscape') {
            Orientation.lockToPortrait();
        }

        await ConversationServices.updateMessageStatus(
            this.conversationContext?.conversationId,
            undefined,
            'opened',
            this.user,
            this.bot.userDomain
        );

        TimelineBuilder.buildTiimeline();
        this.mounted = false;
        Store.dispatch(setCurrentConversationId(''));
        Store.dispatch(setDebugEnabledByBot(false));
        Store.dispatch(
            updateNonConvChat({
                list: [],
                id: this.bot.botId,
                instanceId: this.instanceId
            })
        );
        Store.dispatch(
            updateNonConvControlsList({
                list: [],
                id: this.bot.botId,
                src: 'chatbot screen componentWillUnmount',
                instanceId: this.instanceId
            })
        );
        // Remove the event listener - CRITICAL to do to avoid leaks and bugs
        if (this.eventSubscription) {
            this.eventSubscription.remove();
        }
        if (this.TCPeventSubscription) {
            this.TCPeventSubscription.remove();
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
        this.locationUpdate?.remove();
        if (this.removeEventListener) this.removeEventListener();
        if (this.sendMessageSubscribtion) this.sendMessageSubscribtion.remove();
        this.satelliteConnectedListener?.remove();
        this.satelliteNotConnectedListener.remove();
        this.networkListener?.remove();
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

    handleConnectionChange = (connection) => {
        if (connection.type === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            });
        } else if (this.state.network === 'none') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            });
        }
    };

    getBotId = () => {
        return this.props.route.params.bot.botId;
    };

    keyboardDidShow = () => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
            this.setState({ showOptions: false, showSlider: false });
        }
    };

    keyboardDidHide = () => {
        if (Platform.OS === 'ios') {
            this.setState({
                showSlider: this.state.showOptions
                    ? false
                    : this.sliderPreviousState
            });
        }
    };

    handleMessageEventsSend = (event) => {
        if (!event || event.botId !== this.getBotId()) {
            return;
        }
        // console.log('~~~~~~~ handleMessageEvents send', event);
        this.sendMessage(event.message);
    };

    handleTCPMessageEventsSend = (event) => {
        this.sendMessage(event.message);
    };

    handleBackgroundSend = (event) => {
        if (
            !event ||
            event.conversationId !== this.conversationContext.conversationId
        ) {
            return;
        }
        console.log('**MSG Q** message sent in bacgrouund', event);
        this.queueMessage(event.message);
    };

    handleMessageEvents = (event) => {
        if (!event || event.botId !== this.getBotId()) {
            if (event.origin === 'TCP') {
                console.log(
                    '~~~~TCPClient **MSG ** message sent to bot',
                    event.message
                );
                this.loadedBot.asyncResult(
                    event.message,
                    this.botState,
                    this.state.messages,
                    this.botContext
                );
            }

            return;
        }
        console.log('~~~~ message sent to bot', event);
        this.loadedBot.asyncResult(
            event.message,
            this.botState,
            this.state.messages,
            this.botContext
        );
    };

    handleAsyncMessageResult(event) {
        // Don't handle events that are not for this bot
        if (!event || event.key !== this.conversationContext.conversationId) {
            return;
        }
        this.loadedBot.asyncResult(
            event.result,
            this.botState,
            this.state.messages,
            this.botContext
        );
        // console.log('%c ~~~~~~~ handleAsyncMessageResult passed to asyncResult', 'color:green', event.message);
        // Delete the network result now
        return Queue.deleteNetworkRequest(event.id);
    }

    // Clear out any pending network asyn results that need to become messages
    async flushPendingAsyncResults() {
        const self = this;

        Queue.selectCompletedNetworkRequests(
            this.conversationContext.conversationId
        ).then((pendingAsyncResults) => {
            pendingAsyncResults = pendingAsyncResults || [];
            pendingAsyncResults.forEach((pendingAsyncResult) => {
                self.handleAsyncMessageResult(pendingAsyncResult);
            });
        });
    }

    invokeWait = () => {
        if (this.state.conversational === false) {
            this.setState({ isWaiting: true });
            Store.dispatch(setWaitingForMessage(true));
            return;
        }
        let currentMsgData = this.state.messages;
        if (
            currentMsgData.filter(
                (m) =>
                    m.message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_WAIT
            ).length > 0
        )
            return;
        const msg = new Message({ addedByBot: true });
        msg.waitMessage();
        this.queueMessage(msg);
    };

    wait = (shouldWait) => {
        if (shouldWait) {
            this.invokeWait();
        } else {
            this.stopWaiting();
        }
    };

    stopWaiting = () => {
        if (this.state.conversational === false) {
            this.setState({ isWaiting: false });
            Store.dispatch(setWaitingForMessage(false));
            return;
        }
        this.messageQueue = _.filter(
            this.messageQueue,
            (message) =>
                message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_WAIT
        );
        let currentMsgData = this.state.messages;

        const messages = _.filter(
            currentMsgData,
            (item) =>
                item.message.getMessageType() !==
                MessageTypeConstants.MESSAGE_TYPE_WAIT
        );
        this.updateMessages(messages);
    };

    isMessageBeforeToday = (message) =>
        moment(message.getMessageDate()).isBefore(moment(), 'day');

    addSessionStartMessage = (messages) =>
        new Promise((resolve) => {
            if (
                messages.length === 0 ||
                this.isMessageBeforeToday(messages[messages.length - 1].message)
            ) {
                const sMessage = new Message({
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
                    .catch(() => {
                        resolve();
                    });
            } else {
                resolve();
            }
        });

    tell = (message) => {
        const {
            _messageType,
            _msg,
            _options,
            _status,
            _uuid,
            _createdBy,
            _messageDate
        } = message;
        console.log(
            `%c ~~~~~~ new *MSG* tell() from bot ${message.getMessageType()}`,
            'color:red',
            message.getMessage(),
            message.getMessageOptions()
        );

        if (
            NavigationAction.currentScreen() === NavigationAction.SCREENS.jitsi
        ) {
            console.log('~~~~~~ new message ignred');
            return;
        }
        this.stopWaiting();
        // this.countMessage(message);

        // Update the bot interface
        // Push a new message to the end
        if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_SMART_SUGGESTIONS &&
            this.conversational
        ) {
            if (this.chatState.updatingChat) {
                this.chatState.nextSmartSuggestion = message;
            } else {
                this.updateSmartSuggestions(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_RUN_MODE
        ) {
            const msg = message.getMessage();
            if (this.conversational === undefined)
                this.conversational =
                    msg.conversational === undefined
                        ? true
                        : msg.conversational;
            this.setState({ botLoaded: true });
            if (msg.modal) {
                this.setState({
                    isNonConversationalModal: true,
                    conversational: this.conversational
                });
            } else {
                this.setState({
                    isNonConversationalModal: false,
                    conversational: this.conversational
                });
            }

            if (!this.conversational) {
                this.nonConvBackgroundType = msg.background.type;
                if (this.nonConvBackgroundType === 240) {
                    this.currentMapId = msg.background.content.options.mapId;
                    Store.dispatch(setCurrentMap(msg.background.content));
                }
                // const chatMessageList = this.state.messages.filter(
                //     (listMessage) =>
                //         listMessage.message.getMessageType() ===
                //         MessageTypeConstants.MESSAGE_TYPE_STRING
                // );
                // Store.dispatch(
                //     updateNonConvChat({
                //         list: chatMessageList,
                //         id: this.bot.botId
                //     })
                // );
                Store.dispatch(
                    updateNonConvControlsList({
                        list: [],
                        id: this.bot.botId,
                        src: ' MESSAGE_TYPE_RUN_MODE',
                        instanceId: this.instanceId
                    })
                );
                this.setState({
                    // nonConversationalScreenList: this.state.messages.filter(
                    //     listMessage => {
                    //         return (
                    //             listMessage.message.getMessageType() ===
                    //             MessageTypeConstants.MESSAGE_TYPE_FORM2 ||
                    //             listMessage.message.getMessageType() ===
                    //             MessageTypeConstants.MESSAGE_TYPE_TABLE ||
                    //             listMessage.message.getMessageType() ===
                    //             MessageTypeConstants.MESSAGE_TYPE_TRACKING_VIEW_MESSAGE
                    //         );
                    //     }
                    // ),
                    nonConversationalType: msg.type,
                    nonConversationalContent: msg.content
                });
                if (!msg.modal)
                    Store.dispatch(
                        updateNonConvChat({
                            list: [],
                            id: this.bot.botId,
                            instanceId: this.instanceId
                        })
                    );
            }
        } else if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION &&
            this.conversational === false
        ) {
            const content = message.getMessage();
            AlertDialog.show(undefined, content);
            this.setState({ nonConversationalFullScreenLoaded: true });
        } else if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CRITICAL_NOTIFICATION &&
            this.conversational === false
        ) {
            const content = message.getMessage();
            AlertDialog.show(undefined, content);
            this.setState({ nonConversationalFullScreenLoaded: true });
        } else if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_AUTHORIZATION_REQUEST &&
            this.conversational === false
        ) {
            console.log('~~~~~ auth ---', message);
            const content = message.getMessage();
            const { confirm, cancel } = content;
            const displayMessage = content.message;
            AlertDialog.show(undefined, displayMessage, [
                {
                    text: cancel || 'No',
                    onPress: () =>
                        this.sendAuthorizationresponse('cancel', content)
                },
                {
                    text: confirm || 'Yes',
                    onPress: () =>
                        this.sendAuthorizationresponse('confirm', content)
                }
            ]);
            this.setState({ nonConversationalFullScreenLoaded: true });
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_SEARCH_BOX
        ) {
            if (this.conversational) {
                const data = message.getMessage();

                if (data.action !== SearchBoxBotAction.CLOSE) {
                    this.setState({ showSearchBox: true, searchBoxData: data });
                    if (this.searchBox) {
                        this.searchBox.onResponseReceived();
                    }
                } else {
                    this.setState({
                        showSearchBox: false,
                        searchBoxData: null
                    });
                }
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
            let currentMsgData = this.state.messages;
            const foundIndex = currentMsgData.findIndex((element) => {
                const options = element.message.getMessageOptions();
                return (
                    options &&
                    element.message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_CHART &&
                    options.chartId === message.getMessageOptions().chartId
                );
            });
            if (foundIndex >= 0) {
                currentMsgData[foundIndex].message.chartMessage(
                    message.getMessage(),
                    {
                        ...message.getMessageOptions(),
                        update: true
                    }
                );
                this.setState({ messages: currentMsgData });
                this.updateChat(message);
            } else {
                this.updateChat(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CLOSE_FORM
        ) {
            const localControlId = message.getMessage().controlId
                ? message.getMessage().controlId +
                  this.conversationContext.conversationId
                : message.getMessage().formId +
                  this.conversationContext.conversationId;
            EventEmitter.emit(
                FormsEvents.complete,
                message.getMessage().formId
            );
            this.closeForm(localControlId);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MAP
        ) {
            if (
                (this.currentMapId &&
                    message.getMessageOptions().mapId === this.currentMapId) ||
                this.state.isNonConversationalModal === false
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
                EventEmitter.emit(FormsEvents.results, message);
            } else if (
                message.getMessageOptions().action === formUpdateAction.CHANGE
            ) {
                EventEmitter.emit(FormsEvents.change, message);
            } else if (
                message.getMessageOptions().action ===
                formUpdateAction.VALIDATION
            ) {
                EventEmitter.emit(FormsEvents.validation, message);
            } else {
                if (this.conversational) {
                    this.openForm(message);
                }
                EventEmitter.emit(FormsEvents.update, message);
                this.updateChat(message);
            }
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_TABLE
        ) {
            if (
                message.getMessageOptions().action ===
                    tableActions.CHANGE_FILTER ||
                message.getMessageOptions().action ===
                    tableActions.RESULT_FILTER
            ) {
                EventEmitter.emit(TablesEvents.newInfo, message);
            } else if (
                message.getMessageOptions().action === tableActions.RESULT
            ) {
                console.log('~~~~ triggering tabler but form results');
                EventEmitter.emit(FormsEvents.results, message);
            } else if (
                message.getMessageOptions().action ===
                formUpdateAction.VALIDATION
            ) {
                console.log('~~~~ triggering tabler but fprm validation');
                EventEmitter.emit(FormsEvents.validation, message);
            } else if (
                message.getMessageOptions().action === formUpdateAction.CHANGE
            ) {
                console.log('~~~~ Table change emitting table change');
                EventEmitter.emit(TablesEvents.change, message);
            } else if (
                message.getMessageOptions().action ===
                tableActions.CHANGE_COLUMN_TEMPLATE
            ) {
                console.log(
                    '~~~~ Table change emitting table templeate update'
                );
                EventEmitter.emit(TablesEvents.templateUpdate, message);
            } else {
                EventEmitter.emit(TablesEvents.updateTable, message);
                this.updateChat(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CALENDAR
        ) {
            // EventEmitter.emit(TablesEvents.updateTable, message);
            if (
                message.getMessageOptions().action ===
                    tableActions.CHANGE_FILTER ||
                message.getMessageOptions().action ===
                    tableActions.RESULT_FILTER
            ) {
                EventEmitter.emit(TablesEvents.newInfo, message);
            } else {
                this.updateChat(message);
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CONTAINER
        ) {
            EventEmitter.emit(ContainersEvents.updateContainer, message);
            this.updateChat(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_TRACKING_VIEW_MESSAGE
        ) {
            EventEmitter.emit(TrackerEvents.updateTracker, message);
            this.updateChat(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_CLOSE_CONTROL
        ) {
            const list = Store.getState().bots.nonConvControlsList[
                this.bot.botId
            ];
            const index = list.findIndex(
                (msg) =>
                    msg.message.getMessageOptions().controlId ===
                    message.getMessage()
            );
            if (index >= 0) {
                list.splice(index, 1);
                Store.dispatch(
                    updateNonConvControlsList({
                        list: [...list],
                        id: this.bot.botId,
                        src: ' MESSAGE_TYPE_CLOSE_CONTROL',
                        instanceId: this.instanceId
                    })
                );
            }
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_VIDEO_RESPONSE
        ) {
            if (
                message.getMessageOptions().action ===
                    videoCallActions.CALL_REJECTED &&
                NavigationAction.currentScreen() ===
                    NavigationAction.SCREENS.meetingRoom
            ) {
                NavigationAction.pop();
            }
        } else if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_VIDEO_CALL &&
            message.getMessage() &&
            message.getMessage().action === 'startVideo' &&
            NavigationAction.currentScreen() !==
                NavigationAction.SCREENS.meetingRoom
        ) {
            console.log('+++++ new VIDEO_CALL', message);
            console.log('+++++ goto call');
            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                sendMessage: this.sendMessage,
                userId: this.getUserId()
            });
        } else if (
            message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_VIDEO_CALL &&
            message.getMessage() &&
            message.getMessage().action === 'text' &&
            NavigationAction.currentScreen() ===
                NavigationAction.SCREENS.meetingRoom
        ) {
            console.log(
                '+++++ new VIDEOCALL display message ',
                message.getMessage().text
            );
            Store.dispatch(messageBroadcastByBot(message.getMessage().text));
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML
        ) {
            if (!this.conversational) {
                EventEmitter.emit(htmlMessagesEvents.update, message);
            } else {
                const messageOptions = message.getMessageOptions();
                const { autoPopUp, modal, htmlContent, url } = messageOptions;

                if (autoPopUp && !modal) {
                    if (_.isEmpty(htmlContent)) {
                        NavigationAction.pushNew(
                            NavigationAction.SCREENS.webview,
                            {
                                url
                            }
                        );
                    } else {
                        NavigationAction.pushNew(
                            NavigationAction.SCREENS.webview,
                            {
                                htmlString: htmlContent,
                                url
                            }
                        );
                    }
                } else if (modal) {
                    if (_.isEmpty(htmlContent)) {
                        this.setState({
                            isModalViewVisibile: true,
                            modalUrl: url
                        });
                    } else {
                        this.setState({
                            isModalViewVisibile: true,
                            modalMessage: htmlContent
                        });
                    }
                }
            }
            this.updateChat(message);
        } else if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MENU
        ) {
            EventEmitter.emit(MenusEvents.update, message);
            this.updateChat(message);
        } else if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_VOICE_CALL
        ) {
            const callMessage = message.getMessage();

            if (callMessage.action === 'call') {
                if (NavigationAction.currentScreen() === 'dialler') {
                    this.sendVoiceMessageToBot(
                        'error',
                        callMessage.controlId,
                        'another call in progress'
                    );
                } else {
                    NavigationAction.push(NavigationAction.SCREENS.dialler, {
                        call: true,
                        number: callMessage.number,
                        newCallScreen: true,
                        sendVoiceMessageToBot: this.sendVoiceMessageToBot,
                        controlId: callMessage.controlId
                    });
                    setTimeout(() => {
                        EventEmitter.emit(CallsEvents.callTerminate);
                    }, 3000);
                }
            } else if (callMessage.action === 'hangup') {
                EventEmitter.emit(CallsEvents.callTerminate);
            }
        } else {
            this.updateChat(message);
        }
    };

    sendVoiceMessageToBot = (action, controlId, message) => {
        // console.log('~~~~ sendVoiceMessageToBot', action);
        const reponseMessage = new Message();
        reponseMessage.messageByBot(false);
        reponseMessage.setCreatedBy(this.getUserId());
        reponseMessage.voiceCallResponseMessage({ controlId, action, message });
        this.sendMessage(reponseMessage);
    };

    devMode = (isEnabled = true) => {
        this.enableLogs = isEnabled;
        Store.dispatch(setDebugEnabledByBot(true));
    };

    log = (payload) => {
        if (this.enableLogs) {
            this.sendLog(payload);
        }
    };

    sendLog = (params) => {
        console.log('========>>>>> sendLog fropm bot', params.entry.message);
        UtilsCapability.addLogEntry(params);
    };

    async openForm(formMessage) {
        const formData = formMessage.getMessage();
        const messageData = formMessage.getMessageOptions();
        NavigationAction.pushNew(NavigationAction.SCREENS.form2, {
            formData,
            formMessage: messageData,
            localControlId: messageData.controlId
                ? messageData.controlId +
                  this.conversationContext.conversationId
                : messageData.formId + this.conversationContext.conversationId,
            conversationId: this.conversationContext.conversationId,
            sendMessage: this.sendMessage,
            userId: this.getUserId(),
            title: messageData.title,
            hideLogo: this.props.route.params.hideLogo
        });
        // Store.dispatch(
        //     setCurrentForm({
        //         formData: formMessage.getMessage(),
        //         formMessage: formMessage.getMessageOptions(),
        //         currentResults: null,
        //         change: null
        //     })
        // );
    }

    done = () => {
        // Done with the bot - navigate away?
    };

    /** Retrun when the message has been persisted */
    persistMessage = (message) =>
        MessageHandler.persistOnDevice(
            this.conversationContext.conversationId,
            message
        );

    // Promise based since setState is async
    updateChat(message) {
        return new Promise((resolve) => {
            if (this.conversational === false) {
                if (
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_STRING ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_FORM2 ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_TABLE ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_CALENDAR ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_TIMELINE ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_CONTAINER ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_TRACKING_VIEW_MESSAGE ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_MENU ||
                    message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_SURVEY ||
                    (message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_HTML &&
                        message.getMessageOptions().embedded === true) ||
                    (message.getMessageType() ===
                        MessageTypeConstants.MESSAGE_TYPE_MAP &&
                        this.state.isNonConversationalModal === false)
                ) {
                    if (message.getMessage().append) {
                        this.totalEntries += message.getMessage().append.length;
                    }
                    this.pushToPersistsMessageQueue(message);

                    resolve();
                } else {
                    resolve();
                }
            } else {
                this.chatState.updatingChat = true;
                this.persistMessage(message)
                    .then((queue) => {
                        if (queue) {
                            return this.queueMessage(message);
                        }
                    })
                    .then((res) => {
                        if (!res) {
                            this.chatState.updatingChat = false;
                            if (this.chatState.nextSmartSuggestion) {
                                this.updateSmartSuggestions(
                                    this.chatState.nextSmartSuggestion
                                );
                                this.chatState.nextSmartSuggestion = undefined;
                            }
                        }
                        resolve(res);
                    })
                    .catch(() => {
                        resolve();
                    });
            }
            // Has to be Immutable for react
        });
    }

    updateSmartSuggestions(message) {
        // Suggestions
        if (this.smartSuggestionsArea) {
            this.smartSuggestionsArea.update(message.getMessage());
        }
    }

    fireSlider(message) {
        // Slider
        Keyboard.dismiss();
        this.sliderPreviousState = true;
        this.setState({ showSlider: true, message });
    }

    openMap = (mapId, title) => {
        ControlDAO.getContentById(
            mapId + this.conversationContext.conversationId
        ).then((content) => {
            Keyboard.dismiss();
            this.currentMapId = mapId;
            Store.dispatch(setCurrentMap(content));
            NavigationAction.push(NavigationAction.SCREENS.locationViewr, {
                title: title || 'Map',
                mapId,
                onAction: this.sendMapResponse,
                sendMessage: this.sendMessage,
                onClosing: () => {
                    Store.dispatch(setCurrentMap(null));
                    this.currentMapId = null;
                },
                userId: this.getUserId()
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
    };

    openLocationMessage = (content, mapId, title) => {
        Keyboard.dismiss();
        this.currentMapId = mapId;
        Store.dispatch(setCurrentMap(content));
        NavigationAction.pushNew(NavigationAction.SCREENS.locationViewr, {
            title: title || 'Map',
            mapId,
            onClosing: () => {
                Store.dispatch(setCurrentMap(null));
                this.currentMapId = null;
            }
        });
    };

    // openChart(message) {
    //     Keyboard.dismiss();
    //     Actions.SNRChart({
    //         chartData: message.getMessage(),
    //         chartTitle: I18n.t('SNR_Chart_title')
    //     });
    // }

    // picked from Smart Suggestions
    sendSmartReply() {
        const message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        // message.sliderResponseMessage(selectedRows);
        return this.sendMessage(message);
    }

    sendSliderResponseMessage(selectedRows) {
        const message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.sliderResponseMessage(selectedRows);
        return this.sendMessage(message);
    }

    // optionalCb is passed by slider if it needs to run some cleanup
    onSliderClose = (optionalCb, scroll = true) => {
        this.sliderPreviousState = false;
        this.setState({ showSlider: false }, (err) => {
            if (!err && _.isFunction(optionalCb)) {
                return optionalCb();
            }
        });
        this.slider = null;
    };

    onScrollToIndexFailed = () => {
        if (this.chatList) {
            this.chatList.scrollToOffset({ offset: 0 });
        }
    };

    checkForScrolling = () => {
        setTimeout(() => {
            if (this.firstUnreadIndex !== -1) {
                if (this.chatList) {
                    this.chatList.scrollToIndex({
                        index: this.firstUnreadIndex,
                        animated: true
                    });
                }
                this.firstUnreadIndex = -1;
            } else if (this.chatList) {
                this.chatList.scrollToOffset({ offset: 0 });
            }
            this.initialScrollDone = true;
        }, 300);
    };

    scrollToBottomIfNeeded = () => {
        if (this.chatList) {
            this.chatList.scrollToOffset({ offset: 0 });
            this.initialScrollDone = true;
        }
    };

    onSliderDone = (selectedRows) => {
        this.sendSliderResponseMessage(selectedRows);
    };

    onSliderCancel = () => {
        const message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.sliderCancelMessage();
        return this.sendMessage(message);
    };

    onSliderTap = (selectedRow) => {
        this.sendSliderTapResponseMessage(selectedRow);
    };

    sendSliderTapResponseMessage = (selectedRow) => {
        const message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserId());
        message.stringMessage(selectedRow.title);
        return this.sendMessage(message);
    };

    // selectedItem for igonre click==> DATA in sendButtonResponseMessage ----- {"action": "IgnoreContact", "style": 0, "title": "Ignore", "user": {"userId": "x6tQLuprcSu7CjNBf9prPF", "userName": "rankcaptian"}}
    // how to send from contact
    sendButtonResponseMessage = (selectedItem) => {
        console.log('DATA in sendButtonResponseMessage -----', selectedItem);
        const message = new Message({ addedByBot: false });
        message.buttonResponseMessage(selectedItem);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message).then(async () => {
            if (selectedItem.action === 'AcceptContact') {
                await Contact.refreshContacts();
                EventEmitter.emit(ContactsEvents.contactAccepted);
                // Event to people chat to enable button (Maybe) if better way then do that...
            }
            //TODO: implemt this
            if (selectedItem.action === 'IgnoreContact') {
                // this.props.navigation.setParams({
                //     isRequestIgnored: true
                // });
                Conversation.downloadRemoteConversations(); //TODO:why is this here?
            }
        });
    };

    onButtonDone = (messageIndex, selectedItem) => {
        MessageHandler.deleteMessage(
            this.state.messages[messageIndex].message.getMessageId()
        );
        let currentMsgData = this.state.messages;
        currentMsgData.splice(messageIndex, 1);
        this.setState({ messages: currentMsgData }, () => {
            this.sendButtonResponseMessage(selectedItem);
        });
    };

    // TODO(refactor): is this message even required ?
    replaceUpdatedMessage = (updatedMessage) => {
        const index = _.findIndex(
            this.state.messages,
            (item) =>
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

    sendSearchBoxResponse = (response) => {
        const message = new Message();
        message.searchBoxResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message);
        this.setState({ showSearchBox: false, searchBoxData: null });
    };

    sendSearchBoxQuery = (query) => {
        const message = new Message();
        message.searchBoxResponseMessage(query);
        message.setCreatedBy(this.getUserId());
        this.sendMessage(message);
    };

    sendMapResponse = (response) => {
        const message = new Message();
        message.mapResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    onFormDone = (response) => {
        const message = new Message();
        message.messageByBot(false);
        message.formResponseMessage(response);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    closeForm = async (localControlId) => {
        ControlDAO.getOptionsById(localControlId).then((messageData) => {
            ControlDAO.getContentById(localControlId).then((formData) => {
                messageData.stage = formStatus.COMPLETED;
                ControlDAO.updateControl(
                    localControlId,
                    formData,
                    MessageTypeConstants.MESSAGE_TYPE_FORM2,
                    Date.now(),
                    messageData
                );
            });
        });
    };

    /** Returns true if queue processing is running, false if it's ended */
    queueMessage = (message) => {
        return new Promise(async (resolve) => {
            if (
                this.conversational === true ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_STRING ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_FORM2 ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_TABLE ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_CALENDAR ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_TIMELINE ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_CONTAINER ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_TRACKING_VIEW_MESSAGE ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_MENU ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_SURVEY ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_HTML ||
                (message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_MAP &&
                    this.state.isNonConversationalModal === false)
            ) {
                this.messageQueue.push(message);
                if (this.processingMessageQueue === false) {
                    this.processMessageQueue().then(() => {
                        resolve(false);
                    });
                } else {
                    resolve(true);
                }
            }
        });
    };

    pushToPersistsMessageQueue = (message) => {
        this.persistMessageQueue.push(message);
        // console.log('~~~~ added to q, q length:', this.persistMessageQueue.length);
        if (this.processingpersistMessageQueue === false) {
            this.processpersistMessageQueue();
        }
    };

    processpersistMessageQueue = async () => {
        this.processingpersistMessageQueue = true;
        if (this.persistMessageQueue.length > 0) {
            messageToProcess = this.persistMessageQueue.shift();
            // console.log(
            //     '~~~~ processing start',
            //     messageToProcess.getMessageId()
            // );
            await this.persistMessage(messageToProcess);
            EventEmitter.emit(TablesEvents.updateTable, messageToProcess);
            this.queueMessage(messageToProcess);
            console.log(
                '~~~~~ processing end',
                messageToProcess.getMessageId()
            );
            this.processpersistMessageQueue();
        } else {
            this.processingpersistMessageQueue = false;
            console.log('~~~~~ no more in q');
            // console.log('%c ~~~~~ totale apends:', 'color:red', this.totalEntries);
        }
    };

    processMessageQueue = () => {
        return new Promise(async (resolve) => {
            this.processingMessageQueue = true;
            while (this.messageQueue.length > 0) {
                if (this.conversational) {
                    await this.appendMessageToChat(this.messageQueue.shift());
                } else {
                    await this.appendMessageNonConversational(
                        this.messageQueue.shift()
                    );
                }
            }
            this.processingMessageQueue = false;
            resolve(this.processingMessageQueue);
        });
    };

    /** Update message list and screen */
    appendMessageToChat = (message) => {
        return new Promise((resolve) => {
            if (this.addMessage && this.setState) {
                let currentMsgData = this.state.messages;
                const updatedMessageList = this.addMessage(
                    message,
                    currentMsgData
                );
                this.updateMessages(updatedMessageList, (err, res) => {
                    if (!err) {
                        // this.scrollToBottomIfNeeded();
                    }
                    resolve(res);
                });
            }
        });
    };

    /** Update message list and screen in non coversational mode */
    appendMessageNonConversational = (message) => {
        console.log('~~~~~~ appendMessageNonConversational', message);
        return new Promise((resolve) => {
            if (this.addMessage && this.setState) {
                // this.addMessage(message, this.state.messages);
                if (Platform.OS === 'ios') {
                    LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                    );
                }
                if (
                    message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_STRING
                ) {
                    this.setState({ nonConversationalFullScreenLoaded: true });
                    Toast.show({
                        text1: message.getMessage(),
                        type: 'standard'
                    });
                    resolve();
                } else {
                    const nonConvControlsList = Store.getState().bots
                        .nonConvControlsList[this.bot.botId];
                    // console.log(
                    //     '~~~~~ trying to finnd the message in contll list',
                    //     message.getMessageOptions().tabId
                    // );
                    const messageExists = nonConvControlsList.find((msg) => {
                        const msgOptions = msg.message.getMessageOptions();
                        if (
                            message.getMessageType() ===
                            MessageTypeConstants.MESSAGE_TYPE_FORM2
                        ) {
                            return (
                                msgOptions.formId ===
                                    message.getMessageOptions().formId ||
                                msgOptions.controlId ===
                                    message.getMessageOptions().parent
                            );
                        }
                        if (
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_TABLE ||
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_CALENDAR ||
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_TIMELINE ||
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_MAP ||
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_SURVEY
                        ) {
                            return (
                                msgOptions.tabId ===
                                    message.getMessageOptions().tabId ||
                                msgOptions.controlId ===
                                    message.getMessageOptions().parent
                            );
                        }
                        if (
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_CONTAINER ||
                            message.getMessageType() ===
                                MessageTypeConstants.MESSAGE_TYPE_MENU
                        ) {
                            return (
                                msgOptions.tabId ===
                                message.getMessageOptions().tabId
                            );
                        }
                    });
                    console.log(`incoming: messageExists? - ${messageExists}`);
                    this.setState({
                        nonConversationalFullScreenLoaded: true
                    });
                    if (!messageExists) {
                        if (message.getMessageOptions().updateInBackground)
                            resolve();
                        const incomingMessage = message.toBotDisplay();
                        const controlsList = Store.getState().bots
                            .nonConvControlsList[this.bot.botId];

                        Store.dispatch(
                            updateNonConvControlsList({
                                list: [...controlsList, incomingMessage],
                                id: this.bot.botId,
                                src: 'chatbt screen !messageExists',
                                instanceId: this.instanceId
                            })
                        );
                        if (this.state.isNonConversationalModal === false) {
                            // console.log('~~~~ incoming: messageExists - isNonConversationalModal');
                            const messageIndex = controlsList.length;
                            if (messageIndex === 0) {
                                console.log(
                                    'incoming: !messageExists - messageIndex is 0, resolve'
                                );
                                this.setState({
                                    nonConversationalFullScreenLoaded: true
                                });
                                return resolve();
                            }
                            console.log(
                                'incoming: !messageExists - messageIndex is not 0, push new screen'
                            );
                            NavigationAction.pushNew(
                                NavigationAction.SCREENS.fullScreenMessage,
                                {
                                    origin: 'action_push',
                                    message,
                                    conversationId: this.conversationContext
                                        .conversationId,
                                    conversationContext: this
                                        .conversationContext,
                                    userId: this.getUserId(),
                                    sendMessage: this.sendMessage,
                                    title: this.props.route.params.bot.botName,
                                    messageIndex,
                                    botDone: this.botDone,
                                    clearCurrentMap: () => {
                                        this.currentMapId = null;
                                    },
                                    bot: this.bot,
                                    isWaiting: this.state.isWaiting,
                                    hideLogo: this.props.route.params.hideLogo
                                }
                            );
                        }
                        console.log('~~~~ incoming: !messageExists resolve');
                        resolve();
                    } else {
                        console.log('~~~~ incoming: messageExists resolve');
                        resolve();
                    }
                }
            }
        });
    };

    /** Add the new message to a message list and return the updated messagelist */
    addMessage = (message, messageList) => {
        const incomingMessage = message.toBotDisplay();
        const messageIndex = R.findIndex(R.propEq('key', incomingMessage.key))(
            messageList
        );
        if (messageIndex >= 0) {
            const updatedMessages = R.update(
                messageIndex,
                incomingMessage,
                messageList
            );
            return updatedMessages;
        }
        return [incomingMessage, ...messageList];

        // let msgs = this.state.messages.slice();
        // msgs.push(message.toBotDisplay());
        // return msgs;
    };

    /** Render the new message on screen */
    updateMessages = (messages, callback) => {
        if (this.mounted) {
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                );
            }
            let formattedMsg = this.addSessionStartMessages(messages);
            this.setState(
                {
                    // typing: '',
                    messages: formattedMsg,
                    overrideDoneFn: null
                },
                () => {
                    // this.scrollToBottomIfNeeded();
                    if (callback) {
                        callback();
                    }
                }
            );
        }
    };

    isUserChat = () => {
        return false;
    };

    showBotName = () => {
        return true;
    };

    shouldShowUserName() {
        return false;
    }

    onChatListLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        this.chatListHeight = height;
        // this.chatList.scrollToBottom({animated : true});
    };

    renderItem = (rowdata) => {
        // console.log('the data-------->', rowdata);
        const { item, index } = rowdata;
        const { message } = item;
        const currentConv = this.state.currentConvContact;
        if (message.isMessageByBot()) {
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_MAP
            ) {
                return (
                    <MapMessage
                        isFromUser={false}
                        isFromBot
                        openMap={this.openMap}
                        mapOptions={message.getMessageOptions()}
                        conversationId={this.conversationContext.conversationId}
                    />
                );
            }
            // if (
            //     message.getMessageType()
            //     === MessageTypeConstants.MESSAGE_TYPE_VIDEO
            // ) {
            //     return (
            //         <VideoMessage
            //             url={message.getMessage()}
            //             conversationContext={this.conversationContext}
            //             isFromUser={false}
            //             options={message.getMessageOptions()}
            //         />
            //     );
            // }
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_LOCATION
            ) {
                return (
                    <MapMessage
                        showTime={item.showTime}
                        shouldShowUserName={true}
                        isBotNameShown={
                            this.showBotName()
                                ? this.props.route.params.botName
                                : false
                        }
                        message={message}
                        user={this.user}
                        isFromUser
                        isFromBot={false}
                        openMap={this.openLocationMessage}
                        mapOptions={message.getMessageOptions()}
                        mapData={message.getMessage()}
                        conversationId={this.conversationContext.conversationId}
                    />
                );
            }
            // if (
            //     message.getMessageType() ===
            //     MessageTypeConstants.MESSAGE_TYPE_WEB_CARD
            // ) {
            //     return (
            //         <WebCards
            //             webCardsList={message.getMessage()}
            //             previews={message.getMessageOptions()}
            //         />
            //     );
            // }
            // if (
            //     message.getMessageType() ===
            //     MessageTypeConstants.MESSAGE_TYPE_DATA_CARD
            // ) {
            //     return (
            //         <Datacard
            //             datacardList={message.getMessage()}
            //             onCardSelected={this.openModalWithContent.bind(this)}
            //         />
            //     );
            // }
            // if (
            //     message.getMessageType() ===
            //     MessageTypeConstants.MESSAGE_TYPE_CARDS
            // ) {
            //     return (
            //         <Cards
            //             cards={message.getMessage()}
            //             cardsOptions={message.getMessageOptions()}
            //             onCardSelected={this.openModalWithContent.bind(this)}
            //             hideModal={this.hideChatModal}
            //             sendMessage={this.sendMessage}
            //             userId={this.getUserId()}
            //         />
            //     );
            // }
            if (
                !currentConv &&
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
            }
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_FORM2
            ) {
                return (
                    <Form2Message
                        formData={message.getMessage()}
                        messageData={message.getMessageOptions()}
                        message={message}
                        saveMessage={this.persistMessage}
                        sendMessage={this.sendMessage}
                        conversationId={this.conversationContext.conversationId}
                        userId={this.getUserId()}
                    />
                );
            }
            if (
                message.getMessageType() ===
                MessageTypeConstants.MESSAGE_TYPE_CHART
            ) {
                return (
                    <ChartMessage
                        chartOptions={message.getMessageOptions()}
                        chartData={message.getMessage()}
                        conversationId={this.conversationContext.conversationId}
                    />
                );
            }
            // for removing date msg that is created in addSessionStartMessages
            // if (message._msg == '{}') {
            //     return null;
            // }
            return this.user.userId !== item.message._createdBy ? (
                <ChatMessage
                    // alignRight
                    message={message}
                    otherUserName={this.otherUserName}
                    isUserChat={this.isUserChat()}
                    shouldShowUserName={true}
                    isBotNameShown={
                        this.showBotName()
                            ? this.props.route.params.botName
                            : false
                    }
                    user={this.user}
                    imageSource={{ uri: this.bot.logoUrl }}
                    showTime={item.showTime}
                    openModalWithContent={this.openModalWithContent}
                    hideChatModal={this.hideChatModal}
                    onFormCTAClick={this.onFormDone}
                    onFormCancel={this.onFormCancel}
                    onFormOpen={this.onFormOpen}
                    conversationContext={this.conversationContext}
                />
            ) : (
                <View>
                    <ChatMessage
                        otherUserName={this.otherUserName}
                        shouldShowUserName={true}
                        showTime={item.showTime}
                        message={message}
                        // alignRight
                        user={this.user}
                        openModalWithContent={this.openModalWithContent}
                        hideChatModal={this.hideChatModal}
                        conversationContext={this.conversationContext}
                    />
                    {this.state.messages.length == 2 ? (
                        <View style={{ height: 0 }} />
                    ) : null}
                </View>
            );
        }
        if (
            message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MAP
        ) {
            return (
                <MapMessage
                    showTime={item.showTime}
                    shouldShowUserName={true}
                    isBotNameShown={
                        this.showBotName()
                            ? this.props.route.params.botName
                            : false
                    }
                    message={message}
                    user={this.user}
                    isFromUser
                    isFromBot={false}
                    openMap={this.openLocationMessage}
                    mapOptions={message.getMessageOptions()}
                    mapData={message.getMessage()}
                    conversationId={this.conversationContext.conversationId}
                />
            );
        }
        // if (
        //     message.getMessageType()
        //     === MessageTypeConstants.MESSAGE_TYPE_VIDEO
        // ) {
        //     return (
        //         <VideoMessage
        //             url={message.getMessage()}
        //             conversationContext={this.conversationContext}
        //             isFromUser
        //             options={message.getMessageOptions()}
        //         />
        //     );
        // }
        if (
            message.getMessageType() ===
            MessageTypeConstants.MESSAGE_TYPE_LOCATION
        ) {
            return (
                <MapMessage
                    showTime={item.showTime}
                    shouldShowUserName={true}
                    message={message}
                    user={this.user}
                    isBotNameShown={
                        this.showBotName()
                            ? this.props.route.params.botName
                            : false
                    }
                    isFromUser
                    isFromBot={false}
                    openMap={this.openLocationMessage}
                    mapOptions={message.getMessageOptions()}
                    mapData={message.getMessage()}
                    conversationId={this.conversationContext.conversationId}
                />
            );
        }
        return (
            <View>
                <ChatMessage
                    otherUserName={this.otherUserName}
                    showTime={item.showTime}
                    message={message}
                    // alignRight
                    user={this.user}
                    openModalWithContent={this.openModalWithContent}
                    hideChatModal={this.hideChatModal}
                    conversationContext={this.conversationContext}
                />
                {this.state.messages.length == 2 ? (
                    <View style={{ height: 0 }} />
                ) : null}
            </View>
        );
    };

    waitForQueueProcessing() {
        return new Promise((resolve) => {
            const self = this;
            const interval = setInterval(() => {
                if (self.processingMessageQueue === false) {
                    clearInterval(interval);
                    resolve();
                }
            }, Config.ChatMessageOptions.messageTransitionTime / 2);
        });
    }

    // countMessage = (message) => {
    //     if (!message.isEmptyMessage()) {
    //         MessageCounter.addCount(this.getBotId(), 1);
    //     }
    // };

    sendAuthorizationresponse(response, content) {
        const message = new Message();
        message.messageByBot(false);
        message.authorizationRequestResponse({
            action: response,
            content,
            controlId: content?.controlId || null,
            tabId: content?.tabId
        });
        message.setCreatedBy(this.props.route.params.userId);
        this.sendMessage(message);
    }

    sendMessage = async (message) => {
        message.setStatus(0);
        console.log(
            '***** ~~~~~~ *MSG* SEND: type:' + message.getMessageType(),
            message.getMessage(),
            message.getMessageOptions()
        );
        // this.countMessage(message);
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.CHAT,
            GoogleAnalyticsEventsActions.SEND_MESSAGE,
            this.props.route.params.bot.botName,
            0,
            null
        );
        this.updateChat(message).then(() => {
            // TimelineBuilder.buildTiimeline();
            if (this.state.conversational) {
                this.scrollToBottom = true;
                this.chatList && this.chatList.scrollToOffset({ offset: 0 });
            }

            // let currentMsgData1 = this.state.messages;
            const getNext = this.loadedBot.next(
                message,
                this.botState,
                this.state.messages,
                this.botContext
            );
            if (
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_BACKGROUND_EVENT ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_TYPE_SENSOR ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_DOWNLOAD_PROGRESS ||
                message.getMessageType() ===
                    MessageTypeConstants.MESSAGE_DOWNLOAD_ERROR
            ) {
                return getNext;
            }
            const isPromise = getNext instanceof Promise;
            if (isPromise) {
                getNext.then((response) => {
                    if (response) {
                        const status = R.pathOr(1, ['data', 'error'], response);
                        if (response?.parsedGroupRemovedError) {
                            // parsedGroupRemovedError added due to user removed from group.
                            //and error coming in content refer CORE-1989
                            message.setStatus(-1);
                            Toast.show({
                                text1: 'Group Admin removed you!',
                                text2: 'now you can not send message!'
                            });
                            this.updateChat(message);
                        } else if (status == 0) {
                            message.setStatus(1);
                            this.updateChat(message);
                        }
                    } else {
                        message.setStatus(-1);
                        this.updateChat(message);
                    }
                    if (this.state.conversational)
                        this.setState({
                            upDateForMsgStatus: !this.state.upDateForMsgStatus
                        });
                });
            } else {
                return getNext;
            }
            // });
        });
    };

    onSendMessage = async (messageStr) => {
        const self = this;
        // read message from component state
        const message = new Message();
        message.setCreatedBy(this.getUserId());
        message.stringMessage(messageStr);
        // message.htmlMessage(htmlMessageTest)
        message.setRead(true);
        // Keyboard.dismiss();

        return self.sendMessage(message);
    };

    getUserId = () => this.user.userId;

    async pickImage() {
        Keyboard.dismiss();
        const result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendImage(result.uri, result.name);
        }
    }

    async pickvideo() {
        Keyboard.dismiss();
        const result = await Media.pickMediaFromLibrary(Config.videoptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendVideo(result.uri, result.name);
        }
    }

    async pickFile() {
        Keyboard.dismiss();
        DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles]
        })
            .then((res) => {
                const fileSize = res.size / Math.pow(1024, 2);
                if (fileSize > 20.0) {
                    Toast.show({
                        text1:
                            'The file you are trying to send is larger than the 20mb limit!',
                        type: 'error'
                    });
                    return;
                }
                this.sendFile(res.uri, res.type, res.name);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    async sendImage(imageUri, name) {
        const self = this;
        const message = new Message({ status: 0 });
        message.setCreatedBy(this.getUserId());
        message.imageMessage(
            `${message.getMessageId()}.png`,
            name ? { fileName: name } : undefined
        );

        const newUri = `${
            Constants.IMAGES_DIRECTORY
        }/${message.getMessageId()}.png`;
        await RNFS.mkdir(Constants.IMAGES_DIRECTORY);
        await RNFS.copyFile(imageUri, newUri);

        const res = await RNFS.stat(newUri);
        const fileSize = res.size / Math.pow(1024, 2);
        if (fileSize > 20.0) {
            AlertDialog.show(
                'The image you are trying to send is larger than the 20mb limit!'
            );
            return;
        }
        const test = {
            newUri,
            conversationId: this.conversationContext.conversationId,
            message: message.getMessageId(),
            ResourceTypes: ResourceTypes.Image
        };

        NetInfo.fetch().then(async (res) => {
            if (!res.isConnected) {
                AsyncStorage.setItem(
                    'file_' + message.getMessageId(),
                    JSON.stringify(test)
                );
                await this.sendMessage(message);
                await this.queueMessage(message);
            } else {
                await this.queueMessage(message);
                // Send the file to the S3/backend and then let the user know
                const uploadedUrl = await Resource.uploadFile(
                    newUri,
                    this.conversationContext.conversationId,
                    message.getMessageId(),
                    ResourceTypes.Image
                );
                if (uploadedUrl) {
                    this.stopWaiting();
                    return this.sendMessage(message);
                } else {
                    message.setStatus(-1);
                    this.setState({
                        upDateForMsgStatus: !this.state.upDateForMsgStatus
                    });
                }
            }
        });
    }

    /**
     * Async method that copy a file in a local directory. Can Also rename it.
     *
     * @param fileLocalUri uri of the local file
     * @param fileMIMEType MIME type of the file
     * @param fileName file name with extension
     *
     */
    async sendFile(fsendFileileLocalUri, fileMIMEType, fileName) {
        const message = new Message({ status: 0 });
        message.setCreatedBy(this.getUserId());

        // COPY THE FILE
        await RNFS.mkdir(Constants.OTHER_FILE_DIRECTORY);
        const rename = `${message.getMessageId()}.${mime.extension(
            fileMIMEType
        )}`;

        const newFileUri = await Utils.copyFileAsync(
            decodeURI(fsendFileileLocalUri),
            Constants.OTHER_FILE_DIRECTORY,
            rename
        );
        message.otherFileMessage('', {
            fileName: fileName,
            type: fileMIMEType
        });

        const test = {
            newUri: newFileUri,
            conversationId: this.conversationContext.conversationId,
            message: message.getMessageId(),
            ResourceTypes: ResourceTypes.OtherFile,
            type: fileMIMEType
        };
        NetInfo.fetch().then(async (res) => {
            if (!res.isConnected) {
                try {
                    AsyncStorage.setItem(
                        'file_' + message.getMessageId(),
                        JSON.stringify(test)
                    )
                        .then(() => {})
                        .catch((e) => {
                            console.log('Something went wrong! ', e);
                        });
                    message.otherFileMessage(rename, {
                        fileName: fileName,
                        type: fileMIMEType
                    });
                    await this.sendMessage(message);
                    await this.queueMessage(message);
                } catch (e) {
                    Toast.show({
                        text1: 'Something went wrong while uploading',
                        type: 'error'
                    });
                    console.log('Error sedinf oofline file msg:: ', e);
                }
            } else {
                await this.queueMessage(message);
                // Send the file to the S3/backend and then let the user know
                const uploadedUrl = await Resource.uploadFile(
                    newFileUri,
                    this.conversationContext.conversationId,
                    message.getMessageId(),
                    ResourceTypes.OtherFile,
                    fileMIMEType
                );
                message.otherFileMessage(rename, {
                    fileName: fileName,
                    type: fileMIMEType
                });
                if (uploadedUrl) {
                    this.stopWaiting();
                    return this.sendMessage(message);
                } else {
                    message.setStatus(-1);
                    this.setState({
                        upDateForMsgStatus: !this.state.upDateForMsgStatus
                    });
                }
            }
        });
    }

    onSendAudio = (audioURI) => {
        this.sendAudio(audioURI);
    };

    sendAudio = async (audioURI) => {
        const message = new Message({ status: 0 });
        message.setCreatedBy(this.getUserId());

        // MOVE THE AUDIO
        const rename = `${message.getMessageId()}.aac`;
        message.audioMessage(rename);
        // this.queueMessage(message);

        const newUri = `${Constants.AUDIO_DIRECTORY}/${rename}`;
        RNFS.mkdir(Constants.AUDIO_DIRECTORY);
        await RNFS.moveFile(audioURI, newUri);

        const test = {
            newUri: newUri,
            conversationId: this.conversationContext.conversationId,
            message: message.getMessageId(),
            ResourceTypes: ResourceTypes.Audio
        };

        NetInfo.fetch().then(async (res) => {
            if (!res.isConnected) {
                AsyncStorage.setItem(
                    'file_' + message.getMessageId(),
                    JSON.stringify(test)
                );
                await this.sendMessage(message);
                await this.queueMessage(message);
            } else {
                await this.queueMessage(message);
                // Send the audio file to the S3/backend and then let the user know
                await Resource.uploadFile(
                    newUri,
                    this.conversationContext.conversationId,
                    message.getMessageId(),
                    ResourceTypes.Audio
                );
                this.stopWaiting();
                return this.sendMessage(message);
            }
        });
    };

    sendVideo = async (videoFileURL, name) => {
        // TODO(amal): Copy the file to videos directory
        // const toPath = await Utils.copyFileInPathAsync(videoPath, Utils.fileUriToPath(Constants.VIDEO_DIRECTORY));
        const toUri = videoFileURL;

        const message = new Message({ status: 0 });
        message.setCreatedBy(this.getUserId());
        let actualUrl = videoFileURL;

        const res = await RNFS.stat(videoFileURL);
        if (Platform.OS === 'android') {
            actualUrl = res.originalFilepath;
        }
        const fileSize = res.size / Math.pow(1024, 2);
        if (fileSize > 20.0) {
            AlertDialog.show(
                'The video you are trying to send is larger than the 20mb limit!'
            );
            return;
        }
        const extention = actualUrl.split('.').pop();
        message.videoMessage('', {
            fileName: name || message.getMessageId(),
            type: `video/${extention}`
        });

        const test = {
            newUri: actualUrl,
            conversationId: this.conversationContext.conversationId,
            message: message.getMessageId(),
            ResourceTypes: ResourceTypes.Video,
            type: `video/${extention}`
        };

        NetInfo.fetch().then(async (res) => {
            const rename = message.getMessageId() + '.' + extention;
            if (!res.isConnected) {
                AsyncStorage.setItem(
                    'file_' + message.getMessageId(),
                    JSON.stringify(test)
                );
                message.videoMessage(rename, {
                    fileName: name || message.getMessageId(),
                    type: `video/${extention}`
                });
                await this.sendMessage(message);
                await this.queueMessage(message);
            } else {
                await this.queueMessage(message);
                // Send the file to the S3/backend and then let the user know
                const uploadedUrl = await Resource.uploadFile(
                    actualUrl,
                    this.conversationContext.conversationId,
                    message.getMessageId(),
                    ResourceTypes.Video,
                    `video/${extention}`
                );
                message.videoMessage(rename, {
                    fileName: name || message.getMessageId(),
                    type: `video/${extention}`
                });
                if (uploadedUrl) {
                    this.stopWaiting();
                    return this.sendMessage(message);
                }
            }
        });
    };

    async takePicture() {
        Keyboard.dismiss();
        const result = await Media.takePicture(Config.CameraOptions);
        if (!result.cancelled) {
            this.sendImage(result.uri, result.name);
        }
    }

    onVideoCaptured = (video) => {
        this.sendVideo(video.uri, video.name);
    };

    recordVideo() {
        Media.recordVideo().then((result) => {
            if (!result.cancelled) {
                this.onVideoCaptured(result.data);
            }
        });
    }

    requestCameraPermissions(callback) {
        return Permissions.request(PermissionList.CAMERA).then((response) => {
            if (response === Permissions.RESULTS.GRANTED) {
                callback();
            }
        });
    }

    requestAudioPermissions(callback) {
        return Permissions.request(PermissionList.MICROPHONE).then(
            (response) => {
                if (response === Permissions.RESULTS.GRANTED) {
                    callback();
                }
            }
        );
    }

    requestStoragePermissions(callback) {
        return Permissions.request(PermissionList.STORAGE).then((response) => {
            if (response === Permissions.RESULTS.GRANTED) {
                callback();
            }
        });
    }

    alertForRecordingPermission() {
        AlertDialog.show(
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
        const response = await this.hasRecordVideoPermission();
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
            response[PermissionList.CAMERA] === Permissions.RESULTS.GRANTED &&
            response[PermissionList.MICROPHONE] ===
                Permissions.RESULTS.GRANTED &&
            (Platform.OS === 'ios' ||
                response[PermissionList.STORAGE] ===
                    Permissions.RESULTS.GRANTED)
        ) {
            this.recordVideo();
        } else if (
            response[PermissionList.CAMERA] === Permissions.RESULTS.BLOCKED ||
            response[PermissionList.MICROPHONE] === Permissions.RESULTS.BLOCKED
        ) {
            this.alertForRecordingPermission();
        } else if (
            response[PermissionList.CAMERA] === Permissions.RESULTS.DENIED
        ) {
            this.requestCameraPermissions(requestAudioPermissionCallback);
        } else if (
            response[PermissionList.MICROPHONE] === Permissions.RESULTS.DENIED
        ) {
            if (Platform.OS === 'ios') {
                this.requestAudioPermissions(recordVideoCallback);
            } else {
                this.requestAudioPermissions(requestStoragePermissionsCallback);
            }
        } else if (response.storage === Permissions.RESULTS.DENIED) {
            this.requestStoragePermissions(recordVideoCallback);
        }
    }

    hasRecordVideoPermission() {
        if (Platform.OS === 'ios') {
            return Permissions.checkMultiple([
                PermissionList.CAMERA,
                PermissionList.MICROPHONE
            ]);
        }
        return Permissions.checkMultiple([
            PermissionList.CAMERA,
            PermissionList.MICROPHONE,
            PermissionList.STORAGE
        ]);
    }

    onBarcodeRead(barCodeData) {
        const message = new Message();
        message.setCreatedBy(this.getUserId());
        message.barcodeMessage(barCodeData);
        return this.sendMessage(message);
    }

    async readBarCode() {
        Keyboard.dismiss();
        const result = await Media.readBarcode();
        if (!result.cancelled) {
            this.onBarcodeRead(result.data);
        }
    }

    addContactsToBot() {
        Keyboard.dismiss();
        Contact.getAddedContacts().then((contacts) => {
            const message = Contact.asSliderMessage(contacts);
            this.setState({
                showSlider: true,
                message,
                overrideDoneFn: this.addSelectedContactsToBot
            });
        });
    }

    resetConversation() {
        Keyboard.dismiss();
        // TODO: should the first parameter be message even?
        // Maybe this should return a promise so we can chain things?
        let currentMsgData = this.state.messages;
        this.loadedBot.done(
            null,
            this.botState,
            currentMsgData,
            this.botContext
        );
        ConversationContext.createAndSaveNewConversationContext(
            this.botContext,
            this.user
        )
            .then((context) => {
                this.conversationContext = context;
                this.loadedBot.init(
                    this.botState,
                    currentMsgData,
                    this.botContext
                );
            })
            .catch();
    }

    addSelectedContactsToBot = (selectedRows) => {
        if (selectedRows.length > 0) {
            try {
                const uuids = _.map(selectedRows, (row) => {
                    const uuid = _.find(
                        row.data.contact_info,
                        (m) => m.key === 'userId'
                    );
                    return uuid.value;
                });
                const names = _.map(selectedRows, (row) => row.title);
                ConversationContext.addParticipants(
                    uuids,
                    this.botContext
                ).then((context) => {
                    this.conversationContext = context;
                    const message = new Message();
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

    async pickLocation() {
        Keyboard.dismiss();

        NavigationAction.push(NavigationAction.SCREENS.locationPicker, {
            onLocationPicked: this.onLocationPicked
        });
    }

    onChatStatusBarClose = () => {
        this.setState({ network: 'none' });
        Store.dispatch(setNetworkMsgUI(false));
    };
    onLocationPicked = (locationData) => {
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
    };

    pickContact() {
        Keyboard.dismiss();
        Contact.getAddedContacts().then((contacts) => {
            NavigationAction.push(NavigationAction.SCREENS.manageContacts, {
                title: 'Share Contacts',
                allContacts: contacts,
                showMultiSelect: true,
                onSelected: this.shareContacts,
                disabledUserIds: [],
                showSelected: true
            });
        });
    }

    shareContacts = (selectedContacts) => {
        _.map(selectedContacts, (contact) => {
            message = new Message();
            const { userName, userId, contactType } = contact;
            let forLocalContact = contact;
            if (contactType == 'local') {
                message.contactCard(forLocalContact); // webappside updated now it send all details in msg of local contact
            } else {
                message.contactCard({
                    userName,
                    userId
                });
            }

            message.messageByBot(false);
            message.setCreatedBy(this.getUserId());
            this.sendMessage(message);
        });
    };

    onPlusButtonPressed = () => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );

            this.setState({
                // showOptions: true,
                showSlider: false
            });
            Keyboard.dismiss();
        } else {
            Keyboard.dismiss();
        }
        // this.defaultInputHeight = defaultInputHeight;

        this.RBUserOptions.open();

        // this.defaultInputHeight = defaultInputHeight;
    };

    hideModal = () => {
        this.setState({
            isModalViewVisibile: false
        });
    };

    onRandomTap = () => {
        // if (this.state.showOptions === false) {
        //     LayoutAnimation.configureNext(
        //         LayoutAnimation.Presets.easeInEaseOut
        //     );
        // Keyboard.dismiss();
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
            this.setState({
                showOptions: false,
                showSlider: this.sliderPreviousState
            });
        }

        // }
    };

    closeSheet = async (key) => {
        this.RBUserOptions.close();
        setTimeout(() => {
            this.selectOption(key);
        }, 150);
    };

    selectOption = async (key) => {
        this.setState({ showOptions: false }, () => {
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
            } else if (key === BotInputBarCapabilities.video_library) {
                this.pickvideo();
            }
        });
    };

    async loadMessages(init = false) {
        // return [];
        if (this.loadingMessage) return [];

        this.loadingMessage = true;
        let page = null;
        try {
            page = await MessageManager.getPaginatedMessages(
                this.conversationContext.conversationId,
                this.getBotId(),
                this.oldestLoadedDate(),
                init
            );
        } catch (e) {
            console.log('Error in loading paginated messages');
            this.loadingMessage = false;
            return [];
        }

        if (!page.moreMessagesExist) {
            this.moreMessagesExist = false;
        }
        this.loadingMessage = false;
        return page.messages ? page.messages : [];
    }

    onRefresh = async () => {
        let startTime = this.state.messages[0].message
            .getMessageDate()
            .valueOf();
        // TODO(refactor): think again on the 30 minute messages that we are fetching again and again.
        if (this.state.messages && this.state.messages.length > 0) {
            await MessageManager.getNewArchivedMessages(
                this.conversationContext.conversationId,
                this.getBotId(),
                startTime - 1000 * 60 * 30
            );
        }
        this.setState({ fetchingNewMessages: false });
    };

    loadOlderMessages = async () => {
        try {
            if (this.moreMessagesExist) {
                if (this.state.loadActivity) {
                    console.log('|||||||||||||| already loading, skipp');
                    return;
                }
                this.setState({ loadActivity: true }, async () => {
                    const messages = await this.loadMessages();
                    let currentMsgData = this.state.messages;
                    if (messages && messages.length > 0) {
                        const combinedMsgs = currentMsgData.concat(messages);
                        if (this.mounted) {
                            if (Platform.OS === 'ios') {
                                LayoutAnimation.configureNext(
                                    LayoutAnimation.Presets.easeInEaseOut
                                );
                            }
                            // let convertedGroupByDate =
                            let formattedMsg = this.addSessionStartMessages(
                                combinedMsgs
                            );

                            this.setState({
                                messages: formattedMsg
                            });
                        }
                    }
                    this.setState({ loadActivity: false });
                });
            } else if (this.state.loadActivity) {
                this.setState({ loadActivity: false });
            }
        } catch (error) {
            this.setState({ loadActivity: false });
        }
    };

    oldestLoadedDate = () => {
        let date = moment().valueOf();

        if (this.state.messages.length > 0) {
            const message = this.state.messages[this.state.messages.length - 2]; // -2 to not consider the oldest sessionStartMessage
            if (message)
                date = moment(message.message.getMessageDate()).valueOf();
        }

        return date;
    };

    loadOldMessagesFromServer = async () => {
        // return [];
        try {
            const messages = await NetworkHandler.getArchivedMessages(
                this.getBotId(),
                this.conversationContext.conversationId
            );

            return messages.reverse();
        } catch (error) {
            return [];
        }
    };

    addBotMessage = (message) =>
        new Promise((resolve) => {
            // TODO: Adding bot messages directly seems a bad choice. May be should have a new
            // Message type (Echo message) that contains a internal message for bot to process
            // and echo it back.
            this.persistMessage(message)
                .then(() => {
                    this.queueMessage(message);
                    resolve();
                })
                .catch((err) => {
                    console.error('Error persisting session message::', err);
                    resolve();
                });
        });

    renderSmartSuggestions() {
        return (
            <SmartSuggestions
                ref={(smartSuggestionsArea) => {
                    this.smartSuggestionsArea = smartSuggestionsArea;
                }}
                suggestions={this.state.smartSuggesions}
                onReplySelected={this.onSendMessage}
            />
        );
    }

    renderSlider() {
        const { message } = this.state;
        const doneFn = this.state.overrideDoneFn
            ? this.state.overrideDoneFn
            : this.onSliderDone;
        const options = _.extend({}, message.getMessageOptions(), {
            doneFunction: doneFn,
            cancelFunction: this.onSliderCancel
        });
        // If smart reply - the taps are sent back to the bot
        const tapFn = options.smartReply === true ? this.onSliderTap : null;

        if (tapFn) {
            options.tapFunction = tapFn;
        }
        return (
            <Slider
                ref={(slider) => {
                    this.slider = slider;
                }}
                onClose={this.onSliderClose}
                message={message.getMessage()}
                options={options}
                containerStyle={chatStyles.slider}
                maxHeight={SLIDER_HEIGHT}
            />
        );
    }

    renderSearchBox() {
        return (
            <SearchBox
                ref={(searchBox) => {
                    this.searchBox = searchBox;
                }}
                data={this.state.searchBoxData}
                sendResponse={this.sendSearchBoxResponse}
                sendSearchQuery={this.sendSearchBoxQuery}
                onOpenInfo={this.openModalWithContent}
            />
        );
    }

    renderChatInputBar() {
        //TODO: handle this
        // if (!this.disableScannerOptionForIMbot) {
        //     chatInputMoreOptions.push({
        //         key: BotInputBarCapabilities.bar_code_scanner,
        //         imageStyle: { width: 24, height: 24 },
        //         imageSource: Icons.shareBarcode(),
        //         label: I18n.t('Bar_code_option')
        //     });
        // }
        return (
            // <KeyboardAvoidingView></KeyboardAvoidingView>
            <View>
                <RBSheet
                    ref={(ref) => {
                        this.RBUserOptions = ref;
                    }}
                    height={this.disableScannerOptionForIMbot ? 340 : 390}
                    openDuration={100}
                    closeDuration={100}
                    customStyles={{
                        container: {
                            paddingTop: 20,
                            paddingHorizontal: 10,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20
                        }
                    }}
                >
                    <View style={[chatStyles.moreOptionContainer]}>
                        {!this.disableScannerOptionForIMbot
                            ? chatInputMoreOptionsWithQR.map((elem, index) => (
                                  <TouchableHighlight
                                      activeOpacity={0.8}
                                      underlayColor={'#f8fbfd'}
                                      key={index}
                                      onPress={() => {
                                          this.closeSheet(elem.key);
                                      }}
                                      style={chatStyles.optionContainer}
                                  >
                                      <View
                                          style={{
                                              flexDirection: 'row',
                                              justifyContent: 'flex-start',
                                              alignItems: 'center'
                                          }}
                                      >
                                          <View style={{ marginHorizontal: 2 }}>
                                              <Text>{elem.imageSource}</Text>
                                          </View>
                                          <View
                                              style={{ marginHorizontal: 20 }}
                                          >
                                              <Text
                                                  style={chatStyles.optionText}
                                              >
                                                  {elem.label}
                                              </Text>
                                          </View>
                                      </View>
                                  </TouchableHighlight>
                              ))
                            : chatInputMoreOptions.map((elem, index) => (
                                  <TouchableHighlight
                                      activeOpacity={0.8}
                                      underlayColor={'#f8fbfd'}
                                      key={index}
                                      onPress={() => {
                                          this.closeSheet(elem.key);
                                      }}
                                      style={chatStyles.optionContainer}
                                  >
                                      <View
                                          style={{
                                              flexDirection: 'row',
                                              justifyContent: 'flex-start',
                                              alignItems: 'center'
                                          }}
                                      >
                                          <View style={{ marginHorizontal: 2 }}>
                                              <Text>{elem.imageSource}</Text>
                                          </View>
                                          <View
                                              style={{ marginHorizontal: 20 }}
                                          >
                                              <Text
                                                  style={chatStyles.optionText}
                                              >
                                                  {elem.label}
                                              </Text>
                                          </View>
                                      </View>
                                  </TouchableHighlight>
                              ))}
                    </View>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: '(rgba(203,215,227,0.5)',
                            width: '100%'
                        }}
                    />
                    <TouchableHighlight
                        activeOpacity={0.8}
                        underlayColor={'#f8fbfd'}
                        style={{
                            backgroundColor: 'white',
                            paddingVertical: 12,
                            width: '100%',
                            minHeight: 40
                        }}
                        onPress={() => {
                            this.RBUserOptions.close();
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text
                                style={[
                                    chatStyles.optionText,
                                    { color: 'rgb(229,69,59)' }
                                ]}
                            >
                                {'Cancel'}
                            </Text>
                        </View>
                    </TouchableHighlight>
                </RBSheet>
                <ChatInputBar
                    accessibilityLabel="Chat Input Bar"
                    testID="chat-input-bar"
                    onSend={this.onSendMessage}
                    onSendAudio={this.onSendAudio}
                    options={chatInputMoreOptions}
                    onSelectGalary={this.selectOption}
                    botId={this.getBotId()}
                    onPlusButtonPressed={this.onPlusButtonPressed}
                />
            </View>
        );
    }

    // onChatStatusBarClose = () => {
    //     this.setState({
    //         showNetworkStatusBar: false
    //     });
    // };

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

    renderCallModal = () => (
        <CallModal ref="callModal" parentFlatList={this} isVisible={false} />
    );

    renderChatModal = () => {
        if (this.state.chatModalContent)
            return (
                <ChatModal
                    content={this.state.chatModalContent}
                    isVisible={this.state.isModalVisible}
                    backdropOpacity={0.1}
                    onBackButtonPress={this.hideChatModal}
                    onBackdropPress={() =>
                        this.setState({ isModalVisible: false })
                    }
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 0
                    }}
                />
            );
    };

    hideChatModal = () => {
        this.setState({ isModalVisible: false });
    };

    openModalWithContent = (content) => {
        this.setState({
            chatModalContent: content,
            isModalVisible: true
        });
    };

    onFormOpen = () => {
        const message = new Message({ addedByBot: false });
        message.formOpenMessage();
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    onFormCancel = (formMessage) => {
        const message = new Message({ addedByBot: false });
        message.formCancelMessage(formMessage);
        message.setCreatedBy(this.getUserId());
        return this.sendMessage(message);
    };

    keyExtractor = (item) => {
        return item.key;
    };

    renderView = () => {
        const {
            conversational,
            isNonConversationalModal,
            isWaiting,
            showOptions,
            loadActivity,
            messages,
            fetchingNewMessages,
            showSlider,
            showSearchBox,
            modalMessage,
            modalUrl,
            nonConversationalFullScreenLoaded,
            botLoaded
        } = this.state;
        if (botLoaded) {
            if (conversational === false) {
                const messageList =
                    Store.getState().bots.nonConvControlsList[this.bot.botId] ||
                    [];

                const firstMessage = _.get(messageList, '[0].message');

                if (
                    !isNonConversationalModal &&
                    nonConversationalFullScreenLoaded
                ) {
                    if (!firstMessage) {
                        return (
                            <View style={{ flex: 1 }}>
                                <ChatBubblesOverlay
                                    conversationContext={
                                        this.conversationContext
                                    }
                                    bot={this.bot}
                                />
                            </View>
                        );
                    }
                    return (
                        <FullScreenMessage
                            message={firstMessage}
                            messageIndex={0}
                            conversationId={
                                this.conversationContext.conversationId
                            }
                            conversationContext={this.conversationContext}
                            userId={this.getUserId()}
                            sendMessage={this.sendMessage}
                            bot={this.bot}
                            clearCurrentMap={() => {
                                this.currentMapId = null;
                            }}
                            isWaiting={isWaiting}
                            navigation={this.props.navigation}
                        />
                    );
                }

                if (isNonConversationalModal) {
                    const nonConversationalContent = (
                        <NonConversationalControlsList
                            // list={this.state.nonConversationalScreenList}
                            conversationId={
                                this.conversationContext.conversationId
                            }
                            botId={this.bot.Id}
                            sendMessage={this.sendMessage}
                            userId={this.getUserId()}
                        />
                    );
                    if (this.nonConvBackgroundType === 0) {
                        return (
                            <View style={chatStyles.safeArea}>
                                <BackgroundImage
                                    accessibilityLabel="Messages List"
                                    testID="messages-list"
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'flex-end',
                                            paddingBottom: 30
                                        }}
                                        behavior={
                                            Platform.OS === 'ios'
                                                ? 'padding'
                                                : null
                                        }
                                        // keyboardVerticalOffset={
                                        //     Constants.DEFAULT_HEADER_HEIGHT +
                                        //     (Utils.isiPhoneX() ? 24 : 0)
                                        // }
                                        // enabled
                                    >
                                        {nonConversationalContent}
                                        {isWaiting && (
                                            <PulseIndicator
                                                color={
                                                    GlobalColors.frontmLightBlue
                                                }
                                                style={{
                                                    size: 50,
                                                    bottom: 150,
                                                    position: 'absolute',
                                                    alignSelf: 'center'
                                                }}
                                            />
                                        )}
                                    </View>
                                </BackgroundImage>
                                <ChatNotificationBar botId={this.bot.botId} />
                            </View>
                        );
                    }
                    if (this.nonConvBackgroundType === 240) {
                        return (
                            <View style={chatStyles.safeArea}>
                                <MapView
                                    title="Mappp"
                                    mapId="map_background"
                                    onAction={this.sendMapResponse}
                                    sendMessage={this.sendMessage}
                                    onClosing={() => {
                                        Store.dispatch(setCurrentMap(null));
                                        this.currentMapId = null;
                                    }}
                                    conversational={false}
                                    nonConversationalContent={
                                        nonConversationalContent
                                    }
                                    isWaiting={isWaiting}
                                    userId={this.getUserId()}
                                />
                            </View>
                        );
                    }
                }
                return (
                    <View style={chatStyles.loading}>
                        <SimpleLoader />
                        <Text style={chatStyles.botLoadingStatusText}>
                            {this.state.waitingForMessage
                                ? `Waiting for ${this.props.route.params.bot.botName} to respond`
                                : 'Initializing ' +
                                  this.props.route.params.bot.botName}
                        </Text>
                    </View>
                );
            }
            return (
                <View style={chatStyles.loading}>
                    <SimpleLoader />
                </View>
            );
        }
    };

    render() {
        const {
            conversational,
            isNonConversationalModal,
            isWaiting,
            showOptions,
            loadActivity,
            messages,
            fetchingNewMessages,
            showSlider,
            showSearchBox,
            modalMessage,
            modalUrl,
            nonConversationalFullScreenLoaded,
            botLoaded,
            isModalViewVisibile
        } = this.state;
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: GlobalColors.appBackground
                }}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                    keyboardVerticalOffset={
                        Platform.OS === 'ios' ? (hasNotch ? 100 : 75) : 0
                    }
                    enabled={true}
                >
                    <UserInactivity
                        timeForInactivity={
                            this.bot.inactivityDuration !== 0 &&
                            this.bot.inactivityDuration * 60000
                        }
                        timeoutHandler={BackgroundTimer}
                        onAction={(isActive) => {
                            if (
                                this.bot.authorisedAccess &&
                                !isActive &&
                                this.bot.botId !== 'im-bot'
                            ) {
                                NavigationAction.pop();
                            }
                        }}
                        style={{ flex: 1 }}
                    >
                        <SocketStatus
                            network={this.state.network}
                            onChatStatusBarClose={this.onChatStatusBarClose}
                        />
                        {/* <BotDownloadStatus /> */}
                        {this.state.botLoading && (
                            <View style={chatStyles.loading}>
                                <BarIndicator
                                    count={5}
                                    color={GlobalColors.frontmLightBlue}
                                />
                                <Text style={chatStyles.botLoadingStatusText}>
                                    {`Downloading ${this.props.route.params.bot.botName}...`}
                                </Text>
                            </View>
                        )}
                        {botLoaded && conversational ? (
                            <>
                                <View style={chatStyles.safeArea1to1}>
                                    <TouchableWithoutFeedback
                                        style={{ flex: 1 }}
                                        disabled={!showOptions}
                                        onPress={this.onRandomTap}
                                    >
                                        <View
                                            style={{
                                                flex: 1
                                            }}
                                        >
                                            {loadActivity && <SimpleLoader />}
                                            <FlatList
                                                inverted
                                                onEndReached={
                                                    this.loadOlderMessages
                                                }
                                                keyExtractor={this.keyExtractor}
                                                onEndReachedThreshold={0.1}
                                                extraData={messages}
                                                style={chatStyles.messagesList}
                                                keyboardShouldPersistTaps="handled"
                                                ListHeaderComponent={this.renderSmartSuggestions()}
                                                accessibilityLabel="Messages List"
                                                testID="messages-list"
                                                ref={(list) => {
                                                    this.chatList = list;
                                                }}
                                                overScrollMode="never"
                                                windowSize={21}
                                                maxToRenderPerBatch={10}
                                                // removeClippedSubviews={true}
                                                data={messages}
                                                onLayout={this.onChatListLayout}
                                                renderItem={this.renderItem}
                                                refreshControl={
                                                    <RefreshControl
                                                        refreshing={
                                                            fetchingNewMessages
                                                        }
                                                        onRefresh={() => {
                                                            this.setState({
                                                                fetchingNewMessages: true
                                                            });
                                                            // this.readLambdaQueue();
                                                            // setTimeout(() => {
                                                            //     this.setState({
                                                            //         fetchingNewMessages: false
                                                            //     });
                                                            // }, 3000);
                                                            this.onRefresh();
                                                        }}
                                                    />
                                                }
                                                onScrollToIndexFailed={
                                                    this.onScrollToIndexFailed
                                                }
                                            />
                                            {showSlider
                                                ? this.renderSlider()
                                                : null}
                                            {showSearchBox
                                                ? this.renderSearchBox()
                                                : this.renderChatInputBar()}
                                            {/* {this.renderNetworkStatusBar()} */}
                                            {/* {this.renderCallModal()} */}
                                            {this.renderChatModal()}

                                            <Modal
                                                isVisible={isModalViewVisibile}
                                                style={{
                                                    marginHorizontal: 0,
                                                    marginVertical: 0
                                                }}
                                            >
                                                <SafeAreaView
                                                    style={chatStyles.modal}
                                                >
                                                    <TouchableOpacity
                                                        onPress={this.hideModal}
                                                    >
                                                        <Image
                                                            source={
                                                                images.btn_close
                                                            }
                                                            style={
                                                                chatStyles.closeImg
                                                            }
                                                            resizeMode="contain"
                                                        />
                                                    </TouchableOpacity>

                                                    <WebView
                                                        originWhitelist={['*']}
                                                        automaticallyAdjustContentInsets
                                                        source={
                                                            modalMessage
                                                                ? {
                                                                      html: modalMessage
                                                                  }
                                                                : {
                                                                      uri: modalUrl
                                                                  }
                                                        }
                                                    />
                                                </SafeAreaView>
                                            </Modal>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </>
                        ) : this.state.botLoaded ? (
                            this.renderView()
                        ) : null}
                    </UserInactivity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

export default ChatBotScreen;
