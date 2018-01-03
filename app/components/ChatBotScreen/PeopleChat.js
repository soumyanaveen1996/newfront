import React from 'react';
import ChatBotScreen from './ChatBotScreen';
import { ConversationContext, Promise, Contact } from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import { Queue } from '../../lib/network';
import { Actions } from 'react-native-router-flux';
import { HeaderBack } from '../Header';

export default class PeopleChat extends ChatBotScreen {

    static navigationOptions({ navigation, screenProps }) {
        const { state } = navigation;
        let navigationOptions = {
            headerTitle: state.params.title,
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
        return navigationOptions;
    }

    constructor(props) {
        super(props);
        // TODO: name or id? - what is constant across releases?
        this.botKey = null;
        // This means we have a list of participants to start the conversation with (new chat)
        this.participants = props.participants;
        // This means we are picking up from an older conversation (existing chat)
        this.conversation = props.conversation;
        // Botkey is the id
        if (this.conversation) {
            this.botKey = this.conversation.conversationId;
        }
    }

    // Implemented methods
    getBotKey = () => {
        return this.botKey;
    }

    async getConversationContext(botContext, user) {
        try {
            let context = null;
            // Existing conversation - so pick from storage
            if (this.conversation) {
                context = await Promise.resolve(ConversationContext.getConversationContext(botContext, user));
                this.props.navigation.setParams({ title: ConversationContext.getChatName(context, user) });
                return context;
            }
            // Else its a new conversation with participants.
            if (!this.participants) {
                throw new Error('At least one participant is required to start a chat');
            }

            context = await Promise.resolve(ConversationContext.createNewConversationContext(botContext, user));
            ConversationContext.updateParticipants(context, this.participants);

            // Use conversationId as the botkey for people chat
            this.botKey = context.conversationId;

            this.props.navigation.setParams({ title: ConversationContext.getChatName(context, user) });

            // Save this conversation context (save has to happen after the botkey has been extracted)
            await Promise.resolve(ConversationContext.saveConversationContext(context, botContext, user));

            // Create a conversation for this conversation id
            this.conversation = await Promise.resolve(Conversation.createIMConversation(context.conversationId));

            return context;
        } catch (error) {
            console.log('Error getting a conversation context for people chat');
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

}
