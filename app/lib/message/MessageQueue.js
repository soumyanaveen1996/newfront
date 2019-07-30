import { Auth } from '../capability';
import { Queue, IMBotMessageHandler } from '../network';
import { MessageDAO, NetworkDAO } from '../persistence';
import EventEmitter, { AuthEvents, MessageEvents } from '../events';
import { BackgroundTaskProcessor } from '../BackgroundTask';
import Store from '../../redux/store/configureStore';

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
        console.log('User data fetched : ');
        this.clear();
    }

    userLoggedOutHandler() {
        this.clear();
    }

    push(message) {
        console.log('Message  to enqueued : ', message);
        this.queue[this.queueLength++] = message;
        this.process();
    }

    top() {
        if (this.queueLength > 0) {
            return this.queue[0];
        } else {
            return undefined;
        }
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
        } else {
            return undefined;
        }
    }

    async isMessageAlreadyProcessed(message) {
        console.log('Sourav Logging:::: Processing Message', message);
        if (
            message.messageId === '' ||
            message.messageId == null ||
            !message.messageId
        ) {
            console.log('Sourav Logging:::: No message id', message);
            return false;
        }
        try {
            const networkItem = await NetworkDAO.selectByMessageId(
                message.messageId
            );
            const dbMessage = await MessageDAO.selectMessageById(
                message.messageId
            );
            console.log('Sourav Logging:::: Message in Database', dbMessage);
            if (dbMessage || networkItem) {
                console.log(
                    'Sourav Logging:::: Message Already processed',
                    message
                );
                return true;
            }
        } catch (error) {
            console.log('Error while checking message : ', error);
        }
        return false;
    }

    //    Sample message
    //     { 'createdBy': 'test2',
    //         'bot': 'IMBot',
    //         'requestUuid': '',
    //         'details': [
    //         {
    //             'options': [
    //                 'op1',
    //                 'op2'
    //             ]
    //         }
    //     ],
    //         'contentType': 2,
    //         'createdOn': 1502381820277,
    //         'conversation': 'uuid123',
    //         'messageId': 'uuid1223',
    // //}

    async handleMessage(message) {
        let user = await Auth.getUser();
        console.log(
            'Sourav Logging:::: Processing Message:::',
            message.messageId
        );
        const alreadyProcessed = await this.isMessageAlreadyProcessed(message);
        if (alreadyProcessed) {
            return true;
        }

        console.log(
            'Processing message : ',
            message,
            Queue,
            IMBotMessageHandler
        );
        let bot = message.bot;
        // Name of the bot is the key, unless its IMBot (one to many relationship)
        if (bot === 'im-bot' || bot === 'channels-bot') {
            await IMBotMessageHandler.handleMessage(message, user);
        } else {
            // If our Bot is currently in Foreground then Handle Differently
            const activeBot = Store.getState().bots.id;
            const messageBot = message.bot;
            if (activeBot && activeBot === messageBot) {
                EventEmitter.emit(MessageEvents.messageProcessed, {
                    message,
                    botId: messageBot
                });
            } else {
                console.log('Sourav Logging:::: Bot in Background Handle it!!');
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
            console.log(
                'Processing Message : ',
                message.details,
                this.queueLength
            );
            for (let i = 0; i < this.retryCount; ++i) {
                try {
                    const success = await this.handleMessage(message);
                    console.log('Message handle state : ', success);
                    if (success) {
                        break;
                    }
                } catch (e) {
                    console.log('Error in handling message : ', e);
                }
            }
            this.pop();
        }
        this.processing = false;
    }
}
