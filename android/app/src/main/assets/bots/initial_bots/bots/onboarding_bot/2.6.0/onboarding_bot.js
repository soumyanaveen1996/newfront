const Bot = botState => {
  const _ = botState._;
  const R = botState.R;
  const d = botState.developer;

  //Fields
  const LAST_LOGIN = "lastLogin";
  // const NOTIFICATIONS_ACTIVE = "notificationsActive";
  const PREVIOUS_INTENT = "previousIntent";
  const NLPId = "FMBot";

  const smartSuggestionsConstants = {
    CHECKRECENTCALLS: "Check recent calls",
    EMAILHISTORY: "Email me usage history",
    CHECKCALLRATES: "Check calling rates",
    WHYUSEFRONTMCALLS: "Why use FrontM voice calling"
  };
  const INMARSAT = "Inmarsat";
  const IRIDIUM = "Iridium";
  const SAT_PHONE = "SAT_PHONE";
  const CALL_HISTORY_FIELD = "callHistoryField";

  //Intent Smart Suggestions
  const YES = "Yes, sure";
  const NO = "No";
  const TRAVEL = "Travel";
  const MARITIME_PRODUCTIVITY = "Maritime Productivity";
  const MARITIME_OPERATIONS = "Maritime Operations";
  const COMMUNICATIONS_COLLABORATION = "Collaborate with crew";
  const IOT_SENSOR_MANAGEMENT = "IoT Sensor Management";
  const AVIATION_OPERATIONS = "Airlines Administation";
  const PROCESS_AUTOMATION = "Process Automation";
  const CHATBOT_DEVELOPMENT = "FrontM Development";
  const NOTHING_SPECIFIC = "Default Settings";
  const USER_QUALIFICATION_FINISHED = "Set Personalisation";
  const SERVICE_PROVIDER_ACCESS = "Access Service Provider Apps";
  const CANCEL_EDGE_CODE_VALIDATION_PROCESS = "Abort";
  const HELP_CODE_VALIDATION_PROCESS = "What is an Access Code?";
  const DO_NOT_KNOW_CODE_VALIDATION_PROCESS = "I don't know the code";
  const SELECT_POLLING_STRATEGY = "Internet usage settings";
  const TERRESTRIAL_POLLING_STRATEGY = "Terrestrial";
  const SATELLITE_POLLING_STRATEGY = "Satellite";
  const MANUAL_POLLING_STRATEGY = "Manual";
  const AUTOMATIC_POLLING_STRATEGY = "Automatic";
  const CANCEL_POLLING_STRATEGY = "Leave it as it is";
  const MY_ACCOUNT = "My Account";
  const CANCEL_MY_ACCOUNT = "Leave my account as is";
  const CHANGE_PASSWORD = "Change Password";
  const LOGOUT = "Logout";
  const ACTIVE_PUSH_NOTIFICATIONS = "Activate Notifications";
  const DEACTIVE_PUSH_NOTIFICATIONS = "Deactivate Notifications";

  //Others
  // const PUSH_NOTIFICATIONS_CHECK_INTENT = "pushNotificationsCheck";
  const LOGOUT_INTENT = "logoutIntent";
  //const REGISTER_PUSH_ON_BACKEND = "registerPushOnBackend";
  const DEREGISTER_PUSH_ON_EDGE = "deregisterPushOnEdge";
  const DEREGISTER_PUSH_ON_BACKEND = "deregisterPushOnBackend";
  const USER_QUALIFICATION = "userQualification";
  const EDGE_CODE_VALIDATION_PROCESS = "edgeCodeValidationProcess";
  const SAVE_NEW_PASSWORD = "saveNewPassword";
  const USER_QUALIFICATION_FIELD = "userQualificationField";
  const AUTO_INSTALLATION_STATUS = "autoInstallationStatus";
  const NOTIFICATION_CHANGES_IN_PROGRESS = "notificationsChangesInProgress";
  const COMPLAINT_FORM = "COMPLAINT_FORM";
  const AUTO_INSTALL_INITIAL_BOTS_INTENT = "autoInstallInitialBots";
  const AUTO_INSTALL_INITIAL_MARITIME_BOTS_INTENT = "autoInstallInitialMaritimeBots";
  const AUTO_INSTALL_INITIAL_BOTS_TRAVEL_INTENT = "autoInstallInitialTravelBots";
  const AUTO_INSTALL_INITIAL_BOTS_PROCESSES_INTENT = "autoInstallInitialProcessesBots";
  const AUTO_INSTALL_INITIAL_BOTS_COMMS_INTENT = "autoInstallInitialCommsBots";
  const AUTO_INSTALL_INITIAL_BOTS_AIRLINES_INTENT = "autoInstallInitialAirlinesBots";
  const AUTO_INSTALL_INITIAL_BOTS_FM_DEV_INTENT = "autoInstallInitialFrontMDevBots";

  //BotFlows
  const ACTIVATE_DOMAIN_ENTITY = "activateDomainEntity";
  const CHANGE_PASSWORD_FORM = "passwordForm";

  //Questions
  const ALL_QUESTIONS = "allQuestions";
  const HOW_TO_USE_FRONTM = "How to use frontM?";
  const HOW_DO_I_MAKE_CALLS = "How do I make calls?";
  const HOW_DO_I_ADD_CALL_CREDIT = "How do I add call credit?";
  const HOW_DO_I_ADD_CONTACTS = "How do I add contacts?";
  const WHAT_ARE_CHANNELS = "What are channels?";
  const WHAT_IS_AN_ASSISTANT = "What is a FrontM app?";
  const INVITE_PEOPLE_TO_FRONTM = "How do I invite people to FrontM?";

  //Messages
  const WELCOME_MESSAGE =
    "Welcome to FrontM Assistant. I am here to assist you with setup and answer your questions. All you need to do is chat with me here.";

  //complaint form
  let setComplaintForm = botState => {
    let formId = botState.getField(COMPLAINT_FORM);
    if (!formId) {
      formId = botState.getUniqueId();
      botState.setField(COMPLAINT_FORM, formId);
    }
    let complaintForm = new Form(botState, {
      formId: formId,
      title: "Support Request",
      description: "Click here to enter details",
      confirm: "Save",
      cancel: "Cancel"
    });
    complaintForm.addField({
      id: "title",
      title: "Title",
      type: FormFieldTypes.TEXT_FIELD(),
      mandatory: true
    });
    complaintForm.addField({
      id: "description",
      title: "Description",
      type: FormFieldTypes.TEXT_AREA(),
      mandatory: true
    });
    complaintForm.onSubmit = data => {
      let ticket = data.fieldsAsObject();
      botState.addStringResponse("I am generating a support case. Please bear with me for a second");
      botState.sendMessage({
        intentId: "emailSupport",
        title: ticket.title,
        description: ticket.description
      });
    };
    botState.addForm(complaintForm);
  };

  let setChangePasswordForm = botState => {
    let formId = botState.getField(CHANGE_PASSWORD_FORM);
    if (!formId) {
      formId = botState.getUniqueId();
      botState.setField(CHANGE_PASSWORD_FORM, formId);
    }
    let chgPasswordForm = new Form(botState, {
      formId: formId,
      title: "Change Password Form",
      description: "Open this form to change the password",
      confirm: "Submit",
      cancel: "Cancel"
    });
    chgPasswordForm.addField({
      id: "oldPassword",
      title: "Old Password",
      type: FormFieldTypes.PASSWORD_FIELD(),
      mandatory: true
    });
    chgPasswordForm.addField({
      id: "newPassword1",
      title: "New Password",
      info:
        "Different from the previous passwords. Minimal 8 characters long. At least one capital letter, number and special character",
      type: FormFieldTypes.PASSWORD_FIELD(),
      mandatory: true,
      validation: true,
      onMoveOut: form => {
        let formObject = form.fieldsAsObject();
        let response = {
          field: "newPassword1",
          validationResult: true
        };
        if (formObject.oldPassword === formObject.newPassword1) {
          response.validationResult = false;
          response.validationMessage = "Your new password must be different than your old Password";
        } else if (formObject.newPassword1.length < 8) {
          response.validationResult = false;
          response.validationMessage = "Your new password must be minimal 8 characters long";
        }
        return response;
      }
    });
    chgPasswordForm.addField({
      id: "newPassword2",
      title: "Repeat Password",
      info: "For security repeat the password from the previous field",
      type: FormFieldTypes.PASSWORD_FIELD(),
      mandatory: true,
      validation: true,
      onMoveOut: form => {
        let formObject = form.fieldsAsObject();
        let response = {
          field: "newPassword2",
          validationResult: true
        };
        if (formObject.newPassword1 !== formObject.newPassword2) {
          response.validationResult = false;
          response.validationMessage = "The new password fields don't match";
        }
        return response;
      }
    });
    chgPasswordForm.onSubmit = data => {
      let form = data.fieldsAsObject();
      if (form.newPassword1 !== form.newPassword2) {
        botState.addErrorToStack(1002, "The new password fields don't match");
      } else if (form.oldPassword === form.newPassword1) {
        botState.addErrorToStack(1003, "Your new password must be different than your old Password");
      } else if (botState._.size(form.newPassword1) < 8) {
        botState.addErrorToStack(1004, "Your new password must be minimal 8 characters long");
      }
      if (botState.inError) {
        let chgPasswordForm = botState.getForm(botState.getField(CHANGE_PASSWORD_FORM));
        botState.addResponse("form2", chgPasswordForm);
      } else {
        botState.sendMessage({
          intentId: SAVE_NEW_PASSWORD,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword1
        });
      }
    };
    botState.addForm(chgPasswordForm);
  };

  //Intent Main
  let main = new Intent("main");
  main.nlpId = NLPId;
  main.onInit = () => {
    setChangePasswordForm(botState);
    setComplaintForm(botState);
  };
  main.onResolution = async () => {
    botState.runFunctionOnceAnHour(() => {
      let autoInstallationStatus = botState.getField(AUTO_INSTALLATION_STATUS);
      let lastLogin = botState.getField(LAST_LOGIN);
      if ((!autoInstallationStatus && !lastLogin) || (autoInstallationStatus && lastLogin)) {
        botState.addStringResponse("Hello! " + botState.userName);
        if (!lastLogin) {
          sendWelcomeMessages(botState);
          botState.setField(LAST_LOGIN, new Date().toUTCString());
          // botState.setField(NOTIFICATIONS_ACTIVE, true);
          if (botState.client === State.MOBILECLIENT()) {
            botState.developer.debug("User is on mobile device");
            if (botState.amIOnline) {
              botState.developer.debug("User is online");
              //botState.processIntentWithId("fullEdgeSetup");
            } else {
              botState.developer.debug("User is offline");
              botState.addStringResponse(
                "You don't appear to have Internet connection at this moment. In order to personalise the app configuration, I need to be online. Let us skip this for now."
              );
            }
          } else {
            botState.developer.debug("User is on web");
            //botState.processIntentWithId('fullBackendSetup');
          }
        } else {
          botState.developer.debug("User logged in before");
        }
      }
    });
  };

  // let fullEdgeSetup = new Intent("fullEdgeSetup");
  // fullEdgeSetup.onMatching = botState => {
  //   return botState.messageFromUser.intentId === "fullEdgeSetup";
  // };
  // fullEdgeSetup.onResolution = async botState => {
  //   // botState.setField(NOTIFICATIONS_ACTIVE, false);
  //   let notificationDeviceInfo = await botState.notification.registerDeviceForPushOnEdge();
  //   if (!botState.inError) {
  //     botState.processIntentWithIdAndMessage("fullBackendSetup", {
  //       notificationDeviceInfo: notificationDeviceInfo
  //     });
  //   } else {
  //     botState.processIntentWithId("fullBackendSetup");
  //   }
  // };

  // let fullBackendSetup = new Intent("fullBackendSetup");
  // fullBackendSetup.runOnCloud();
  // fullBackendSetup.onMatching = botState => {
  //   return botState.messageFromUser.intentId === "fullBackendSetup";
  // };
  // fullBackendSetup.onResolution = async botState => {
  //   let domains = await botState.marketplace.validateActivationCode(AUTO_INSTALL_INITIAL_BOTS_INTENT);
  //   botState.setField(ACTIVATE_DOMAIN_ENTITY, domains);
  //   botState.setField(AUTO_INSTALLATION_STATUS, true);
  //   if (botState.client === State.MOBILECLIENT() && botState.messageFromUser.notificationDeviceInfo) {
  //     await botState.notification.registerDeviceForPushOnBackend(botState.messageFromUser.notificationDeviceInfo);
  //     // botState.setField(NOTIFICATIONS_ACTIVE, true);
  //     //botState.addStringResponse("Registered push on backend");
  //   }
  //   botState.processIntentWithId("finishSetup");
  //   //botState.addStringResponse("Passed backend setup");
  // };

  // let finishSetup = new Intent("finishSetup");
  // finishSetup.onMatching = botState => {
  //   return botState.messageFromUser.intentId === "finishSetup";
  // };
  // finishSetup.onResolution = async botState => {
  //   let domains = botState.getField(ACTIVATE_DOMAIN_ENTITY);
  //   await botState.marketplace.activateDomainsOnEdge(domains);
  //   await botState.marketplace.autoInstallAllBotsOnEdge();
  //   botState.setField(AUTO_INSTALLATION_STATUS, true);
  //   botState.clearField(ACTIVATE_DOMAIN_ENTITY);
  //   botState.addResponse("silent", {});
  // };

  //Push notifications check
  // let c = new Intent(PUSH_NOTIFICATIONS_CHECK_INTENT);
  // pushNotificationsCheck.onMatching = () => {
  //   return botState.messageFromUser.intentId === PUSH_NOTIFICATIONS_CHECK_INTENT;
  // };
  // pushNotificationsCheck.onResolution = async () => {
  //   return botState.notification.isDeviceRegisteredForPush().then(isRegistered => {
  //     if (!isRegistered) {
  //       // botState.setField(NOTIFICATIONS_ACTIVE, false);
  //       // botState.setField(PREVIOUS_INTENT, PUSH_NOTIFICATIONS_CHECK_INTENT);
  //       // return botState.notification.registerDeviceForPushOnEdge().then(notificationDeviceInfo => {
  //       //   botState.addResponse('silent', {});
  //       //   if (!botState.inError) {
  //       //     botState.addStringResponse('Activating push');
  //       //     botState.processIntentWithIdAndMessage(REGISTER_PUSH_ON_BACKEND, {
  //       //       notificationDeviceInfo: notificationDeviceInfo,
  //       //     });
  //       //   } else {
  //       //     botState.processIntentWithId(EDGE_CODE_VALIDATION_PROCESS);
  //       //     //botState.processIntentWithId(AUTO_INSTALL_INITIAL_BOTS_INTENT);
  //       //   }
  //       //   botState.clearField(PREVIOUS_INTENT);
  //       // });
  //     } else {
  //       // botState.setField(NOTIFICATIONS_ACTIVE, true);
  //       //botState.processIntentWithId(AUTO_INSTALL_INITIAL_BOTS_INTENT);
  //       // botState.processIntentWithId(EDGE_CODE_VALIDATION_PROCESS);
  //       // botState.sendMessage({
  //       //   intentId: USER_QUALIFICATION,
  //       // });
  //     }
  //   });
  // };

  let showErrorsToUser = botState => {
    botState.defaultOnError();
    botState.clearField(NOTIFICATION_CHANGES_IN_PROGRESS);
  };

  //Intent PushNotificationsCheck
  let yesPush = new Intent("yesPush");
  yesPush.suggestionsArray = [
    {
      lang: "en",
      list: [ACTIVE_PUSH_NOTIFICATIONS]
    }
  ];
  yesPush.onMatching = botState => {
    return (botState.messageFromUser === ACTIVE_PUSH_NOTIFICATIONS || botState.getNlpResultsForId(NLPId).action === "ActivatePush");
  };
  yesPush.onError = botState => {
    showErrorsToUser(botState);
  };
  yesPush.onResolution = async botState => {
    botState.notification.registerDeviceForPushOnEdge();
    botState.addStringResponse('Push notifications are now active');
    botState.clearField(PREVIOUS_INTENT);
  };
  yesPush.onPrediction = async () => {
    let notificationsActive = true;
    if (botState.client === State.MOBILECLIENT()) {
      notificationsActive = await botState.notification.isDeviceRegisteredForPush();
    }
    if ([myAccount.intentId].indexOf(botState.activeIntent) > -1 && !notificationsActive) {
      return 1;
    }
    return 0;
  };

  //Intent PushNotificationsCheck
  let yesLogout = new Intent("yesLogout");
  yesLogout.onMatching = botState => {
    let previousIntent = botState.getField(PREVIOUS_INTENT);
    return (
      (botState.messageFromUser === YES || botState.getNlpResultsForId(NLPId).action === "yes") &&
      previousIntent === LOGOUT_INTENT
    );
  };
  yesLogout.onError = botState => {
    showErrorsToUser(botState);
  };
  yesLogout.onResolution = async botState => {
    botState.processIntentWithId(DEREGISTER_PUSH_ON_EDGE);
    // botState.sendMessage({
    //   intentId: DEREGISTER_PUSH_ON_EDGE
    // });
    botState.clearField(PREVIOUS_INTENT);
    botState.blockSuggestions = true;
  };

  //Intent PushNotificationsCheck
  let yes = new Intent("yes");
  yes.suggestionsArray = [
    {
      lang: "en",
      list: [YES]
    }
  ];
  yes.onPrediction = async () => {
    if (
      botState.getField(NOTIFICATION_CHANGES_IN_PROGRESS) === null &&
      [logout.intentId].indexOf(botState.activeIntent) > -1
    ) {
      return 1;
    }
    return 0;
  };

  //Intent PushNotificationsCheck
  let yesBackend = new Intent("yesBackend");
  yesBackend.onMatching = botState => {
    let previousIntent = botState.getField(PREVIOUS_INTENT);
    return !previousIntent && botState.getNlpResultsForId(NLPId).action === "yes";
  };
  yesBackend.onResolution = async botState => {
    botState.addStringResponse("Say yes to you!");
  };

  // //ActivatePushOnCloud
  // let registerPushOnBackend = new Intent(REGISTER_PUSH_ON_BACKEND);
  // registerPushOnBackend.runOnCloud();
  // registerPushOnBackend.onMatching = botState => {
  //   return botState.messageFromUser.intentId === REGISTER_PUSH_ON_BACKEND;
  // };
  // registerPushOnBackend.onError = botState => {
  //   showErrorsToUser(botState);
  // };
  // registerPushOnBackend.onResolution = async botState => {
  //   //botState.addStringResponse(R.toString(botState.messageFromUser.notificationDeviceInfo));
  //   return botState.notification
  //     .registerDeviceForPushOnBackend(botState.messageFromUser.notificationDeviceInfo)
  //     .then(() => {
  //       // botState.setField(NOTIFICATIONS_ACTIVE, true);
  //       botState.addStringResponse("Notifications are now active");
  //       //botState.processIntentWithId(EDGE_CODE_VALIDATION_PROCESS);
  //     });
  // };

  //Intent PushNotificationsCheck
  let deActivatePushNotifications = new Intent("deActivatePushNotifications");
  deActivatePushNotifications.suggestionsArray = [
    {
      lang: "en",
      list: [DEACTIVE_PUSH_NOTIFICATIONS]
    }
  ];
  deActivatePushNotifications.onMatching = botState => {
    return (
      ((botState.messageTypeFromUser === "string" && botState.messageFromUser === DEACTIVE_PUSH_NOTIFICATIONS) ||
        botState.getNlpResultsForId(NLPId).action === "DeactivateNotifications" ||
        (botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === DEREGISTER_PUSH_ON_EDGE)) &&
      botState.client === State.MOBILECLIENT()
    );
  };
  deActivatePushNotifications.onError = botState => {
    showErrorsToUser(botState);
  };
  deActivatePushNotifications.onResolution = async botState => {
    let callNextIntent = notificationDeviceInfo => {
      let forLogOut = false;
      if (botState.messageTypeFromUser === "object") {
        forLogOut = true;
      }
      if (notificationDeviceInfo) {
        botState.processIntentWithIdAndMessage(DEREGISTER_PUSH_ON_BACKEND, {
          notificationDeviceInfo: notificationDeviceInfo,
          forLogOut: forLogOut
        });
        // botState.sendMessage({
        //   intentId: DEREGISTER_PUSH_ON_BACKEND,
        //   notificationDeviceInfo: notificationDeviceInfo,
        //   forLogOut: forLogOut
        // });
      } else {
        if (forLogOut) {
          botState.processIntentWithId(LOGOUT);
          // botState.sendMessage({
          //   intentId: LOGOUT
          // });
        }
      }
    };
    // if (botState.getField(NOTIFICATION_CHANGES_IN_PROGRESS) === null) {
    //   botState.setField(NOTIFICATION_CHANGES_IN_PROGRESS, true);
    return botState.notification.isDeviceRegisteredForPush().then(isRegistered => {
      if (isRegistered) {
        return botState.notification.deregisterDeviceForPushOnEdge().then(notificationDeviceInfo => {
          // botState.setField(NOTIFICATIONS_ACTIVE, false);
          callNextIntent(notificationDeviceInfo);
        });
      } else {
        callNextIntent();
      }
    });
    // // } else {
    // //   botState.addStringResponse(
    // //     "Your notification settings are still being updated. Please try me again in just a moment."
    // //   );
    // }
  };
  deActivatePushNotifications.onPrediction = async () => {
    let notificationsActive = true;
    if (botState.client === State.MOBILECLIENT()) {
      notificationsActive = await botState.notification.isDeviceRegisteredForPush();
    }
    if ([myAccount.intentId].indexOf(botState.activeIntent) > -1 && notificationsActive) {
      return 1;
    }
    return 0;
  };

  //ActivatePushOnCloud
  let deregisterPushOnBackend = new Intent(DEREGISTER_PUSH_ON_BACKEND);
  deregisterPushOnBackend.runOnCloud();
  deregisterPushOnBackend.onMatching = botState => {
    return (
      botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === DEREGISTER_PUSH_ON_BACKEND
    );
  };
  deregisterPushOnBackend.onError = botState => {
    showErrorsToUser(botState);
  };
  deregisterPushOnBackend.onResolution = async botState => {
    return botState.notification
      .deregisterDeviceForPushOnBackend(botState.messageFromUser.notificationDeviceInfo)
      .then(() => {
        if (botState.messageFromUser.forLogOut) {
          botState.processIntentWithId(LOGOUT);
          // botState.sendMessage({
          //   intentId: LOGOUT
          // });
        } else {
          botState.addStringResponse("Notifications are now deactivated");
        }
        botState.clearField(NOTIFICATION_CHANGES_IN_PROGRESS);
      });
  };

  //Intent NoPushNotificationsCheck
  let noPush = new Intent("noPush");
  noPush.onMatching = botState => {
    let previousIntent = botState.getField(PREVIOUS_INTENT);
    return (
      (botState.messageFromUser === NO || botState.getNlpResultsForId(NLPId).action === "no") &&
      previousIntent === PUSH_NOTIFICATIONS_CHECK_INTENT
    );
  };
  noPush.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(NOTIFICATIONS_BOTFLOW);
    // botFlow.end();
    botState.addStringResponse(
      "No problem, any incoming messages and alerts will not be notified. You can always ask me to switch on notifications here"
    );
    botState.processIntentWithId(AUTO_INSTALL_INITIAL_BOTS_INTENT);
    // botState.sendMessage({
    //   intentId: USER_QUALIFICATION
    // });
    botState.clearField(PREVIOUS_INTENT);
  };

  //Intent NoPushNotificationsCheck
  let noLogout = new Intent("noLogout");
  noLogout.onMatching = botState => {
    let previousIntent = botState.getField(PREVIOUS_INTENT);
    return (
      (botState.messageFromUser === NO || botState.getNlpResultsForId(NLPId).action === "no") &&
      previousIntent === LOGOUT_INTENT
    );
  };
  noLogout.onResolution = async botState => {
    botState.addStringResponse("Ok");
    botState.clearField(PREVIOUS_INTENT);
  };

  //Intent NoPushNotificationsCheck
  let no = new Intent("no");
  no.suggestionsArray = [
    {
      lang: "en",
      list: [NO]
    }
  ];
  no.onPrediction = async () => {
    if (
      botState.getField(NOTIFICATION_CHANGES_IN_PROGRESS) === null &&
      [logout.intentId].indexOf(botState.activeIntent) > -1
    ) {
      return 1;
    }
    return 0;
  };

  //Intent NoPushNotificationsCheck
  let noBackend = new Intent("noBackend");
  noBackend.onMatching = botState => {
    return botState.messageFromUser === "TEST";
  };
  noBackend.onResolution = async botState => {
    botState.addStringResponse("Testing testing");
  };

  let sendWelcomeMessages = botState => {
    botState.addStringResponse(WELCOME_MESSAGE);
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "To start using the app, touch the back button to go to the home screen. Explore Contacts, Channels and Apps to start collaborating!"
      );
    } else {
      if (botState.user.loggedInDomain === "gns") {
        botState.addStringResponse(
          "To start using the app, simply add credit to make calls to satellite numbers – use the dialpad or add contacts on the left menu"
        );
      } else {
        botState.addStringResponse(
          "To start using the app, simply add credit to make calls to satellite numbers, use the dialpad or add contacts on the left menu. Join Channels for group messages, and browse our Apps for other add ons"
        );
      }
    }
    //botState.addStringResponse('Remember, I am here to help you with any general enquiries and app settings.');
  };

  let amIinGNS = () => {
    return botState.client === State.WEBCLIENT() && botState.user.loggedInDomain === "gns";
  };

  let allQuestions = new Intent(ALL_QUESTIONS);
  allQuestions.setEnglishSmartSuggestions(
    [
      HOW_TO_USE_FRONTM,
      HOW_DO_I_MAKE_CALLS,
      HOW_DO_I_ADD_CALL_CREDIT,
      HOW_DO_I_ADD_CONTACTS,
      WHAT_ARE_CHANNELS,
      INVITE_PEOPLE_TO_FRONTM,
      smartSuggestionsConstants.CHECKCALLRATES,
      smartSuggestionsConstants.CHECKRECENTCALLS,
      smartSuggestionsConstants.EMAILHISTORY,
      smartSuggestionsConstants.WHYUSEFRONTMCALLS
    ],
    [
      HOW_TO_USE_FRONTM,
      HOW_DO_I_MAKE_CALLS,
      HOW_DO_I_ADD_CALL_CREDIT,
      HOW_DO_I_ADD_CONTACTS,
      INVITE_PEOPLE_TO_FRONTM,
      smartSuggestionsConstants.CHECKCALLRATES,
      smartSuggestionsConstants.CHECKRECENTCALLS,
      smartSuggestionsConstants.EMAILHISTORY,
      smartSuggestionsConstants.WHYUSEFRONTMCALLS
    ],
    amIinGNS
  );
  allQuestions.onPrediction = async () => {
    let formId = botState.getField(CHANGE_PASSWORD_FORM) || " ";
    if (
      [
        formId,
        Intent.SPEECH(),
        Intent.NO_INTENT(),
        main.intentId,
        //finishSetup.intentId,
        //fullBackendSetup.intentId,
        // fullEdgeSetup.intentId,
        // pushNotificationsCheck.intentId,
        yesPush.intentId,
        //registerPushOnBackend.intentId,
        edgeValidationProcess.intentId,
        automaticPollingStrategy.intentId,
        satellitePollingStrategy.intentId,
        terrestrialPollingStrategy.intentId,
        manualPollingStrategy.intentId,
        cancelPollingStrategySelection.intentId,
        cancelMyAccount.intentId,
        noLogout.intentId,
        noBackend.intentId,
        cancelValidationProcess.intentId,
        deregisterPushOnBackend.intentId,
        //registerPushOnBackend.intentId,
        checkBalance.intentId,
        tariffCheck.intentId,
        tariffCheckSat.intentId,
        recentCalls.intentId,
        emailUsageHistory.intentId,
        callSatFailed.intentId,
        inviteQuestion,
        validationCode.intentId,
        howToUseFrontM.intentId,
        howDoIAddCallCredits.intentId,
        howDoIAddContacts.intentId,
        whatIsFrontM.intentId,
        howToAccessApps.intentId,
        cannotFindApp.intentId,
        howToChat.intentId,
        dunno.intentId,
        howToMakeCalls.intentId,
        inviteQuestion.intentId
      ].indexOf(botState.activeIntent) > -1
    ) {
      return 1;
    }
    return 0;
  };

  let testVideo = new Intent("testVideo");
  testVideo.onMatching = () => {
    return botState.messageFromUser === "TestVideo";
  };
  testVideo.onResolution = async () => {
    botState.addStringResponse("This is google https://google.com");
    botState.addResponse(
      "video",
      "https://frontm-contentdelivery-mobilehub-1030065648.s3.amazonaws.com/videos/How+to+call+using+contact+list.mp4"
    );
  };

  //User qualification
  let userQualification = new Intent(USER_QUALIFICATION);
  userQualification.onMatching = botState => {
    return botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === USER_QUALIFICATION;
  };
  userQualification.onResolution = async botState => {
    let userQualificationField = botState.getField(USER_QUALIFICATION_FIELD);
    if (!userQualificationField) {
      botState.addStringResponse(
        "We provide a range of Apps to address your context-specific needs. Explore the below options and select one that best applies to you."
      );
      let cards = [];
      if (botState.client === State.MOBILECLIENT()) {
        cards = [
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Travel.jpeg",
            description:
              "For those with a travel bug, a suite of Apps that accompany you on your flight or cruise. \n" +
              "Apps that ensure you are in control during your travel. \n" +
              "1. Flight tracker: From the comfort of your aeroplane seats, track your flight, discover destination, explore hotels and more\n" +
              "2. Journey planner: For the air traveller to easily access transit info, baggage tracking, flight status, booking changes and more\n" +
              "3. Coming soon",
            action: TRAVEL
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Ship.jpeg",
            description:
              "For mariners and crew, applications that enhance collaboration, operations and productivity\n" +
              "Applications that help you save time, money and be more efficient in marine operations\n" +
              "1. Boat tracker: For the shore coordinator and ship master, track you boats, get safety alerts and situational information\n" +
              "2. Service provider specific applications: You need a licence code to unlock them, follow through the conversation next. \n" +
              "3. New applications coming soon",
            action: MARITIME_PRODUCTIVITY
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Process.jpeg",
            description:
              "For teams dealing with satellite terminals, Industrial IoT and other operations in remote industries\n" +
              "Applications that help you save time, money and be more efficient in remote operations \n" +
              "1. Sensor manager: Activate and manage your sensors on your LoRaWAN network\n" +
              "2. Service provider specific applications: You need a licence code to unlock them, follow through the conversation next. \n" +
              "3. Many new applications coming soon",
            action: PROCESS_AUTOMATION
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Check.jpeg",
            description:
              "For generic users to mainly take advantage of FrontM's default chat, channels and voice calling features \n" +
              "We are constantly adding new Apps for your generic use\n" +
              "1. Survey: Tell us about the app, \n" +
              "2. New applications coming soon",
            action: NOTHING_SPECIFIC
          }
        ];
      } else {
        cards = [
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Ship.jpeg",
            description:
              "Manage your digital wallet, call satellite numbers, administrate your team channels, view performance metrics and more",
            action: COMMUNICATIONS_COLLABORATION
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Travel.jpeg",
            description:
              "Track your fleet, install apps on your flight edge servers, manage performance, perform upgrades and obtain insights.  \n",
            action: AVIATION_OPERATIONS
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Process.jpeg",
            description:
              "Develop with FrontM and integrate your application for FrontM marketplace. Access airlines, cruises, shipping and remote enterprise markets through a single channel",
            action: CHATBOT_DEVELOPMENT
          },
          {
            pictureUrl:
              "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/cardIcons/Check.jpeg",
            description:
              "For generic users to mainly take advantage of FrontM's default chat, channels and voice calling features \n" +
              "We are constantly adding new Apps for your generic use\n" +
              "1. Survey: Tell us about the app, \n" +
              "2. New applications coming soon",
            action: NOTHING_SPECIFIC
          }
        ];
      }
      botState.addResponse("cards", cards);
      botState.blockSuggestions = true;
      // let botFlow = botState.getBotFlow(USER_QUALIFICATION_BOTFLOW);
      // botFlow.start();
      // botFlow.markIntentResolved(USER_QUALIFICATION);
    } else {
      botState.addResponse("silent", {});
    }
  };

  //User Qualification Finished
  let userQualificationFinished = new Intent("userQualificationFinished");
  userQualificationFinished.onMatching = botState => {
    return botState.messageFromUser === USER_QUALIFICATION_FINISHED;
  };
  userQualificationFinished.onResolution = async botState => {
    sendWelcomeMessages(botState);
    // let botFlow = botState.getBotFlow(USER_QUALIFICATION_BOTFLOW);
    // botFlow.end();
  };

  let setNewPersonalisationTo = (botState, personalisation, text) => {
    // let botFlow = botState.getBotFlow(USER_QUALIFICATION_BOTFLOW);
    let userQualificationField = botState.getField(USER_QUALIFICATION_FIELD);
    if (userQualificationField) {
      if (personalisation === "nothing") {
        botState.addStringResponse("Ok");
        return;
      }
      let index = _.findIndex(userQualificationField, existingPersonalisation => {
        return existingPersonalisation === personalisation;
      });
      if (index === -1) {
        userQualificationField.push(personalisation);
        botState.setField(USER_QUALIFICATION_FIELD, userQualificationField);
        botState.addStringResponse(
          "Sure, " +
          personalisation +
          " is also added to your preferences.\n" +
          "Again remember that I am always here to help you with any general enquiries and app settings"
        );
      } else {
        botState.addStringResponse("You've already set " + personalisation + " as your preferred context");
      }
    } else {
      botState.setField(USER_QUALIFICATION_FIELD, [personalisation]);
      switch (personalisation) {
        case maritimeProductivity.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_MARITIME_BOTS_INTENT
          });
          break;
        }
        case aviationProductivity.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_AIRLINES_INTENT
          });
          break;
        }
        case communicationCollaboration.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_COMMS_INTENT
          });
          break;
        }
        case chatbotDevelopment.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_FM_DEV_INTENT
          });
          break;
        }
        case processAutomation.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_PROCESSES_INTENT
          });
          break;
        }
        case processAutomation.intentId: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_TRAVEL_INTENT
          });
          break;
        }
        default: {
          botState.sendMessage({
            intentId: AUTO_INSTALL_INITIAL_BOTS_INTENT
          });
          break;
        }
      }
    }
    // botFlow.end();
  };

  //Maritime
  let travel = new Intent("travel");
  travel.suggestionsArray = [
    {
      lang: "en",
      list: [TRAVEL]
    }
  ];
  travel.onMatching = botState => {
    return botState.messageFromUser === TRAVEL || botState.getNlpResultsForId(NLPId).action === "travel";
  };
  travel.onResolution = async botState => {
    setNewPersonalisationTo(botState, travel.intentId, "Travel");
  };
  travel.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let maritimeProductivity = new Intent("maritimeProductivity");
  maritimeProductivity.suggestionsArray = [
    {
      lang: "en",
      list: [MARITIME_PRODUCTIVITY]
    }
  ];
  maritimeProductivity.onMatching = botState => {
    return (
      botState.messageFromUser === MARITIME_PRODUCTIVITY ||
      botState.getNlpResultsForId(NLPId).action === "MaritimeProductivity"
    );
  };
  maritimeProductivity.onResolution = async botState => {
    setNewPersonalisationTo(botState, maritimeProductivity.intentId, "Maritime Productivity");
  };
  maritimeProductivity.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let aviationProductivity = new Intent("aviationProductivity");
  aviationProductivity.suggestionsArray = [
    {
      lang: "en",
      list: [AVIATION_OPERATIONS]
    }
  ];
  aviationProductivity.onMatching = botState => {
    return (
      botState.messageFromUser === AVIATION_OPERATIONS ||
      botState.getNlpResultsForId(NLPId).action === "AviationOperations"
    );
  };
  aviationProductivity.onResolution = async botState => {
    setNewPersonalisationTo(botState, aviationProductivity.intentId, "Aviation Productivity");
  };
  aviationProductivity.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let maritimeOperations = new Intent("maritimeOperations");
  maritimeOperations.suggestionsArray = [
    {
      lang: "en",
      list: [MARITIME_OPERATIONS]
    }
  ];
  maritimeOperations.onMatching = botState => {
    return (
      (botState.messageFromUser === MARITIME_OPERATIONS ||
        botState.getNlpResultsForId(NLPId).action === "MaritimeProductivity") &&
      botState.client === State.WEBCLIENT()
    );
  };
  maritimeOperations.onResolution = async botState => {
    setNewPersonalisationTo(botState, maritimeOperations.intentId, MARITIME_OPERATIONS);
  };
  maritimeOperations.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let communicationCollaboration = new Intent("communicationCollaboration");
  communicationCollaboration.suggestionsArray = [
    {
      lang: "en",
      list: [COMMUNICATIONS_COLLABORATION]
    }
  ];
  communicationCollaboration.onMatching = botState => {
    return (
      botState.messageFromUser === COMMUNICATIONS_COLLABORATION ||
      botState.getNlpResultsForId(NLPId).action === "CommunicationCollaboration"
    );
  };
  communicationCollaboration.onResolution = async botState => {
    setNewPersonalisationTo(botState, communicationCollaboration.intentId, COMMUNICATIONS_COLLABORATION);
  };
  communicationCollaboration.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let iotSensorManagement = new Intent("iotSensorManagement");
  iotSensorManagement.suggestionsArray = [
    {
      lang: "en",
      list: [IOT_SENSOR_MANAGEMENT]
    }
  ];
  iotSensorManagement.onMatching = botState => {
    return botState.messageFromUser === IOT_SENSOR_MANAGEMENT || botState.getNlpResultsForId(NLPId).action === "IOT";
  };
  iotSensorManagement.onResolution = async botState => {
    setNewPersonalisationTo(botState, iotSensorManagement.intentId, IOT_SENSOR_MANAGEMENT);
  };
  iotSensorManagement.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Maritime
  let chatbotDevelopment = new Intent("chatbotDevelopment");
  chatbotDevelopment.suggestionsArray = [
    {
      lang: "en",
      list: [CHATBOT_DEVELOPMENT]
    }
  ];
  chatbotDevelopment.onMatching = botState => {
    return (
      botState.messageFromUser === CHATBOT_DEVELOPMENT || botState.getNlpResultsForId(NLPId).action === "development"
    );
  };
  chatbotDevelopment.onResolution = async botState => {
    setNewPersonalisationTo(botState, chatbotDevelopment.intentId, CHATBOT_DEVELOPMENT);
  };
  chatbotDevelopment.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Process automation
  let processAutomation = new Intent("processAutomation");
  processAutomation.suggestionsArray = [
    {
      lang: "en",
      list: [PROCESS_AUTOMATION]
    }
  ];
  processAutomation.onMatching = botState => {
    return (
      botState.messageFromUser === PROCESS_AUTOMATION ||
      botState.getNlpResultsForId(NLPId).action === "ProcessAutomation"
    );
  };
  processAutomation.onResolution = async botState => {
    setNewPersonalisationTo(botState, processAutomation.intentId, "Process Automation");
  };
  processAutomation.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let nothingSpecific = new Intent("nothingSpecific");
  nothingSpecific.suggestionsArray = [
    {
      lang: "en",
      list: [NOTHING_SPECIFIC]
    }
  ];
  nothingSpecific.onMatching = botState => {
    return (
      botState.messageFromUser === NOTHING_SPECIFIC || botState.getNlpResultsForId(NLPId).action === "NothingSpecific"
    );
  };
  nothingSpecific.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(USER_QUALIFICATION_BOTFLOW);
    // botFlow.end();
    // botFlow.markIntentResolved('nothingSpecific');
    //sendWelcomeMessages(botState);
    setNewPersonalisationTo(botState, nothingSpecific.intentId, "nothing");
  };
  nothingSpecific.onPrediction = async () => {
    if ([userQualificationFinished.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Service Providers access
  let serviceProviderAccess = new Intent("serviceProviderAccess");
  // serviceProviderAccess.suggestionsArray = [
  //   {
  //     lang: "en",
  //     list: [SERVICE_PROVIDER_ACCESS, "What is FrontM?"]
  //   }
  // ];
  serviceProviderAccess.onMatching = botState => {
    return (
      botState.messageFromUser === SERVICE_PROVIDER_ACCESS ||
      botState.getNlpResultsForId(NLPId).action === "InvitationCode"
    );
  };
  serviceProviderAccess.onResolution = async botState => {
    if (botState.client === State.WEBCLIENT()) {
      botState.addStringResponse(
        "Open the drop down at the top left of this page and then click on +. Then enter the code you have been given"
      );
    } else {
      botState.addStringResponse("Please type in or scan the invitation code provided");
    }
  };
  serviceProviderAccess.onPrediction = async () => {
    let lastLogin = botState.getField(LAST_LOGIN);
    let userQualificationField = botState.getField(USER_QUALIFICATION_FIELD);
    let formId = botState.getField(CHANGE_PASSWORD_FORM) || "";
    if (
      [
        formId,
        Intent.SPEECH(),
        Intent.NO_INTENT(),
        main.intentId,
        edgeValidationProcess.intentId,
        automaticPollingStrategy.intentId,
        satellitePollingStrategy.intentId,
        terrestrialPollingStrategy.intentId,
        manualPollingStrategy.intentId,
        cancelPollingStrategySelection.intentId,
        cancelMyAccount.intentId,
        noLogout.intentId,
        noBackend.intentId,
        cancelValidationProcess.intentId,
        deregisterPushOnBackend.intentId,
        //registerPushOnBackend.intentId
      ].indexOf(botState.activeIntent) > -1 &&
      lastLogin &&
      userQualificationField
    ) {
      return 1;
    }
    return 0;
  };

  //Service Providers access
  let validationCode = new Intent("validationCode");
  validationCode.runOnCloud();
  validationCode.onMatching = botState => {
    // let botFlow = botState.getBotFlow(ACTIVATE_DOMAIN_BOTFLOW);
    //let activationEntity = botState.getField(ACTIVATE_DOMAIN_ENTITY);
    return (
      (botState.previousActiveIntent === serviceProviderAccess.intentId ||
        botState.previousActiveIntent === validationCode.intentId ||
        botState.messageTypeFromUser === "barcode") &&
      (botState.getNlpResultsForId(NLPId).action === Intent.NO_INTENT() ||
        botState.getNlpResultsForId(NLPId).action === "undefined")
    );
  };
  validationCode.onResolution = async botState => {
    return botState.marketplace.validateActivationCode(botState.messageFromUser).then(domains => {
      if (domains && !botState._.isEmpty(domains)) {
        //let botFlow = botState.getBotFlow(ACTIVATE_DOMAIN_BOTFLOW);
        let activationEntity = botState.getField(ACTIVATE_DOMAIN_ENTITY);
        //botFlow.setBotFlowChanged();
        //activationEntity.domains = domains;
        botState.setField(ACTIVATE_DOMAIN_ENTITY, domains);
        //botFlow.markCurrentStepAsCompleted();
        botState.sendMessage({
          intentId: EDGE_CODE_VALIDATION_PROCESS
        });
      } else {
        botState.addErrorToStack(
          1001,
          "I could not validate the code. Please try again or click Abort if you wouldn't like to try further."
        );
      }
    });
  };

  //Service Providers access
  let autoInstallInitialBots = new Intent(AUTO_INSTALL_INITIAL_BOTS_INTENT);
  autoInstallInitialBots.runOnCloud();
  autoInstallInitialBots.onMatching = () => {
    let intentId = botState.messageFromUser.intentId || "";
    return intentId.substr(0, 18) === "autoInstallInitial";
  };
  autoInstallInitialBots.onResolution = async botState => {
    let intentId = botState.messageFromUser.intentId || "";
    if (intentId !== "") {
      botState.addStringResponse("Activating code");
      return botState.marketplace.validateActivationCode(intentId).then(domains => {
        if (domains && !botState._.isEmpty(domains)) {
          botState.processIntentWithId(EDGE_CODE_VALIDATION_PROCESS);
          // botState.sendMessage({
          //   intentId: EDGE_CODE_VALIDATION_PROCESS,
          // });
        } else {
          botState.addErrorToStack(
            1001,
            "I could not validate the code. Please try again or click Abort if you wouldn't like to try further."
          );
        }
      });
    }
  };

  let cancelValidationProcess = new Intent("cancelValidationCode");
  // cancelValidationProcess.suggestionsArray = [
  //   {
  //     lang: "en",
  //     list: [CANCEL_EDGE_CODE_VALIDATION_PROCESS, HELP_CODE_VALIDATION_PROCESS, DO_NOT_KNOW_CODE_VALIDATION_PROCESS]
  //   }
  // ];
  cancelValidationProcess.onMatching = botState => {
    return botState.messageFromUser === CANCEL_EDGE_CODE_VALIDATION_PROCESS;
  };
  cancelValidationProcess.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(ACTIVATE_DOMAIN_BOTFLOW);
    // botFlow.end();
    botState.addStringResponse("Ok");
  };
  cancelValidationProcess.onPrediction = async () => {
    if ([validationCode.intentId, serviceProviderAccess.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  let edgeValidationProcess = new Intent(EDGE_CODE_VALIDATION_PROCESS);
  edgeValidationProcess.onMatching = botState => {
    //let botFlow = botState.getBotFlow(ACTIVATE_DOMAIN_BOTFLOW);
    let activationEntity = botState.getField(ACTIVATE_DOMAIN_ENTITY);
    return (
      (activationEntity && !botState.messageFromUser.intentId) ||
      botState.messageFromUser.intentId === EDGE_CODE_VALIDATION_PROCESS
    );
  };
  edgeValidationProcess.onResolution = async botState => {
    //let botFlow = botState.getBotFlow(ACTIVATE_DOMAIN_BOTFLOW);
    let domains = botState.getField(ACTIVATE_DOMAIN_ENTITY) || ["frontmai"];
    //let domains = _.get(activationEntity, 'domains', ['frontmai']);
    //botState.addStringResponse('Activating domain');
    return botState.marketplace
      .activateDomainsOnEdge(domains)
      .then(() => {
        //botState.addStringResponse('Auto-installing bots');
        return botState.marketplace.autoInstallAllBotsOnEdge().then(() => {
          // if (domains.length > 1) {
          //   botState.addStringResponse(
          //     "Great, the service provider's featured Assistants are now installed on your home screen. Touch back to see."
          //   );
          //   botState.addStringResponse('Remember, I am here to help you with any general enquiries and app settings.');
          //   //botFlow.end();
          // } else {
          //   sendWelcomeMessages(botState);
          // }
          botState.setField(AUTO_INSTALLATION_STATUS, true);
          sendWelcomeMessages(botState);
          botState.clearField(ACTIVATE_DOMAIN_ENTITY);
        });
      })
      .catch(() => {
        //botFlow.end();
      });
  };

  //Nothing specific
  let selectPollingStrategy = new Intent("selectPollingStrategy");
  selectPollingStrategy.suggestionsArray = [
    {
      lang: "en",
      list: [SELECT_POLLING_STRATEGY]
    }
  ];
  selectPollingStrategy.onMatching = botState => {
    return (
      botState.messageFromUser === SELECT_POLLING_STRATEGY ||
      botState.getNlpResultsForId(NLPId).action === "Polling Strategy"
    );
  };
  selectPollingStrategy.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
    // botFlow.start();
    // botFlow.markCurrentStepAsCompleted();
    botState.addStringResponse(
      "Uniquely, FrontM helps you control how you use your available internet. This is particularly useful when you're on in-flight WiFi or on a Ship."
    );
    botState.addStringResponse("Select a setting from below suggestions");
  };
  selectPollingStrategy.onPrediction = async () => {
    let lastLogin = botState.getField(LAST_LOGIN);
    let formId = botState.getField(CHANGE_PASSWORD_FORM) || "";
    if (
      [
        formId,
        Intent.SPEECH(),
        Intent.NO_INTENT(),
        main.intentId,
        //finishSetup.intentId,
        //fullBackendSetup.intentId,
        //fullEdgeSetup.intentId,
        yesPush.intentId,
        edgeValidationProcess.intentId,
        automaticPollingStrategy.intentId,
        satellitePollingStrategy.intentId,
        terrestrialPollingStrategy.intentId,
        manualPollingStrategy.intentId,
        cancelPollingStrategySelection.intentId,
        cancelMyAccount.intentId,
        noLogout.intentId,
        noBackend.intentId,
        cancelValidationProcess.intentId,
        deregisterPushOnBackend.intentId,
        //registerPushOnBackend.intentId
      ].indexOf(botState.activeIntent) > -1 &&
      lastLogin
    ) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let automaticPollingStrategy = new Intent("automaticPollingStrategy");
  automaticPollingStrategy.suggestionsArray = [
    {
      lang: "en",
      list: [AUTOMATIC_POLLING_STRATEGY]
    }
  ];
  automaticPollingStrategy.onMatching = botState => {
    return (
      (botState.messageFromUser === AUTOMATIC_POLLING_STRATEGY ||
        botState.getNlpResultsForId(NLPId).action === "AutomaticNetworkMode") &&
      botState.client === State.MOBILECLIENT()
    );
  };
  automaticPollingStrategy.onResolution = async botState => {
    return botState.setNetworkModeTo("automatic").then(() => {
      botState.addStringResponse("I will be detecting automatically the type of network you are using");
      // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
      // botFlow.end();
    });
  };
  automaticPollingStrategy.onPrediction = async () => {
    if ([selectPollingStrategy.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let terrestrialPollingStrategy = new Intent("terrestrialPollingStrategy");
  terrestrialPollingStrategy.suggestionsArray = [
    {
      lang: "en",
      list: [TERRESTRIAL_POLLING_STRATEGY]
    }
  ];
  terrestrialPollingStrategy.onMatching = botState => {
    return (
      (botState.messageFromUser === TERRESTRIAL_POLLING_STRATEGY ||
        botState.getNlpResultsForId(NLPId).action === "TerrestrialMode") &&
      botState.client === State.MOBILECLIENT()
    );
  };
  terrestrialPollingStrategy.onResolution = async botState => {
    return botState.setNetworkModeTo("gsm").then(() => {
      botState.addStringResponse(
        "I will be assuming you are in a terrestrial network all the time. If you are connected over a satellite the screen will turn pink to let you know"
      );
      // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
      // botFlow.end();
    });
  };
  terrestrialPollingStrategy.onPrediction = async () => {
    if ([selectPollingStrategy.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let satellitePollingStrategy = new Intent("satellitePollingStrategy");
  satellitePollingStrategy.suggestionsArray = [
    {
      lang: "en",
      list: [SATELLITE_POLLING_STRATEGY]
    }
  ];
  satellitePollingStrategy.onMatching = botState => {
    return (
      (botState.messageFromUser === SATELLITE_POLLING_STRATEGY ||
        botState.getNlpResultsForId(NLPId).action === "SatelliteMode") &&
      botState.client === State.MOBILECLIENT()
    );
  };
  satellitePollingStrategy.onResolution = async botState => {
    return botState.setNetworkModeTo("satellite").then(() => {
      botState.addStringResponse(
        "I will be assuming you are connected over a satellite all the time saving data as much as possible"
      );
      // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
      // botFlow.end();
    });
  };
  satellitePollingStrategy.onPrediction = async () => {
    if ([selectPollingStrategy.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let manualPollingStrategy = new Intent("manualPollingStrategy");
  manualPollingStrategy.suggestionsArray = [
    {
      lang: "en",
      list: [MANUAL_POLLING_STRATEGY]
    }
  ];
  manualPollingStrategy.onMatching = botState => {
    return (
      (botState.messageFromUser === MANUAL_POLLING_STRATEGY ||
        botState.getNlpResultsForId(NLPId).action === "ManualNetworkMode") &&
      botState.client === State.MOBILECLIENT()
    );
  };
  manualPollingStrategy.onResolution = async botState => {
    return botState.setNetworkModeTo("manual").then(() => {
      botState.addStringResponse(
        "You are in Manual Network Mode. You are consuming 0KB background data currently. You will need to touch the refresh button to fetch messages."
      );
      // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
      // botFlow.end();
    });
  };
  manualPollingStrategy.onPrediction = async () => {
    if ([selectPollingStrategy.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let cancelPollingStrategySelection = new Intent("cancelPollingStrategySelection");
  cancelPollingStrategySelection.suggestionsArray = [
    {
      lang: "en",
      list: [CANCEL_POLLING_STRATEGY]
    }
  ];
  cancelPollingStrategySelection.onMatching = botState => {
    return botState.messageFromUser === CANCEL_POLLING_STRATEGY;
  };
  cancelPollingStrategySelection.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(POLLING_STRATEGY_BOTFLOW);
    // botFlow.end();
    botState.addStringResponse("Ok");
  };
  cancelPollingStrategySelection.onPrediction = async () => {
    if ([selectPollingStrategy.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let myAccount = new Intent("myAccount");
  myAccount.suggestionsArray = [
    {
      lang: "en",
      list: [MY_ACCOUNT]
    }
  ];
  myAccount.onMatching = botState => {
    return botState.messageFromUser === MY_ACCOUNT || botState.getNlpResultsForId(NLPId).action === "MyAccount";
  };
  myAccount.onResolution = async botState => {
    botState.addStringResponse("Select from the suggestions below");
  };
  myAccount.onPrediction = async () => {
    let lastLogin = botState.getField(LAST_LOGIN);
    let formId = botState.getField(CHANGE_PASSWORD_FORM) || "";
    if (
      [
        formId,
        Intent.SPEECH(),
        Intent.NO_INTENT(),
        main.intentId,
        //finishSetup.intentId,
        //fullBackendSetup.intentId,
        //fullEdgeSetup.intentId,
        // pushNotificationsCheck.intentId,
        yesPush.intentId,
        edgeValidationProcess.intentId,
        automaticPollingStrategy.intentId,
        satellitePollingStrategy.intentId,
        terrestrialPollingStrategy.intentId,
        manualPollingStrategy.intentId,
        cancelPollingStrategySelection.intentId,
        cancelMyAccount.intentId,
        noLogout.intentId,
        noBackend.intentId,
        cancelValidationProcess.intentId,
        deregisterPushOnBackend.intentId,
        //registerPushOnBackend.intentId
      ].indexOf(botState.activeIntent) > -1 &&
      lastLogin
    ) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let cancelMyAccount = new Intent("cancelMyAccount");
  cancelMyAccount.suggestionsArray = [
    {
      lang: "en",
      list: [CANCEL_MY_ACCOUNT]
    }
  ];
  cancelMyAccount.onMatching = botState => {
    return botState.messageFromUser === CANCEL_MY_ACCOUNT;
  };
  cancelMyAccount.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(MY_ACCOUNT_BOTFLOW);
    // botFlow.end();
    let formId = botState.getField(CHANGE_PASSWORD_FORM);
    let form = botState.getForm(formId);
    if (form.isOpen) {
      form.cancelForm();
    }
    botState.addStringResponse("Ok");
  };
  cancelMyAccount.onPrediction = async () => {
    if (
      [myAccount.intentId, changePassword.intentId].indexOf(botState.activeIntent) > -1 &&
      botState.client === State.MOBILECLIENT()
    ) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let changePassword = new Intent("changePassword");
  changePassword.suggestionsArray = [
    {
      lang: "en",
      list: [CHANGE_PASSWORD]
    }
  ];
  changePassword.onMatching = botState => {
    return (
      botState.messageFromUser === CHANGE_PASSWORD || botState.getNlpResultsForId(NLPId).action === "ChangePassword"
    );
  };
  changePassword.onResolution = async botState => {
    let provider = "";
    if (botState.client === State.MOBILECLIENT()) {
      provider = _.trim(botState.user.provider.name);
    }
    if (provider !== "google" && provider !== "facebook") {
      if (botState.client === State.MOBILECLIENT()) {
        let formId = botState.getField(CHANGE_PASSWORD_FORM);
        let form = botState.getForm(formId);
        form.clearAllFields();
        botState.addResponse("form2", form);
      } else {
        botState.addStringResponse(
          "You can change your password from your profile screen that can be reached at the top right of the page"
        );
      }
    } else {
      botState.addStringResponse(
        `You have used ${provider} to register in FrontM, if you wish to change your password you need to do it there`
      );
    }
  };
  changePassword.onPrediction = async () => {
    let provider = "";
    if (botState.client === State.MOBILECLIENT()) {
      provider = _.trim(botState.user.provider.name);
    }
    if (provider !== "google" && [myAccount.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Nothing specific
  let saveNewPassword = new Intent(SAVE_NEW_PASSWORD);
  saveNewPassword.onMatching = botState => {
    return botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === SAVE_NEW_PASSWORD;
  };
  saveNewPassword.onError = () => {
    botState.addStringResponse(
      "I could not change your password. Either your old password typed is wrong or the password is not strong enough"
    );
  };
  saveNewPassword.onResolution = async botState => {
    // let botFlow = botState.getBotFlow(MY_ACCOUNT_BOTFLOW);
    // botFlow.end();
    return botState
      .updatePassword(botState.messageFromUser.oldPassword, botState.messageFromUser.newPassword)
      .then(() => {
        if (!botState.inError) {
          botState.addStringResponse("Your password have been updated");
        }
      });
  };

  //Nothing specific
  let logout = new Intent(LOGOUT);
  logout.suggestionsArray = [
    {
      lang: "en",
      list: [LOGOUT]
    }
  ];
  logout.onMatching = botState => {
    return (
      (botState.messageTypeFromUser === "string" && botState.messageFromUser === LOGOUT) ||
      (botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === LOGOUT) ||
      botState.getNlpResultsForId(NLPId).action === "logout"
    );
  };
  logout.onResolution = async botState => {
    if (botState.messageTypeFromUser === "string" || botState.getNlpResultsForId(NLPId).action === "logout") {
      if (botState.getField(NOTIFICATION_CHANGES_IN_PROGRESS) === null) {
        botState.setField(PREVIOUS_INTENT, LOGOUT_INTENT);
        botState.addStringResponse("Are you sure you would like to logout?");
        //botState.addEnglishSmartSuggestions([YES, NO]);
      } else {
        botState.addStringResponse(
          "Your notification settings are still being updated. Please try me again in just a moment."
        );
      }
    } else {
      return botState.logout();
    }
  };
  logout.onPrediction = async () => {
    if ([myAccount.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Intent Support
  let support = new Intent("support");
  support.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "support";
  };
  support.onResolution = async botState => {
    // botState.addStringResponse(
    //   'Sorry for the trouble, Please fill the form and I will pass the information to our support team immediately'
    // );
    let formId = botState.getField(COMPLAINT_FORM);
    let form = botState.getForm(formId);
    botState.addResponse("form2", form);
  };

  let emailSupport = new Intent("emailSupport");
  emailSupport.runOnCloud();
  emailSupport.onMatching = botState => {
    return botState.messageTypeFromUser === "object" && botState.messageFromUser.intentId === "emailSupport";
  };
  emailSupport.onResolution = async botState => {
    let supportId = Math.round(Math.random() * (99999999 - 1) + 1);
    let body = `Support request; support id: ${supportId}
                Title: ${botState.messageFromUser.title}
                Description: ${botState.messageFromUser.description}
                User Email: ${botState.user.userEmail}`;
    let clientBody = `Thank you for contacting FrontM Platform.
We have opened case “${supportId}” to address your issue.
The details of your case are as follows:

Case ID: ${supportId}
Subject: ${botState.messageFromUser.title}

To contact us again about this issue, please email us to support@frontm.com with the case ID in your subject.

Sincerely,
The FrontM Platform Team

*Please note: this e-mail was sent from an address that cannot accept incoming e-mail. Please use support@frontm.com if you need to contact us again about this same issue.

Some of the content and links in this email may have been generated by a FrontM customer. FrontM is not responsible for the contents or links within.`;
    return botState.notification
      .sendEmail("support@frontm.com", "Support request from " + botState.user.userEmail, body)
      .then(response => {
        return botState.notification.sendEmail(botState.user.userEmail, "Confirmation", clientBody);
      })
      .then(response => {
        botState.addStringResponse("I have informed our team about your concern, they will contact you soon.");
        botState.addStringResponse("Your case number is " + supportId);
      })
      .catch(err => {
        botState.developer.debug("Error while sending mail to support message: " + err);
      });
  };

  //Intent Tariff Check
  let checkBalance = new Intent("4_balanceCheck");
  checkBalance.runOnCloud();
  checkBalance.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "4_balanceCheck";
  };
  checkBalance.onResolution = async botState => {
    return botState.accounts.getBalance("pstn-balance").then(responseBalance => {
      let _ = botState._;
      let balance = _.get(responseBalance, "pstn-balance.available", 0);
      botState.addStringResponse("You have US$" + Math.round(balance * 100) / 100 + " in your account");
    });
  };

  //Intent Tariff Check
  let inviteQuestion = new Intent("inviteQuestion");
  inviteQuestion.runOnCloud();
  inviteQuestion.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "inviteQuestion";
  };
  inviteQuestion.onResolution = async botState => {
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "Go back to your timeline, then touch the Contacts tab at the bottom of the screen, then touch the + button at the top right and follow the instructions on screen"
      );
    } else {
      botState.addStringResponse(
        "Click \"Add Contact\" under Contacts on the left menu. Then choose \"Send an email invitation to a friend\""
      );
    }
  };

  //Intent Tariff Check
  let InvitationCode = new Intent("InvitationCode");
  InvitationCode.runOnCloud();
  InvitationCode.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "InvitationCode";
  };
  InvitationCode.onResolution = async botState => {
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "To activate a new service provider, please touch on the Apps catalogue tab at the bottom of the home screen then touch Providers section at the top and you will find the button to activate a new provider"
      );
    } else {
      botState.addStringResponse("Open the drop down at the top left of this page and then click on +");
    }
  };

  //Intent Tariff Check
  let callingRates = new Intent("checkCallingRates");
  // callingRates.suggestionsArray = [
  //   {
  //     lang: "en",
  //     list: [smartSuggestionsConstants.CHECKCALLRATES]
  //   }
  // ];
  callingRates.onMatching = botState => {
    return (
      botState.messageFromUser === smartSuggestionsConstants.CHECKCALLRATES ||
      botState.messageFromUser === smartSuggestionsConstants.CHECKCALLINGRATESOTHER ||
      botState.getNlpResultsForId(NLPId).action === "checkCallingRates"
    );
  };
  callingRates.onResolution = async botState => {
    botState.addStringResponse("Sure, let me know which destination you want the call rates for?");
  };

  //Intent Tariff Check
  let tariffCheck = new Intent("1_tariffCheck");
  tariffCheck.runOnCloud();
  tariffCheck.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "1_tariffCheck";
  };
  tariffCheck.onResolution = async botState => {
    let _ = botState._;
    let isoCountry = _.get(botState.getNlpResultsForId(NLPId), "nlpParameters.geo-country-code.alpha-2");
    if (!isoCountry) {
      botState.addErrorToStack(1001, "Sorry, could you confirm the destination country name?");
    }
    return botState.accounts.getCallRates(isoCountry).then(tariffsArray => {
      _.each(tariffsArray, tariff => {
        botState.addStringResponse(
          "Calling rates to " + tariff.planName + " is $" + tariff.currentPrice + " per minute"
        );
      });
    });
  };

  //Intent Tariff Check
  let tariffCheckSat = new Intent("1_tariffCheckSat");
  tariffCheckSat.suggestionsArray = [
    {
      lang: "en",
      list: ["India", "Argentina", "France", INMARSAT, IRIDIUM]
    }
  ];
  tariffCheckSat.runOnCloud();
  tariffCheckSat.onMatching = () => {
    return (
      botState.messageFromUser === INMARSAT ||
      botState.messageFromUser === IRIDIUM ||
      botState.getNlpResultsForId(NLPId).action === "qs_IridiumCallingcosts" ||
      botState.getNlpResultsForId(NLPId).action === "qs_InmarsatCallingCosts"
    );
  };
  tariffCheckSat.onResolution = async botState => {
    return botState.accounts.getCallRates(SAT_PHONE).then(tariffsArray => {
      _.each(tariffsArray, tariff => {
        let platform = "Inmarsat";
        if (botState.getNlpResultsForId(NLPId).action === "qs_IridiumCallingcosts") {
          platform = "Iridium";
        }
        botState.addStringResponse("Calling rate to " + platform + " is $" + tariff.currentPrice + " per minute");
      });
    });
  };
  tariffCheckSat.onPrediction = async () => {
    if ([callingRates.intentId].indexOf(botState.activeIntent) > -1) {
      return 1;
    }
    return 0;
  };

  //Intent Support
  let callSatFailed = new Intent("callSatFailed");
  callSatFailed.runOnCloud();
  callSatFailed.onMatching = () => {
    return (
      botState.getNlpResultsForId(NLPId).action === "8_CheckCallFailure" &&
      botState.messageFromUser !== INMARSAT &&
      botState.messageFromUser !== IRIDIUM
    );
  };
  callSatFailed.onResolution = async botState => {
    return botState.accounts.getBalance("pstn-balance").then(responseBalance => {
      let balance = _.get(responseBalance, "pstn-balance.available", 0);
      if (balance <= 0) {
        botState.addStringResponse(
          "Sorry, but you do not have sufficient balance to call Satellite Numbers. Please top up and try again"
        );
      } else {
        botState.sendMessage({
          intentId: "emailSupport",
          title: "Support Request with Satphone numbers",
          description: botState.messageFromUser,
          priority: 1
        });
        botState.addResponse("silent", {});
      }
    });
  };

  let formattedHistory = (botState, callHistoryArray) => {
    let callEntriesArray = [];
    botState._.each(callHistoryArray, callEntry => {
      let newCallForCard = {
        title: "Call data",
        To: callEntry.callTo,
        Duration: callEntry.duration + " minutes",
        Charge: "$" + Math.round(_.get(callEntry, "callCharge", 0) * 100) / 100,
        Time: new Date(callEntry.callTimestamp).toLocaleString(),
        Balance: "$" + Math.round(_.get(callEntry, "currentBalance", 0) * 100) / 100
      };
      callEntriesArray.push(newCallForCard);
    });
    return callEntriesArray;
  };

  //Intent Recent calls
  let recentCalls = new Intent("5_callHistory");
  recentCalls.runOnCloud();
  // recentCalls.suggestionsArray = [
  //   {
  //     lang: "en",
  //     list: [smartSuggestionsConstants.CHECKRECENTCALLS]
  //   }
  // ];
  recentCalls.onMatching = botState => {
    return (
      botState.messageFromUser === smartSuggestionsConstants.CHECKRECENTCALLS ||
      botState.getNlpResultsForId(NLPId).action === "5_callHistory"
    );
  };
  recentCalls.onResolution = async botState => {
    let callHistorySize = botState.getField(CALL_HISTORY_FIELD);
    return botState.accounts.getCallHistory().then(callHistoryArray => {
      callHistorySize = _.size(callHistoryArray);
      botState.setField(CALL_HISTORY_FIELD, callHistorySize);
      if (callHistorySize > 0) {
        if (botState.client === State.WEBCLIENT()) {
          botState.addResponse("table", {
            options: {
              title: "Calls History",
              description: "This table displays the calls you have previously made"
            },
            rows: formattedHistory(botState, callHistoryArray)
          });
        } else {
          botState.addResponse("data_card", formattedHistory(botState, callHistoryArray));
        }
      } else {
        botState.addStringResponse("Sorry but you haven't made any calls recently");
      }
    });
  };

  //Intent Recent calls
  let emailUsageHistory = new Intent("6_emailUsageHistory");
  emailUsageHistory.runOnCloud();
  emailUsageHistory.onMatching = botState => {
    return (
      botState.messageFromUser === smartSuggestionsConstants.EMAILHISTORY ||
      botState.getNlpResultsForId(NLPId).action === "6_emailUsageHistory"
    );
  };
  emailUsageHistory.onResolution = async botState => {
    return botState.accounts.getCallHistory().then(callHistoryArray => {
      if (botState._.size(callHistoryArray) > 0) {
        let body =
          "Hi " +
          botState.userName +
          "!\n\nAttached you can find the call history with the phone numbers you called using FrontM.\n\nFrontM Team";
        let attachment = {
          name: "FrontMCallHistory.txt",
          content: formattedHistory(botState, callHistoryArray)
        };
        return botState.notification
          .sendEmail(botState.user.userEmail, "FrontM Call History", body, attachment)
          .then(response => {
            botState.addStringResponse("I have sent you the email");
          });
      } else {
        botState.addStringResponse("Sorry but you have not made any calls so far ");
      }
    });
  };

  let howToUseFrontM = new Intent("howToUseFrontM");
  howToUseFrontM.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howToUseFrontM";
  };
  howToUseFrontM.onResolution = async () => {
    botState.addStringResponse(
      "You can use FrontM to make low cost calls to satellite phones and other numbers. Top up credit to use the dialpad or call numbers you have saved as Contacts. You can also connect with other app users to make free app-to-app calls over the internet"
    );
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "You can also send instant messages to contacts who have accepted your request, join or create channels for group chat, and install other helper applications. You can also use FrontM online at www.frontm.ai"
      );
    } else {
      if (botState.user.loggedInDomain === "gns") {
        botState.addStringResponse("You can also download our mobile app from the Apple or Google Play app stores");
      } else {
        botState.addStringResponse(
          "You can also sent instant messages to contacts who have accepted your request, join or create channels for group chat, and install other apps"
        );
        botState.addStringResponse("You can also download our mobile app from the Apple or Google Play app stores");
      }
    }
  };

  let howToMakeCalls = new Intent("howToMakeCalls");
  howToMakeCalls.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howToMakeCalls";
  };
  howToMakeCalls.onResolution = async () => {
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "You can enter numbers using the dialpad, or call saved contacts. First, click back, and then click on the phone button"
      );
      botState.addStringResponse(
        "To dial directly, select the dialpad. You'll need to dial the full international number including the code for the country or Iridium/Inmarsat (e.g. +870)"
      );
      botState.addStringResponse(
        "To call a contact from your list, click their name and click the phone button next to the number to call"
      );
      botState.addStringResponse(
        "If you do not have any call credit, you will need to top up by selecting Get Credit first"
      );
    } else {
      botState.addStringResponse(
        "You can enter numbers using the dialpad, or call saved contacts. If you do not have any call credit, you will need to top up by selecting Get Credit first"
      );
      botState.addStringResponse(
        "To dial directly, click on the dialpad above. You'll need to dial the full international number including the code for the country or Iridium/Inmarsat (e.g. +870)"
      );
      botState.addStringResponse(
        "To call a contact, click their name on the contacts button, and click the phone button next to their name or number"
      );
    }
  };

  let howDoIAddCallCredits = new Intent("howDoIAddCallCredits");
  howDoIAddCallCredits.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howDoIAddCallCredits";
  };
  howDoIAddCallCredits.onResolution = async () => {
    if (botState.client === State.MOBILECLIENT()) {
      botState.addStringResponse(
        "You will be prompted to Get Credit when you try to make a call. You can then top up using in-app payments. You can also make card payments using our frontm.ai web app"
      );
    } else {
      botState.addStringResponse(
        "Click \"Get Credit\" above and choose an amount to top up. You will then be able to add payment details to make a card payment"
      );
    }
  };

  let howDoIAddContacts = new Intent("howDoIAddContacts");
  howDoIAddContacts.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howDoIAddContacts";
  };
  howDoIAddContacts.onResolution = async () => {
    if (botState.client === State.WEBCLIENT()) {
      if (botState.user.loggedInDomain === "gns") {
        botState.addStringResponse(
          "Click “Add Contact” under “Contacts” on the left menu. From here, you can create a new contact using their phone number, invite your friends by email or search existing app users to request a direct connection. Install the FrontM mobile app to import your existing mobile contacts"
        );
      } else {
        botState.addStringResponse(
          "Click \"Add Contact\" under \"Contacts\" on the left menu. From here, you can create a new contact using their phone number, invite your friends by email or search existing app users and request a direct connection to make app-to-app calls or send instant messages. Install the FrontM mobile app to import your existing mobile contacts"
        );
      }
    } else {
      botState.addStringResponse(
        "Go back, and tap \"Contacts\" at the bottom. From here, you can import your phone book contacts, create a new contact using their phone number, invite your friends by email or search existing app users and request a direct connection to make app-to-app calls or send instant messages"
      );
    }
  };

  let whatIsFrontM = new Intent("whatIsFrontM");
  whatIsFrontM.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "whatIsFrontM";
  };
  whatIsFrontM.onResolution = async () => {
    if (botState.client === State.WEBCLIENT() && botState.user.loggedInDomain === "gns") {
      botState.addStringResponse(
        "FrontM app is for communication, collaboration and easy access to information in remote spaces, and low cost calls to satellite phones. Use this app for calling satellite phone numbers and for messaging, voice calling and other interactions from sea, mid air or in remote places"
      );
    } else {
      botState.addStringResponse(
        "FrontM app is for low cost calls to satellite phones. Use this app for calling from shore and HQ to ships bridges or other satellite phones"
      );
    }
  };

  let howToAccessApps = new Intent("howToAccessApps");
  howToAccessApps.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howToAccessApps";
  };
  howToAccessApps.onResolution = async () => {
    if (botState.client === State.WEBCLIENT()) {
      if (botState.user.loggedInDomain === "gns") {
        botState.addStringResponse(
          "You are already using FrontM assistant! Ask me anything and I will try to help. There are currently no other apps available to use on this workspace"
        );
      } else {
        botState.addStringResponse("The FrontM applications are accessed by clicking Apps on the left navigation menu");
      }
    } else {
      botState.addStringResponse("Go back and touch on Apps on the bottom menu");
    }
  };

  let cannotFindApp = new Intent("cannotFindApp");
  cannotFindApp.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "cannotFindApp";
  };
  cannotFindApp.onResolution = async () => {
    if (botState.client === State.WEBCLIENT() && botState.user.loggedInDomain === "gns") {
      botState.addStringResponse("Only the FrontM Assistant is available on this workspace");
    } else {
      botState.addStringResponse(
        "Sorry, you can't find what you are looking for. If you have been invited by a partner, you may need to enter an Access Code. Otherwise, please raise a Customer Feature Request with FrontM below"
      );
    }
  };

  let howToChat = new Intent("howToChat");
  howToChat.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "howToChat";
  };
  howToChat.onResolution = async () => {
    if (botState.client === State.WEBCLIENT() && botState.user.loggedInDomain === "gns") {
      botState.addStringResponse("Chats are disabled in this workspace");
    } else {
      botState.addStringResponse(
        "If the contact is a FrontM user and they have authorised your connection request, you will be able to chat with them by clicking on them in your Contacts list, and then clicking the chat icon next to their name. You can also start or join Channels for group chat."
      );
    }
  };

  let dunno = new Intent("dunno");
  dunno.onMatching = () => {
    return botState.getNlpResultsForId(NLPId).action === "dunno";
  };
  dunno.onResolution = async () => {
    botState.addStringResponse(
      "I am sorry to hear that. I am here to help you as far as I can, with your enquiries. If I can't, you always have the option of requesting help from our Support team."
    );
    if (botState.client === State.WEBCLIENT() && botState.user.loggedInDomain === "gns") {
      botState.addEnglishSmartSuggestions([
        "Raise a Support Request",
        "What is this app for",
        "How to make phone calls"
      ]);
    } else {
      botState.addEnglishSmartSuggestions([
        "Raise a Support Request",
        "What is this app for",
        "How to make phone calls",
        "How to chat"
      ]);
    }
  };

  if (botState.client === State.MOBILECLIENT()) {
    return [
      main,
      inviteQuestion,
      InvitationCode,
      callingRates,
      tariffCheck,
      tariffCheckSat,
      callSatFailed,
      //pushNotificationsCheck,
      yes,
      yesPush,
      yesLogout,
      //registerPushOnBackend,
      no,
      noLogout,
      noPush,
      noBackend,
      // userQualification,
      // travel,
      // maritimeProductivity,
      // processAutomation,
      // nothingSpecific,
      validationCode,
      cancelValidationProcess,
      edgeValidationProcess,
      selectPollingStrategy,
      automaticPollingStrategy,
      terrestrialPollingStrategy,
      satellitePollingStrategy,
      manualPollingStrategy,
      cancelPollingStrategySelection,
      deActivatePushNotifications,
      deregisterPushOnBackend,
      myAccount,
      cancelMyAccount,
      changePassword,
      logout,
      saveNewPassword,
      support,
      emailSupport,
      autoInstallInitialBots,
      allQuestions,
      testVideo,
      //fullEdgeSetup,
      //fullBackendSetup,
      //finishSetup,
      checkBalance,
      recentCalls,
      emailUsageHistory,
      howToMakeCalls,
      howToUseFrontM,
      howDoIAddCallCredits,
      howDoIAddContacts,
      whatIsFrontM,
      howToAccessApps,
      cannotFindApp,
      howToChat,
      dunno
    ];
  } else {
    return [
      main,
      inviteQuestion,
      InvitationCode,
      callSatFailed,
      callingRates,
      tariffCheck,
      tariffCheckSat,
      yesBackend,
      changePassword,
      noBackend,
      // userQualification,
      // maritimeOperations,
      // communicationCollaboration,
      // iotSensorManagement,
      // nothingSpecific,
      validationCode,
      cancelValidationProcess,
      edgeValidationProcess,
      cancelMyAccount,
      // aviationProductivity,
      // chatbotDevelopment,
      support,
      emailSupport,
      autoInstallInitialBots,
      allQuestions,
      testVideo,
      //fullEdgeSetup,
      //fullBackendSetup,
      //finishSetup,
      checkBalance,
      recentCalls,
      emailUsageHistory,
      howToMakeCalls,
      howToUseFrontM,
      howDoIAddCallCredits,
      howDoIAddContacts,
      whatIsFrontM,
      howToAccessApps,
      cannotFindApp,
      howToChat,
      dunno
    ];
  }
};
