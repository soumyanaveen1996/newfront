import BackgroundTaskDAO from '../persistence/BackgroundTaskDAO';
import _ from 'lodash';
import moment from 'moment';
import SystemBot, { SYSTEM_BOT_MANIFEST } from '../bot/SystemBot';
import dce, { Bot } from '../../lib/dce';
import { BotContext } from '../../lib/botcontext';
import { Message, ConversationContext, Auth } from '../capability';
import { MessageHandler } from '../message';
import EventEmitter, { MessageEvents } from '../events';

class BackgroundTaskBotScreen {
    constructor(botId, conversationId, message, options) {
        this.botId = botId;
        this.conversationId = conversationId;
        this.receivedMessage = message;
        this.options = options;
        this.receivedMessageProcessed = false;
    }

    getBotKey = () => {
        if (this.botId === SystemBot.imBot.botId) {
            return this.conversationId;
        } else {
            return this.botId;
        }
    };

    updateConversationContextId = () => {};

    persistMessage = async message => {
        await MessageHandler.persistOnDevice(this.getBotKey(), message);
        if (this.receivedMessage && !this.receivedMessageProcessed) {
            EventEmitter.emit(MessageEvents.messageProcessed, {
                botId: this.botId || this.receivedMessage.bot,
                conversationId:
                    this.conversationId || this.receivedMessage.conversation,
                message: this.receivedMessage
            });
            this.receivedMessageProcessed = true;
        }
        EventEmitter.emit(MessageEvents.messagePersisted, {
            botId: this.botId,
            conversationId: this.conversationId,
            message: message
        });
    };

    tell = message => {
        this.persistMessage(message);
    };

    done = () => {};

    wait = () => {};
}

const process = async () => {
    const user = await Auth.getUser();
    if (!user) {
        return;
    }
    const tasks = await BackgroundTaskDAO.selectAllBackgroundTasks();
    console.log('BackgroundProcessor::tasks::', tasks);
    _.forEach(tasks, task => {
        processTask(task, user);
    });
};

const getBotManifest = async botId => {
    const installedBots = await Bot.allInstalledBots();
    const botManifest = _.find(installedBots, bot => {
        return bot.botId === botId;
    });

    if (botManifest) {
        return botManifest;
    }

    const systemBots = SYSTEM_BOT_MANIFEST;
    const systemBotManifest = _.find(systemBots, bot => {
        return bot.botId === botId;
    });
    return systemBotManifest;
};

const processTask = async (task, user) => {
    console.log('BackgroundProcessor::poll::called at ', task);
    const timeNow = moment().valueOf();
    const botManifest = await getBotManifest(task.botId);

    if (!botManifest) {
        BackgroundTaskDAO.deleteBackgroundTask(
            task.key,
            task.botId,
            task.conversationId
        );
    }

    const botScreen = new BackgroundTaskBotScreen(
        task.botId,
        task.conversationId,
        undefined,
        task.options
    );
    const botContext = new BotContext(botScreen, botManifest);

    let conversationContext = await getConversationContext(
        task.botId,
        user,
        botContext,
        botScreen
    );

    if (!conversationContext) {
        BackgroundTaskDAO.deleteBackgroundTask(
            task.key,
            task.botId,
            task.conversationId
        );
    }

    if (
        task.lastRunTime + task.timeInterval < timeNow ||
        task.lastRunTime + task.timeInterval - timeNow < 60000 * 5
    ) {
        let message = new Message();
        message.setCreatedBy({
            addedByBot: true,
            messageDate: moment().valueOf()
        });
        message.backgroundEventMessage(task.key, task.options);
        await processMessage(message, botManifest, botContext, true);
        await BackgroundTaskDAO.updateBackgroundTaskLastRun(
            task.key,
            task.botId,
            task.conversationId,
            moment().valueOf()
        );
    }
};

const getConversationContext = async (
    botId,
    user,
    botContext,
    createContext = false
) => {
    if (!createContext) {
        if (botId === SystemBot.imBot.botId) {
            return await Promise.resolve(
                ConversationContext.fetchIMConversationContext(botContext, user)
            );
        } else {
            return await Promise.resolve(
                ConversationContext.fetchConversationContext(botContext, user)
            );
        }
    } else {
        if (botId !== SystemBot.imBot.botId) {
            return await Promise.resolve(
                ConversationContext.getConversationContext(botContext, user)
            );
        }
    }
};

const processMessage = async (
    message,
    botManifest,
    botContext,
    createContext = false
) => {
    const dceBot = dce.bot(botManifest, botContext);
    let bot;
    for (let i = 0; i < 3; ++i) {
        bot = await dceBot.Load(botContext);
        if (bot) {
            break;
        }
    }
    bot.next(message, {}, [], botContext);
};

const sendBackgroundMessage = async (
    message,
    botId,
    conversationId = undefined,
    createContext = false
) => {
    const user = await Auth.getUser();
    if (!user) {
        return;
    }
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        return;
    }

    const botScreen = new BackgroundTaskBotScreen(botId, conversationId);
    const botContext = new BotContext(botScreen, botManifest);
    let conversationContext = await getConversationContext(
        botId,
        user,
        botContext,
        createContext
    );
    if (!conversationContext) {
        return;
    }
    await processMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, {
        botId: botId,
        conversationId: conversationId,
        message: message
    });
};

const sendUnauthBackgroundMessage = async (
    message,
    botId,
    conversationId = undefined,
    createContext = false
) => {
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        return;
    }
    const botScreen = new BackgroundTaskBotScreen(botId, conversationId);
    const botContext = new BotContext(botScreen, botManifest);
    let conversationContext = await getConversationContext(
        botId,
        undefined,
        botContext,
        createContext
    );
    if (!conversationContext) {
        return;
    }
    await processMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, {
        botId: botId,
        conversationId: conversationId,
        message: message
    });
};

const processAsyncMessage = async (
    message,
    botManifest,
    botContext,
    createContext = false
) => {
    const dceBot = dce.bot(botManifest, botContext);
    const bot = await dceBot.Load(botContext);
    bot.asyncResult(message, {}, [], botContext);
};

const sendBackgroundAsyncMessage = async (
    message,
    botId,
    conversationId = undefined,
    createContext = false
) => {
    const user = await Auth.getUser();
    if (!user) {
        return;
    }
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        return;
    }

    const botScreen = new BackgroundTaskBotScreen(
        botId,
        conversationId,
        message
    );
    const botContext = new BotContext(botScreen, botManifest);
    let conversationContext = await getConversationContext(
        botId,
        user,
        botContext,
        createContext
    );
    if (!conversationContext) {
        return;
    }
    await processAsyncMessage(message, botManifest, botContext);
};

const sendBackgroundIMMessage = async (
    message,
    botId,
    conversationId = undefined,
    createContext = false
) => {
    const user = await Auth.getUser();
    if (!user) {
        return;
    }
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        return;
    }
    const botScreen = new BackgroundTaskBotScreen(
        botId,
        conversationId,
        message
    );
    const botContext = new BotContext(botScreen, botManifest);
    let conversationContext = await getConversationContext(
        botId,
        user,
        botContext,
        createContext
    );
    if (!conversationContext) {
        return;
    }
    await processAsyncMessage(message, botManifest, botContext);
};

export default {
    process: process,
    sendBackgroundMessage: sendBackgroundMessage,
    sendBackgroundIMMessage: sendBackgroundIMMessage,
    sendBackgroundAsyncMessage: sendBackgroundAsyncMessage,
    sendUnauthBackgroundMessage: sendUnauthBackgroundMessage
};
