import { MessageCounter } from '../MessageCounter';

class MessageQuota {
    static setQuota(quota, messageCounts) {
        console.log('MessageQuota :: In setQuota');
        // MessageCounter.setMessageQuota(quota, messageCounts);
    }

    static getUsedMessageQuota() {
        console.log('MessageQuota :: In getUsedQuota');
        // return MessageCounter.getUsedMessageQuota();
    }

    static getAvailableBotMessageQuota(botId) {
        console.log(
            'MessageQuota :: In getAvailableBotMessageQuota for botId : ',
            botId
        );
        // return MessageCounter.getAvailableBotMessageQuota(botId);
    }
}

export default MessageQuota;
