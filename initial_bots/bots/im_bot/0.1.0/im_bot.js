(function () {

    const ADD_CONTACT_ACTION = 'AddContact';
    const IGNORE_CONTACT_ACTION = 'IgnoreContact';
    const SEND_IM_MSG_CAPABILITY = 'SendIMMessage';

    let next = function (message, state, previousMessages, botContext) {
        return decode(message, state, previousMessages, botContext);
    };

    let greeting = function (state, previousMessages, botContext) {
        // DO NOT SHOW ANY MESSAGE - SIMILAR TO WHATSAPP CONVERSATIONS
        state.status = 'greeting';
    };

    let decode = function (message, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;
        authContext.getAuthUser(botContext)
            .then(function (user) {
                if (message.getMessageType() === 'button_response') {
                    let action = message.getMessage().action || '';
                    let contact = message.getMessage().user;
                    const Contact = botContext.getCapability('Contact');

                    Contact.getContactFieldForUUIDs(contact.uuid)
                        .then((contacts) => {
                            if (_.isEmpty(contacts)) {
                                let capParams = {
                                    users: [contact.uuid]
                                };

                                let agentGuardService = botContext.getCapability('agentGuardService');
                                if (ADD_CONTACT_ACTION === action) {
                                    agentGuardService.executeCustomCapability(ADD_CONTACT_ACTION, capParams, true, undefined, botContext, user, true)
                                        .then(() => {
                                            return Contact.addContacts(contact);
                                        })
                                        .then(() => {
                                            tell('Contact ' + contact.name + ' added', botContext);
                                        });
                                } else if (IGNORE_CONTACT_ACTION === action) {
                                    agentGuardService.executeCustomCapability(IGNORE_CONTACT_ACTION, capParams, true, undefined, botContext, user, true)
                                        .then(() => {
                                            return Contact.ignoreContact(contact);
                                        })
                                        .then(() => {
                                            tell('Contact ' + contact.name + ' ignored', botContext);
                                        });
                                }
                            } else {
                                let contactStatus = contacts[0].ignored ? 'ignored' : 'added';
                                tell('Contact ' + contact.name + ' already '+ contactStatus, botContext)
                            }
                        });

                    return 'Contact proccessed';
                } else {
                    return sendImMessage(message, botContext, user);
                }
            })
            .catch(function (err) {
                tell('Error occurred making the call to agent guard' + err, botContext);
            });
    };

    let sendImMessage = function(msg, botContext, user) {
        let agentGuardService = botContext.getCapability('agentGuardService');
        let _ = botContext.getCapability('Utils').Lodash;

        let params = {
            messages: [{
                messageUuid: msg.getMessageId(),
                contentType: agentGuardService.getMessageContentType(msg, botContext),
                createdOn: msg.getMessageDate().valueOf(),
                createdBy: msg.getCreatedBy(),
                content: [msg.getMessage()]
            }]
        };

        let conversationContext = botContext.getCapability('ConversationContext');
        conversationContext.getConversationContext(botContext, user)
            .then(function(conversation) {
                let channelsInfo = conversation.onChannels;
                if(_.isEmpty(channelsInfo)) {
                    params.action = 'SendAndArchive';
                } else {
                    params.action = 'SendToChannelAndArchive';
                    params.domain = channelsInfo[0].domain;
                    params.channel = channelsInfo[0].name;
                }

                agentGuardService.executeCustomCapability(SEND_IM_MSG_CAPABILITY, params, true, undefined, botContext, user, true)
                    .then((response) => {
                        if(!_.isEmpty(response)) {
                            let convIdToUpdate = _.get(response, '[0].conversationId');
                            botContext.updateConversationContextId(convIdToUpdate);
                        }
                    });
            });

    };

    let tell = function (msg, botContext) {
        // Should bots delay? - not for now - make this a dynamic capability?
        // setTimeout(() => botContext.tell(msg), 500);
        botContext.tell(msg);
    };


    let state = {
    };

    // We can use this to dump the state of the bot at any time.
    let debug = function () {
        return {
            localState: state
        }
    };

    let farewell = function (msg, state, previousMessages, botContext) {
    };

    let asyncResult = function (result, state, previousMessages, botContext) {
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;
        const content = _.get(result, 'details[0].message');
        const contentType = _.get(result, 'contentType');
        const createdOn = _.get(result, 'createdOn');
        const createdBy = _.get(result, 'createdBy');
        let Message = botContext.getCapability('Message');
        let message = new Message({messageDate: createdOn, createdBy: createdBy});

        if (content) {
            if (contentType == 30) {
                message.imageMessage(content);
            } else if (contentType == 40) {
                message.videoMessage(content);
            } else if (contentType == 60) {
                message.audioMessage(content);
            } else if (contentType == 140) {
                // TODO: need to pass options to this
                message.htmlMessage(content);
            } else {
                // String
                message.stringMessage(content);
            }
            tell(message, botContext);
        }

        const authContext = botContext.getCapability('authContext');
        let loggedInUser = {};
        authContext.getAuthUser(botContext)
            .then(function (user) {
                loggedInUser = user;
                let conversationContext = botContext.getCapability('ConversationContext');
                return conversationContext.getConversationContext(botContext, user)
            })
            .then(function(conversation) {
                let channelsInfo = conversation.onChannels;
                if (_.isEmpty(channelsInfo)) {
                    const Contact = botContext.getCapability('Contact');
                    return Contact.getContactFieldForUUIDs([result.createdBy]);
                } else {
                    return ' ';
                }
            })
            .then((contacts) => {
                if (_.isEmpty(contacts)) {
                    return getUserInfo(botContext, loggedInUser, previousMessages, result.createdBy);
                } else {
                    return null;
                }
            })
            .then((users) => {
                if(!_.isEmpty(users) && _.isUndefined(state['AddIgnoreMsgShown'])) {
                    let contact = users[0];
                    tell('User ' + contact.name +' would like to connect with you. Add user to contacts?', botContext);
                    let msg = new Message();
                    msg.buttonMessage([{
                        title: 'Accept',
                        action: ADD_CONTACT_ACTION,
                        user: contact,
                        style: 1,
                    }, {
                        title: 'Ignore',
                        action: IGNORE_CONTACT_ACTION,
                        user: contact,
                        style: 0,
                    }], {smartReply: true});
                    tell(msg, botContext);
                    state['AddIgnoreMsgShown'] = true;
                }
            });
    };

    let getUserInfo = function(botContext, user, previousMessages, uuid) {
        const agentGuardService = botContext.getCapability('agentGuardService');
        let params = {
            collection: "People",
            queryObject: "{uuid:'" + uuid + "'}",
            fields: ['emailAddress','givenName', 'screenName', 'surname', 'name', 'uuid']
        };
        return agentGuardService.readData(null, botContext, user, previousMessages, params);
    };

    return {
        done: farewell,
        init: greeting,
        asyncResult: asyncResult,
        next: next,
        debug: debug,
        version: '1.0.0'
    };
})();
