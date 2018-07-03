(function() {
  var CHANNELS_CAP = 'ChannelsCapability';
  var MenuHelper = {
    showMenu: function showMenu(menuToShow, botContext, options) {
      delete botState.selectedMenuItem;
      botState.menuToShow = menuToShow;
      var Message = botContext.getCapability('Message');
      var message = new Message();
      options = options || { smartReply: true };
      message.sliderMessage(menuToShow, options);
      tell(message, botContext);
    },
  };
  var FormHandler = {
    createChannel: function createChannel(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var FRONTM_DOMAIN = 'frontmai';
      var formMsg = message.getMessage();
      var channelName = formMsg[1].value;
      var channelDesc = formMsg[2].value;
      botContext.wait(true);
      var channelCap = botContext.getCapability('Channel');
      channelCap
        .create(channelName, channelDesc, FRONTM_DOMAIN)
        .then(function() {
          tell('Channel created', botContext);
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        })
        .catch(function() {
          tell(
            'Unable to create the channel. Is a channel with the same name already created? If so, you can subscribe to it',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
    editChannel: function editChannel(
      msg,
      state,
      previousMessages,
      botContext
    ) {
      var desc = msg.getMessage()[1].value;
      var channel = msg.getMessage()[3].channel;
      botContext.wait(true);
      var channelCap = botContext.getCapability('Channel');
      channelCap
        .update(channel.channelName, desc, channel.userDomain)
        .then(function() {
          tell('Channel updated', botContext);
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        })
        .catch(function() {
          tell(
            'We seem to be experiencing network difficulties. Please contact the support team and tell them that the issue occurred while updating the channel',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
  };
  var MenuHandler = {
    GET_UNSUBED_CHANNELS: 'GetUnsubbedChannels',
    SHOW_OWNED_CHANNELS: 'GetOwnedChannels',
    showUnsubedChannels: function showUnsubedChannels(
      message,
      state,
      previousMessages,
      botContext
    ) {
      return MenuHandler.getChannels(
        botContext,
        MenuHandler.GET_UNSUBED_CHANNELS
      );
    },
    showOwnedChannels: function showOwnedChannels(
      message,
      state,
      previousMessages,
      botContext
    ) {
      return MenuHandler.getChannels(
        botContext,
        MenuHandler.SHOW_OWNED_CHANNELS
      );
    },
    showCreateChannelForm: function showCreateChannelForm(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var Message = botContext.getCapability('Message');
      var formMsg = new Message();
      formMsg.formMessage(
        [
          { id: 1, title: "Please enter the channel's details", type: 'title' },
          {
            id: 2,
            title: 'Name',
            type: 'text_field',
            optional: false,
            value: '',
          },
          {
            id: 3,
            title: 'Description',
            type: 'text_field',
            optional: false,
            value: '',
          },
          { id: 4, title: 'Create', type: 'button', action: 'createChannel' },
        ],
        ''
      );
      tell(formMsg, botContext);
    },
    showEditChannelForm: function showEditChannelForm(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var _ = botContext.getCapability('Utils').Lodash;
      var selectedChannel = botState.selectedMenuItem;
      var channel = {
        channelName: selectedChannel.title,
        userDomain: selectedChannel.userDomain,
        description: _.get(selectedChannel, 'data.channel_info[1].value'),
      };
      var Message = botContext.getCapability('Message');
      var formMsg = new Message();
      formMsg.formMessage(
        [
          {
            id: 1,
            title:
              'Please edit the channel ' + channel.channelName + ' details',
            type: 'title',
          },
          {
            id: 2,
            title: 'Description',
            type: 'text_field',
            optional: false,
            value: channel.description,
          },
          { id: 3, title: 'Edit', type: 'button', action: 'editChannel' },
          { channel: channel },
        ],
        ''
      );
      tell(formMsg, botContext);
    },
    getChannels: function getChannels(botContext, action) {
      botContext.wait(true);
      var authContext = botContext.getCapability('authContext');
      authContext
        .getAuthUser(botContext)
        .then(function(user) {
          var agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.executeCustomCapability(
            CHANNELS_CAP,
            { action: action, domains: user.info.domains },
            true,
            undefined,
            botContext,
            user
          );
        })
        .then(function(channels) {
          var isOwnedChannels = action === MenuHandler.SHOW_OWNED_CHANNELS;
          if (isOwnedChannels) {
            MenuHandler.displayOwnedChannelList(channels, botContext);
          } else {
            MenuHandler.displayUnsubbedChannelList(channels, botContext);
          }
        })
        .catch(function() {
          tell(
            'We seem to be experiencing network difficulties. Please contact the support team and tell them that the issue occurred while trying to see the channels',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
    displayOwnedChannelList: function displayOwnedChannelList(
      channels,
      botContext
    ) {
      channels = channels || [];
      var _ = botContext.getCapability('Utils').Lodash;
      if (_.isEmpty(channels)) {
        tell('You have not created any channels', botContext);
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      } else {
        var channelList = MenuHandler.getChannelsListForDisplay(channels, true);
        return MenuHelper.showMenu(channelList, botContext);
      }
    },
    displayUnsubbedChannelList: function displayUnsubbedChannelList(
      channels,
      botContext
    ) {
      channels = channels || [];
      var _ = botContext.getCapability('Utils').Lodash;
      if (_.isEmpty(channels)) {
        tell('You have subscribed to all the channels', botContext);
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      } else {
        var channelList = MenuHandler.getChannelsListForDisplay(
          channels,
          false
        );
        return MenuHelper.showMenu(channelList, botContext, {
          select: true,
          multiSelect: true,
        });
      }
    },
    getChannelsListForDisplay: function getChannelsListForDisplay(
      channels,
      isOwnedChannels
    ) {
      return channels.map(function(channel) {
        var menuItem = {
          title: channel.channelName,
          data: {
            channel_info: [
              { key: 'Name', value: channel.channelName },
              { key: 'Description', value: channel.description },
            ],
          },
          userDomain: channel.userDomain,
          channelId: channel.channelId,
          logo: channel.logo,
        };
        if (isOwnedChannels) {
          menuItem.ownedChannel = true;
          menuItem.action = MenuHandler.showEditChannelForm;
        }
        return menuItem;
      });
    },
  };
  var MessageProcessor = {
    FIND_UNSUBED_CHANNELS: 'FindChannels',
    processFormMsg: function processFormMsg(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var _ = botContext.getCapability('Utils').Lodash;
      var formMsg = message.getMessage();
      var buttonIndex = _.findIndex(formMsg, function(formElement) {
        return formElement.type === 'button';
      });
      FormHandler[formMsg[buttonIndex].action](
        message,
        state,
        previousMessages,
        botContext
      );
    },
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
        MessageProcessor.processNlp(
          message,
          state,
          previousMessages,
          botContext
        );
      } else {
        var selectedMenuItem = botState.menuToShow[index];
        botState.selectedMenuItem = selectedMenuItem;
        selectedMenuItem.action(message, state, previousMessages, botContext);
      }
    },
    processNlp: function processNlp(msg, state, previousMessages, botContext) {
      var authContext = botContext.getCapability('authContext');
      botContext.wait(true);
      authContext
        .getAuthUser(botContext)
        .then(function(user) {
          var agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.executeCustomCapability(
            MessageProcessor.FIND_UNSUBED_CHANNELS,
            { queryString: msg.getMessage(), domains: user.info.domains },
            true,
            undefined,
            botContext,
            user
          );
        })
        .then(function(channels) {
          MenuHandler.displayUnsubbedChannelList(channels, botContext);
        })
        .catch(function(err) {
          console.log(err);
          tell(
            'We seem to be experiencing network difficulties. Please contact the support team and tell them that the issue occurred while trying to see channels list',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
    processSliderMsg: function processSliderMsg(
      message,
      state,
      previousMessages,
      botContext
    ) {
      botContext.wait(true);
      var _ = botContext.getCapability('Utils').Lodash;
      var selectedChannels = [];
      _.forEach(message.getMessage(), function(channel) {
        selectedChannels.push({
          channelId: channel.channelId,
          channelName: channel.title,
          userDomain: channel.userDomain,
          logo: channel.logo,
          description: _.get(channel, 'data.channel_info[1].value'),
        });
      });
      var channelCap = botContext.getCapability('Channel');
      channelCap
        .subscribe(selectedChannels)
        .then(function() {
          tell('Subscribed to selected channels', botContext);
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        })
        .catch(function() {
          tell(
            'We seem to be experiencing network difficulties. Please contact the support team and tell them that the issue occurred while subscribing to channels',
            botContext
          );
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
  };
  var MENU = {
    MAIN: [
      {
        title: 'Show me channel suggestions',
        action: MenuHandler.showUnsubedChannels,
      },
      {
        title: 'Show me the channels I created',
        action: MenuHandler.showOwnedChannels,
      },
      { title: 'Create Channel', action: MenuHandler.showCreateChannelForm },
    ],
  };
  var botState = {};
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
      case MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE:
        MessageProcessor.processFormMsg(
          message,
          state,
          previousMessages,
          botContext
        );
        break;
      case MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE:
        MessageProcessor.processSliderMsg(
          message,
          state,
          previousMessages,
          botContext
        );
        break;
      case MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL:
        return MenuHelper.showMenu(MENU.MAIN, botContext);
        break;
    }
  };
  var debug = function debug() {};
  var farewell = function farewell(msg, state, previousMessages, botContext) {};
  var asyncResult = function asyncResult(
    result,
    state,
    previousMessages,
    botContext
  ) {};
  return {
    done: farewell,
    init: greeting,
    asyncResult: asyncResult,
    next: next,
    debug: debug,
    version: '1.0.0',
  };
})();
