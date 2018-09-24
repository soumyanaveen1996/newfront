// Import the capabilities
import * as Capabilities from '../capability/';
// Always use our defined promise
import Promise from '../Promise';

export default class BotContext {
    // Require a bot on which this can act on
    constructor(botScreen, botManifest) {
        if (!botScreen) {
            throw new Error('Developer error - Bot context requires botScreen');
        }
        this.botScreen = botScreen;
        this.botManifest = botManifest;
        // this.capabilities = Capabilities;
        this.capabilities = {
            ...Capabilities
        };
        this.conversationContext = null;
    }

    addCapability = (name, capability) => {
        this.capabilities[name] = capability;
    };

    getCapability = name => {
        const capability = this.capabilities[name];

        // TODO: @Kartik's favorite error handling goes here
        if (!capability) {
            throw new Error(
                'This capability is not supported on this device: [' +
                    name +
                    ']'
            );
        }
        return capability;
    };

    setConversationContext = context => {
        this.conversationContext = context;
    };

    getConversationContext = () => {
        return this.conversationContext;
    };

    updateConversationContextId = contextId => {
        //const previousConversaionContext = this.conversationContext;
        //this.conversationContext = context;
        console.log('New Context ID : ', contextId);
        this.botScreen.updateConversationContextId(contextId);
    };

    // Delegate back to the actual instance of the screen (people chat vs bot chat vs channel etc)
    // Returns conversationId for channels and IM chat.
    getBotKey = () => {
        return this.botScreen.getBotKey();
    };

    // Actual botId.
    getBotId = () => {
        return this.botManifest.botId;
    };

    tell = payload =>
        new Promise(resolve => {
            if (typeof payload === 'string') {
                const Message = this.getCapability('Message');
                let message = new Message();
                message.stringMessage(payload);
                message.messageByBot(true);
                resolve(this.botScreen.tell(message));
            } else {
                payload.messageByBot(true);
                resolve(this.botScreen.tell(payload));
            }
        });

    done = () =>
        new Promise(resolve => {
            resolve(this.botScreen.done());
        });

    wait = (shouldWait = true) => {
        this.botScreen.wait(shouldWait);
    };
}
