import BackgroundTaskDAO from '../persistence/BackgroundTaskDAO';
import _ from 'lodash';
import moment from 'moment';
import SystemBot from '../bot/SystemBot';
import dce, { Bot } from '../../lib/dce';
import { BotContext } from '../../lib/botcontext';
import { Message, ConversationContext, Auth } from '../capability';
import { MessageHandler } from '../message';
import EventEmitter, { MessageEvents } from '../events';


class BackgroundTaskBotScreen {
    constructor(botId, conversationId, options) {
        this.botId = botId;
        this.conversationId = conversationId;
        this.options = options;
    }

    getBotKey = () => {
        if (this.botId === SystemBot.imBot.botId) {
            return this.conversationId;
        } else {
            return this.botId;
        }
    }

    updateConversationContextId = () => {

    }

    persistMessage = async (message) => {
        await MessageHandler.persistOnDevice(this.getBotKey(), message);
        EventEmitter.emit(MessageEvents.messagePersisted, {message: message});
    }

    tell = (message) => {
        this.persistMessage(message);
    }

    done = () => {

    }

    wait = () => {

    }
}

const process = async () => {
    console.log('BackgroundProcessor::process::called at ', new Date());
    const user = await Auth.getUser();
    if (!user) {
        return;
    }
    const tasks = await BackgroundTaskDAO.selectAllBackgroundTasks();
    console.log('BackgroundProcessor::tasks::', tasks);
    _.forEach(tasks, (task) => {
        processTask(task, user);
    });
};

const getBotManifest = async (botId) => {
    const installedBots = await Bot.allInstalledBots();
    const botManifest = _.find(installedBots, (bot) => {
        return bot.botId === botId
    });
    return botManifest;
}

const processTask = async (task, user) => {
    console.log('BackgroundProcessor::poll::called at ', task);
    const timeNow = moment().valueOf();
    const botManifest = await getBotManifest(task.botId);

    if (!botManifest) {
        BackgroundTaskDAO.deleteBackgroundTask(task.key, task.botId, task.conversationId);
    }

    const botScreen = new BackgroundTaskBotScreen(task.botId, task.conversationId, task.options);
    const botContext = new BotContext(botScreen, botManifest);

    let conversationContext = await getConversationContext(task.botId, user, botContext, botScreen);

    if (!conversationContext) {
        BackgroundTaskDAO.deleteBackgroundTask(task.key, task.botId, task.conversationId);
    }

    if (task.lastRunTime + task.timeInterval < timeNow ||
        (task.lastRunTime + task.timeInterval - timeNow) < 60000 * 5) {
        let message = new Message();
        message.setCreatedBy({addedByBot: true, messageDate: moment().valueOf()});
        message.backgroundEventMessage(task.key, task.options);
        await processMessage(message, botManifest, botContext, true);
        await BackgroundTaskDAO.updateBackgroundTaskLastRun(task.key, task.botId, task.conversationId, moment().valueOf());
    }
}

const getConversationContext = async (botId, user, botContext, createContext = false) => {
    if (!createContext) {
        if (botId === SystemBot.imBot.botId) {
            return await Promise.resolve(ConversationContext.fetchIMConversationContext(botContext, user));
        } else {
            return await Promise.resolve(ConversationContext.fetchConversationContext(botContext, user));
        }
    } else {
        if (botId !== SystemBot.imBot.botId) {
            return await Promise.resolve(ConversationContext.getConversationContext(botContext, user));
        }
    }
}

const processMessage = async(message, botManifest, botContext, createContext = false) => {
    const dceBot = dce.bot(botManifest, botContext);
    const bot = await dceBot.Load(botContext);
    bot.next(message, {}, [], botContext);
}

const processAsyncMessage = async(message, botManifest, botContext, createContext = false) => {
    const dceBot = dce.bot(botManifest, botContext);
    const bot = await dceBot.Load(botContext);
    bot.async(message, {}, [], botContext);
}

const sendBackgroundAsyncMessage = async (message, botId, conversationId = undefined, createContext = false) => {
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
    let conversationContext = await getConversationContext(botId, user, botContext, createContext);
    if (!conversationContext) {
        return;
    }
    await processAsyncMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, { botId: botId, conversationId: conversationId, message: message});
}

const sendBackgroundMessage = async (message, botId, conversationId = undefined, createContext = false) => {
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
    let conversationContext = await getConversationContext(botId, user, botContext, createContext);
    if (!conversationContext) {
        return;
    }
    console.log('Sending message : ', message);
    await processMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, { botId: botId, conversationId: conversationId, message: message});
}


const sendUnauthBackgroundMessage = async (message, botId, conversationId = undefined, createContext = false) => {
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        return;
    }
    const botScreen = new BackgroundTaskBotScreen(botId, conversationId);
    const botContext = new BotContext(botScreen, botManifest);
    let conversationContext = await getConversationContext(botId, undefined, botContext, createContext);
    if (!conversationContext) {
        return;
    }
    await processMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, { botId: botId, conversationId: conversationId, message: message});
}

const sendBackgroundIMMessage = async (message, botId, conversationId = undefined, createContext = false) => {
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
    let conversationContext = await getConversationContext(botId, user, botContext, createContext);
    if (!conversationContext) {
        return;
    }
    await processAsyncMessage(message, botManifest, botContext);
    EventEmitter.emit(MessageEvents.messageProcessed, { botId: botId, conversationId: conversationId, message: message});
}

export default {
    process: process,
    sendBackgroundMessage: sendBackgroundMessage,
    sendBackgroundIMMessage: sendBackgroundIMMessage,
    sendBackgroundAsyncMessage: sendBackgroundAsyncMessage,
    sendUnauthBackgroundMessage: sendUnauthBackgroundMessage
};
