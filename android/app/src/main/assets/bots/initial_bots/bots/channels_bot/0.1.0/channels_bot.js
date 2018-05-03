(function(){var CHANNELS_CAP='ChannelsCapability';var CREATE_CHANNEL='CreateChannel';var SHOW_OWNED_CHANNELS='GetOwnedChannels';var SHOW_UNSUBED_CHANNELS='FindChannels';var GET_UNSUBED_CHANNELS='GetUnsubbedChannels';var FRONTM_DOMAIN='frontmai';var next=function next(message,state,previousMessages,botContext){if(message.getMessageType()==='slider_response'){var action=message.getMessage()[0].action||'';if(CREATE_CHANNEL===action){return showCreateChannelForm(message,state,previousMessages,botContext);}else if(SHOW_UNSUBED_CHANNELS===action){return showUnsubedChannels(message,state,previousMessages,botContext);}else if(SHOW_OWNED_CHANNELS===action){return showOwnedChannels(message,state,previousMessages,botContext);}else{var channelList=message.getMessage();var ownedChannel=channelList[0].ownedChannel;if(ownedChannel){return showEditChannelForm(channelList[0],state,previousMessages,botContext);}else{return subscribeToChannels(channelList,state,previousMessages,botContext);}}}else if(message.getMessageType()==='form_response'){var formData=message.getMessage();var buttonTitle=formData[3].title||formData[2].title||'';if(buttonTitle==='Create'){return createChannel(message,previousMessages,botContext);}else if(buttonTitle==='Edit'){return editChannel(message,previousMessages,botContext);}}else if(message.getMessageType()==='string'){return processNlp(message,state,previousMessages,botContext);}};var processNlp=function processNlp(msg,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');botContext.wait(true);authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.executeCustomCapability(SHOW_UNSUBED_CHANNELS,{queryString:msg.getMessage(),domains:user.info.domains},true,undefined,botContext,user);}).then(function(channels){showChannelsList(channels,false,botContext);}).catch(function(err){console.log(err);tell('Error occurred getting channels data',botContext);});};var subscribeToChannels=function subscribeToChannels(channelList,state,previousMessages,botContext){botContext.wait(true);var _=botContext.getCapability('Utils').Lodash;var selectedChannels=[];_.forEach(channelList,function(channel){selectedChannels.push({channelName:channel.title,userDomain:channel.userDomain,logo:channel.logo,description:_.get(channel,'data.channel_info[1].value')});});var channelCap=botContext.getCapability('Channel');channelCap.subscribe(selectedChannels).then(function(){tell('Subscribed to selected channels',botContext);}).catch(function(){tell('Error occurred while trying to subscribe to the channels',botContext);});return ask(botContext);};var ask=function ask(botContext){var Message=botContext.getCapability('Message');var message=new Message();message.sliderMessage([{title:'Show me channel suggestions',action:SHOW_UNSUBED_CHANNELS},{title:'Show me the channels I created',action:SHOW_OWNED_CHANNELS},{title:'Create Channel',action:CREATE_CHANNEL}],{smartReply:true});tell(message,botContext);};var createChannel=function createChannel(msg,previousMessages,botContext){var channelName=msg.getMessage()[1].value;var channelDesc=msg.getMessage()[2].value;botContext.wait(true);var channelCap=botContext.getCapability('Channel');channelCap.create(channelName,channelDesc,FRONTM_DOMAIN).then(function(){tell('Channel created',botContext);return ask(botContext);}).catch(function(){tell('Unable to create channel. Is a channel with the same name already created? If so, you can subscribe to it',botContext);return ask(botContext);});};var editChannel=function editChannel(msg,previousMessages,botContext){var desc=msg.getMessage()[1].value;var channel=msg.getMessage()[3].channel;botContext.wait(true);var channelCap=botContext.getCapability('Channel');channelCap.update(channel.channelName,desc,channel.userDomain).then(function(){tell('Channel updated',botContext);return ask(botContext);}).catch(function(){tell('Unable to update channel',botContext);return ask(botContext);});};var showOwnedChannels=function showOwnedChannels(message,state,previousMessages,botContext){var authContext=botContext.getCapability('authContext');botContext.wait(true);authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.executeCustomCapability(CHANNELS_CAP,{action:SHOW_OWNED_CHANNELS,domains:user.info.domains},true,undefined,botContext,user);}).then(function(channels){showChannelsList(channels,true,botContext);}).catch(function(err){console.log(err);tell('Error occurred getting channels data',botContext);});};var showUnsubedChannels=function showUnsubedChannels(message,state,previousMessages,botContext){botContext.wait(true);var authContext=botContext.getCapability('authContext');authContext.getAuthUser(botContext).then(function(user){var agentGuardService=botContext.getCapability('agentGuardService');return agentGuardService.executeCustomCapability(CHANNELS_CAP,{action:GET_UNSUBED_CHANNELS,domains:user.info.domains},true,undefined,botContext,user);}).then(function(channels){showChannelsList(channels,false,botContext);}).catch(function(err){tell('Unable to get the channel list'+err,botContext);});};var showChannelsList=function showChannelsList(channels,isOwnedChannels,botContext){channels=channels||[];var _=botContext.getCapability('Utils').Lodash;if(_.isEmpty(channels)){if(isOwnedChannels){tell('You have not created any channels',botContext);}else{tell('You have subscribed to all the channels',botContext);}return ask(botContext);}else{var sliderData=getChannelsListForDisplay(channels,isOwnedChannels);var Message=botContext.getCapability('Message');var message=new Message();if(isOwnedChannels){message.sliderMessage(sliderData,{smartReply:true});}else{message.sliderMessage(sliderData,{select:true,multiSelect:true});}tell(message,botContext);}};var getChannelsListForDisplay=function getChannelsListForDisplay(channelsJson,isOwnedChannels){channelsJson=channelsJson||[];var sliderFormat=channelsJson.map(function(channel){return{title:channel.channelName,data:{channel_info:[{key:'Name',value:channel.channelName},{key:'Description',value:channel.description}]},userDomain:channel.userDomain,logo:channel.logo,ownedChannel:isOwnedChannels};});return sliderFormat;};var showEditChannelForm=function showEditChannelForm(selectedChannel,state,previousMessages,botContext){var _=botContext.getCapability('Utils').Lodash;var channel={channelName:selectedChannel.title,userDomain:selectedChannel.userDomain,description:_.get(selectedChannel,'data.channel_info[1].value')};var Message=botContext.getCapability('Message');var message=new Message();message.formMessage([{id:1,title:'Please edit the channel '+channel.channelName+' details',type:'text'},{id:2,title:'Description',type:'text_field',optional:false,value:channel.description},{id:3,title:'Edit',type:'button'},{channel:channel}],'');tell(message,botContext);};var showCreateChannelForm=function showCreateChannelForm(msg,state,previousMessages,botContext){var Message=botContext.getCapability('Message');var message=new Message();message.formMessage([{id:1,title:'Please enter the channel\'s details',type:'text'},{id:2,title:'Name',type:'text_field',optional:false,value:''},{id:3,title:'Description',type:'text_field',optional:false,value:''},{id:4,title:'Create',type:'button'}],'');tell(message,botContext);};var greeting=function greeting(state,previousMessages,botContext){return ask(botContext);};var tell=function tell(msg,botContext){botContext.tell(msg);};var state={};var debug=function debug(){return{localState:state};};var farewell=function farewell(msg,state,previousMessages,botContext){};var asyncResult=function asyncResult(result,state,previousMessages,botContext){};return{done:farewell,init:greeting,asyncResult:asyncResult,next:next,debug:debug,version:'1.0.0'};})();
