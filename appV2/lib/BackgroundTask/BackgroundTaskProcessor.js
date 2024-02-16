import _ from 'lodash';
import moment from 'moment';
import { InteractionManager } from 'react-native';
import BackgroundTaskDAO from '../persistence/BackgroundTaskDAO';
import SystemBot, { SYSTEM_BOT_MANIFEST } from '../bot/SystemBot';
import dce, { Bot } from '../dce';
import { BotContext } from '../botcontext';
import { Message, ConversationContext, Auth, Utils } from '../capability';
import { MessageHandler } from '../message';
import EventEmitter, { MessageEvents } from '../events';
import Store from '../../redux/store/configureStore';
import RemoteLogger from '../utils/remoteDebugger';
import TimelineBuilder from '../TimelineBuilder/TimelineBuilder';

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
        }
        return this.botId;
    };

    updateConversationContextId = () => {};

    persistMessage = async (message, rebuildTimeline) => {
        await MessageHandler.persistOnDevice(this.conversationId, message);
        // Just a check
        if (this.receivedMessage && !this.receivedMessageProcessed) {
            EventEmitter.emit(MessageEvents.messageProcessed, {
                botId: this.botId || this.receivedMessage.bot,
                conversationId:
                    this.conversationId || this.receivedMessage.conversation,
                message: this.receivedMessage
            });
            this.receivedMessageProcessed = true;
        }
        if (rebuildTimeline) {
            setTimeout(() => {
                TimelineBuilder.buildTiimeline();
            }, 0);
        }

        EventEmitter.emit(MessageEvents.messagePersisted, {
            botId: this.botId,
            conversationId: this.conversationId,
            message
        });
    };

    tell = (message) => {
        this.persistMessage(message);
    };

    log = (payload) => {
        this.sendLog(payload);
    };

    sendLog = (params) => {
        console.log(
            '======>>> log request from bot: params in sednlaog, ignored',
            params
        );
        // Utils.addLogEntry(params);
    };

    done = () => {};

    wait = () => {};
}

const generateScreen = (botId, conversationId) =>
    new BackgroundTaskBotScreen(botId, conversationId);

const process = async () => {
    const user = Auth.getUserData();
    if (!user) {
        return;
    }
    // RemoteLogger('Process Background Tasks');
    const tasks = await BackgroundTaskDAO.selectAllBackgroundTasks();
    _.forEach(tasks, (task) => {
        processTask(task, user);
    });
};

export const getBotManifest = async (botId) => {
    const installedBots = await Bot.allInstalledBots();
    const botManifest = _.find(installedBots, (bot) => bot.botId === botId);

    if (botManifest) {
        return botManifest;
    }

    const systemBots = SYSTEM_BOT_MANIFEST;
    const systemBotManifest = _.find(systemBots, (bot) => bot.botId === botId);
    return systemBotManifest;
};

const processTask = async (task, user) => {
    // console.log('BackgroundProcessor::poll::called at ', task);
    const activeBot = Store.getState().bots.id;
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

    const conversationContext = await getConversationContext(
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
        task.lastRunTime + task.timeInterval <
        timeNow
        // task.lastRunTime + task.timeInterval < timeNow ||
        // task.lastRunTime + task.timeInterval - timeNow < 60000 * 5
    ) {
        const message = new Message();
        message.setCreatedBy({
            addedByBot: true,
            messageDate: moment().valueOf()
        });
        message.backgroundEventMessage(task.key, task.options);

        if (activeBot == task.botId) {
            EventEmitter.emit(MessageEvents.messageSend, {
                message,
                botId: activeBot
            });
        } else {
            await processMessage(message, botManifest, botContext, true);
        }
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
        }
        return await Promise.resolve(
            ConversationContext.fetchConversationContext(botContext, user)
        );
    }
    if (botId !== SystemBot.imBot.botId) {
        return await Promise.resolve(
            ConversationContext.getConversationContext(botContext, user)
        );
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
    const user = Auth.getUserData();
    if (!user) {
        return;
    }
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        console.log('Sourav Logging:::: No Bot Manifest Found');
        return;
    }

    const botScreen = new BackgroundTaskBotScreen(botId, conversationId);
    const botContext = new BotContext(botScreen, botManifest);
    const conversationContext = await getConversationContext(
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
        botId,
        conversationId,
        message
    });
};

export const sendBackgroundMessageSafe = async (
    message,
    botId,
    conversationId,
    options = {}
) => {
    const user = Auth.getUserData();
    if (!user) {
        return;
    }
    const activeBot = Store.getState().bots.id;
    const botManifest = await getBotManifest(botId);
    if (!botManifest) {
        console.log('Sourav Logging:::: No Bot Manifest Found');
        return;
    }

    const botScreen = new BackgroundTaskBotScreen(
        botId,
        conversationId,
        undefined,
        options
    );
    const botContext = new BotContext(botScreen, botManifest);
    const conversationContext = await getConversationContext(
        botId,
        user,
        botContext,
        botScreen
    );
    if (!conversationContext) {
        RemoteLogger(
            'Location Tracker:::: No Conversation Context - Cannot Send data'
        );
        return;
    }
    if (activeBot == botId) {
        RemoteLogger('Location Tracker:::: Sending Location to Bot');
        EventEmitter.emit(MessageEvents.messageSend, {
            message,
            botId: activeBot
        });
    } else {
        RemoteLogger('Location Tracker:::: Sending Location to Bot');
        await processMessage(message, botManifest, botContext, true);
    }
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
    const conversationContext = await getConversationContext(
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
        botId,
        conversationId,
        message
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
    const user = Auth.getUserData();
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
    const conversationContext = await getConversationContext(
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
    const user = Auth.getUserData();
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
    const conversationContext = await getConversationContext(
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

const processLastMessageonLoad = async (
    message,
    botId,
    conversationId = undefined,
    createContext = false,
    rebuildTimeline = true
) => {
    const user = Auth.getUserData();
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
    const conversationContext = await getConversationContext(
        botId,
        user,
        botContext,
        createContext
    );
    if (!conversationContext) {
        return;
    }

    const { contentType } = message;
    if (message.createdBy === user.userId) {
        // Self Message --> Just Persist this
        const myMessage = new Message({
            uuid: message.messageId,
            messageDate: message.createdOn
        });
        myMessage.setCreatedBy(user.userId);
        myMessage.setRead(true);
        const messageStr = message?.details[0]?.message;
        if (contentType === '30') {
            myMessage.imageMessage(messageStr);
            botScreen.persistMessage(myMessage, rebuildTimeline);
            return;
        }
        if (contentType === '40') {
            myMessage.videoMessage(messageStr);
            botScreen.persistMessage(myMessage, rebuildTimeline);
            return;
        }
        if (contentType === '60') {
            myMessage.audioMessage(messageStr);
            botScreen.persistMessage(myMessage, rebuildTimeline);
            return;
        }

        myMessage.stringMessage(messageStr);
        botScreen.persistMessage(myMessage, rebuildTimeline);
        return;
    }

    await processAsyncMessage(message, botManifest, botContext);
};

export default {
    generateScreen,
    process,
    sendBackgroundMessage,
    sendBackgroundIMMessage,
    sendBackgroundAsyncMessage,
    sendUnauthBackgroundMessage,
    processLastMessageonLoad
};
