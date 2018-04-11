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
    SafeAreaView,
    Platform
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Promise from '../../lib/Promise';
import chatStyles from './styles';
import ChatInputBar from './ChatInputBar';
import ChatStatusBar from './ChatStatusBar';
import ChatMessage from './ChatMessage';
import Slider from '../Slider/Slider';
import { BotContext } from '../../lib/botcontext';
import { Network, Message, Contact, MessageTypeConstants, Auth, ConversationContext, Media, Resource, ResourceTypes, Settings, PollingStrategyTypes } from '../../lib/capability';
import dce from '../../lib/dce';
import I18n from '../../config/i18n/i18n';
import Config, { BOT_LOAD_RETRIES } from './config';
import Constants from '../../config/constants';
import Utils from '../../lib/utils';
import moment from 'moment';

import { BotInputBarCapabilities, SLIDER_HEIGHT } from './BotConstants';

import { HeaderBack, HeaderRightIcon } from '../Header';

import { MessageHandler } from '../../lib/message';
import { NetworkHandler, AsyncResultEventEmitter, NETWORK_EVENTS_CONSTANTS, Queue } from '../../lib/network';
var pageSize = Config.ChatMessageOptions.pageSize;
import appConfig from '../../config/config';
import { MessageCounter } from '../../lib/MessageCounter';
import { EventEmitter, SatelliteConnectionEvents, PollingStrategyEvents } from '../../lib/events';
import { Icons } from '../../config/icons';

