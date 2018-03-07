(function () {

    const FIND_CONTACTS_CAP = 'FindContacts';
    const CONTACTS_FIND_NLP_ID = 'ContactsBot-FindName';
    const EMAIL_BODY = "<p>Hello there!</p>" +
        "<p>FrontM is a platform for businesses and people to collaborate and take smart decisions – EVEN IN ISOLATED ENVIRONMENTS.</p>" +
        "<p>So if you, or your colleague or your friend, are on a ship, or on an aeroplane, or far away from the nearest cell tower……. " +
        "we have you covered with Powerful Chatbots that even work offline and data optimized multi-platform instant messaging.</p>" +
        "<p>Go ahead and download the <a href=\"http://itunes.com/apps/frontm\">app</a> and log in using Google or Facebook. And off you go :)</p>" +
        "<p><i>Android, Web, desktop, Mac, MS Hololens  – all coming soon</i></p>" +
        "<p>If you have any questions, we would love to hear from you. Email us at info@frontm.com or follow us on twitter @frontmplatform</p>"+
        "<p>Happy staying in touch from anywhere!</p>" +
        "<p><font size=\"1\">Guillermo Acilu</font></p>"+
        "<p><font size=\"1\">Co-founder and CTO</font></p>"+
        "<p><img src=\"https://s3.amazonaws.com/frontm-contentdelivery/botLogos/emailIcon.png\" alt=\"FrontM logo\" width=\"163\" height=\"26\" style=\"margin-right: 0px;\"></p>";
    const PLATFORM_USERS = 'platformUsers';
    const ADDRESS_BOOK_USERS = 'addressBookUsers';


    let next = function (message, state, previousMessages, botContext) {
        if (message.getMessageType() === 'slider_response') {
            let action = message.getMessage()[0].action || '';
            if ('SearchPlatformContacts' === action) {
                return showSearchForm(message, state, previousMessages, botContext);
            } else if ('InviteUser' === action) {
                return showEmailForm(message, state, previousMessages, botContext);
            } else if ('ShowAddressBookUsers' === action) {
                return showAddressBookUsers(message, state, previousMessages, botContext);
            } else if('Help' === action || 'NlpSmartReply' === action) {
                let Message = botContext.getCapability('Message');
                let msg = new Message();
                msg.stringMessage(message.getMessage()[0].title);
                return processNlpString(msg, state, previousMessages, botContext);
            } else {
                let userType = getStateVariable('userType');
                if(userType === PLATFORM_USERS) {
                    return addContacts(message, state, previousMessages, botContext);
                } else if(userType === ADDRESS_BOOK_USERS) {
                    return sendEmail(message, previousMessages, botContext);
                }
            }
        } else if (message.getMessageType() === 'form_response') {
            let buttonTitle = message.getMessage()[2].title;
            if (buttonTitle === 'Invite') {
                return sendEmail(message, previousMessages, botContext);
            } else if (buttonTitle === 'Search') {
                let Message = botContext.getCapability('Message');
                let msg = new Message();
                msg.stringMessage('find ' + message.getMessage()[1].value);
                return processNlp(msg, state, previousMessages, botContext);
            }
        }  else if (message.getMessageType() === 'string') {
            let msgVal = message.getMessage().toLowerCase();
            if (msgVal === 'help') {
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

        botContext.wait(true);
        let user = {};
        authContext.getAuthUser(botContext)
            .then(function(usr) {
                user = usr;
                const agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.executeCustomCapability(FIND_CONTACTS_CAP, {queryString: msg.getMessage()}, true, undefined, botContext, user);
            })
            .then(function(contacts) {
                showContactList(contacts, botContext, PLATFORM_USERS);
            })
            .catch(function (err) {
                console.log(err);
                tell('Error occurred getting contacts data', botContext);
            });
    };

    const processNlpString = function(msg, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;

        botContext.wait(true);
        authContext.getAuthUser(botContext)
            .then(function(user) {
                const agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.nlp(msg, botContext, user, previousMessages, CONTACTS_FIND_NLP_ID);
            })
            .then(function(queryResp) {
                let Message = botContext.getCapability('Message');
                let messages = queryResp.messages || [];
                let action = queryResp.action;

                if(_.isEmpty(messages)) {
                    let strMsg = queryResp.speech || 'Unable to get results for the query';
                    tell(strMsg, botContext);
                } else {
                    let type0Msg = _.find(messages, function (element) {
                        return element.type === 0;
                    });

                    if(type0Msg.speech) {
                        tell(type0Msg.speech, botContext);
                    }

                    if(action === '0_configurationMenu') {
                        return ask(botContext);
                    } else {
                        let typ2Or4Msg = _.find(messages, function (element) {
                            return element.type === 4;
                        });

                        if(_.isEmpty(typ2Or4Msg)) {
                            typ2Or4Msg = _.find(messages, function (element) {
                                return element.type === 2;
                            });
                        }

                        if (typ2Or4Msg) {
                            let messages = _.get(typ2Or4Msg, "payload.messages") || _.get(typ2Or4Msg, "replies") || [];
                            let sliderMsgList = [];
                            _.each(messages, function (element) {
                                sliderMsgList.push({title: element, action: 'NlpSmartReply'});
                            });
                            let message = new Message();
                            message.sliderMessage(sliderMsgList, {smartReply: true});
                            tell(message, botContext);
                        }
                    }

                }
            });
    };

    const ask = function(botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: 'Search user',
            action: 'SearchPlatformContacts'
        }, {
            title: 'Invite users from address book',
            action: 'ShowAddressBookUsers'
        }, {
            title: 'Invite user with email',
            action: 'InviteUser'
        }, {
            title: 'Help',
            action: 'Help'
        }
        ], {smartReply: true});
        tell(message, botContext);

    };

    function sendEmail(msg, previousMessages, botContext) {
        let emailId = null;
        if (msg.getMessageType() === 'slider_response') {
            let addrBookUsers = _reverseFromSliderMessageFormat(msg.getMessage()) || [];
            emailId = addrBookUsers.map((user) => user.emailAddress);
        } else {
            emailId = msg.getMessage()[1].value || '';
        }
        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
            .then(function(user) {
                let userInfo = user.info || {};
                let params = {
                    address: emailId,
                    htmlBody: EMAIL_BODY,
                    title: userInfo.name + " is inviting you to try FrontM!"
                };
                const agentGuardService = botContext.getCapability('agentGuardService');
                agentGuardService.sendEmail(msg, botContext, user, previousMessages, params);
                tell('Email invitation sent to user(s)', botContext);
                return ask(botContext);
            });
    }

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
            title:'Invite',
            type: 'button'
        }], '');
        tell(message, botContext);
    };

    let showSearchForm = function (msg, state, previousMessages, botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.formMessage([{
            id:1,
            title:'Please enter the user\'s name or email',
            type: 'text'
        }, {
            id:2,
            title:'User name or email',
            type: 'text_field',
            value: ''
        },{
            id:3,
            title:'Search',
            type: 'button'
        }], '');
        tell(message, botContext);
    };

    let greeting = function (state, previousMessages, botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        if(_.isEmpty(previousMessages)) {
            let greeting = 'To search for people already using the platform, select the "Find users" option. To invite your friends to start using FrontM, select one of the invite users options';
            tell(greeting, botContext);
        }
        return ask(botContext);
    };


    let showAddressBookUsers = function (message, state, previousMessages, botContext) {
        const Contact = botContext.getCapability('Contact');
        Contact.getAddressBookEmails()
            .then((addressBookContacts) => {
                showContactList(addressBookContacts, botContext, ADDRESS_BOOK_USERS);
            });
    };

    let showContactList = function(contacts, botContext, userType) {
        contacts = contacts || [];
        const _ = botContext.getCapability('Utils').Lodash;
        if (_.isEmpty(contacts)) {
            if(ADDRESS_BOOK_USERS === userType) {
                tell('No contacts exist in the address book', botContext);
            } else {
                tell('No contacts exist which match the criteria', botContext);
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
            state['userType'] = userType;
            tell(message, botContext);
        }
    };

    let addContacts = function (message, state, previousMessages, botContext) {
        const greeting = 'Adding the selected contacts for you';
        tell(greeting, botContext);

        let contactsToAdd = _reverseFromSliderMessageFormat(message.getMessage());
        let uuidList = contactsToAdd.map(user =>  user.uuid );

        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
        .then(function (user) {
            let agentGuardService = botContext.getCapability('agentGuardService');
            const ADD_CONTACT_ACTION = 'AddContact';
            agentGuardService.executeCustomCapability(ADD_CONTACT_ACTION, {users: uuidList}, true, undefined, botContext, user, true)
        })
        .then(() => {
            let Contact = botContext.getCapability('Contact');
            return Contact.addContacts(contactsToAdd);
        })
        .then(() => {
            return ask(botContext);
        });
    };

    const _formatForSliderMessage = function (peopleJson) {
        peopleJson = peopleJson || [];
        const sliderFormat = peopleJson.map((person) => {
            let name = person.name || person.givenName + ' ' + (person.surname || person.familyName);
            return {
                title: name,
                data: {
                    contact_info: [{
                        key: 'Name',
                        value: name
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
                        value: person.surname || person.familyName
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
    };

    let tell = function (msg, botContext) {
        // Should bots delay? - not for now - make this a dynamic capability?
        // setTimeout(() => botContext.tell(msg), 500);
        botContext.tell(msg);
    };


    let state = {
    };

    let getStateVariable = function(varName) {
        return state[varName];
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
