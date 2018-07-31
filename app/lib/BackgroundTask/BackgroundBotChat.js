import { ConversationContext, Auth } from '../../lib/capability';
import { BotContext } from '../botcontext';
import SystemBot from '../bot/SystemBot';
import dce from '../../lib/dce';
import { MessageHandler } from '../message';
import moment from 'moment';

const BOT_LOAD_RETRIES = 2;
const PAGE_SIZE = 5;

export default class BackgroundBotChat {
    constructor(props) {
        this.bot = props.bot;
        this.loadedBot = undefined;
        this.botLoaded = false;
        this.botState = {};

        // Create a new botcontext with this as the bot
        this.botContext = new BotContext(this, this.bot);

        this.dce_bot = dce.bot(this.bot, this.botContext);
        this.user = null;
        this.conversationContext = null;
    }

    getBotContext = () => {
        return this.botContext;
    }

    getBotKey = () => {
        return this.bot.botId;
    }

    updateConversationContextId = () => {

    }

    persistMessage = async (message) => {
        await MessageHandler.persistOnDevice(this.getBotKey(), message);
        EventEmitter.emit(MessageEvents.messagePersisted);
    }

    tell = (message) => {
        this.persistMessage(message);
    }

    done = () => {

    }

    wait = () => {

    }

    next = (message, state, messages, botContext) => {
        if (this.loadedBot) {
            this.loadedBot.next(message, state, messages, botContext);
        }
    }

    async initialize() {
        let self = this;

        // 0. load the bot
        for (let i = 0; i < BOT_LOAD_RETRIES; i++) {
            try {
                let botResponse = await this.loadBot();
                self.loadedBot = botResponse;
                break;
            } catch (error) {
                console.log('Bot load error');
            }
        }

        if (!self.loadedBot) {
            throw new Error('Unable to load the bots');
        }

        if (this.bot.maxRequiredPlatformVersion && versionCompare(VersionCheck.getCurrentVersion(), this.bot.maxRequiredPlatformVersion) === 1) {
            throw new Error('Unable to load the botss');
        }

        try {
            // 1. Get the user
            self.user = await Promise.resolve(Auth.getUser());

            // 2. Get the conversation context
            self.conversationContext = await this.getConversationContext(this.botContext, this.user);

            // 3. Get messages for this bot / chat
            this.messages = await this.loadMessages();

            self.botLoaded = true;
        } catch (e) {
            console.log('Error in loading the bot : ', e);
            throw new Error('Unable to load the bot');
        }
    }

    async init() {
        this.loadedBot.init(this.botState, this.messages, this.botContext);
    }

    loadBot = async () => {
        let botResp = await this.dce_bot.Load(this.botContext);
        return botResp;
    }

    async loadMessages() {
        let messages = await MessageHandler.fetchDeviceMessagesBeforeDate(this.getBotKey(), PAGE_SIZE, this.oldestLoadedDate())
        return messages;
    }

    oldestLoadedDate() {
        let date = moment().valueOf();
        if (this.messages && this.messages.length > 0) {
            const message = this.messages[0];
            date = moment(message.message.getMessageDate()).valueOf();
        }
        return date;
    }

    // Can be overriden from sub classes (PeopleChat)
    async getConversationContext(botContext, user) {
        try {
            let context = await Promise.resolve(ConversationContext.getConversationContext(botContext, user));
            return context;
        } catch (error) {
            console.log('Error getting a conversation context for bot chat');
            throw error;
        }
    }
}
