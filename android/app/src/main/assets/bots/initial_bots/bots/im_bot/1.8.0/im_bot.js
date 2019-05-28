(function(){var ACCEPT_CONTACT_ACTION='AcceptContact';var IGNORE_CONTACT_ACTION='IgnoreContact';var SEND_IM_MSG_CAPABILITY='SendIMMessage';var TEN_MINUTES=10*60*1000;var DeviceStorageUtil={IM_BOT_STATE:'IM_BOT',getContext:function getContext(botContext,DeviceStorage){DeviceStorage=DeviceStorage||botContext.getCapability('DeviceStorage');return DeviceStorage.get(DeviceStorageUtil.IM_BOT_STATE);},setInContext:function setInContext(key,value,botContext){var DeviceStorage=botContext.getCapability('DeviceStorage');return DeviceStorageUtil.getContext(botContext,DeviceStorage).then(function(state){state=state||{};state[key]=value;return DeviceStorage.save(DeviceStorageUtil.IM_BOT_STATE,state);});}};var next=function next(message,state,previousMessages,botContext){return decode(message,state,previousMessages,botContext);};var greeting=function greeting(state,previousMessages,botContext){state.status='greeting';};var decode=function decode(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');var _=botContext.getCapability('Utils').Lodash;var agentGuardService=botContext.getCapability('agentGuardService');var curUser=null;return authContext.getAuthUser(botContext).then(function(user){curUser=user;if(message.getMessageType()==='button_response'){var action=message.getMessage().action||'';var contact=message.getMessage().user;var Contact=botContext.getCapability('Contact');Contact.getContactFieldForUUIDs(contact.userId).then(function(contacts){if(_.isEmpty(contacts)){var capParams={users:[contact.userId]};var _agentGuardService=botContext.getCapability('agentGuardService');if(ACCEPT_CONTACT_ACTION===action){_agentGuardService.executeCustomCapability(ACCEPT_CONTACT_ACTION,capParams,true,undefined,botContext,user,false).then(function(){return Contact.addContacts(contact);}).then(function(){var Message=botContext.getCapability('Message');var message=new Message();message.standardNotification('Contact '+contact.userName+' added');tell(message,botContext);});}else if(IGNORE_CONTACT_ACTION===action){_agentGuardService.executeCustomCapability(IGNORE_CONTACT_ACTION,capParams,true,undefined,botContext,user,false).then(function(){return Contact.ignoreContact(contact);}).then(function(){var Message=botContext.getCapability('Message');var message=new Message();message.criticalNotification('Contact '+contact.userName+' ignored');tell(message,botContext);});}}else{var contactStatus=contacts[0].ignored?'ignored':'added';tell('Contact '+contact.userName+' already '+contactStatus,botContext);}});return'Contact proccessed';}else{return sendImMessage(message,botContext,user,previousMessages);}}).catch(function(err){if(agentGuardService.AG_ERRORS.QUEUED_REQUEST===err){showOfflineMessage(curUser,botContext);}else{tell('I am having trouble sending your messages. Please report this issue to the support team',botContext);}});};var showOfflineMessage=function showOfflineMessage(user,botContext){var _=botContext.getCapability('Utils').Lodash;var conversationContext=botContext.getCapability('ConversationContext');var conversationId=null;conversationContext.getConversationContext(botContext,user).then(function(conversation){conversationId=conversation.conversationId;return DeviceStorageUtil.getContext(botContext);}).then(function(deviceStorage){var curConversationData=_.get(deviceStorage,conversationId)||{};var lastOfflineMsgShownTime=_.get(curConversationData,'lastOfflineMsgShownTime');var latestTime=_.now();if(_.isUndefined(lastOfflineMsgShownTime)||_.toNumber(latestTime)-_.toNumber(lastOfflineMsgShownTime)>TEN_MINUTES){var Message=botContext.getCapability('Message');var queuedMsg=new Message();queuedMsg.criticalNotification("You appear to be offline. Keep going, I'll send the messages once the connection is back");tell(queuedMsg,botContext);curConversationData.lastOfflineMsgShownTime=latestTime;DeviceStorageUtil.setInContext(conversationId,curConversationData,botContext);}});};var sendImMessage=function sendImMessage(msg,botContext,user,previousMessages){var conversationContext=botContext.getCapability('ConversationContext');var _=botContext.getCapability('Utils').Lodash;return conversationContext.getConversationContext(botContext,user).then(function(conversation){var isNewConversation=_.isUndefined(conversation.created);var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.sendIMMessage(msg,isNewConversation,botContext,user,previousMessages);}).then(function(_ref){var newConvId=_ref.newConvId,status=_ref.status;console.log('Response received from Server --->',newConvId,status);if(!_.isEmpty(newConvId)){botContext.updateConversationContextId(newConvId);}return status;});};var tell=function tell(msg,botContext){botContext.tell(msg);};var state={};var debug=function debug(){return{localState:state};};var farewell=function farewell(msg,state,previousMessages,botContext){};var asyncResult=function asyncResult(result,state,previousMessages,botContext){var MessageTypeConstantsToInt=botContext.getCapability('MessageTypeConstantsToInt');var MessageTypeConstants=botContext.getCapability('MessageTypeConstants');var utils=botContext.getCapability('Utils');var _=utils.Lodash;var content=_.get(result,'details[0].message');var contentType=_.get(result,'contentType');var createdOn=_.get(result,'createdOn');var createdBy=_.get(result,'createdBy');var messageId=_.get(result,'messageId');var Message=botContext.getCapability('Message');var asyncMessage=new Message({messageDate:createdOn,createdBy:createdBy,uuid:messageId});if(content){if(contentType==30){asyncMessage.imageMessage(content);}else if(contentType==40){asyncMessage.videoMessage(content);}else if(contentType==60){asyncMessage.audioMessage(content);}else if(contentType==140){asyncMessage.htmlMessage(content);}else if(contentType==270){var msgInfo=_.get(result,'details[0].info')||null;msgInfo=JSON.parse(msgInfo);switch(msgInfo.messageType){case'MISSED_CALL':var callTimestamp=_.get(msgInfo,'callTimestamp');var date=callTimestamp?new Date(callTimestamp):new Date();asyncMessage.standardNotification('Missed voice call at '+date.getHours()+':'+date.getMinutes());break;default:asyncMessage.standardNotification(content);break;}}else if(contentType==290){var options=_.get(result,'details[0].options')||{};options=JSON.parse(options);asyncMessage.locationMessage(content,options);}else if(MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_CONTACT_CARD]==contentType){asyncMessage.contactCard(content);}else if(MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_OTHER_FILE]==contentType){var _options=_.get(result,'details[0].options')||{};_options=JSON.parse(_options);asyncMessage.otherFileMessage(content,_options);}else if(contentType==1000){var _contact=content;_contact.waitingForConfirmation=false;var Contact=botContext.getCapability('Contact');return Contact.confirmContact(_contact).then(function(){asyncMessage.standardNotification('You will be able to see '+_contact.userName+"'s details now");tell(asyncMessage,botContext);});}else{asyncMessage.stringMessage(content);}tell(asyncMessage,botContext);}var authContext=botContext.getCapability('authContext');var NO_MORE_PROCESSING='NO_MORE_PROCESSING';var loggedInUser={};var conversationId=null;var contact=null;authContext.getAuthUser(botContext).then(function(user){loggedInUser=user;var conversationContext=botContext.getCapability('ConversationContext');return conversationContext.getConversationContext(botContext,user);}).then(function(conversation){conversationId=conversation.conversationId;var channelsInfo=conversation.onChannels;if(_.isEmpty(channelsInfo)){var _Contact=botContext.getCapability('Contact');return _Contact.getContactFieldForUUIDs([result.createdBy]);}else{return NO_MORE_PROCESSING;}}).then(function(contacts){if(NO_MORE_PROCESSING===contacts){return NO_MORE_PROCESSING;}else{return getUserInfo(botContext,loggedInUser,previousMessages,result.createdBy);}}).then(function(users){if(NO_MORE_PROCESSING===users){return NO_MORE_PROCESSING;}else{if(!_.isEmpty(users)&&users.length>0&&!_.isEmpty(users[0].items)){contact=users[0].items[0];if(!contact.visible){delete contact.phoneNumbers;delete contact.emailAddress;}return DeviceStorageUtil.getContext(botContext);}else{return NO_MORE_PROCESSING;}}}).then(function(deviceStorage){if(NO_MORE_PROCESSING===deviceStorage){return null;}else{var curConversationData=_.get(deviceStorage,conversationId)||{};var acceptIgnoreMsgShown=_.get(curConversationData,'acceptIgnoreMsgShown')||false;if(acceptIgnoreMsgShown){return null;}else{displayAcceptIgnoreMessage(Message,content,asyncMessage,contact,botContext);curConversationData.acceptIgnoreMsgShown=true;return DeviceStorageUtil.setInContext(conversationId,curConversationData,botContext);}}});};var displayAcceptIgnoreMessage=function displayAcceptIgnoreMessage(Message,content,asyncMessage,contact,botContext){var acceptIgnoreButtonMsg=null;if(content){acceptIgnoreButtonMsg=new Message();}else{acceptIgnoreButtonMsg=asyncMessage;}acceptIgnoreButtonMsg.buttonMessage({title:contact.userName,body:'would like to connect with you. Add user to contacts?',buttons:[{title:'Accept',action:ACCEPT_CONTACT_ACTION,user:contact,style:1},{title:'Ignore',action:IGNORE_CONTACT_ACTION,user:contact,style:0}]},{smartReply:true});tell(acceptIgnoreButtonMsg,botContext);};var getUserInfo=function getUserInfo(botContext,user,previousMessages,userId){var agentGuardService=botContext.getCapability('agentGuardService');var params={collection:'People',query:[{operand:'userId',value:userId}],fields:['emailAddress','userName','userId','visible','phoneNumbers']};return agentGuardService.readData(null,botContext,user,previousMessages,params);};return{done:farewell,init:greeting,asyncResult:asyncResult,next:next,debug:debug,version:'1.0.0'};})();