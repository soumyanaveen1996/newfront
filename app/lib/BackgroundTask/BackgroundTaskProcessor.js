import BackgroundTaskDAO from '../persistence/BackgroundTaskDAO';
import _ from 'lodash';
import moment from 'moment';
import SystemBot from '../bot/SystemBot';
import dce, { Bot } from '../../lib/dce';
import { BotContext } from '../../lib/botcontext';
import { Message, ConversationContext, Auth } from '../capability';

class BackgroundTaskBotScreen {
    constructor(botId, conversationId, options) {
        this.botId = botId;
        this.conversationId = conversationId;
        this.options = options;
    }

    getBotKey() {
        if (this.botId === SystemBot.imBot.botId) {
            return this.conversationId;
        } else {
            return this.botId;
        }
    }

    updateConversationContextId() {

    }

    tell() {

    }

    done() {

    }

    wait() {

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
    const installedBots = await Bot.allInstalledBots();
    _.forEach(tasks, (task) => {
        processTask(task, user, installedBots);
    });
};

const processTask = async (task, user, installedBots) => {
    console.log('BackgroundProcessor::poll::called at ', task);
    console.log('BackgroundProcessor::poll::called at ', user);
    const timeNow = moment().valueOf();
    const botManifest = _.find(installedBots, (bot) => {
        return bot.botId === task.botId
    });

    if (!botManifest) {
        BackgroundTaskDAO.deleteBackgroundTask(task.key, task.botId, task.conversationId);
    }

    let conversationContext;
    const botScreen = new BackgroundTaskBotScreen(task.botId, task.conversationId, task.options);
    const botContext = new BotContext(botScreen, botManifest);

    if (task.botId === SystemBot.imBot.botId) {
        conversationContext = await Promise.resolve(ConversationContext.fetchIMConversationContext(botContext, user));
    } else {
        conversationContext = await Promise.resolve(ConversationContext.fetchConversationContext(botContext, user));
    }

    if (!conversationContext) {
        BackgroundTaskDAO.deleteBackgroundTask(task.key, task.botId, task.conversationId);
    }

    if (task.lastRunTime + task.timeInterval < timeNow ||
        (task.lastRunTime + task.timeInterval - timeNow) < 60000 * 5) {
        const dceBot = dce.bot(botManifest, botContext);
        const bot = await dceBot.Load(botContext);
        let message = new Message();
        message.setCreatedBy({addedByBot: true, messageDate: moment().valueOf()});
        message.backgroundEventMessage(task.key, task.options);
        bot.next(message, {}, [], botContext);
    }
}


export default {
    process: process,
};
