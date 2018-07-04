import MH from './MessageHandler';
import MQ from './MessageQueue';

// We want just once instance of MessageHandler - since this is making sure events are set on the main instance
let MessageHandler = new MH();
let MessageQueue = new MQ();

export { MessageHandler, MessageQueue };
