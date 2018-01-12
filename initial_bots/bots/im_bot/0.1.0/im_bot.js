(function () {

    const ADD_CONTACT_ACTION = 'AddContact';
    const IGNORE_CONTACT_ACTION = 'IgnoreContact';

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
                                if (ADD_CONTACT_ACTION === action) {
                                    Contact.addContacts(contact)
                                        .then(() => {
                                        tell('Contact ' + contact.name + ' added', botContext);
                                    });
                                } else if (IGNORE_CONTACT_ACTION === action) {
                                    Contact.ignoreContact(contact)
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
                    const agentGuardService = botContext.getCapability('agentGuardService');
                    return agentGuardService.send(message, botContext, user, botContext.botManifest.id, previousMessages);
                }
            })
            .catch(function (err) {
                tell('Error occurred making the call to agent guard' + err, botContext);
            });
    };

    let tell = function (msg, botContext) {
        // Should bots delay? - not for now - make this a dynamic capability?
        // setTimeout(() => botContext.tell(msg), 500);
        botContext.tell(msg);
    }


    let state = {
    };

    // We can use this to dump the state of the bot at any time.
    let debug = function () {
        return {
            localState: state
        }
    }

    let farewell = function (msg, state, previousMessages, botContext) {
    };

    let asyncResult = function (result, state, previousMessages, botContext) {
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;
        const content = _.get(result, 'details[0].message');
        const contentType = _.get(result, 'contentType');
        let Message = botContext.getCapability('Message');
        let message = new Message();

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

        const Contact = botContext.getCapability('Contact');
        const authContext = botContext.getCapability('authContext');
        let loggedInUser = {};

        authContext.getAuthUser(botContext)
            .then(function (user) {
                loggedInUser = user;
                return Contact.getContactFieldForUUIDs([result.createdBy]);
            })
            .then((contacts) => {
                if (_.isEmpty(contacts)) {
                    return getUserInfo(botContext, loggedInUser, previousMessages, result.createdBy);
                } else {
                    return null;
                }
            })
            .then((users) => {
                if(!_.isEmpty(users)) {
                    let contact = users[0];
                    tell('User ' + contact.name +' would like to connect with you. Add user to contacts?', botContext);
                    let msg = new Message();
                    msg.buttonMessage([{
                        title: 'Accept',
                        action: ADD_CONTACT_ACTION,
                        user: contact
                    }, {
                        title: 'Ignore',
                        action: IGNORE_CONTACT_ACTION,
                        user: contact
                    }], {smartReply: true});
                    tell(msg, botContext);
                }
            });
    };

    let getUserInfo = function(botContext, user, previousMessages, uuid) {
        const agentGuardService = botContext.getCapability('agentGuardService');
        let params = {
            collection: "People",
            queryObject: "{uuid:'" + uuid + "'}"
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