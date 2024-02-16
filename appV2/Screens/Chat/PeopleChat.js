import React from 'react';
import { Keyboard } from 'react-native';
import ChatBotScreen from './ChatBotScreen';
import {
    ConversationContext,
    Promise,
    Contact,
    MessageTypeConstants,
    Auth
} from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import { Queue } from '../../lib/network';
import { HeaderBack, HeaderRightIcon, HeaderTitle } from '../../widgets/Header';
import { MessageHandler } from '../../lib/message';
import { Icons } from '../../config/icons';
import chatStyles from './styles';
import GlobalColors from '../../config/styles';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import EventEmitter from '../../lib/events';
import ContactsEvents from '../../lib/events/Contacts';
import config from '../../config/config';
import NavigationAction from '../../navigation/NavigationAction';
import AlertDialog from '../../lib/utils/AlertDialog';

const backTimer = null;
//TODO: review for optimization
export default class PeopleChat extends ChatBotScreen {
    constructor(props) {
        super(props);
        this.newSession = false;
        this.sentMessageCount = 0;
        // TODO: name or id? - what is constant across releases?
        this.botKey = null;
        // This means we have a list of participants to start the conversation with (new chat)
        this.otherParticipants = this.props.route.params.otherParticipants;
        console.log(
            'the other participantes',
            this.props.route.params.otherParticipants
        );
        // This means we are picking up from an older conversation (existing chat)
        this.conversation = props.route.params.conversation;
        this.flagForFetchUserName = false;
        // Botkey is the id
        if (this.conversation) {
            this.botKey = this.conversation.conversationId;
            this.newSession = false;
        }

        EventEmitter.addListener(
            ContactsEvents.contactAccepted,
            this.eventListener
        );
        EventEmitter.addListener(ContactsEvents.contactsRefreshed, async () => {
            console.log(
                '*** ContactsEvents.contactsRefreshed ---  cheking for current user state'
            );
            const otherUserId = ConversationContext.getOtherUserId(
                this.conversationContext,
                this.user
            );
            let callDisabled = true;
            const contact = await Contact.getContactFieldForUUIDs(otherUserId);
            if (contact.length > 0 && !contact[0].waitingForConfirmation) {
                callDisabled = false;
            }
            this.props.navigation.setParams({
                callDisabled
            });
            if (!callDisabled) {
                console.log(
                    '*** ContactsEvents.contactsRefreshedthis.state.messages?.length',
                    this.state.messages?.length
                );
                const buttonMessageIndex = this.state.messages?.findIndex(
                    (message) =>
                        message?.getMessageType?.() &&
                        message.getMessageType() ===
                            MessageTypeConstants.MESSAGE_TYPE_BUTTON
                );

                if (buttonMessageIndex > -1) {
                    console.log(
                        '*** ContactsEvents.contactsRefreshed ---buttonMessageIndex',
                        buttonMessageIndex
                    );
                    MessageHandler.deleteMessage(latestMessage.getMessageId());

                    this.state.messages.splice(buttonMessageIndex, 1);
                    this.setState({ messages: this.state.messages });
                }
            }
        });
    }

    eventListener = () => {
        this.props.navigation.setParams({
            callDisabled: false
        });
    };

    sendLog = (params) => {
        console.log('========>>>>> i-m ot seding logs, why? ignore');
    };

    // Implemented methods
    getBotKey = () => this.conversation.conversationId;

    setNavigationParams(context, user, callDisabled = true) {
        let titleForChat = ConversationContext.getChatName(context, user);
        this.props.navigation.setParams({
            title: titleForChat,
            botDone: this.loadedBot.done.bind(
                this,
                null,
                this.botState,
                this.state.messages,
                this.botContext
            ),
            deleteConversation: this.deleteConversation.bind(this),
            refresh: this.readLambdaQueue.bind(this),
            // showConnectionMessage: this.showConnectionMessage.bind(this),
            showCallMessage: this.showCallMessage.bind(this),
            callDisabled,
            otherUserId: ConversationContext.getOtherUserId(context, user)
        });
    }

    showVoipEnableAlert() {
        AlertDialog.show('Alert!!', I18n.t('VoipAlert'));
    }

