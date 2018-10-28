import React from 'react';
import { BackHandler } from 'react-native';
import ChatBotScreen from './ChatBotScreen';
import { ConversationContext, Promise, Contact } from '../../lib/capability';
import { Conversation } from '../../lib/conversation';
import { Queue } from '../../lib/network';
import { Actions, ActionConst } from 'react-native-router-flux';
import { HeaderBack, HeaderRightIcon } from '../Header';
import ChannelDAO from '../../lib/persistence/ChannelDAO';
import { Icons } from '../../config/icons';
import images from '../../images';

export default class ChannelChat extends ChatBotScreen {
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
        this.newSession = false;
        this.sentMessageCount = 0;
        // TODO: name or id? - what is constant across releases?
        this.botKey = null;
        this.channel = props.channel;
        // This means we are picking up from an older conversation (existing chat)
        this.conversation = props.conversation;
        // Botkey is the id
        if (this.conversation) {
            this.botKey = this.conversation.conversationId;
            this.newSession = false;
        }
    }

    componentWillMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick
        );
    }

    handleBackButtonClick() {
        if (Actions.currentScene === 'channelChat') {
            Actions.timeline({ type: ActionConst.REPLACE });
        }
    }

    // Implemented methods
    getBotKey = () => {
        return this.conversation.conversationId || this.channel.channelId;
    };

    setNavigationParams(context, user) {
        this.props.navigation.setParams({
            title: this.channel ? this.channel.channelName : '',
            botDone: this.loadedBot.done.bind(
                this,
                null,
                this.botState,
                this.state.messages,
                this.botContext
            ),
            deleteConversation: this.deleteConversation.bind(this),
            refresh: this.readLambdaQueue.bind(this),
            showConnectionMessage: this.showConnectionMessage.bind(this)
        });
    }

    async getConversationContext(botContext, user) {
        try {
            let context = null;
            if (this.conversation) {
                this.channel = await ChannelDAO.selectChannelByConversationId(
                    this.conversation.conversationId
                );
            } else if (this.channel && this.channel.channelId) {
                this.conversation = await Conversation.getChannelConversation(
                    this.channel.channelId
                );
            }
            if (this.channel) {
            }
            // Existing conversation - so pick from storage
            if (this.conversation) {
                context = await Promise.resolve(
                    ConversationContext.getChannelConversationContext(
                        botContext,
                        user,
                        this.channel
                    )
                );
                this.setNavigationParams(context, user);

                return context;
            }
            // Else its a new conversation with participants.
            if (!this.channel) {
                throw new Error('Channel Object is required');
            }

            context = await Promise.resolve(
                ConversationContext.createNewChannelConversationContext(
                    botContext,
                    user,
                    this.channel,
                    this.channel.channelId
                )
            );
            ConversationContext.updateParticipants(context, this.participants);

            // Use conversationId as the botkey for people chat
            this.botKey = context.conversationId;

            this.setNavigationParams(context, user);

            // Create a conversation for this conversation id
            this.conversation = await Promise.resolve(
                Conversation.createChannelConversation(context.conversationId)
            );

            await ChannelDAO.updateConversationForChannel(
                this.channel.channelName,
                this.channel.userDomain,
                context.conversationId
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

    isUserChat() {
        return true;
    }

    shouldShowUserName() {
        return true;
    }

    async onSendMessage(messageStr) {
        this.sentMessageCount += 1;
        return super.onSendMessage(messageStr);
    }

    async deleteConversation() {
        if (this.newSession && this.sentMessageCount === 0) {
            await Conversation.deleteChannelConversation(
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
