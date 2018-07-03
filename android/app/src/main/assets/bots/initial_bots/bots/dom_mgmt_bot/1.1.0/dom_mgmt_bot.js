(function() {
  var MenuHandler = {
    ADD_DOMAIN_ROLE_CAPABILITY: 'SubscribeDomainRole',
    addDomainAndRoleToUser: function addDomainAndRoleToUser(
      msg,
      state,
      previousMessages,
      botContext
    ) {
      var _ = botContext.getCapability('Utils').Lodash;
      botContext.wait(true);
      var authContext = botContext.getCapability('authContext');
      authContext
        .getAuthUser(botContext)
        .then(function(user) {
          var strMsg = msg.getMessage();
          var agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.executeCustomCapability(
            MenuHandler.ADD_DOMAIN_ROLE_CAPABILITY,
            { verificationCode: strMsg },
            true,
            undefined,
            botContext,
            user
          );
        })
        .then(function(data) {
          if (_.isEmpty(_.compact(data))) {
            tell(
              "You should now be able to access the featured partner's bot",
              botContext
            );
          } else {
            tell(
              'I do not recognise this code. Can you check if you entered that right?',
              botContext
            );
          }
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        })
        .catch(function(error) {
          console.error('Error occurred while updating user details: ', error);
          tell(
            'Error occurred: Unable to activate the enterprise bots. Please reach out to the support team.',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
    showActivateBotMsg: function showActivateBotMsg(
      message,
      state,
      previousMessages,
      botContext
    ) {
      tell(
        'If a company has invited you to use their Bots, please scan the QR Code or type the invitation code. Please note that invitation code is case sensitive',
        botContext
      );
      return MenuHelper.showMenu(MENU.MAIN, botContext);
    },
  };
  var MENU = {
    MAIN: [
      {
        title: 'Activate Enterprise Bots',
        action: MenuHandler.showActivateBotMsg,
      },
    ],
  };
  var botState = {};
  var MenuHelper = {
    showMenu: function showMenu(menuToShow, botContext) {
      botState.menuToShow = menuToShow;
      var _ = botContext.getCapability('Utils').Lodash;
      var Message = botContext.getCapability('Message');
      var message = new Message();
      var options = _.map(menuToShow, function(option) {
        return { title: option.title };
      });
      message.sliderMessage(options, { smartReply: true });
      tell(message, botContext);
    },
  };
  var MessageProcessor = {
    processStringMsg: function processStringMsg(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var _ = botContext.getCapability('Utils').Lodash;
      var strMsg = message.getMessage().toLowerCase();
      var botStateMenu = botState.menuToShow;
      var index = _.findIndex(botStateMenu, function(option) {
        return option.title.toLowerCase() === strMsg;
      });
      if (index === -1) {
        return MenuHandler.addDomainAndRoleToUser(
          message,
          state,
          previousMessages,
          botContext
        );
      } else {
        botState.menuToShow[index].action(
          message,
          state,
          previousMessages,
          botContext
        );
      }
    },
  };
  var tell = function tell(msg, botContext) {
    botContext.tell(msg);
  };
  var greeting = function greeting(state, previousMessages, botContext) {
    return MenuHelper.showMenu(MENU.MAIN, botContext);
  };
  var next = function next(message, state, previousMessages, botContext) {
    var MessageTypeConstants = botContext.getCapability('MessageTypeConstants');
    var msgType = message.getMessageType();
    switch (msgType) {
      case MessageTypeConstants.MESSAGE_TYPE_STRING:
        MessageProcessor.processStringMsg(
          message,
          state,
          previousMessages,
          botContext
        );
        break;
    }
  };
  var farewell = function farewell() {};
  var asyncResult = function asyncResult(
    result,
    state,
    previousMessages,
    botContext
  ) {};
  return {
    done: farewell,
    init: greeting,
    next: next,
    asyncResult: asyncResult,
    version: '1.0.0',
  };
})();