    async showCallMessage(backKey, isVideoCall) {
        console.log('showCallMessage');
        this.setNavigationParams(this.conversationContext, this.user, true);
        try {
            Keyboard.dismiss();
            const otherUserId = ConversationContext.getOtherUserId(
                this.conversationContext,
                this.user
            );

            const chatName = ConversationContext.getChatName(
                this.conversationContext,
                this.user
            );
            this.setNavigationParams(
                this.conversationContext,
                this.user,
                false
            );
            GoogleAnalytics.logEvents(
                GoogleAnalyticsEventsCategories.CALL,
                GoogleAnalyticsEventsActions.VOIP_CALL,
                null,
                0,
                null
            );

            NavigationAction.push(NavigationAction.SCREENS.meetingRoom, {
                data: this.props.route.params.videoCallData,
                voipCallData: { otherUserId, otherUserName: chatName },
                userId: this.user.userId,
                title: chatName,
                isVideoCall
            });
        } catch (err) {}
    }

    async getConversationContext(botContext, user) {
        try {
            let context = null;
            // Existing conversation - so pick from storage
            if (!this.conversation) {
                if (!this.otherParticipants) {
                    throw new Error(
                        'At least one participant is required to start a chat'
                    );
                }
                const conversationId = Conversation.getIMConversationId(
                    user.userId,
                    this.otherParticipants[0].userId
                );
                this.conversation = await Conversation.getIMConversation(
                    conversationId
                );
                if (this.conversation) {
                    this.botKey = this.conversation.conversationId;
                }
            }

            if (this.conversation) {
                context = await Promise.resolve(
                    ConversationContext.getIMConversationContext(
                        botContext,
                        user,
                        this.conversation.conversationId
                    )
                );
                // TODO(amal); Should I check if participants are same in the conversation Context ?
                let callDisabled = true;
                const otherUserId = context.participants.find(
                    (partId) => partId !== user.userId
                );
                if (otherUserId) {
                    const contact = await Contact.getContactFieldForUUIDs(
                        otherUserId
                    );
                    if (
                        contact.length > 0 &&
                        !contact[0].waitingForConfirmation
                    ) {
                        callDisabled = false;
                    }
                }
                this.setNavigationParams(context, user, callDisabled);
                return context;
            }

            if (!this.otherParticipants) {
                throw new Error(
                    'At least one participant is required to start a chat'
                );
            }

            const conversationId = Conversation.getIMConversationId(
                user.userId,
                this.otherParticipants[0].userId
            );
            context = await Promise.resolve(
                ConversationContext.createNewConversationContext(
                    botContext,
                    user,
                    conversationId
                )
            );
            ConversationContext.updateParticipants(
                context,
                this.otherParticipants
            );

            // Use conversationId as the botkey for people chat
            this.botKey = context.conversationId;

            let callDisabled = true;
            const otherUserId = context.participants.find(
                (partId) => partId !== user.userId
            );
            if (otherUserId) {
                const contact = await Contact.getContactFieldForUUIDs(
                    otherUserId
                );
                if (contact.length > 0 && !contact[0].waitingForConfirmation) {
                    callDisabled = false;
                }
            }
            this.setNavigationParams(context, user, callDisabled);

            // Create a conversation for this conversation id
            this.conversation = await Promise.resolve(
                Conversation.createIMConversation(context.conversationId, -1)
            );

            // Save this conversation context (save has to happen after the botkey has been extracted)
            await Promise.resolve(
                ConversationContext.saveConversationContext(
                    context,
                    botContext,
                    user
                )
            );

            this.newSession = true;
            return context;
        } catch (error) {
            console.error(
                'Error getting a conversation context for people chat',
                error
            );
            throw error;
        }
    }

    async getCreatorContact() {
        if (!this.creatorContact) {
            const contactsArray = await Contact.getContactFieldForUUIDs([
                this.conversationContext.creatorInstanceId
            ]);
            if (contactsArray.length > 0) {
                this.creatorContact = contactsArray[0];
            }
        }
        return this.creatorContact;
    }

