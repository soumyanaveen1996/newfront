import ChatBotScreen from './ChatBotScreen';
import { ConversationContext } from '../../lib/capability';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../../lib/GoogleAnalytics';

export default class BotChat extends ChatBotScreen {
    constructor(props) {
        super(props);

        // id is the key (not name) - this ties up with the backend too
        this.botKey = props.bot.botId;
    }

    getBotKey = () => {
        return this.botKey;
    };

    // Can be overriden from sub classes (PeopleChat)
    async getConversationContext(botContext, user) {
        try {
            let context = await Promise.resolve(
                ConversationContext.getConversationContext(botContext, user)
            );
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
            this.props.bot.botName,
            0,
            null
        );
    }
}
