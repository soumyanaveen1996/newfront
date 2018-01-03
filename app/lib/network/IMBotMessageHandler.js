import Queue from './Queue';
import { Promise, Contact, Network, ConversationContext } from '../capability';
import { Conversation } from '../conversation';
import { BotContext } from '../botcontext';
import config from '../../config/config';
import { SYSTEM_BOT_MANIFEST } from '../../lib/bot/SystemBot';

/**
 * Guarantees ordering - first in first out
 * @param {object} message 
 * @param {object} user
 */
const handleMessageQueue = (messageQ, user) => {
    messageQ = messageQ || [];
    if (messageQ.length < 1) {
        return;
    }
    // Promise in series from: http://www.datchley.name/promise-patterns-anti-patterns/
    // Execute a list of Promise return functions in series
    function eachSeries(arr, iteratorFn) {
        var index = 0;

        function next() {
            if (index < arr.length) {
                return iteratorFn(arr[index++], user).then(next);
            }
        }
        return Promise.resolve().then(next);
    }

    eachSeries(messageQ, handle);
}

/**
 * Check if the message has to be handled - single message. Queue calls this
 * @param {object} message 
 * @param {object} user
 */
const handle = (message, user) => new Promise((resolve, reject) => {
    const botKey = message.conversation;

    // 1. First check if the conversation Exists - if it does, complete Queue call
    // 2. If the conversation doesn't exist then:
    //  - Get the participants and the creator of this message
    //  - Check whether the creator of the message is a contact for this user 
    //  - If the creator is NOT a contact for this user - then ignore the message and return
    //  - If the creator is indeed a contact this means that this is the first time the user is getting pinged about this message. 
    //  - then, create a new conversation context with the participants, along with the conversationId as the botkey
    //  - then complete Queue call
    Conversation.getIMConversation(botKey)
        .then((conversation) => {
            if (conversation) {
                // Complete the queue call
                return resolve(Queue.completeAsyncQueueResponse(botKey, message));
            } else {
                return resolve(handleNewConversation(message, user));
            }
        })
        .catch((err) => {
            console.log('Error handling the message for IMBot message ', err, message);
        });
});

// 2. If the conversation doesn't exist then:
//  - Get the participants ( are array of {name, uuid} ) and the creator ({name, uuid}) of this message
//  - Check whether the creator of the message is a contact for this user 
//  - If the creator is a ignored contact for this user - then ignore the message and return
//  - If the creator is not a contact in added contacts, this means that this is the first time the user is getting pinged about this message. 
//  - then, create a new conversation context with the participants, along with the conversationId as the botkey
//  - then complete Queue call
const handleNewConversation = (message, user) => new Promise((resolve, reject) => {
    const botKey = message.conversation;
    let isUnignoredContact = false;
    let participants = null;
    let fakeBotContext = getFakeBotKey(botKey);
    let creator = null;

    getConversationData(botKey, user)
        .then((conversationData) => {
            if (conversationData && conversationData.data) {
                const data = conversationData.data;
                if (!data) {
                    return null;
                }

                creator = data.conversationOwner;
                participants = data.participants;
                return Contact.getContactFieldForUUIDs([creator.uuid]);
            }
        })
        .then((contacts) => {
            if (contacts && contacts.length > 0 && contacts[0].ignored) {
                isUnignoredContact = false
            } else {
                isUnignoredContact = true;
                return ConversationContext.createNewConversationContext(fakeBotContext);
            }
        })
        .then((conversationContext) => {
            if (isUnignoredContact && conversationContext) {
                conversationContext.conversationId = botKey;
                ConversationContext.updateParticipants(conversationContext, participants);
                conversationContext.creatorInstanceId = creator.uuid;
                conversationContext.creator = creator;
                return ConversationContext.saveConversationContext(conversationContext, fakeBotContext, user);
            }
        })
        .then((conversationContext) => {
            if (isUnignoredContact && conversationContext) {
                return Conversation.createIMConversation(botKey);
            }
        })
        .then((conv) => {
            if (isUnignoredContact && conv) {
                return Queue.completeAsyncQueueResponse(botKey, message);
            }
        })
        .then(() => {
            resolve();
        })
        .catch((err) => {
            console.log('Error handling the message for IMBot message ', err, message);
        });
});

const getConversationData = (conversationId, user) => {
    let options = {
        'method': 'get',
        'url': getUrl() + '?userUuid=' + user.userUUID + '&conversationId=' + conversationId + '&botId=' + SYSTEM_BOT_MANIFEST.IMChat.id,
        'headers': getHeaders(user)
    };

    function getUrl() {
        return config.proxy.protocol + config.proxy.host + config.proxy.conversationPath;
    }

    function getHeaders() {
        return {
            accessKeyId: user.aws.accessKeyId,
            secretAccessKey: user.aws.secretAccessKey,
            sessionToken: user.aws.sessionToken
        };
    }
    return Network(options);
};

const getFakeBotKey = (botKey) => {
    return new BotContext({
        getBotKey: function () {
            return botKey;
        }
    }, {
        name: 'netWorkPoll'
    });
}

export default {
    handleMessageQueue: handleMessageQueue
};
