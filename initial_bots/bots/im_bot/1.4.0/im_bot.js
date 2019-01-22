(function(){var ACCEPT_CONTACT_ACTION='AcceptContact';var IGNORE_CONTACT_ACTION='IgnoreContact';var SEND_IM_MSG_CAPABILITY='SendIMMessage';var next=function next(message,state,previousMessages,botContext){return decode(message,state,previousMessages,botContext);};var greeting=function greeting(state,previousMessages,botContext){state.status='greeting';};var decode=function decode(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');var _=botContext.getCapability('Utils').Lodash;return authContext.getAuthUser(botContext).then(function(user){if(message.getMessageType()==='button_response'){var action=message.getMessage().action||'';var contact=message.getMessage().user;var Contact=botContext.getCapability('Contact');Contact.getContactFieldForUUIDs(contact.userId).then(function(contacts){if(_.isEmpty(contacts)){var capParams={users:[contact.userId]};var agentGuardService=botContext.getCapability('agentGuardService');if(ACCEPT_CONTACT_ACTION===action){agentGuardService.executeCustomCapability(ACCEPT_CONTACT_ACTION,capParams,true,undefined,botContext,user,false).then(function(){return Contact.addContacts(contact);}).then(function(){var Message=botContext.getCapability('Message');var message=new Message();message.standardNotification('Contact '+contact.userName+' added');tell(message,botContext);});}else if(IGNORE_CONTACT_ACTION===action){agentGuardService.executeCustomCapability(IGNORE_CONTACT_ACTION,capParams,true,undefined,botContext,user,false).then(function(){return Contact.ignoreContact(contact);}).then(function(){var Message=botContext.getCapability('Message');var message=new Message();message.criticalNotification('Contact '+contact.userName+' ignored');tell(message,botContext);});}}else{var contactStatus=contacts[0].ignored?'ignored':'added';tell('Contact '+contact.userName+' already '+contactStatus,botContext);}});return'Contact proccessed';}else{return sendImMessage(message,botContext,user,previousMessages);}}).catch(function(err){tell('Error occurred making the call to agent guard'+err,botContext);});};var sendImMessage=function sendImMessage(msg,botContext,user,previousMessages){var conversationContext=botContext.getCapability('ConversationContext');var _=botContext.getCapability('Utils').Lodash;return conversationContext.getConversationContext(botContext,user).then(function(conversation){var isNewConversation=_.isUndefined(conversation.created);var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.sendIMMessage(msg,isNewConversation,botContext,user,previousMessages);}).then(function(_ref){var newConvId=_ref.newConvId,status=_ref.status;console.log('Response received from Server --->',newConvId,status);if(!_.isEmpty(newConvId)){botContext.updateConversationContextId(newConvId);}return status;});};var tell=function tell(msg,botContext){botContext.tell(msg);};var state={};var debug=function debug(){return{localState:state};};var farewell=function farewell(msg,state,previousMessages,botContext){};var asyncResult=function asyncResult(result,state,previousMessages,botContext){var utils=botContext.getCapability('Utils');var _=utils.Lodash;var content=_.get(result,'details[0].message');var contentType=_.get(result,'contentType');var createdOn=_.get(result,'createdOn');var createdBy=_.get(result,'createdBy');var messageId=_.get(result,'messageId');var Message=botContext.getCapability('Message');var message=new Message({messageDate:createdOn,createdBy:createdBy,uuid:messageId});if(content){if(contentType==30){message.imageMessage(content);}else if(contentType==40){message.videoMessage(content);}else if(contentType==60){message.audioMessage(content);}else if(contentType==140){message.htmlMessage(content);}else if(contentType==270){var msgInfo=_.get(result,'details[0].info')||{};switch(msgInfo.messageType){case'MISSED_CALL':var callTimestamp=_.get(msgInfo,'callTimestamp');var date=callTimestamp?new Date(callTimestamp):new Date();message.standardNotification('Missed voice call at '+date.getHours()+':'+date.getMinutes());break;default:message.standardNotification(content);break;}}else if(contentType==290){message.locationMessage(content);}else if(contentType==1000){var contact=content;contact.waitingForConfirmation=false;var Contact=botContext.getCapability('Contact');return Contact.confirmContact(contact).then(function(){message.standardNotification(contact.userName+'\'s details are now visible to you');tell(message,botContext);});}else{message.stringMessage(content);}tell(message,botContext);}var authContext=botContext.getCapability('authContext');var loggedInUser={};authContext.getAuthUser(botContext).then(function(user){loggedInUser=user;var conversationContext=botContext.getCapability('ConversationContext');return conversationContext.getConversationContext(botContext,user);}).then(function(conversation){var channelsInfo=conversation.onChannels;if(_.isEmpty(channelsInfo)){var _Contact=botContext.getCapability('Contact');return _Contact.getContactFieldForUUIDs([result.createdBy]);}else{return' ';}}).then(function(contacts){if(_.isEmpty(contacts)){return getUserInfo(botContext,loggedInUser,previousMessages,result.createdBy);}else{return null;}}).then(function(users){if(!_.isEmpty(users)&&users.length>0&&!_.isEmpty(users[0].items)&&_.isUndefined(state['AddIgnoreMsgShown'])){var _contact=users[0].items[0];if(!_contact.visible){delete _contact.phoneNumbers;delete _contact.emailAddress;}var msg=new Message();msg.buttonMessage({title:_contact.userName,body:'would like to connect with you. Add user to contacts?',buttons:[{title:'Accept',action:ACCEPT_CONTACT_ACTION,user:_contact,style:1},{title:'Ignore',action:IGNORE_CONTACT_ACTION,user:_contact,style:0}]},{smartReply:true});tell(msg,botContext);state['AddIgnoreMsgShown']=true;}});};var getUserInfo=function getUserInfo(botContext,user,previousMessages,userId){var agentGuardService=botContext.getCapability('agentGuardService');var params={collection:'People',query:[{operand:'userId',value:userId}],fields:['emailAddress','userName','userId','visible','phoneNumbers']};return agentGuardService.readData(null,botContext,user,previousMessages,params);};return{done:farewell,init:greeting,asyncResult:asyncResult,next:next,debug:debug,version:'1.0.0'};})();