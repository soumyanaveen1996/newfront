(function () {

    const FIND_CONTACTS_CAP = 'FindContacts';
    const EMAIL_BODY = "Hi there,\n\n" +
        "FrontM is a Messaging platform optimised for use in remote and poorly connected places.\n" +
        "Are you on a ship? An airplane? Or far away from the nearest cell tower? We have you covered.\n" +
        "With FrontM you have the power of chatbots and instant messaging at your fingertips, even when you are offline.\n" +
        "To download the iOS client of the app, follow the link below:\n" +
        "\n" +
        "\n" +
        "Enjoy it!!\n" +
        "The FrontM Team\n";


    let next = function (message, state, previousMessages, botContext) {
        if (message.getMessageType() === 'slider_response') {
            let action = message.getMessage()[0].action || '';
            if ('GetPlatformContacts' === action) {
                return getPlatformContacts(message, state, previousMessages, botContext);
            } else if ('InviteUser' === action) {
                return showEmailForm(message, state, previousMessages, botContext);
            } else {
                return addContacts(message, state, previousMessages, botContext);
            }
        } else if (message.getMessageType() === 'form_response') {
            return sendEmail(message, state, previousMessages, botContext);
        }  else if (message.getMessageType() === 'string') {
            let msgVal = message.getMessage().toLowerCase();
            if (msgVal === 'options') {
                return ask(botContext);
            } else {
                return processNlp(message, state, previousMessages, botContext);
            }
        } else {
            return ask(botContext);
        }
    };

    const processNlp = function(msg, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;

        botContext.wait(true);
        let user = {};
        authContext.getAuthUser(botContext)
            .then(function(usr) {
                user = usr;
                const agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.executeCustomCapability(FIND_CONTACTS_CAP, {queryString: msg.getMessage()}, true, undefined, botContext, user);
            })
            .then(function(contacts) {
                showContactList(contacts, botContext, true);
            })
            .catch(function (err) {
                console.log(err);
                tell('Error occurred getting contacts data', botContext);
            });
    };

    let writeUserFeedback = function(msg, botContext, user, previousMessages, nlpIntent) {
        let doc = {
            bot: botContext.botManifest.id,
            question: msg.getMessage(),
            lastError: nlpIntent,
            user: user.userUUID
        };

        const agentGuardService = botContext.getCapability('agentGuardService');
        let params = {
            collection: "UserFeedback",
            documents: [{document: doc}]
        };

        return agentGuardService.writeData(msg, botContext, user, previousMessages, params);
    };

    let getContacts = function(msg, botContext, user, previousMessages, queryString, queryObject) {
        const agentGuardService = botContext.getCapability('agentGuardService');
        const _ = botContext.getCapability('Utils').Lodash;
        let params = {
            collection: "People"
        };

        if(_.isEmpty(queryString)) {
            params["queryObject"] = queryObject;
        } else {
            params["queryString"] = queryString;
        }
        return agentGuardService.readData(msg, botContext, user, previousMessages, params);
    };

    const ask = function(botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: 'Show me FrontM users I might know',
            action: 'GetPlatformContacts'
        }, {
            title: 'Invite user with email',
            action: 'InviteUser'
        }
        ], {smartReply: true});
        tell(message, botContext);

    };

    function sendEmail(msg, state, previousMessages, botContext) {
        let emailId = msg.getMessage()[1].value || '';
        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
            .then(function(user) {
                let userInfo = user.info || {};
                let params = {
                    address: emailId,
                    body: EMAIL_BODY,
                    title: userInfo.name + " is inviting you to try FrontM!"
                };
                const agentGuardService = botContext.getCapability('agentGuardService');
                agentGuardService.sendEmail(msg, botContext, user, previousMessages, params);
                tell('Email invitation sent to user', botContext);
                return ask(botContext);
            });
    };

    let showEmailForm = function (msg, state, previousMessages, botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.formMessage([{
            id:1,
            title:'Please enter the user\'s email',
            type: 'text'
        }, {
            id:2,
            title:'Email',
            type: 'text_field',
            value: ''
        },{
            id:3,
            title:'Submit',
            type: 'button'
        }], '');
        tell(message, botContext);
    };

    let greeting = function (state, previousMessages, botContext) {
        return ask(botContext);
    };

    let getPlatformContacts = function (message, state, previousMessages, botContext) {
        botContext.wait(true);
        let page = state.contactsPage || 1;

        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
            .then(function (user) {
                let queryStr = '{uuid: {$not: {$eq: \'' + user.userUUID + '\'}}}';
                let pageQuery = "&page=" + page;
                let pgSizeQuery = "&pagesize=10";
                let queryObj = queryStr + pageQuery + pgSizeQuery;

                return getContacts(message, botContext, user, previousMessages, null, queryObj);
            })
            .then((contacts) => {
                const _ = botContext.getCapability('Utils').Lodash;
                if (_.isEmpty(contacts)) {
                    state['contactsPage'] = 1;
                } else {
                    state['contactsPage'] = page + 1;
                }
                showContactList(contacts, botContext);
            })
            .catch(function (err) {
                tell('Error occurred making the call to readPeople on agent guard' + err, botContext);
            });
    };

    let showContactList = function(contacts, botContext, isNlp) {
        contacts = contacts || [];
        const _ = botContext.getCapability('Utils').Lodash;
        if (_.isEmpty(contacts)) {
            if(isNlp) {
                tell('No contacts exist which match the criteria', botContext);
            } else {
                tell('No more contacts exist. Will display the contacts from the beginning from next time', botContext);
            }
            return ask(botContext);
        } else {
            const sliderData = _formatForSliderMessage(contacts);
            let Message = botContext.getCapability('Message');
            let message = new Message();
            message.sliderMessage(sliderData, {
                select: true,
                multiSelect: true
            });
            tell(message, botContext);
        }
    };

    let addContacts = function (message, state, previousMessages, botContext) {
        const greeting = 'Adding the selected contacts for you';
        tell(greeting, botContext);

        const Contact = botContext.getCapability('Contact');
        Contact.addContacts(_reverseFromSliderMessageFormat(message.getMessage()))
            .then(() => {
                return ask(botContext);
            });
    };

    // TODO: reuse from peopleData ? do we need a utils lib for bots??
    const _formatForSliderMessage = function (peopleJson) {
        peopleJson = peopleJson || [];
        const sliderFormat = peopleJson.map((person) => {
            return {
                title: person.name,
                data: {
                    contact_info: [{
                        key: 'Name',
                        value: person.name
                    }, {
                        key: 'Email',
                        value: person.emailAddress
                    }, {
                        key: 'Screen Name',
                        value: person.screenName
                    }, {
                        key: 'uuid',
                        value: person.uuid
                    }, {
                        key: 'Given Name',
                        value: person.givenName
                    }, {
                        key: 'Sur Name',
                        value: person.surname
                    }]
                }
            }
        });
        return sliderFormat;
    };

    // {
    //     "emailAddress": "akshay@frontm.com",
    //     "givenName": "Akshay",
    //     "screenName": "akshr",
    //     "surname": "Sharma",
    //     "name": "Akshay Sharma",
    //     "uuid": "11A2A680-7E76-4154-A811-2A6BAB2A3BF9",
    // }
    const _reverseFromSliderMessageFormat = function (contacts) {
        contacts = contacts || [];
        const contactFormat = contacts.map((contact) => {
            return {
                name: contact.data.contact_info[0].value,
                emailAddress: contact.data.contact_info[1].value,
                screenName: contact.data.contact_info[2].value,
                uuid: contact.data.contact_info[3].value,
                givenName: contact.data.contact_info[4].value,
                surname: contact.data.contact_info[5].value
            };
        });
        return contactFormat;
    }

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
        // Do something with this result
        tell('Got the response from async call', botContext);
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
