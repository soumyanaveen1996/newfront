(function(){var PROFILE_PIC_BUCKET='profile-pics';var ERRORS={UNKNOWN_QR_CODE:'UNKNOWN_QR_CODE'};var LoginHandler={LOGIN_STEPS:{ACTIVATE_BOTS:'ACTIVATE_BOTS',FINAL_MSG:'FINAL_MSG'},postLoginSteps:function postLoginSteps(botContext){botState.postLogin=true;var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){tell('Hi '+user.info.userName+'! Do you allow app notifications?',botContext);MenuHelper.showMenu(MENU.PUSH_NOTIFICATION,botContext);});},postLoginActivationCode:function postLoginActivationCode(botContext){tell('Do you have a QR Code or invitation code from a company?',botContext);return MenuHelper.showMenu(MENU.ACTIVATION_CODE_ENTRY,botContext);},noActivationCode:function noActivationCode(message,state,previousMessages,botContext){tell('No problem, you can always return to this conversation when you have it',botContext);return LoginHandler.displayConditionalMenu(LoginHandler.LOGIN_STEPS.FINAL_MSG,message,state,previousMessages,botContext);},postLoginWelcomeMsg:function postLoginWelcomeMsg(botContext){delete botState.postLogin;tell('Feel free to personalise the configuration from the menu below',botContext);tell("Touch the back arrow (above) to go back to the FrontM timeline. You'll find collabration tools on the menu there. Worry not! I am always there to help!",botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);},displayConditionalMenu:function displayConditionalMenu(step,message,state,previousMessages,botContext){if(botState.postLogin){switch(step){case LoginHandler.LOGIN_STEPS.ACTIVATE_BOTS:return LoginHandler.postLoginActivationCode(botContext);break;case LoginHandler.LOGIN_STEPS.FINAL_MSG:return LoginHandler.postLoginWelcomeMsg(botContext);break;}}else{return MenuHelper.showMenu(MENU.MAIN,botContext);}}};var FormHandler={updateUserInfo:function updateUserInfo(msg,state,previousMessages,botContext){var _=botContext.getCapability('Utils').Lodash;var userDetails={};botContext.wait(true);var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var userInfo=user.info||{};var dbDocument={};var userName=msg.getMessage()[1].value||userInfo.userName;userDetails.userName=userName;dbDocument.userName=userName;dbDocument.userNameSearch=_.toLower(userName);var params={collection:'People',documents:[{key:{userId:user.userId},document:dbDocument}]};var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.writeData(msg,botContext,user,previousMessages,params);}).then(function(){return authContext.updateUserDetails(userDetails,botContext);}).then(function(){tell('Done! Your details have been updated',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}).catch(function(error){console.error('Error occurred while updating user details: ',error);tell('Error occurred: Unable to update your details',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},changeUserPwd:function changeUserPwd(msg,state,previousMessages,botContext){botContext.wait(true);var formMsg=msg.getMessage();var oldPassword=formMsg[3].value;var newPassword=formMsg[4].value;if(oldPassword===newPassword){botContext.wait(false);tell('Your new password must be different from your old password',botContext);return MenuHandler.showPwdChangeForm(msg,state,previousMessages,botContext);}var updatedUser={email:formMsg[2].value,oldPassword:oldPassword,newPassword:newPassword};var authContext=botContext.getCapability('authContext');authContext.updatePassword(updatedUser,botContext).then(function(){botContext.wait(false);tell('Your password has been updated',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}).catch(function(error){console.log('Password update error :',JSON.stringify(error));botContext.wait(false);tell(error.message,botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},reportAccountHack:function reportAccountHack(msg,state,previousMessages,botContext){botContext.wait(true);var formMsg=msg.getMessage();var emailDetails=formMsg[1].value;var authContext=botContext.getCapability('authContext');return authContext.getAuthUser(botContext).then(function(user){var userInfo=user.info||{};var emailUserInfo={userName:userInfo.userName,emailAddress:userInfo.emailAddress,userId:userInfo.userId};var emailBody='User information: \n'+JSON.stringify(emailUserInfo,null,4)+'\n \n \nDetails reported by the user: \n'+emailDetails;var params={address:'support@frontm.com',body:emailBody,title:'User Hacked!'};var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.sendEmail(null,botContext,user,null,params);}).then(function(){tell('I have reported your details to the support team. They should get in touch with you soon',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});}};var MenuHandler={EMAIL_USER_DATA_CAPABILITY:'EmailUserData',ADD_DOMAIN_ROLE_CAPABILITY:'SubscribeDomainRole',MSG_QUOTA_CAPABILITY:'MessageQuotaCapability',showUserForm:function showUserForm(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(usr){var Message=botContext.getCapability('Message');var message=new Message();message.formMessage([{id:1,title:'Enter your updated details',type:'title'},{id:2,title:'Name',value:usr.info.userName,type:'text_field',optional:false},{id:3,title:'Update',type:'button',action:'updateUserInfo'}],'');tell(message,botContext);});},showPwdChangeForm:function showPwdChangeForm(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(usr){var Message=botContext.getCapability('Message');var message=new Message();message.formMessage([{id:1,title:'Enter your new password',type:'title'},{id:2,text:'The new password should be different from your old password minimum 8 characters long with lower case, upper case, number and special characters in it',type:'text'},{id:3,title:'Email',type:'text_field',value:usr.info.emailAddress,editable:false},{id:4,title:'Old Password',type:'password_field',optional:false},{id:5,title:'New Password',type:'password_field',optional:false,retry:true},{id:6,title:'Change Password',type:'button',action:'changeUserPwd'}],'');tell(message,botContext);});},registerDevice:function registerDevice(message,state,previousMessages,botContext){var user=null;var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(usr){user=usr;var notification=botContext.getCapability('Notification');return notification.register();}).then(function(notificationDeviceInfo){botContext.wait(true);var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.registerDevice(notificationDeviceInfo,botContext,user);}).then(function(){tell('Ok, done!',botContext);return LoginHandler.displayConditionalMenu(LoginHandler.LOGIN_STEPS.ACTIVATE_BOTS,message,state,previousMessages,botContext);}).catch(function(){tell('Oops! I am not able to activate push notifications now. You can try again from the Configuration Menu',botContext);return LoginHandler.displayConditionalMenu(LoginHandler.LOGIN_STEPS.ACTIVATE_BOTS,message,state,previousMessages,botContext);});},deregisterDevice:function deregisterDevice(message,state,previousMessages,botContext){return MenuHandler.removePushNotification(botContext).then(function(){tell('Push notifications are deactivated for your device',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},removePushNotification:function removePushNotification(botContext){var user=null;var authContext=botContext.getCapability('authContext');return authContext.getAuthUser(botContext).then(function(usr){user=usr;var notification=botContext.getCapability('Notification');return notification.deregister();}).then(function(notificationDeviceInfo){botContext.wait(true);var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.deregisterDevice(notificationDeviceInfo,botContext,user);});},showNoPushNotificationMsg:function showNoPushNotificationMsg(message,state,previousMessages,botContext){tell('No problem, you can always ask me to activate them returning to this conversation',botContext);return LoginHandler.displayConditionalMenu(LoginHandler.LOGIN_STEPS.ACTIVATE_BOTS,message,state,previousMessages,botContext);},showConfigMenu:function showConfigMenu(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.CONFIG,botContext);},showAccountMenu:function showAccountMenu(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.ACCOUNT,botContext);},showAccountHackMenu:function showAccountHackMenu(message,state,previousMessages,botContext){tell("Alright, I'll need a few details about the hack. Then I'll let the adminstrators know about it.",botContext);tell("To start, we want to make sure this wasn't an error. Can you confirm if you still think you were hacked?",botContext);return MenuHelper.showMenu(MENU.REPORT_ACCOUNT_HACK,botContext);},showLogoutMenu:function showLogoutMenu(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.LOGOUT,botContext);},showDeleteDataMenu:function showDeleteDataMenu(message,state,previousMessages,botContext){tell('All your data will be permanently deleted. Do you want to proceed?',botContext);return MenuHelper.showMenu(MENU.DELETE_DATA,botContext);},showNetworkControlMenu:function showNetworkControlMenu(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.NETWORK_CONTROL,botContext);},showArchiveMessages:function showArchiveMessages(message,state,previousMessages,botContext){tell('Do you want to activate multi-device synchronization?',botContext);return MenuHelper.showMenu(MENU.ARCHIVE_MSGS,botContext);},showStopArchiveMessages:function showStopArchiveMessages(message,state,previousMessages,botContext){tell('Do you want to deactivate multi-device synchronization?',botContext);return MenuHelper.showMenu(MENU.STOP_ARCHIVE_MSGS,botContext);},showNetworkUsageMenu:function showNetworkUsageMenu(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');botContext.wait(true);var params={action:'getUserQuota'};return agentGuardService.executeCustomCapability(MenuHandler.MSG_QUOTA_CAPABILITY,params,true,undefined,botContext,user);}).then(function(data){var _=botContext.getCapability('Utils').Lodash;var msgCount=data[0]||{};if(_.isEmpty(msgCount)){tell('Looks like you have not used any bots yet. You do not have messages in your bots',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}else{var botUsageOptions=[];_.forIn(msgCount,function(value,key){var used=value.used,available=value.available,assigned=value.assigned;var quota=[{key:'used',value:used}];if(available){quota.push({key:'available',value:available});}if(assigned){quota.push({key:'assigned',value:assigned});}botUsageOptions.push({title:key,data:{contact_info:quota}});});tell('Following is your message quotas across all your bots:',botContext);return MenuHelper.showMenu(botUsageOptions,botContext);}});},changePollingStrategy:function changePollingStrategy(message,state,previousMessages,botContext){var PollingStrategyTypes=botContext.getCapability('PollingStrategyTypes');var _=botContext.getCapability('Utils').Lodash;var selectedOption=message.getMessage();var chosenStrategy=_.get(PollingStrategyTypes,selectedOption.toLowerCase())||'gsm';var Settings=botContext.getCapability('Settings');return Settings.setPollingStrategy(chosenStrategy).then(function(){if(selectedOption==='Manual'){tell('You are in Manual Network Mode. You are consuming 0KB background data currently. You will need to touch the refresh button to fetch messages.',botContext);}else{tell('Network control has been updated to '+selectedOption,botContext);}return MenuHelper.showMenu(MENU.MAIN,botContext);});},showActivateBotMsg:function showActivateBotMsg(message,state,previousMessages,botContext){botState.activatePartnerBots=true;tell('If a company has invited you to use their Bots, please scan the QR Code or type the invitation code. Please note that invitation code is case sensitive',botContext);},emailMyData:function emailMyData(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');botContext.wait(true);var params={action:'Email'};return agentGuardService.executeCustomCapability(MenuHandler.EMAIL_USER_DATA_CAPABILITY,params,false,undefined,botContext,user);}).then(function(){tell('I will email your data to the address you have used to login now. You should receive it shortly.',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},logout:function logout(message,state,previousMessages,botContext){return MenuHandler.removePushNotification(botContext).finally(function(){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){tell('Goodbye '+user.info.userName+', I will miss you and expect you back soon',botContext);return authContext.logout(botContext);});});},showNoLogoutMsg:function showNoLogoutMsg(message,state,previousMessages,botContext){tell('You can use this bot to logout anytime',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);},deleteDataAndLogout:function deleteDataAndLogout(message,state,previousMessages,botContext){return MenuHandler.removePushNotification(botContext).finally(function(){var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){tell('Goodbye '+user.info.userName+'. Sorry to see you go',botContext);return authContext.deleteDataAndLogout(botContext);}).catch(function(){tell('We seem to be experiencing network difficulties at the moment. Please contact the support team and they will be able to help you',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});});},showNoDeleteDataMsg:function showNoDeleteDataMsg(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.MAIN,botContext);},showMsgForNoActivateBots:function showMsgForNoActivateBots(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.MAIN,botContext);},enableArchiveMsgs:function enableArchiveMsgs(message,state,previousMessages,botContext){botContext.wait(true);var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var dbDoc={};dbDoc[MenuHelper.ARCHIVE_MSGS_SETTING]=true;var params={collection:'People',documents:[{key:{userId:user.userId},document:dbDoc}]};var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.writeData(message,botContext,user,previousMessages,params);}).then(function(){return authContext.updateSetting(MenuHelper.ARCHIVE_MSGS_SETTING,true,botContext);}).then(function(){tell('Done! Multi-device synchronisation has been activated now',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}).catch(function(error){console.error('Error occurred while updating user details: ',error);tell('Unable to activate multi-device synchronisation. Please let the support team now',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},disableArchiveMsgs:function disableArchiveMsgs(message,state,previousMessages,botContext){botContext.wait(true);var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var dbDoc={};dbDoc[MenuHelper.ARCHIVE_MSGS_SETTING]=false;var params={collection:'People',documents:[{key:{userId:user.userId},document:dbDoc}]};var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.writeData(message,botContext,user,previousMessages,params);}).then(function(){return authContext.updateSetting(MenuHelper.ARCHIVE_MSGS_SETTING,false,botContext);}).then(function(){tell('Done! Multi-device synchronisation has been deactivated now',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}).catch(function(error){console.error('Error occurred while updating user details: ',error);tell('Unable to deactivate multi-device synchronisation. Please let the support team now',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);});},showNoArchiveMsg:function showNoArchiveMsg(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.MAIN,botContext);},showNoDisableArchiveMsg:function showNoDisableArchiveMsg(message,state,previousMessages,botContext){return MenuHelper.showMenu(MENU.MAIN,botContext);},showAccountHackForm:function showAccountHackForm(message,state,previousMessages,botContext){var Message=botContext.getCapability('Message');var formMsg=new Message();formMsg.formMessage([{id:1,title:'Enter the details of your account hacking',type:'title'},{id:2,title:'Details',type:'text_area',optional:false},{id:3,title:'Report',type:'button',action:'reportAccountHack'}],'');tell(formMsg,botContext);},showNoHackMsg:function showNoHackMsg(message,state,previousMessages,botContext){tell('Ok, no problem',botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);},uploadProfilePic:function uploadProfilePic(message,state,previousMessages,botContext){tell('Please choose a profile picture from your library',botContext);var authContext=botContext.getCapability('authContext');var _=botContext.getCapability('Utils').Lodash;var user=null;authContext.getAuthUser(botContext).then(function(usr){user=usr;var Media=botContext.getCapability('Media');return Media.pickMediaFromLibrary();}).then(function(media){if(media.cancelled){return null;}else{botContext.wait(true);var Resource=botContext.getCapability('Resource');var ResourceTypes=botContext.getCapability('ResourceTypes');return Resource.uploadFile(media.base64,media.uri,PROFILE_PIC_BUCKET,user.userId,ResourceTypes.Image,user,true);}}).then(function(fileUrl){if(_.isNull(fileUrl)){tell('You have disabled access to media library. Please enable access to upload a profile picture',botContext);}else{tell('Got it. This is your new profile picture',botContext);var Message=botContext.getCapability('Message');var _message=new Message();_message.imageMessage(fileUrl);tell(_message,botContext);}return MenuHelper.showMenu(MENU.MAIN,botContext);});},addDomainAndRoleToUser:function addDomainAndRoleToUser(msg,state,previousMessages,botContext){var _=botContext.getCapability('Utils').Lodash;botContext.wait(true);delete botState.activatePartnerBots;var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var strMsg=msg.getMessage();var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.executeCustomCapability(MenuHandler.ADD_DOMAIN_ROLE_CAPABILITY,{verificationCode:strMsg},true,undefined,botContext,user);}).then(function(data){if(_.isEmpty(_.compact(data))){return null;}else{return authContext.setDomains(data,botContext);}}).then(function(data){if(data===null){tell('I do not recognise this code. Can you check if you entered that right?',botContext);return ERRORS.UNKNOWN_QR_CODE;}else{tell("Installing the featured partner's bots for you",botContext);botContext.wait(true);var RemoteBotInstall=botContext.getCapability('RemoteBotInstall');return RemoteBotInstall.syncronizeBots();}}).then(function(data){botContext.wait(false);if(data!==ERRORS.UNKNOWN_QR_CODE){tell("Done! you should now be able to access the featured partner's bots",botContext);}return LoginHandler.displayConditionalMenu(LoginHandler.LOGIN_STEPS.FINAL_MSG,msg,state,previousMessages,botContext);}).catch(function(error){botContext.wait(false);console.error('Error occurred while updating user details: ',error);if(error==='Older version of the app'){tell('Looks like you have an older version of the app. Can you update your app and try again?',botContext);}else{tell('Error occurred: Unable to activate the enterprise bots. Please reach out to the support team.',botContext);}return MenuHelper.showMenu(MENU.MAIN,botContext);});}};var MENU={PUSH_NOTIFICATION:{options:[{title:'Yes',action:MenuHandler.registerDevice},{title:'No',action:MenuHandler.showNoPushNotificationMsg}]},MAIN:{options:[{title:'Configuration',action:MenuHandler.showConfigMenu},{title:'My Account',action:MenuHandler.showAccountMenu},{title:'Logout',action:MenuHandler.showLogoutMenu}]},ACCOUNT:{options:[{title:'Add/change profile picture',action:MenuHandler.uploadProfilePic},{title:'Update user details',action:MenuHandler.showUserForm},{title:'Change password',action:MenuHandler.showPwdChangeForm},{title:'Activate Enterprise Bots',action:MenuHandler.showActivateBotMsg},{title:'Email my data',action:MenuHandler.emailMyData},{title:'My account has been hacked',action:MenuHandler.showAccountHackMenu}]},LOGOUT:{options:[{title:'Yes',action:MenuHandler.logout},{title:'No',action:MenuHandler.showNoLogoutMsg},{title:'Delete my data',action:MenuHandler.showDeleteDataMenu}]},DELETE_DATA:{options:[{title:'Yes',action:MenuHandler.deleteDataAndLogout},{title:'No',action:MenuHandler.showNoDeleteDataMsg}]},REPORT_ACCOUNT_HACK:{options:[{title:'Yes',action:MenuHandler.showAccountHackForm},{title:'No',action:MenuHandler.showNoHackMsg}]},CONFIG:{menuRenderer:'showConfigMenu',options:[{title:'Activate Push Notifications',action:MenuHandler.registerDevice,activateNotifications:true},{title:'Deactivate Push Notifications',action:MenuHandler.deregisterDevice,activateNotifications:false},{title:'Network control',action:MenuHandler.showNetworkControlMenu},{title:'Network usage',action:MenuHandler.showNetworkUsageMenu},{title:'Activate multi-device synchronisation',action:MenuHandler.showArchiveMessages,archiveMessages:true},{title:'Deactivate multi-device synchronisation',action:MenuHandler.showStopArchiveMessages,archiveMessages:false}]},ACTIVATION_CODE_ENTRY:{options:[{title:'Yes',action:MenuHandler.showActivateBotMsg},{title:'No',action:LoginHandler.noActivationCode}]},ARCHIVE_MSGS:{options:[{title:'Yes',action:MenuHandler.enableArchiveMsgs},{title:'No',action:MenuHandler.showNoArchiveMsg}]},STOP_ARCHIVE_MSGS:{options:[{title:'Yes',action:MenuHandler.disableArchiveMsgs},{title:'No',action:MenuHandler.showNoDisableArchiveMsg}]},NETWORK_CONTROL:{options:[{title:'Manual',action:MenuHandler.changePollingStrategy},{title:'Satellite',action:MenuHandler.changePollingStrategy},{title:'Terrestrial',action:MenuHandler.changePollingStrategy},{title:'Automatic',action:MenuHandler.changePollingStrategy}]}};var botState={};var MenuHelper={ARCHIVE_MSGS_SETTING:'archiveMessages',showMenu:function showMenu(menuToShow,botContext){var menuRenderer=menuToShow.menuRenderer||null;var _=botContext.getCapability('Utils').Lodash;if(menuRenderer===null){botState.menuToShow=menuToShow.options||menuToShow;var Message=botContext.getCapability('Message');var message=new Message();var options=_.map(botState.menuToShow,function(option){var finalOption={title:option.title};if(option.data){finalOption.data=option.data;}return finalOption;});message.sliderMessage(options,{smartReply:true});tell(message,botContext);}else{MenuHelper[menuRenderer](botContext,_);}},showConfigMenu:function showConfigMenu(botContext,_){var authContext=botContext.getCapability('authContext');var notification=botContext.getCapability('Notification');var isArchiveMsgsEnabled=false;authContext.getSetting(MenuHelper.ARCHIVE_MSGS_SETTING,false,botContext).then(function(archiveMessagesSetting){isArchiveMsgsEnabled=archiveMessagesSetting;return notification.deviceInfo();}).then(function(deviceInfo){var isDeviceUnregistered=_.isEmpty(deviceInfo)||!deviceInfo.isRegistered;var options=[];_.forEach(MENU.CONFIG.options,function(option){var optionActivateNotifications=option.activateNotifications;var optionArchiveMessages=option.archiveMessages;if(_.isUndefined(optionActivateNotifications)&&_.isUndefined(optionArchiveMessages)){options.push(option);}else if(!_.isUndefined(optionActivateNotifications)&&(isDeviceUnregistered&&optionActivateNotifications||!isDeviceUnregistered&&!optionActivateNotifications)){options.push(option);}else if(!_.isUndefined(optionArchiveMessages)&&(isArchiveMsgsEnabled&&!optionArchiveMessages||!isArchiveMsgsEnabled&&optionArchiveMessages)){options.push(option);}});MenuHelper.showMenu(options,botContext);});}};var DeviceStorageUtil={BOT_CONTEXT:'MBot',getContext:function getContext(botContext,DeviceStorage){DeviceStorage=DeviceStorage||botContext.getCapability('DeviceStorage');return DeviceStorage.get(DeviceStorageUtil.BOT_CONTEXT);},setInContext:function setInContext(key,value,botContext){var DeviceStorage=botContext.getCapability('DeviceStorage');return DeviceStorageUtil.getContext(botContext,DeviceStorage).then(function(state){state=state||{};state[key]=value;return DeviceStorage.save(DeviceStorageUtil.BOT_CONTEXT,state);});},removeFromContext:function removeFromContext(key,botContext){var DeviceStorage=botContext.getCapability('DeviceStorage');return DeviceStorageUtil.getContext(botContext,DeviceStorage).then(function(state){delete state[key];return DeviceStorage.save(DeviceStorageUtil.BOT_CONTEXT,state);});}};var MessageProcessor={processFormMsg:function processFormMsg(message,state,previousMessages,botContext){var _=botContext.getCapability('Utils').Lodash;var formMsg=message.getMessage();var buttonIndex=_.findIndex(formMsg,function(formElement){return formElement.type==='button';});FormHandler[formMsg[buttonIndex].action](message,state,previousMessages,botContext);},processFormCloseMsg:function processFormCloseMsg(botContext){return MenuHelper.showMenu(MENU.MAIN,botContext);},processBackgroundEvent:function processBackgroundEvent(message,botContext){var _=botContext.getCapability('Utils').Lodash;var bgTaskKey=_.get(message.getMessageOptions(),'key');},processStringMsg:function processStringMsg(message,state,previousMessages,botContext){var _=botContext.getCapability('Utils').Lodash;var strMsg=message.getMessage().toLowerCase();var botStateMenu=botState.menuToShow;var index=_.findIndex(botStateMenu,function(option){return option.title.toLowerCase()===strMsg;});if(index===-1){if(botState.activatePartnerBots){MenuHandler.addDomainAndRoleToUser(message,state,previousMessages,botContext);}else{MessageProcessor.processNlp(message,state,previousMessages,botContext);}}else{var action=botState.menuToShow[index].action;if(action){action(message,state,previousMessages,botContext);}else{return MenuHelper.showMenu(MENU.MAIN,botContext);}}},processNlp:function processNlp(msg,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');var _=botContext.getCapability('Utils').Lodash;var ONBOARDING_NLP_ID='FMBot';botContext.wait(true);authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.nlp(msg,botContext,user,previousMessages,ONBOARDING_NLP_ID);}).then(function(queryResp){var Message=botContext.getCapability('Message');var messages=queryResp.messages||[];var action=queryResp.action;var _GREETING='smalltalk.';var _INPUT='input.';if(_.isEmpty(messages)){var strMsg=queryResp.speech||'Unable to get results for the query';tell(strMsg,botContext);return MenuHelper.showMenu(MENU.MAIN,botContext);}else if(_.includes(action,_INPUT)||_.includes(action,_GREETING)){var respMsg=queryResp.speech;tell(respMsg,botContext);}else if(action==='1_configurationMenu'){return MenuHelper.showMenu(MENU.CONFIG,botContext);}else{var type0Msg=_.find(messages,function(element){return element.type===0;});var type0MsgSpeech=type0Msg.speech;if(type0MsgSpeech){tell(type0MsgSpeech,botContext);}var typ2Or4Msg=_.find(messages,function(element){return element.type===4;});if(_.isEmpty(typ2Or4Msg)){typ2Or4Msg=_.find(messages,function(element){return element.type===2;});}if(typ2Or4Msg){var _messages=_.get(typ2Or4Msg,'payload.messages')||_.get(typ2Or4Msg,'replies')||[];var sliderMsgList=[];_.each(_messages,function(element){sliderMsgList.push({title:element});});var message=new Message();message.sliderMessage(sliderMsgList,{smartReply:true});tell(message,botContext);}else{return MenuHelper.showMenu(MENU.MAIN,botContext);}}});}};var tell=function tell(msg,botContext){botContext.tell(msg);};var showGreeting=function showGreeting(botContext){var _=botContext.getCapability('Utils').Lodash;var INITIAL_MSG_DISP='INITIAL_MSG_DISP';DeviceStorageUtil.getContext(botContext).then(function(context){var displayedInitialMsg=_.get(context,INITIAL_MSG_DISP);if(_.isUndefined(displayedInitialMsg)){DeviceStorageUtil.setInContext(INITIAL_MSG_DISP,true,botContext).then(function(){LoginHandler.postLoginSteps(botContext);});}else{return MenuHelper.showMenu(MENU.MAIN,botContext);}});};var greeting=function greeting(state,previousMessages,botContext){showGreeting(botContext);};var next=function next(message,state,previousMessages,botContext){var MessageTypeConstants=botContext.getCapability('MessageTypeConstants');var msgType=message.getMessageType();switch(msgType){case MessageTypeConstants.MESSAGE_TYPE_STRING:MessageProcessor.processStringMsg(message,state,previousMessages,botContext);break;case MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE:MessageProcessor.processFormMsg(message,state,previousMessages,botContext);break;case MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL:case MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL:MessageProcessor.processFormCloseMsg(botContext);break;case MessageTypeConstants.MESSAGE_TYPE_BACKGROUND_EVENT:MessageProcessor.processBackgroundEvent(message,botContext);break;}};var farewell=function farewell(){};var asyncResult=function asyncResult(result,state,previousMessages,botContext){};return{done:farewell,init:greeting,next:next,asyncResult:asyncResult,version:'1.0.0'};})();
