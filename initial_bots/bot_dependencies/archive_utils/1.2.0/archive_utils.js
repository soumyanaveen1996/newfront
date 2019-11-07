(function() {
  const MSG_ARCHIVE_THRESHOLD = 10;
  const ARCHIVE_MSGS_SETTING = 'archiveMessages';

  let archive = function(msg, msgState, isDone, botContext) {
    let msgList = msgState.msgList;
    let MessageTypeConstants = botContext.getCapability('MessageTypeConstants');
    if(msg !== null) {
      let msgType = msg.getMessageType();
      if (
          !(
            MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_LIST === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SLIDER === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SMART_SUGGESTIONS === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_BUTTON === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_MAP_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_CLOSE_FORM === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_WAIT === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SESSION_START === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_UPDATE_CALL_QUOTA === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_MENU === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_STRIPE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_BACKGROUND_EVENT === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_STRIPE_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SEARCH_BOX === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_SEARCH_BOX_RESPONSE === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_CARD_ACTION === msgType ||
            MessageTypeConstants.MESSAGE_TYPE_RUN_MODE === msgType
          )
      ) {
        msgList.push(msg);
      }
    }

    let messagesToArchive = [];
    if (isDone) {
      messagesToArchive = msgList;
    } else {
      messagesToArchive = msgList.length > MSG_ARCHIVE_THRESHOLD ? msgList.slice(0, MSG_ARCHIVE_THRESHOLD) : [];
    }
    // console.log('In Archive', JSON.stringify(messagesToArchive));
    if (messagesToArchive.length > 0) {
      // console.log('removing messages from the message list!!!: ', JSON.stringify(messagesToArchive));
      const authContext = botContext.getCapability('authContext');
      return authContext
        .getAuthUser(botContext)
        .then(function(user) {
          let agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.archive(messagesToArchive, botContext, user, false);
        })
        .then(() => {
          msgState.msgList = msgList.slice(messagesToArchive.length);
          return Promise.resolve(null);
        });
    } else {
      return Promise.resolve(null);
    }
  };

  let overrideBotForArchive = function(bot, msgState, botContext) {
    const authContext = botContext.getCapability('authContext');
    return authContext.getSetting(ARCHIVE_MSGS_SETTING, false, botContext).then(archiveEnabled => {
      if (archiveEnabled) {
        // console.log('Before override', bot.done.toString());
        let oldDone = bot.done;
        oldDone.bind(bot);
        bot.done = overrideBotFunction(msgState, oldDone, true);
        // console.log('After override', bot.done.toString());

        let oldNext = bot.next;
        oldNext.bind(bot);
        bot.next = overrideBotFunction(msgState, oldNext);
      }
      return Promise.resolve(null);
    });
  };

  let overrideBotFunction = function(msgState, func, isDone = false) {
    // console.log('In overrideBotFunction');
    return function(msg, state, previousMessages, botContext) {
      return archive(msg, msgState, isDone, botContext).then(() => {
        func(msg, state, previousMessages, botContext);
      });
    };
  };

  let getArchiveSetting = function(botContext) {
    const authContext = botContext.getCapability('authContext');
    return authContext.getSetting(ARCHIVE_MSGS_SETTING, false, botContext);
  };

  let overrideTellForArchive = function(tell, msgState, botContext) {
    return getArchiveSetting(botContext).then(archiveEnabled => {
      if (archiveEnabled) {
        let oldTell = tell;
        tell = function(msg, botContext, delay) {
          if (typeof msg === 'string') {
            const Message = botContext.getCapability('Message');
            let strMsg = msg;
            msg = new Message();
            msg.stringMessage(strMsg);
          }
          return archive(msg, msgState, false, botContext).then(() => {
            oldTell(msg, botContext, delay);
          });
        };
      }
      return Promise.resolve(tell);
    });
  };

  return {
    overrideBotForArchive: overrideBotForArchive,
    overrideTellForArchive: overrideTellForArchive,
    version: '1.0.0',
  };
})();
