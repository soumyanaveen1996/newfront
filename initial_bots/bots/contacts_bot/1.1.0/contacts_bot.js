(function() {
  var MenuHelper = {
    showMenu: function showMenu(menuToShow, botContext, options) {
      botState.menuToShow = menuToShow;
      var Message = botContext.getCapability('Message');
      var message = new Message();
      options = options || { smartReply: true };
      message.sliderMessage(menuToShow, options);
      tell(message, botContext);
    },
  };
  var FormHandler = {
    searchPlatformUsers: function searchPlatformUsers(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var Message = botContext.getCapability('Message');
      var msg = new Message();
      msg.stringMessage('find ' + message.getMessage()[1].value);
      return MessageProcessor.processNlp(
        msg,
        state,
        previousMessages,
        botContext
      );
    },
    inviteUser: function inviteUser(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var emailIds = message.getMessage()[1].value;
      Utils.sendEmail(emailIds, botContext).then(function() {
        tell('Email invitation sent to user', botContext);
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      });
    },
  };
  var SliderHandler = {
    addContacts: function addContacts(
      message,
      state,
      previousMessages,
      botContext
    ) {
      botContext.wait(true);
      var contactsToAdd = SliderHandler.getUsersList(message.getMessage());
      var userIdList = contactsToAdd.map(function(user) {
        return user.userId;
      });
      var authContext = botContext.getCapability('authContext');
      authContext
        .getAuthUser(botContext)
        .then(function(user) {
          var agentGuardService = botContext.getCapability('agentGuardService');
          var ADD_CONTACT_ACTION = 'AddContact';
          return agentGuardService.executeCustomCapability(
            ADD_CONTACT_ACTION,
            { users: userIdList },
            true,
            undefined,
            botContext,
            user,
            false
          );
        })
        .then(function() {
          var Contact = botContext.getCapability('Contact');
          return Contact.addContacts(contactsToAdd);
        })
        .then(function() {
          tell('Added the selected users to your contacts', botContext);
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        });
    },
    sendEmailToAddressBookUsers: function sendEmailToAddressBookUsers(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var addrBookUsers =
        SliderHandler.getUsersList(message.getMessage()) || [];
      var emailIds = addrBookUsers.map(function(user) {
        return user.emailAddress;
      });
      Utils.sendEmail(emailIds, botContext).then(function() {
        var msg =
          'Email invitation sent to ' +
          (emailIds.length > 1 ? 'users' : 'user');
        tell(msg, botContext);
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      });
    },
    getUsersList: function getUsersList(contacts) {
      contacts = contacts || [];
      return contacts.map(function(contact) {
        return {
          userName: contact.data.contact_info[0].value,
          emailAddress: contact.data.contact_info[1].value,
          screenName: contact.data.contact_info[2].value,
          givenName: contact.data.contact_info[3].value,
          surname: contact.data.contact_info[4].value,
          userId: contact.userId,
        };
      });
    },
  };
  var Utils = {
    EMAIL_BODY:
      '<p>Hello there!</p>' +
      '<p>FrontM is a platform for businesses and people to collaborate and take smart decisions – EVEN IN ISOLATED ENVIRONMENTS.</p>' +
      '<p>So if you, or your colleague or your friend, are on a ship, or on an aeroplane, or far away from the nearest cell tower……. ' +
      'we have you covered with Powerful Chatbots that even work offline and data optimized multi-platform instant messaging.</p>' +
      '<p>Go ahead and download the <a href="http://itunes.com/apps/frontm">app</a> and log in using Google or Facebook. And off you go :)</p>' +
      '<p><i>Android, Web, desktop, Mac, MS Hololens  – all coming soon</i></p>' +
      '<p>If you have any questions, we would love to hear from you. Email us at info@frontm.com or follow us on twitter @frontmplatform</p>' +
      '<p>Happy staying in touch from anywhere!</p>' +
      '<p><font size="1">Guillermo Acilu</font></p>' +
      '<p><font size="1">Co-founder and CTO</font></p>' +
      '<p><img src="https://s3.amazonaws.com/frontm-contentdelivery/botLogos/emailIcon.png" alt="FrontM logo" width="163" height="26" style="margin-right: 0px;"></p>',
    sendEmail: function sendEmail(emailIds, botContext) {
      var authContext = botContext.getCapability('authContext');
      return authContext.getAuthUser(botContext).then(function(user) {
        var userInfo = user.info || {};
        var params = {
          address: emailIds,
          htmlBody: Utils.EMAIL_BODY,
          title: userInfo.userName + ' is inviting you to try FrontM!',
        };
        var agentGuardService = botContext.getCapability('agentGuardService');
        return agentGuardService.sendEmail(
          null,
          botContext,
          user,
          null,
          params
        );
      });
    },
  };
  var MenuHandler = {
    PLATFORM_USERS: 'PLATFORM_USERS',
    showPlatformUserSearchForm: function showPlatformUserSearchForm(
      msg,
      state,
      previousMessages,
      botContext
    ) {
      var Message = botContext.getCapability('Message');
      var formMsg = new Message();
      formMsg.formMessage(
        [
          {
            id: 1,
            title: "Please enter the user's name or email",
            type: 'title',
          },
          { id: 2, title: 'User name or email', type: 'text_field', value: '' },
          {
            id: 3,
            title: 'Search',
            type: 'button',
            action: 'searchPlatformUsers',
          },
        ],
        ''
      );
      tell(formMsg, botContext);
    },
    showAddressBookUsers: function showAddressBookUsers(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var Contact = botContext.getCapability('Contact');
      Contact.getAddressBookEmails().then(function(addressBookContacts) {
        var _ = botContext.getCapability('Utils').Lodash;
        if (_.isEmpty(addressBookContacts)) {
          tell('No contacts exist in the address book', botContext);
          return MenuHelper.showMenu(MENU.MAIN, botContext);
        } else {
          var contactsList = MessageProcessor.getUsersListForDisplay(
            addressBookContacts,
            'sendEmailToAddressBookUsers'
          );
          return MenuHelper.showMenu(contactsList, botContext, {
            select: true,
            multiSelect: true,
          });
        }
      });
    },
    showEmailForm: function showEmailForm(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var Message = botContext.getCapability('Message');
      var formMsg = new Message();
      formMsg.formMessage(
        [
          { id: 1, title: "Please enter the user's email", type: 'title' },
          { id: 2, title: 'Email', type: 'text_field', value: '' },
          { id: 3, title: 'Invite', type: 'button', action: 'inviteUser' },
        ],
        ''
      );
      tell(formMsg, botContext);
    },
  };
  var MessageProcessor = {
    FIND_CONTACTS_CAP: 'FindContacts',
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
    processSliderMsg: function processSliderMsg(
      message,
      state,
      previousMessages,
      botContext
    ) {
      var _ = botContext.getCapability('Utils').Lodash;
      var sliderSelections = message.getMessage() || [];
      if (_.isEmpty(sliderSelections)) {
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      } else {
        return SliderHandler[sliderSelections[0].action](
          message,
          state,
          previousMessages,
          botContext
        );
      }
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
        selectedMenuItem.action(message, state, previousMessages, botContext);
      }
    },
    processNlp: function processNlp(msg, state, previousMessages, botContext) {
      var authContext = botContext.getCapability('authContext');
      botContext.wait(true);
      var user = {};
      authContext
        .getAuthUser(botContext)
        .then(function(usr) {
          user = usr;
          var agentGuardService = botContext.getCapability('agentGuardService');
          return agentGuardService.executeCustomCapability(
            MessageProcessor.FIND_CONTACTS_CAP,
            { queryString: msg.getMessage() },
            true,
            undefined,
            botContext,
            user
          );
        })
        .then(function(contacts) {
          if (contacts[0] === 'Unknown intent') {
            tell(
              "I am sorry, I am not able to understand your query. I have reported it. You can use the 'Search user' option to search for users",
              botContext
            );
            return MenuHelper.showMenu(MENU.MAIN, botContext);
          } else {
            MessageProcessor.showPlatformContactsList(contacts, botContext);
          }
        })
        .catch(function(err) {
          console.log(err);
          tell('Error occurred getting contacts data', botContext);
        });
    },
    showPlatformContactsList: function showPlatformContactsList(
      contacts,
      botContext
    ) {
      contacts = contacts || [];
      var _ = botContext.getCapability('Utils').Lodash;
      if (_.isEmpty(contacts)) {
        tell(
          'Looks like there are no users matching your search criteria or you have added all users who match your search criteria',
          botContext
        );
        return MenuHelper.showMenu(MENU.MAIN, botContext);
      } else {
        var contactsList = MessageProcessor.getUsersListForDisplay(
          contacts,
          'addContacts'
        );
        return MenuHelper.showMenu(contactsList, botContext, {
          select: true,
          multiSelect: true,
        });
      }
    },
    getUsersListForDisplay: function getUsersListForDisplay(contacts, action) {
      return contacts.map(function(person) {
        var name =
          person.userName ||
          person.givenName + ' ' + (person.surname || person.familyName);
        return {
          title: name,
          userId: person.userId,
          action: action,
          data: {
            contact_info: [
              { key: 'Name', value: name },
              { key: 'Email', value: person.emailAddress },
              { key: 'Screen Name', value: person.screenName },
              { key: 'Given Name', value: person.givenName },
              { key: 'Sur Name', value: person.surname || person.familyName },
            ],
          },
        };
      });
    },
  };
  var botState = {};
  var MENU = {
    MAIN: [
      { title: 'Search user', action: MenuHandler.showPlatformUserSearchForm },
      {
        title: 'Invite users from address book',
        action: MenuHandler.showAddressBookUsers,
      },
      { title: 'Invite user with email', action: MenuHandler.showEmailForm },
    ],
  };
  var tell = function tell(msg, botContext) {
    botContext.tell(msg);
  };
  var greeting = function greeting(state, previousMessages, botContext) {
    var _ = botContext.getCapability('Utils').Lodash;
    if (_.isEmpty(previousMessages)) {
      var _greeting =
        'Want to find out if you know anyone on the platform? Select ‘Search User’ and type in their name. If you want to invite a friend to use FrontM please select an invite option';
      tell(_greeting, botContext);
    }
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
        MenuHelper.showMenu(MENU.MAIN, botContext);
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
