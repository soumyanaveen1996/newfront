import React from 'react';
import ChatBotScreen from './ChatBotScreen';
import { ConversationContext, Promise, Contact } from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import { Queue } from '../../lib/network';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';
import { MessageHandler } from '../../lib/message';
import ChannelDAO from '../../lib/persistence/ChannelDAO';

export default class ChannelChat extends ChatBotScreen {

    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title,
        };
        if (state.params.noBack === true) {
            navigationOptions.headerLeft = null;
        } else {
            navigationOptions.headerLeft = <HeaderBack onPress={async () => {
                if (state.params.botDone) {
                    state.params.botDone();
                }
                await state.params.deleteConversation();
                if (state.params.onBack) {
                    Actions.pop(); state.params.onBack();
                } else {
                    Actions.pop();
                }
            }} />;
        }
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        this.newSession = false;
        this.sentMessageCount = 0;
        // TODO: name or id? - what is constant across releases?
        this.botKey = null;
        this.channel = props.channel
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
        return this.conversation.conversationId || this.channel.conversationId;
    }

    setNavigationParams(context, user) {
        this.props.navigation.setParams({
            title: this.channel ? this.channel.name : '',
            botDone: this.loadedBot.done.bind(this, null, this.botState, this.state.messages, this.botContext),
            deleteConversation: this.deleteConversation.bind(this)
        });
    }

    async getConversationContext(botContext, user) {
        try {
            let context = null;
            if (this.conversation) {
                this.channel = await ChannelDAO.selectChannelByConversationId(this.conversation.conversationId)
            } else if (this.channel && this.channel.conversationId) {
                this.conversation = await Conversation.getChannelConversation(this.channel.conversationId);
            }
            if (this.channel) {
                console.log('Conversation ID from channel : ', this.channel.conversationId);
            }
            // Existing conversation - so pick from storage
            if (this.conversation) {
                context = await Promise.resolve(ConversationContext.getChannelConversationContext(botContext, user, this.channel));
                this.setNavigationParams(context, user);
                return context;
            }
            // Else its a new conversation with participants.
            if (!this.channel) {
                throw new Error('Channel Object is required');
            }

            context = await Promise.resolve(ConversationContext.createNewChannelConversationContext(botContext, user, this.channel, this.channel.conversationId));
            ConversationContext.updateParticipants(context, this.participants);


            // Use conversationId as the botkey for people chat
            this.botKey = context.conversationId;

            this.setNavigationParams(context, user);

            // Create a conversation for this conversation id
            this.conversation = await Promise.resolve(Conversation.createChannelConversation(context.conversationId));

            await ChannelDAO.updateConversationForChannel(this.channel.name, this.channel.domain, context.conversationId);

            // Save this conversation context (save has to happen after the botkey has been extracted)
            await Promise.resolve(ConversationContext.saveConversationContext(context, botContext, user));

            this.newSession = true;
            return context;
        } catch (error) {
            console.log('Error getting a conversation context for channel chat', error);
            throw error;
        }
    }

    async getCreatorContact() {
        if (!this.creatorContact) {
            let contactsArray = await Contact.getContactFieldForUUIDs([this.conversationContext.creatorInstanceId]);
            if (contactsArray.length > 0) {
                this.creatorContact = contactsArray[0];
            }
        }
        return this.creatorContact;
    }

    async handleAsyncMessageResult (event) {
        // Don't handle events that are not for this bot
        if (!event || event.key !== this.getBotKey()) {
            return;
        }
        let contact = await this.getCreatorContact();
        if (!contact || !contact.ignored) {
            this.loadedBot.asyncResult(event.result, this.botState, this.state.messages, this.botContext);
        }
        // Delete the network result now
        return Queue.deleteNetworkRequest(event.id);
    }

    resetConversation() {
        // People chat should not reset conversation.
    }

    async createOrUpdateConversation(oldConversationId, newConversationId) {
        let newConversation = await Conversation.getChannelConversation(newConversationId);
        if (newConversation) {
            await Conversation.deleteChannelConversation(oldConversationId);
            this.conversation = newConversation
        } else {
            await Conversation.updateConversation(oldConversationId, newConversationId);
            this.conversation = await Conversation.getChannelConversation(newConversationId);
        }
    }

    async checkAndUpdateConversationContext(oldConversationId, newConversationId) {
        let newContext = await ConversationContext.getBotConversationContextForId(newConversationId);
        if (!newContext) {
            this.conversationContext.conversationId = newConversationId;
            await ConversationContext.saveConversationContext(this.conversationContext, this.botContext, this.user)
        } else {
            this.conversationContext = newContext;
        }
        await ConversationContext.deleteConversationContext(oldConversationId);
    }

    async updateConversationContextId(newConversationId) {
        let oldConversationId = this.conversationContext.conversationId;

        await this.createOrUpdateConversation(oldConversationId, newConversationId);
        await MessageHandler.moveMessages(oldConversationId, newConversationId);
        await this.checkAndUpdateConversationContext(oldConversationId, newConversationId)
        await ChannelDAO.updateConversationForChannel(this.channel.name, this.channel.domain, newConversationId);

        this.botContext.setConversationContext(this.conversationContext);
        this.loadedBot.done(null, this.botState, this.state.messages, this.botContext);
        this.loadedBot.init(this.botState, this.state.messages, this.botContext);
    }

    isUserChat() {
        return true
    }

    shouldShowUserName() {
        return true
    }

    async onSendMessage(messageStr) {
        this.sentMessageCount += 1;
        return super.onSendMessage(messageStr);
    }

    async deleteConversation() {
        if (this.newSession && this.sentMessageCount === 0) {
            Conversation.deleteChannelConversation(this.conversation.conversationId);
            let currentChannel = await ChannelDAO.selectChannelByConversationId(this.conversation.conversationId);
            if (currentChannel && this.channel && this.channel.id === currentChannel.id) {
                console.log('deleting conversation Id from channel');
                ChannelDAO.updateConversationForChannel(this.channel.name, this.channel.domain, null);
            } else {
                console.log('conversation got updated. So not upditng to null');
            }
        }
    }
}
