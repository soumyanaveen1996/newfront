import React from 'react';
import { View, Alert, Keyboard } from 'react-native';
import ChatBotScreen from './ChatBotScreen';
import { ConversationContext, Promise, Contact } from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import { Queue } from '../../lib/network';
import { Actions } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import { MessageHandler } from '../../lib/message';
import { Icons } from '../../config/icons';
import images from '../../images';
import chatStyles from './styles';
import { PhoneState } from '../Phone';

export default class PeopleChat extends ChatBotScreen {
    static connectionButton(params) {
        if (params.button) {
            if (params.button === 'manual') {
                return (
                    <HeaderRightIcon
                        onPress={() => {
                            params.refresh();
                        }}
                        icon={Icons.refresh()}
                    />
                );
            } else if (params.button === 'gsm') {
                return (
                    <HeaderRightIcon
                        image={images.gsm}
                        onPress={() => {
                            params.showConnectionMessage('gsm');
                        }}
                    />
                );
            } else if (params.button === 'satellite') {
                return (
                    <HeaderRightIcon
                        image={images.satellite}
                        onPress={() => {
                            params.showConnectionMessage('satellite');
                        }}
                    />
                );
            } else {
                return (
                    <HeaderRightIcon
                        icon={Icons.automatic()}
                        onPress={() => {
                            params.showConnectionMessage('automatic');
                        }}
                    />
                );
            }
        } else {
            return null;
        }
    }

    static rightHeaderView({ params }) {
        const callButton = params.callDisabled ? (
            <HeaderRightIcon
                icon={Icons.callDisabled()}
                style={{ marginRight: 0, paddingHorizontal: 0 }}
            />
        ) : (
            <HeaderRightIcon
                icon={Icons.call()}
                onPress={() => {
                    params.showCallMessage();
                }}
                style={{ marginRight: 0, paddingHorizontal: 0 }}
            />
        );
        return (
            <View style={chatStyles.headerRightView}>
                {callButton}
                {PeopleChat.connectionButton(params)}
            </View>
        );
    }

    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = (
                <HeaderBack
                    onPress={async () => {
                        if (state.params.botDone) {
                            state.params.botDone();
                        }
                        await state.params.deleteConversation();
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
        navigationOptions.headerRight = PeopleChat.rightHeaderView(state);
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.newSession = false;
        this.sentMessageCount = 0;
        // TODO: name or id? - what is constant across releases?
        this.botKey = null;
        // This means we have a list of participants to start the conversation with (new chat)
        this.otherParticipants = props.otherParticipants;
        // This means we are picking up from an older conversation (existing chat)
        this.conversation = props.conversation;
        // Botkey is the id
        if (this.conversation) {
            this.botKey = this.conversation.conversationId;
            this.newSession = false;
        }
    }

    // Implemented methods
    getBotKey = () => {
        return this.conversation.conversationId;
    };

    setNavigationParams(context, user, callDisabled = false) {
        this.props.navigation.setParams({
            title: ConversationContext.getChatName(context, user),
            botDone: this.loadedBot.done.bind(
                this,
                null,
                this.botState,
                this.state.messages,
                this.botContext
            ),
            deleteConversation: this.deleteConversation.bind(this),
            refresh: this.readLambdaQueue.bind(this),
            showConnectionMessage: this.showConnectionMessage.bind(this),
            showCallMessage: this.showCallMessage.bind(this),
            callDisabled: callDisabled
        });
    }

    showVoipEnableAlert() {
        Alert.alert(
            'Alert!!',
            'Other user has not installed VoIP enable FrontM app yet',
            [{ text: 'OK' }],
            { cancelable: false }
        );
    }

    async showCallMessage() {
        this.setNavigationParams(this.conversationContext, this.user, true);
        try {
            Keyboard.dismiss();
            const otherUserId = ConversationContext.getOtherUserId(
                this.conversationContext,
                this.user
            );
            //const isVoIPEnabled = await Twilio.isVoIPEnabled(otherUserId, this.user);
            const chatName = ConversationContext.getChatName(
                this.conversationContext,
                this.user
            );
            this.setNavigationParams(
                this.conversationContext,
                this.user,
                false
            );
            Actions.phone({
                state: PhoneState.init,
                data: {
                    call_to: chatName || otherUserId,
                    otherUserId: otherUserId,
                    from: this.user.info.userName
                }
            });
        } catch (err) {
            Alert.alert('VoIP Error', 'Error : ' + JSON.stringify(err));
        }
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
                this.setNavigationParams(context, user);
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

            this.setNavigationParams(context, user);

            // Create a conversation for this conversation id
            this.conversation = await Promise.resolve(
                Conversation.createIMConversation(context.conversationId)
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
            let contactsArray = await Contact.getContactFieldForUUIDs([
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
        let contact = await this.getCreatorContact();
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
        let newConversation = await Conversation.getIMConversation(
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
        let newContext = await ConversationContext.getBotConversationContextForId(
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
        let oldConversationId = this.conversationContext.conversationId;

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
            if (messages.length === 0) {
                this.allOldMessagesLoaded = true;
            }
        }
        let combinedMsgs = messages.concat(this.state.messages);
        if (this.mounted) {
            this.setState({
                messages: this.addSessionStartMessages(combinedMsgs),
                refreshing: false
            });
        }
    }
}
