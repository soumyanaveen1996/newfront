import {
    Auth,
    Message,
    UpdateCallQuota,
    Contact,
    Channel
} from '../capability';
import { IMBotMessageHandler } from '../network';
import { ConversationDAO, MessageDAO, NetworkDAO } from '../persistence';
import EventEmitter, {
    AuthEvents,
    MessageEvents,
    TimelineEvents
} from '../events';
import { BackgroundTaskProcessor } from '../BackgroundTask';
import Store from '../../redux/store/configureStore';
import { otherUserProfileUpdated } from '../../redux/actions/BotActions';
import { VideoCalls } from '../calls';
import { Conversation } from '../conversation';
import TimelineBuilder from '../TimelineBuilder/TimelineBuilder';
import { MessageHandler } from '.';

export default class MessageQueue {
    constructor(options = {}) {
        this.retryCount = options.retryCount || 1;
        this.processing = false;
        this.queue = [];
        this.queueLength = 0;
    }

    subscribeToEvents() {
        EventEmitter.addListener(
            AuthEvents.userDataFetched,
            this.userLoggedInHandler.bind(this)
        );
        EventEmitter.addListener(
            AuthEvents.userLoggedOut,
            this.userLoggedOutHandler.bind(this)
        );
    }

    userLoggedInHandler() {
        this.clear();
    }

    userLoggedOutHandler() {
        this.clear();
    }

    push(message) {
        this.queue[this.queueLength++] = message;
        this.process();
    }

    top() {
        if (this.queueLength > 0) {
            return this.queue[0];
        }
        return undefined;
    }

    clear() {
        while (this.top()) {
            this.pop();
        }
    }

    pop() {
        if (this.queueLength > 0) {
            const val = this.queue.shift();
            this.queueLength--;
            return val;
        }
        return undefined;
    }

    async isMessageAlreadyProcessed(message) {
        if (message.bot === '') {
            if (
                message.contentType !== 11000 ||
                message.contentType !== 10001 ||
                message.contentType !== 10002 ||
                message.contentType !== 10003
            ) {
                return false;
            }

            return true;
        }
        if (
            message.messageId === '' ||
            message.messageId == null ||
            !message.messageId
        ) {
            // No message id
            return false;
        }
        try {
            const networkItem = await NetworkDAO.selectByMessageId(
                message.messageId
            );
            const dbMessage = await MessageDAO.selectMessageById(
                message.messageId
            );

            if (dbMessage || networkItem) {
                // Message Already processed',
                return true;
            }
        } catch (error) {
            console.log('Error while checking message : ', error);
        }
        return false;
    }

    async handleMessage(message) {
        const user = Auth.getUserData();

        const alreadyProcessed = await this.isMessageAlreadyProcessed(message);
        if (alreadyProcessed) {
            return true;
        }
        const { bot } = message;
        // Name of the bot is the key, unless its IMBot (one to many relationship)
        if (bot === 'im-bot' || bot === 'channels-bot') {
            await IMBotMessageHandler.handleMessage(message, user);
        } else {
            try {
                //save raw message to filter out duplicates,
                //Once bot processes this it will give new messages and we cannot flag duplicates.
                const incomingMessage = new Message({
                    uuid: message.messageId
                });
                incomingMessage.placeholderMessage('');
                incomingMessage.setBotKey('server_message');
                await MessageDAO.insertMessage(incomingMessage);
            } catch (e) {
                console.log('~~~~~~~~ error saveing raw', e);
            }

            // If our Bot is currently in Foreground then Handle Differently
            const activeBot = Store.getState().bots.id;
            const messageBot = message.bot;

            if (
                message.contentType === 12004 ||
                message.contentType === 12001
            ) {
                await Channel.refreshChannels();
                await Conversation.downloadRemoteConversations(false);
                EventEmitter.emit(TimelineEvents.updateTimelineView, {});
                return;
            }
            if (message.contentType === 11000) {
                const newBalance = message?.details[0]?.message['pstn-balance'];
                if (message.details.length > 0 && newBalance) {
                    UpdateCallQuota({
                        error: message.error,
                        callQuota: newBalance
                    });
                }
                return;
            }
            if (message.contentType === 10005) {
                Store.dispatch(otherUserProfileUpdated(true));
                return;
            }
            if (
                message.contentType === 1000 ||
                message.contentType === 10001 ||
                message.contentType === 10002 ||
                message.contentType === 10003
            ) {
                Contact.refreshContacts();
                return;
            } else if (message.contentType === 25010) {
                VideoCalls.handleCallEndEvent(message?.details[0].message);
                return;
            } else if (message.contentType === 25020) {
                EventEmitter.emit(
                    MessageEvents.callMessage,
                    message?.details[0].message
                );
                return;
            } else if (message.contentType === 14001) {
                if (message?.details[0]?.message?.conversationId)
                    MessageHandler.markUnreadMessagesAsRead(
                        message?.details[0].message.conversationId
                    ).then(() => {
                        ConversationDAO.resetUnreadCount(
                            message?.details[0].message.conversationId
                        ).then((result) => {
                            TimelineBuilder.buildTiimeline();
                        });
                    });
            }

            if (activeBot && activeBot === messageBot) {
                EventEmitter.emit(MessageEvents.messageProcessed, {
                    message,
                    botId: messageBot
                });
            } else {
                await BackgroundTaskProcessor.sendBackgroundAsyncMessage(
                    message,
                    message.bot,
                    message.conversation
                );
            }
        }
        return true;
    }

    async process() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        while (this.top()) {
            const message = this.top();

            for (let i = 0; i < this.retryCount; ++i) {
                try {
                    const success = await this.handleMessage(message);

                    if (success) {
                        break;
                    }
                } catch (e) {
                    console.log('==> Error in handling message : ', e);
                }
            }
            this.pop();
        }
        this.processing = false;
    }
}
