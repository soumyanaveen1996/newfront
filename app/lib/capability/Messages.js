import { MessageDAO } from '../persistence';

export default class Messages {
    /**
     * Removes the messages corresponding to the bot from local db.
     *
     * @param botKey Bot Key of the bot
     *
     * @return returns a promise that resolves on success and rejects on failure.
     */
    static removeMessages = botKey => MessageDAO.deleteBotMessages(botKey);
}
