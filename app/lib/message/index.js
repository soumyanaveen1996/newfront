import MH from './MessageHandler';

// We want just once instance of MessageHandler - since this is making sure events are set on the main instance
let MessageHandler = new MH();

export { MessageHandler };
