import _ from 'lodash';
import {
    Promise,
    ConversationContext,
    Auth,
    DeviceStorage,
    Contact
} from '../capability';
import Conversation from '../conversation/Conversation';
import Bot from '../bot';
import { BotContext } from '../botcontext';
import Utils from '../utils/MainScreenUtils';
import Store from '../../redux/store/configureStore';
import { timelineRebuild } from '../../redux/actions/UserActions';
import SystemBot, { SYSTEM_BOT_MANIFEST } from '../bot/SystemBot';
import EventEmitter, { TimelineEvents } from '../events';
import configToUse from '../../config/config';

export const FAVOURITE_BOTS = 'favourite_bots';
class TimelineBuilder {
    constructor() {
        this.queueCount = 0;
        this.isRunning = false;
    }

    async listenToRefreshEvent() {}

    async buildTiimeline(emitEvent = true) {
        if (this.isRunning) {
            this.queueCount += 1;
            return;
        }

        this.queueCount = 0;
        this.isRunning = true;

        console.log('%cIn Rebuild Timeline', 'color: red; font-size: 20px;');
        Store.dispatch(timelineRebuild(true));
        let bots = [];
        let favBotsArray = [];
        if (configToUse.customHomeScreen) {
        } else {
            const allBots = await Bot.getInstalledBots();
            const defaultBots = await SystemBot.getDefaultBots();
            bots = _.reject(allBots, (bot) =>
                _.find(defaultBots, { botId: bot.botId })
            );
            favBotsArray = await DeviceStorage.getArrayValues(FAVOURITE_BOTS);
        }

        const conversations =
            (await Promise.resolve(Conversation.getLocalConversations())) || [];
        const user = Auth.getUserData();
        const contacts = await Contact.getAddedContacts();
        const vesselDirectory = contacts
            .filter((contact) => contact.type === 'Vessels')
            .map((vessel) => vessel.userId);
        // All
        const allChats = [];
        conversations.forEach((conversation) => {
            allChats.push({
                key: conversation.conversationId,
                type: 'conversation',
                bot: conversation
            });
        });
        if (bots) {
            const allBots = bots.map((bot) => {
                if (bot.botId) {
                    const botIndex = bot.botId;
                    if (favBotsArray && favBotsArray.indexOf(botIndex) !== -1) {
                        bot.favorite = 1;
                    }
                }

                return bot;
            });

            const assistant = SYSTEM_BOT_MANIFEST[SystemBot.assistant];
            allBots.forEach((bot) => {
                if (bot.botId !== assistant?.botId) {
                    allChats.push({ key: bot.botId, type: 'bot', bot });
                }
            });
        }
        let allChatsData = [];
        for (let index = 0; index < allChats.length; index++) {
            try {
                const conversation = allChats[index];
                let chatData = null;
                if (conversation.type === 'bot') {
                    // bot conversations are not directly stored, create conversation context and pass the conversation id
                    const botContext = new BotContext(this, conversation.bot);
                    const conversationContext =
                        await ConversationContext.getConversationContext(
                            botContext,
                            user
                        );
                    chatData = await Utils.getMessageDataForBot(
                        conversationContext.conversationId,
                        user.info.userId
                    );

                    if (
                        conversation.bot.unreadCount !== -1 &&
                        chatData.totalUnread === 1
                    ) {
                        chatData.totalUnread = conversation.bot.unreadCount;
                    }

                    if (chatData.lastMessage) {
                        chatData.display_message =
                            chatData.lastMessage.getDisplayMessage();
                    } else {
                        chatData.display_message = '';
                        chatData.lastMessageDate =
                            Store.getState()?.session?.user?.provider?.lastRefreshTime;
                    }
                } else {
                    chatData = await Promise.resolve(
                        Utils.getMessageDataForConversation(
                            conversation.bot,
                            user
                        )
                    );
                    if (conversation.bot.unreadCount !== -1) {
                        chatData.totalUnread = conversation.bot.unreadCount;
                    }
                    if (chatData.lastMessage) {
                        chatData.display_message =
                            chatData.lastMessage.getDisplayMessage();
                    } else {
                        chatData.display_message = '';
                    }
                }
                if (chatData) {
                    conversation.chatData = chatData;
                    allChatsData.push(conversation);
                } else {
                    console.log(
                        'timeline: bot no chat data found for conversation',
                        conversation
                    );
                }
            } catch (e) {
                console.log('timeline: Error getting info for timeline', e);
                allChatsData = [];
                break;
            }
        }
        // console.log('getting all chat data ', allChatsData);
        // Remove All Vessels from the List
        allChatsData = allChatsData.filter(
            (chat) =>
                vesselDirectory.findIndex(
                    (vessel) => vessel === chat.chatData.otherUserId
                ) < 0
        );
        allChatsData = _.uniqBy(allChatsData, 'key');
        // Sort with the most recent date at top
        allChatsData = _.orderBy(
            allChatsData,
            (o) => {
                if (o.chatData.lastMessageDate) {
                    return o.chatData.lastMessageDate;
                }
                if (o.bot.createdOn) {
                    return o.bot.createdOn;
                }
                return 0;
            },
            'desc'
        );
        const favData = allChatsData
            .filter((chat) => chat.bot.favorite == 1)
            .map((chat) => ({
                ...chat,
                elemType: 'favorite'
            }));
        const recentData = allChatsData
            .filter((chat) => !chat.bot.favorite || chat.bot.favorite == 0)
            .map((chat) => ({
                ...chat,
                elemType: 'recents'
            }));
        const timelineData = {
            favData: favData,
            recentData: recentData
        };
        DeviceStorage.save('timeline_data', timelineData);
        Store.dispatch(timelineRebuild(false));
        this.isRunning = false;
        if (this.queueCount) {
            this.buildTiimeline(true);
        }
        if (emitEvent) {
            EventEmitter.emit(TimelineEvents.timelineChanged, timelineData);
        }
        return timelineData;
    }
    getTimeline() {}
}

export default new TimelineBuilder();
