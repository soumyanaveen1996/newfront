import { Contact, Promise, ConversationContext, MessageTypeConstants } from '../../lib/capability';
import { MessageHandler } from '../../lib/message';
import { Queue } from '../../lib/network';
import { IM_CHAT } from '../../lib/conversation/Conversation';
import ChannelDAO from '../../lib/persistence/ChannelDAO';

const getMessageDataForBot = (bot) => new Promise((resolve, reject) => {
    // Bot id is the botkey for bot chats
    return resolve(getMessageDataFor(bot.botId));
});

const getMessageDataForConversation = (conversation, user) => new Promise((resolve, reject) => {
    let context = null;
    let chatName = '';
    var otherUserId = null;
    // TODO: This is not a very performant code - we need to optimize this!
    if (conversation.type === IM_CHAT) {
        ConversationContext.getBotConversationContextForId(conversation.conversationId)
            .then((conversationContext) => {
                context = conversationContext;
                chatName = ConversationContext.getChatName(context, user)
                otherUserId = ConversationContext.getOtherUserId(context, user)
                return Contact.getContactFieldForUUIDs([context.creatorInstanceId]);
            })
            .then((contacts) => {
                if (contacts.length === 0 || !contacts[0].ignored) {
                    getMessageDataForConversationFromServer(conversation, context, chatName, otherUserId)
                        .then((data) => {
                            resolve(data);
                        })
                } else {
                    // For ignored users, we don't want to fetch the details from the server.
                    resolve({
                        totalUnread: 0,
                        chatName: chatName
                    });
                }
            })
    } else {
        //let channel = null;
        ConversationContext.getBotConversationContextForId(conversation.conversationId)
            .then((conversationContext) => {
                context = conversationContext;
                chatName = ConversationContext.getChatName(context, user)
                return ChannelDAO.selectChannelByConversationId(conversation.conversationId);
            })
            .then((channel) => {
                getMessageDataForConversationFromServer(conversation, context, chatName, undefined)
                    .then((data) => {
                        data.channel = channel;
                        resolve(data);
                    });
            })
            .catch(reject);
    }
});

const getMessageDataForConversationFromServer = (conversation, conversationContext, chatName, otherUserId) => new Promise((resolve, reject) => {
    getMessageDataFor(conversation.conversationId)
        .then((results) => {
            results.chatName = chatName;
            results.otherUserId = otherUserId;
            resolve(results);
        })
        .catch((e) => {
            reject(e);
        });
});

const getMessageDataFor = (botKey) => new Promise((resolve, reject) => {
    let message = null;
    let totalUnread = 0;
    let lastMessageDate = new Date('1970');
    loadLastMessage(botKey)
        .then((messages) => {
            if (messages.length > 0) {
                message = messages[0].message;
                lastMessageDate = message.getMessageDate();
            }
            return message;
        })
        .then(() => {
            return loadBotUnreadCount(botKey);
        })
        .then((count) => {
            totalUnread += count;
            return loadPendingAsyncResults(botKey);
        })
        .then((pendingResults) => {
            pendingResults = pendingResults || [];
            totalUnread += pendingResults.length;
            if (pendingResults.length > 0) {
                // This means there is pending results - so date is right now!
                lastMessageDate = new Date();
            }
            resolve({
                lastMessage: message,
                totalUnread: totalUnread,
                lastMessageDate: lastMessageDate
            });
        })
        .catch((e) => {
            reject(e);
        });
});

const loadLastMessage = (key) => {
    return MessageHandler.fetchDeviceMessages(key, 1, 0, [MessageTypeConstants.MESSAGE_TYPE_SESSION_START])
}

const loadBotUnreadCount = (key) => {
    return MessageHandler.unreadMessageCount(key)
}

const loadPendingAsyncResults = (key) => {
    return Queue.selectCompletedNetworkRequests(key)
}


export default {
    getMessageDataForBot: getMessageDataForBot,
    getMessageDataForConversation: getMessageDataForConversation
};
