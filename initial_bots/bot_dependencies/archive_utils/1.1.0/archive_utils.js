(function() {
  var MSG_ARCHIVE_THRESHOLD = 10;
  var ARCHIVE_MSGS_SETTING = 'archiveMessages';
  var archive = function archive(msg, msgState, isDone, botContext) {
    var msgList = msgState.msgList;
    var messagesToArchive = [];
    if (isDone) {
      messagesToArchive = msgList;
    } else {
      var MessageTypeConstants = botContext.getCapability(
        'MessageTypeConstants'
      );
      var msgType = msg.getMessageType();
      if (
        !(
          MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN === msgType ||
          MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL === msgType
        )
      ) {
        msgList.push(msg);
        messagesToArchive =
          msgList.length > MSG_ARCHIVE_THRESHOLD
            ? msgList.slice(0, MSG_ARCHIVE_THRESHOLD)
            : [];
      }
    }
    if (messagesToArchive.length > 0) {
      var authContext = botContext.getCapability('authContext');
      return authContext
        .getAuthUser(botContext)
        .then(function(user) {
          var agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.archive(
            messagesToArchive,
            botContext,
            user,
            false
          );
        })
        .then(function() {
          msgState.msgList = msgList.slice(messagesToArchive.length);
          return Promise.resolve(null);
        });
    } else {
      return Promise.resolve(null);
    }
  };
  var overrideBotForArchive = function overrideBotForArchive(
    bot,
    msgState,
    botContext
  ) {
    var authContext = botContext.getCapability('authContext');
    return authContext
      .getSetting(ARCHIVE_MSGS_SETTING, false, botContext)
      .then(function(archiveEnabled) {
        if (archiveEnabled) {
          var oldDone = bot.done;
          oldDone.bind(bot);
          bot.done = overrideBotFunction(msgState, oldDone, true);
          var oldNext = bot.next;
          oldNext.bind(bot);
          bot.next = overrideBotFunction(msgState, oldNext);
        }
        return Promise.resolve(null);
      });
  };
  var overrideBotFunction = function overrideBotFunction(msgState, func) {
    var isDone =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return function(msg, state, previousMessages, botContext) {
      return archive(msg, msgState, isDone, botContext).then(function() {
        func(msg, state, previousMessages, botContext);
      });
    };
  };
  var getArchiveSetting = function getArchiveSetting(botContext) {
    var authContext = botContext.getCapability('authContext');
    return authContext.getSetting(ARCHIVE_MSGS_SETTING, false, botContext);
  };
  var overrideTellForArchive = function overrideTellForArchive(
    tell,
    msgState,
    botContext
  ) {
    return getArchiveSetting(botContext).then(function(archiveEnabled) {
      if (archiveEnabled) {
        var oldTell = tell;
        tell = function tell(msg, botContext, delay) {
          if (typeof msg === 'string') {
            var Message = botContext.getCapability('Message');
            var strMsg = msg;
            msg = new Message();
            msg.stringMessage(strMsg);
          }
          return archive(msg, msgState, false, botContext).then(function() {
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