    handleMessageEvents(event) {
        if (
            !event ||
            event.botId !== this.getBotId() ||
            event.conversationId !== this.getBotKey()
        ) {
            return;
        }
        this.loadedBot.asyncResult(
            event.message,
            this.botState,
            this.state.messages,
            this.botContext
        );
    }

    async handleAsyncMessageResult(event) {
        // Don't handle events that are not for this bot
        if (!event || event.key !== this.getBotKey()) {
            return;
        }
        const contact = await this.getCreatorContact();
        if (!contact || !contact.ignored) {
            this.loadedBot.asyncResult(
                event.result,
                this.botState,
                this.state.messages,
                this.botContext
            );
        }
        // Delete the network result now
        return Queue.deleteNetworkRequest(event.id);
    }

    resetConversation() {
        // People chat should not reset conversation.
    }

    async createOrUpdateConversation(oldConversationId, newConversationId) {
        if (oldConversationId === newConversationId) {
            return;
        }
        const newConversation = await Conversation.getIMConversation(
            newConversationId
        );
        if (newConversation) {
            await Conversation.deleteConversation(oldConversationId);
            this.conversation = newConversation;
        } else {
            await Conversation.updateConversation(
                oldConversationId,
                newConversationId
            );
            this.conversation = await Conversation.getIMConversation(
                newConversationId
            );
        }
    }

    async checkAndUpdateConversationContext(
        oldConversationId,
        newConversationId
    ) {
        if (oldConversationId === newConversationId) {
            return;
        }
        const newContext = await ConversationContext.getBotConversationContextForId(
            newConversationId
        );
        if (!newContext) {
            this.conversationContext.conversationId = newConversationId;
            await ConversationContext.saveConversationContext(
                this.conversationContext,
                this.botContext,
                this.user
            );
        } else {
            this.conversationContext = newContext;
        }
        await ConversationContext.deleteConversationContext(oldConversationId);
    }

    async updateConversationContextId(newConversationId) {
        const oldConversationId = this.conversationContext.conversationId;

        await this.createOrUpdateConversation(
            oldConversationId,
            newConversationId
        );
        await MessageHandler.moveMessages(oldConversationId, newConversationId);
        await this.checkAndUpdateConversationContext(
            oldConversationId,
            newConversationId
        );

        this.botContext.setConversationContext(this.conversationContext);
        this.loadedBot.done(
            null,
            this.botState,
            this.state.messages,
            this.botContext
        );
        this.loadedBot.init(
            this.botState,
            this.state.messages,
            this.botContext
        );
    }

    isUserChat() {
        return true;
    }

    sendInitialMessage = () => {
        this.loadedBot.init(
            this.botState,
            this.state.messages,
            this.botContext
        );

        // Reading the queue 3 times just to wait till socket connects.
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.readLambdaQueue();
            }, i * 10000);
        }
    };

    async onSendMessage(messageStr) {
        this.sentMessageCount += 1;
        return super.onSendMessage(messageStr);
    }

    async deleteConversation() {
        if (this.newSession && this.sentMessageCount === 0) {
            Conversation.deleteConversation(this.conversation.conversationId);
            ConversationContext.deleteConversationContext(
                this.conversation.conversationId
            );
        }
    }

    async onRefresh() {
        if (this.allOldMessagesLoaded) {
            this.setState({
                refreshing: false
            });
            return;
        }
        this.setState({
            refreshing: true
        });
        let messages = await this.loadMessages();
        if (messages.length === 0) {
            this.allLocalMessagesLoaded = true;
        }
        if (this.allLocalMessagesLoaded) {
            messages = await this.loadOldMessagesFromServer();
            if (messages && messages.length === 0) {
                this.allOldMessagesLoaded = true;
            }
        }
        const combinedMsgs = messages.concat(this.state.messages);
        if (this.mounted) {
            this.setState({
                messages: this.addSessionStartMessages(combinedMsgs),
                refreshing: false
            });
        }
    }

    logGoogleAnalytics() {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.CHAT,
            GoogleAnalyticsEventsActions.PEOPLE_CHAT_OPENED,
            null,
            0,
            null
        );
    }
}
