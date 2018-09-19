import Bot from './Bot';

class DCE {
    constructor() {
        this.bots = {};
    }

    bot(options) {
        console.log('DCE>>>>>>>>>>>>> ' + options)

        let bot = new Bot(options);

        this.bots[bot.botId] = bot;

        return bot;
    }

    // TODO: if bot exists 'bring it back'
}

export default DCE;