export default class ChatBotScreen extends React.Component {
    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.botName,
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = <HeaderBack onPress={() => {
                if (state.params.botDone) {
                    state.params.botDone();
                }
                if (state.params.onBack) {
                    Actions.pop(); state.params.onBack();
                } else {
                    Actions.pop();
                }
            }} />;
        }

        if (state.params.showRefresh) {
            navigationOptions.headerRight = <HeaderRightIcon onPress={() => {
                state.params.refresh();
            }} icon={Icons.refresh()}/>;
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);

        this.bot = props.bot;
        this.loadedBot = undefined;
        this.botLoaded = false;
        this.messageQueue = []
        this.processingMessageQueue = false
        this.camera = null
        this.allLocalMessagesLoaded = false

        this.state = {
            messages: [],
            typing: '',
            showSlider: false,
            refreshing: false,
        };
        this.botState = {}; // Will be mutated by the bot to keep any state
        this.scrollToBottom = false
        this.firstUnreadIndex = -1

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
    }

    goBack = () => {
        Actions.pop();
        if (this.props.onBack) {
            this.props.onBack();
        }
    }

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
            } catch (error) { }
        }

        if (!self.loadedBot) {
            Alert.alert(
                I18n.t('Bot_load_failed_title'),
                I18n.t('Bot_load_failed'),
                [
                    {text: 'OK', onPress: this.goBack},
                ],
                { cancelable: false }
            )
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
            self.conversationContext = await this.getConversationContext(this.botContext, this.user);

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

            if (!this.mounted) { return; }

            // 4. Update the state of the bot with the messages we have
            this.setState({ messages: this.addSessionStartMessages(messages), typing: '', showSlider: false }, function (err, res) {
                if (!err) {
                    self.botLoaded = true;
                    // 5. Kick things off by calling init on the bot
                    this.loadedBot.init(this.botState, this.state.messages, this.botContext);

                    // 6. If there are async results waiting - pass them on to the bot
                    self.flushPendingAsyncResults();

                    // 7. Now that bot is open - add a listener for async results coming in
                    self.eventSubscription = AsyncResultEventEmitter.addListener(NETWORK_EVENTS_CONSTANTS.result, self.handleAsyncMessageResult.bind(self));

                    // 8. Mark new messages as read
                    MessageHandler.markUnreadMessagesAsRead(this.getBotKey());

                    // 9. Stash the bot for nav back for on exit
                    this.props.navigation.setParams({ botDone: this.loadedBot.done.bind(this, null, this.botState, this.state.messages, this.botContext) });

                } else {
                    console.log('Error setting state with messages', err);
                }
            });
        } catch (e) {
            console.log('Error occurred during componentDidMount; ', e);
            // TODO: handle errors
            self.botLoaded = false;
        }

        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        Network.addConnectionChangeEventListener(this.handleConnectionChange);
        EventEmitter.addListener(SatelliteConnectionEvents.connectedToSatellite, this.satelliteConnectionHandler);
        EventEmitter.addListener(SatelliteConnectionEvents.notConnectedToSatellite, this.satelliteDisconnectHandler);


        this.checkPollingStrategy();
        this.props.navigation.setParams({
            refresh: this.readLambdaQueue.bind(this)
        });
        EventEmitter.addListener(PollingStrategyEvents.changed, this.checkPollingStrategy.bind(this));
    }

    sessionStartMessageForDate = (momentObject) => {
        let sMessage = new Message({addedByBot: true, messageDate: momentObject.valueOf()});
        sMessage.sessionStartMessage();
        return sMessage.toBotDisplay();
    }

    addSessionStartMessages(messages) {
        let filteredMessages = _.filter(messages, (item) => item.message.getMessageType() !== MessageTypeConstants.MESSAGE_TYPE_SESSION_START);
        let resultMessages = [];
        if (filteredMessages.length > 0) {
            let currentDate = moment(filteredMessages[0].message.getMessageDate());
            resultMessages.push(this.sessionStartMessageForDate(currentDate));
            for (var i = 0; i < filteredMessages.length; i++) {
                const botMessage = filteredMessages[i];
                const message = botMessage.message;
                const date = moment(message.getMessageDate());
                if (date.dayOfYear() !== currentDate.dayOfYear() || date.year() !== currentDate.year()) {
                    resultMessages.push(this.sessionStartMessageForDate(date));
                    currentDate = date;
                }
                resultMessages.push(botMessage);
            }
            if (currentDate.dayOfYear() !== moment().dayOfYear() && moment().year() !== currentDate.year()) {
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

    showRefreshButton() {
        this.props.navigation.setParams({
            showRefresh: true
        });
    }

    hideRefreshButton() {
        this.props.navigation.setParams({
            showRefresh: false
        });
    }

    async checkPollingStrategy() {
        console.log('Polling strategy changed');
        let pollingStrategy = await Settings.getPollingStrategy();
        if (pollingStrategy === PollingStrategyTypes.manual) {
            this.showRefreshButton();
        } else {
            this.hideRefreshButton();
        }
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
        Network.removeConnectionChangeEventListener(this.handleConnectionChange);
        EventEmitter.removeListener(SatelliteConnectionEvents.connectedToSatellite, this.satelliteConnectionHandler);
        EventEmitter.removeListener(SatelliteConnectionEvents.notConnectedToSatellite, this.satelliteDisconnectHandler);
        EventEmitter.removeListener(PollingStrategyEvents.changed, this.checkPollingStrategy.bind(this));
    }

    satelliteConnectionHandler = () => {
        if (this.state.network !== 'satellite') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'satellite'
            })
        }
    }

    satelliteDisconnectHandler = () => {
        if (this.state.network === 'satellite') {
            this.setState({
                showNetworkStatusBar: false,
                network: 'connected'
            })
        }
    }

    handleConnectionChange = (connection) => {
        if (connection === 'none') {
            this.setState({
                showNetworkStatusBar: true,
                network: 'none'
            })
        } else {
            if (this.state.network === 'none') {
                this.setState({
                    showNetworkStatusBar: false,
                    network: 'connected',
                })
            }
        }
    }

    getBotId() {
        return this.props.bot.id;
    }

    keyboardWillShow = () => {
        if (this.slider) {
            this.slider.close(undefined, true);
        }
    }

    keyboardDidShow = () => {
        this.scrollToBottomIfNeeded();
        if (Platform.OS === 'android' && this.slider) {
            this.slider.close(undefined, true);
        }
    }

    handleAsyncMessageResult (event) {
        // Don't handle events that are not for this bot
        if (!event || event.key !== this.getBotKey()) {
            return;
        }
        this.loadedBot.asyncResult(event.result, this.botState, this.state.messages, this.botContext);
        // Delete the network result now
        return Queue.deleteNetworkRequest(event.id);
    }

    // Clear out any pending network asyn results that need to become messages
    async flushPendingAsyncResults() {
        let self = this;
        console.log('Bot Key :', this.getBotKey());
        Queue.selectCompletedNetworkRequests(this.getBotKey())
            .then((pendingAsyncResults) => {
                pendingAsyncResults = pendingAsyncResults || [];
                pendingAsyncResults.forEach((pendingAsyncResult) => {
                    self.handleAsyncMessageResult(pendingAsyncResult);
                });
            })
    }

    async loadMessages() {
        console.log('Oldest loaded date : ', this.oldestLoadedDate());
        let messages = await MessageHandler.fetchDeviceMessagesBeforeDate(this.getBotKey(), pageSize, this.oldestLoadedDate())
        return messages;
    }

    wait = (shouldWait) => {
        if (shouldWait) {
            let msg = new Message({addedByBot: true});
            msg.waitMessage();
            this.appendMessageToChat(msg, true);
        } else {
            this.stopWaiting();
        }
    }

    stopWaiting = () => {
        let messages = _.filter(this.state.messages, (item) => item.message.getMessageType() !== MessageTypeConstants.MESSAGE_TYPE_WAIT);
        this.updateMessages(messages);
    }

    isMessageBeforeToday = (message) => {
        return moment(message.getMessageDate()).isBefore(moment(), 'day');
    }

    addSessionStartMessage = (messages) => new Promise((resolve) => {
        if (messages.length === 0 || this.isMessageBeforeToday(messages[messages.length - 1].message)) {
            let sMessage = new Message({addedByBot: true, messageDate: moment().valueOf()});
            sMessage.sessionStartMessage();
            // TODO: Should we do it in a timeout so that its displayed first?
            this.persistMessage(sMessage)
                .then(() => {
                    this.queueMessage(sMessage);
                    resolve();
                })
                .catch((err) => {
                    console.log('Error persisting session message::', err);
                    resolve();
                });
        } else {
            resolve();
        }
    });

    tell = (message) => {
        // Removing the waiting message.
        this.stopWaiting();

        MessageCounter.addCount(this.getBotId(), 1);

        // Update the bot interface
        // Push a new message to the end
        if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_SLIDER) {
            if (this.slider) {
                this.slider.close(() => {
                    this.fireSlider(message);
                }, false);
            } else {
                this.fireSlider(message);
            }
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_MAP) {
            this.openMap(message);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_BUTTON) {
            this.queueMessage(message);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML) {
            this.updateChat(message);
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_CHART) {
            this.openChart(message);
        } else {
            this.updateChat(message);
        }
    }

    done = () => {
        // Done with the bot - navigate away?
        console.log('Done called from bot code');
    }

    // Retrun when the message has been persisted
    persistMessage = (message) => {
        return MessageHandler.persistOnDevice(this.getBotKey(), message);
    }

    // Promise based since setState is async
    updateChat(message) {
        this.persistMessage(message)
            .then(() => {
                this.queueMessage(message);
            })
        // Has to be Immutable for react
    }

    fireSlider(message) {
        // Slider
        Keyboard.dismiss()
        this.setState({ showSlider: true, message: message });
    }

    openMap(message) {
        Keyboard.dismiss()
        Actions.mapView({ mapData: message.getMessage() })
    }

    openChart(message) {
        Keyboard.dismiss();
        Actions.SNRChart({ chartData: message.getMessage(), chartTitle: I18n.t('SNR_Chart_title') });
    }

    sendSliderResponseMessage(selectedRows) {
        let message = new Message({ addedByBot: false });
        message.setCreatedBy(this.getUserUUID());
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
    }

    onSliderOpen() {
        // Comparing the chat list height with total scroll height to decide if to
        // scroll to the end.
        console.log('On Slider open : ', this.chatListHeight, this.scrollHeight);
        if (this.chatListHeight < this.scrollHeight) {
            setTimeout(() => {
                this.scrollToBottomIfNeeded();
            }, 1);
        }
    }

    checkForScrolling() {
        setTimeout(() => {
            if (this.initialScrollDone) {
                return;
            }
            if (this.firstUnreadIndex !== -1){
                this.chatList.scrollToIndex({index : this.firstUnreadIndex, animated: true})
            } else {
                this.chatList.scrollToEnd({ animated: true })
            }
            this.initialScrollDone = true;
        }, 300);
    }

    scrollToBottomIfNeeded() {
        if (this.chatList) {
            this.chatList.scrollToEnd({ animated: true });
            this.initialScrollDone = true;
        }
    }

    onSliderDone = (selectedRows) => {
        if (selectedRows.length > 0) {
            this.sendSliderResponseMessage(selectedRows);
        }
    }

    sendButtonResponseMessage(selectedItem) {
        let message = new Message({ addedByBot: false });
        message.buttonResponseMessage(selectedItem);
        message.setCreatedBy(this.getUserUUID());
        return this.sendMessage(message);
    }

    onButtonDone = (selectedItem) => {
        this.sendButtonResponseMessage(selectedItem);
    }

    replaceUpdatedMessage = (updatedMessage) => {
        const index = _.findIndex(this.state.messages, (item) => item.message.getMessageId() === updatedMessage.getMessageId());
        if (index !== -1) {
            const messages = this.state.messages.slice();
            messages[index] = updatedMessage.toBotDisplay();
            this.setState({
                messages: this.addSessionStartMessages(messages)
            });
        }
    }

    onFormDone = (formItems, formMessage) => {
        formMessage.setCompleted(true);
        formMessage.formMessage(formItems);
        this.persistMessage(formMessage)
            .then(() => {
                this.replaceUpdatedMessage(formMessage);
                let message = new Message({ addedByBot: false });
                message.formResponseMessage(formItems);
                message.setCreatedBy(this.getUserUUID());
                return this.sendMessage(message);
            });
    }

    updateMessages = (messages, callback) => {
        if (this.mounted) {
            this.setState({ typing: '', messages: this.addSessionStartMessages(messages), overrideDoneFn: null }, callback);
        }
    }

    appendMessageToChat(message, immediate = false) {
        const timeout = immediate ? 0 : Config.ChatMessageOptions.messageTransitionTime
        return new Promise((resolve) => {
            setTimeout(() => {
                // Potentially avoiding issues if the component is unmounted
                if (this.addMessage && this.setState) {
                    let msgs = this.addMessage(message);
                    this.updateMessages(msgs, (err, res) => {
                        if (!err) {
                            resolve(res);
                        }
                    });
                }
            }, timeout)
        });
    }

    processMessageQueue() {
        var message = this.messageQueue.shift()
        if (message) {
            this.processingMessageQueue = true;
            this.appendMessageToChat(message)
                .then(() => {
                    this.processMessageQueue()
                })
        } else {
            this.processingMessageQueue = false;
        }
    }

    queueMessage(message) {
        this.messageQueue.push(message)
        if (this.processingMessageQueue === false) {
            this.processMessageQueue()
        }
    }

    addMessage(message) {
        let msgs = this.state.messages.slice()
        msgs.push(message.toBotDisplay());
        return msgs;
    }

    isUserChat() {
        return false;
    }

    shouldShowUserName() {
        return false;
    }

    onChatListLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        this.chatListHeight = height;
        //this.chatList.scrollToBottom({animated : true});
    }

    onMessageItemLayout = (event, message) => {
        const key = message.getMessageId();
        if (!this.scrollHeight) {
            this.scrollHeight = 0;
            this.itemHeights = {};
        }
        const { height } = event.nativeEvent.layout;
        this.scrollHeight += height - (this.itemHeights[key] || 0);
        this.itemHeights[key] = height;
        if (_.keys(this.itemHeights) === this.state.messages.count &&
            this.messages[this.messages.length - 1].getMessageId() === key &&
            this.scrollToBottom) {
            this.scrollToBottomIfNeeded();
        }
    }

    renderItem({ item }) {
        const message = item.message;
        if (message.isMessageByBot()) {
            return <ChatMessage message={message}
                isUserChat={this.isUserChat()}
                shouldShowUserName={this.shouldShowUserName()}
                user={this.user}
                imageSource={{ uri: this.bot.logoUrl }}
                onDoneBtnClick={this.onButtonDone.bind()}
                onFormCTAClick={this.onFormDone.bind(this)}
                onLayout={this.onMessageItemLayout.bind(this)} />;
        } else {
            return (
                <ChatMessage message={message} alignRight user={this.user}
                    onLayout={this.onMessageItemLayout.bind(this)}/>
            )
        }
    }

    waitForQueueProcessing() {
        return new Promise((resolve, reject) => {
            var self = this;
            let interval = setInterval(function () {
                if (self.processingMessageQueue === false) {
                    clearInterval(interval);
                    resolve()
                }
            }, Config.ChatMessageOptions.messageTransitionTime / 2);
        })
    }

    sendMessage = async (message) => {
        this.updateChat(message)
        this.scrollToBottom = true;
        this.waitForQueueProcessing()
            .then(() => {
                this.loadedBot.next(message, this.botState, this.state.messages, this.botContext);
                this.scrollToBottomIfNeeded();
            })
    }

    async onSendMessage (messageStr) {
        let self = this;
        // read message from component state
        let message = new Message();
        message.setCreatedBy(this.getUserUUID());
        message.stringMessage(messageStr);

        return self.sendMessage(message);
    };

    getUserUUID = () => {
        return this.user.userUUID;
    }

    async sendImage(imageUri, base64) {
        const toUri = await Utils.copyFileAsync(imageUri, Constants.IMAGES_DIRECTORY);
        let message = new Message();
        message.setCreatedBy(this.getUserUUID());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await Resource.uploadFile(base64, toUri, this.conversationContext.conversationId, message.getMessageId(), ResourceTypes.Image, this.user);
        message.imageMessage(uploadedUrl);

        return this.sendMessage(message);
    }


    onSendAudio = (audioURI) => {
        this.sendAudio(audioURI);
    }

    sendAudio = async (audioURI) => {
        const toUri = await Utils.copyFileAsync(audioURI, Constants.AUDIO_DIRECTORY);

        // TODO(amal): Upload Audio file
        let message = new Message();
        message.setCreatedBy(this.getUserUUID());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await this.dce_bot.uploadFile(null, toUri, this.conversationContext.conversationId, message.getMessageId(), ResourceTypes.Audio, this.user);

        message.audioMessage(uploadedUrl);
        return this.sendMessage(message);
    }

    sendVideo = async (videoFileURL) => {
        // TODO(amal): Copy the file to videos directory
        //const toPath = await Utils.copyFileInPathAsync(videoPath, Utils.fileUriToPath(Constants.VIDEO_DIRECTORY));
        const toUri = videoFileURL;

        let message = new Message();
        message.setCreatedBy(this.getUserUUID());

        // Send the file to the S3/backend and then let the user know
        const uploadedUrl = await this.dce_bot.uploadFile(null, toUri, this.conversationContext.conversationId, message.getMessageId(), ResourceTypes.Video, this.user);
        message.videoMessage(uploadedUrl);
        return this.sendMessage(message);
    }

    async takePicture() {
        Keyboard.dismiss()
        let result = await Media.takePicture(Config.CameraOptions);
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    onVideoCaptured = (videoFileURL) => {
        this.sendVideo(videoFileURL);
    }

    async takeVideo() {
        Keyboard.dismiss();
        const result = await Media.recordVideo();
        if (!result.cancelled) {
            this.onVideoCaptured(result.uri);
        }
    }

    async pickImage() {
        Keyboard.dismiss()
        let result = await Media.pickMediaFromLibrary(Config.CameraOptions);
        // Have to filter out videos ?
        if (!result.cancelled) {
            this.sendImage(result.uri, result.base64);
        }
    }

    onBarcodeRead(barCodeData) {
        let message = new Message();
        message.setCreatedBy(this.getUserUUID());
        message.stringMessage(barCodeData);
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
        Contact.getAddedContacts()
            .then((contacts) => {
                let message = Contact.asSliderMessage(contacts);
                this.setState({ showSlider: true, message, overrideDoneFn: this.addSelectedContactsToBot });
            });
    }

    async updateConversationContextId(newConversationId) {
    }

    resetConversation() {
        Keyboard.dismiss();
        // TODO: should the first parameter be message even?
        // Maybe this should return a promise so we can chain things?
        this.loadedBot.done(null, this.botState, this.state.messages, this.botContext);
        ConversationContext.createAndSaveNewConversationContext(this.botContext, this.user)
            .then((context) => {
                this.conversationContext = context;
                this.loadedBot.init(this.botState, this.state.messages, this.botContext);
            })
            .catch((err) => {
                console.log('Error resetting coversation ', err);
            })
    }

    addSelectedContactsToBot = (selectedRows) => {
        if (selectedRows.length > 0) {
            try {
                const uuids = _.map(selectedRows, (row) => {
                    let uuid = _.find(row.data.contact_info, function (m) { return m.key === 'uuid' });
                    return uuid.value;
                });
                const names = _.map(selectedRows, (row) => {
                    return row.title;
                });
                ConversationContext.addParticipants(uuids, this.botContext)
                    .then((context) => {
                        this.conversationContext = context;
                        let message = new Message();
                        message.stringMessage(I18n.t('Slider_Response', { lines: names.join('\n') }));
                        message.setCreatedBy(this.getUserUUID());
                        return this.sendMessage(message);
                    });
            } catch (error) {
                // Ignore
            }
        } else {

        }
    }

    pickLocation() {
        Keyboard.dismiss();
        Actions.locationPicker({ onLocationPicked: this.onLocationPicked.bind(this) });
    }

    onLocationPicked(locationData) {
        console.log(locationData);
    }

    onOptionSelected(key) {
        if (key === BotInputBarCapabilities.camera) {
            this.takePicture()
        } else if (key === BotInputBarCapabilities.video) {
            this.takeVideo()
        } else if (key === BotInputBarCapabilities.bar_code_scanner) {
            this.readBarCode()
        } else if (key === BotInputBarCapabilities.photo_library) {
            this.pickImage()
        } else if (key === BotInputBarCapabilities.add_contact) {
            this.addContactsToBot()
        } else if (key === BotInputBarCapabilities.reset_conversation) {
            this.resetConversation()
        } else if (key === BotInputBarCapabilities.pick_location) {
            this.pickLocation()
        }
    }


    async onRefresh() {
        this.setState({
            refreshing: true
        })
        let messages = await this.loadMessages()
        let combinedMsgs = messages.concat(this.state.messages)
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
        let messages = await NetworkHandler.fetchOldMessagesBeforeDate(this.conversationContext.conversationId, this.getBotId(), this.oldestLoadedDate());
        return messages;
    }

    onSliderResize() {
        this.scrollToBottomIfNeeded();
    }

    addBotMessage = (message) => new Promise((resolve) => {
        // TODO: Adding bot messages directly seems a bad choice. May be should have a new
        // Message type (Echo message) that contains a internal message for bot to process
        // and echo it back.
        this.persistMessage(message)
            .then(() => {
                this.queueMessage(message);
                resolve();
            })
            .catch((err) => {
                console.log('Error persisting session message::', err);
                resolve();
            });
    });

    renderSlider() {
        const message = this.state.message;
        const doneFn = this.state.overrideDoneFn ? this.state.overrideDoneFn.bind(this) : this.onSliderDone.bind(this);
        const options = _.extend({}, message.getMessageOptions(), { doneFunction: doneFn });
        // If smart reply - the taps are sent back to the bot
        const tapFn = options.smartReply === true ? this.onSliderDone.bind(this) : null;

        if (tapFn) {
            options.tapFunction = tapFn;
        }
        return (
            <Slider ref={(slider) => { this.slider = slider }}
                onClose={this.onSliderClose.bind(this)}
                message={message.getMessage()}
                option={options}
                containerStyle={chatStyles.slider}
                onResize={this.onSliderResize.bind(this)}
                onSliderOpen={this.onSliderOpen.bind(this)}
                maxHeight={SLIDER_HEIGHT}/>
        );
    }

    renderChatInputBar() {
        const moreOptions = [
            { key: BotInputBarCapabilities.camera, label: I18n.t('Chat_Input_Camera') },
            { key: BotInputBarCapabilities.video, label: I18n.t('Chat_Input_Video') },
            { key: BotInputBarCapabilities.photo_library, label: I18n.t('Chat_Input_Photo_Library') },
            { key: BotInputBarCapabilities.bar_code_scanner, label: I18n.t('Chat_Input_BarCode') },
            { key: BotInputBarCapabilities.pick_location, label: I18n.t('Pick_Location') }
        ];

        if (this.bot.allowResetConversation) {
            moreOptions.push({ key: BotInputBarCapabilities.reset_conversation, label: I18n.t('Reset_Conversation') })
        }
        if (appConfig.app.hideAddContacts !== true) {
            moreOptions.push({ key: BotInputBarCapabilities.add_contact, label: I18n.t('Add_Contact') })
        }

        return (
            <ChatInputBar
                network={this.state.network}
                onSend={this.onSendMessage.bind(this)}
                onSendAudio={this.onSendAudio.bind(this)}
                options={moreOptions}
                onOptionSelected={this.onOptionSelected.bind(this)} />
        );
    }

    onChatStatusBarClose = () => {
        this.setState({
            showNetworkStatusBar: false,
        })
    }

    renderNetworkStatusBar = () => {
        const { network, showNetworkStatusBar } = this.state;
        if (showNetworkStatusBar && (network === 'none' || network === 'satellite')) {
            return <ChatStatusBar network={this.state.network} onChatStatusBarClose={this.onChatStatusBarClose}/>;
        }
    }

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
            <SafeAreaView style={chatStyles.safeArea}>
                <KeyboardAvoidingView style={chatStyles.container}
                    behavior={(Platform.OS === 'ios') ? "padding": null}
                    keyboardVerticalOffset={Constants.DEFAULT_HEADER_HEIGHT + (Utils.isiPhoneX() ? 24 : 0)}>
                    <FlatList ref={(list) => {this.chatList = list; this.checkForScrolling()}}
                        data={this.state.messages}
                        renderItem={this.renderItem.bind(this)}
                        onLayout={this.onChatListLayout.bind(this)}
                        refreshControl={
                            <RefreshControl colors={['#9Bd35A', '#689F38']}
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh.bind(this)} />
                        }
                    />
                    {this.state.showSlider ? this.renderSlider() : null}
                    {this.renderChatInputBar()}
                    {this.renderNetworkStatusBar()}
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
