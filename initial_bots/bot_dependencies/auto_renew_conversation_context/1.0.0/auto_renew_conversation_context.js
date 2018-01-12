(function() {
    
      /**
       * Logic:
       *  1. Check if it has been ELAPSED_TIME_FOR_NEW_CONVERSATION_IN_HOURS since last message:
       *  2. If so create a new conversation context and return it
       *  3. If not, check if a conversation context exists for this bot.
       *  4. If yes, return it
       *  5. If not create a new conversation context and return it
       *  
       * Returns the following: 
       * ```
       *  {
       *    conversationId: string,
       *    creatorInstanceId: string,
       *    instanceId: string, // only if set (not the first time)
       *    participants: [strings], // default value: userUUID
       *    onChannels: [], // not used - for future
       *    closed: boolean // When the conversation is initialised must be set to false and remain false until the conversation is closed (a new conversationId is generated).
       *  }
       * ```
       *  
       * @param {*} message 
       * @param {*} botContext 
       * @param {*} previousMessages 
       */
      const getConversationContext = function(message, botContext, previousMessages, user) {
        let lastMessage = previousMessages ? previousMessages[previousMessages.length - 1] : null;
        let DeviceConversationContext = botContext.getCapability('ConversationContext');

        if (!lastMessage) {
          return DeviceConversationContext.createAndSaveNewConversationContext(botContext, user);
        }
        const utils = botContext.getCapability('Utils');
        const moment = utils.moment;

        // Ugly hack due to client side key/message structure - TODO: handle this better!!!!
        lastMessage = lastMessage.message;
        let now = new Date();

        if (moment(now).subtract(ELAPSED_TIME_FOR_NEW_CONVERSATION.NUM, ELAPSED_TIME_FOR_NEW_CONVERSATION.SCALE).toDate() > moment(lastMessage.getMessageDate())) {
          return DeviceConversationContext.createAndSaveNewConversationContext(botContext, user);
        }

        return DeviceConversationContext.getConversationContext(botContext, user);
      };

      const setInstanceId = function(instanceId, botContext) {
        let DeviceConversationContext = botContext.getCapability('ConversationContext');
        return DeviceConversationContext.setInstanceId(instanceId, botContext);
      };

      const getPreviousConversationContexts = function(botContext, user) {
        let DeviceConversationContext = botContext.getCapability('ConversationContext');
        return DeviceConversationContext.setInstanceId(botContext, user);
      };

      const activateConversationContext = function(context, botContext, user) {
        let DeviceConversationContext = botContext.getCapability('ConversationContext');
        return DeviceConversationContext.setInstanceId(context, botContext, user);
      };

      // 1 Day - moment's config essentially
      const ELAPSED_TIME_FOR_NEW_CONVERSATION = {
        NUM: 24,
        SCALE: 'hours'
      };
    
      return {
        getConversationContext: getConversationContext,
        setInstanceId: setInstanceId,
        getPreviousConversationContexts: getPreviousConversationContexts,
        activateConversationContext: activateConversationContext
      };
    })();