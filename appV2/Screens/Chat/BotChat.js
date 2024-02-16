import ChatBotScreen from './ChatBotScreen';
import { ConversationContext, DeviceStorage } from '../../lib/capability';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';
import { FAVOURITE_BOTS } from '../../lib/RemoteBotInstall';
//TODO: review for optimization
export default class BotChat extends ChatBotScreen {
    constructor(props) {
        super(props);

        // id is the key (not name) - this ties up with the backend too
        this.botKey = props.route.params.bot.botId;
        // console.log('123 ---- i am in the botChat');
        DeviceStorage.getArrayValues(FAVOURITE_BOTS).then((favBotsArray) => {
            const isFav = favBotsArray.find((b) => b === this.botKey);
            if (isFav) {
                this.props.navigation.setParams({ isFavorite: true });
            }
            console.log(isFav);
        });
    }

    getBotKey = () => {
        return this.botKey;
    };

    showBotName = () => {
        return true;
    };
    // Can be overriden from sub classes (PeopleChat)
    async getConversationContext(botContext, user) {
        try {
            let context = await Promise.resolve(
                ConversationContext.getConversationContext(botContext, user)
            );
            console.log('the context ', context);
            return context;
        } catch (error) {
            console.log('Error getting a conversation context for bot chat');
            throw error;
        }
    }

    logGoogleAnalytics() {
        GoogleAnalytics.logEvents(
            GoogleAnalyticsEventsCategories.CHAT,
            GoogleAnalyticsEventsActions.BOT_OPENED,
            this.props.route.params.bot.botName,
            0,
            null
        );
    }
}
