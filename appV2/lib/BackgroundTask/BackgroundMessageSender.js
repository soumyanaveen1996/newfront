import Bot from '../bot';
import BackgroundBotChat from './BackgroundBotChat';

export default class BackgroundMessageSender {
    constructor(props) {
        this.messageQueue = [];
        this.loadedBot = null;
        Bot.getAllInstalledBots().then((bots) => {
            const targetBot = bots.find((bot) => bot.botId === props);
            const bot = new BackgroundBotChat({ bot: targetBot });
            bot.initialize().then(() => {
                console.log(
                    'bacground bot to send messages initilized: ' + targetBot
                );
                this.loadedBot = bot;
                this.sendMessagefromQueue();
            });
        });
    }

    sendMessagefromQueue = () => {
        console.log(
            ' sending message from queu if present ',
            this.messageQueue.length
        );
        this.messageQueue.forEach((message) => {
            this.sendMessage(message);
        });
        this.messageQueue = [];
    };

    sendMessage = (message) => {
        if (this.loadedBot) {
            console.log(' sending message for bg', message);
            this.loadedBot.next(
                message,
                {},
                [],
                this.loadedBot.getBotContext()
            );
        } else {
            console.log(' bot not ready yet, adding to queue', message);
            this.messageQueue.push(message);
        }
    };
}
