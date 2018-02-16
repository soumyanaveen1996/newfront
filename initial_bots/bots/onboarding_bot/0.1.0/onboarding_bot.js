(function () {
    const OnboardingStates = {
        userLoggedIn: 'userLoggedIn',
        userNotLoggedIn: 'userNotLoggedIn'
    };

    const CONFIRM_LOGOUT = 'confirmLogout';
    const LOGOUT = 'logout';
    const NO_LOGOUT = 'noLogout';
    const PROFILE_PIC = 'profilePic';
    const UPDATE_INFO = 'updateInfo';
    const REGISTER_DEVICE = 'registerDevice';
    const DEREGISTER_DEVICE = 'deregisterDevice';
    const ONBOARDING_NLP_ID = 'FMBot';
    const PROFILE_PIC_BUCKET = 'profile-pics';

    let botState = OnboardingStates.userNotLoggedIn;
    const AUTH_ENTERED_KEY = 'authCodeEntered';

    const greeting = function (state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        authContext.isUserLoggedIn(botContext)
            .then((userLoggedIn) => {
                if (userLoggedIn) {
                    //tell('You are already logged in.', botContext);
                    botState = OnboardingStates.userLoggedIn;
                    return logoutAsk(botContext);
                } else {
                    let DeviceStorage = botContext.getCapability('DeviceStorage');
                    DeviceStorage.get(AUTH_ENTERED_KEY)
                        .then((obj) => {
                        if(obj === null) {
                            tell('Welcome Stranger', botContext);
                            tell('Please enter an authentication code, if you don\'t have one, please contact support@frontm.com', botContext);
                        } else {
                            botState = OnboardingStates.userNotLoggedIn;
                            return loginAsk(botContext);
                        }
                    });
                }
            });
    };

    const initialLogin = function(botContext) {
        botState = OnboardingStates.userNotLoggedIn;
        tell('Welcome to the FrontM Platform!', botContext);
        tell('Let me sign you in to get started', botContext);
        let DeviceStorage = botContext.getCapability('DeviceStorage');
        DeviceStorage.save(AUTH_ENTERED_KEY, {authCodeEntered: true});
    };

    const loginAsk = function (botContext) {
        let Message = botContext.getCapability('Message');
        const authContext = botContext.getCapability('authContext');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        const providers = authContext.getAuthProviders(botContext);
        const providerMessages = _.map(providers, (provider) => {
            return {
                title: 'Login with ' + provider,
                id: provider,
            }
        });

        let message = new Message();
        message.sliderMessage(providerMessages, {smartReply: true});
        tell(message, botContext);
    }

    const logoutAsk = function (botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        let Message = botContext.getCapability('Message');
        let message = new Message();
        let options = [
            {
                 title: 'Add/change profile picture',
                 id: PROFILE_PIC
            },
            {
                title: 'Update personal info',
                id: UPDATE_INFO
            }
        ];

        const notification = botContext.getCapability('Notification');
        notification.deviceInfo()
        .then((deviceInfo) => {
            if(_.isEmpty(deviceInfo) || !deviceInfo.isRegistered) {
                options.push({
                    title: 'Activate Push Notifications',
                    id: REGISTER_DEVICE
                });
            } else {
                options.push({
                    title: 'Deactivate Push Notifications',
                    id: DEREGISTER_DEVICE
                });
            }
            options.push(
            {
                title: 'Featured Partners'
            },
            {
                title: 'Find help',
            },
            {
                title: 'Logout',
                id: CONFIRM_LOGOUT
            });
            message.sliderMessage(options, {smartReply: true});
            tell(message, botContext);
        });
    };

    const logoutConfirm = function (botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: 'Yes',
            id: LOGOUT
        }, {
            title: 'No',
            id: NO_LOGOUT
        }], {smartReply: true});
        tell(message, botContext);
    };

    const tell = function (msg, botContext) {
        botContext.tell(msg);
    }

    const farewell = function () {
    };

    const next = function (message, state, previousMessages, botContext) {

        if (message.getMessageType() === 'slider_response') {
            const authContext = botContext.getCapability('authContext');
            let sliderMsgId = message.getMessage()[0].id;
            if (botState === OnboardingStates.userNotLoggedIn) {
                botContext.wait(true);
                authContext.login(botContext, sliderMsgId)
                    .then((user) => {
                        botState = OnboardingStates.userLoggedIn;
                        tell('Hi ' + user.info.name, botContext);
                        tell('You\'ve been successfully logged in', botContext);
                        tell('Now touching the back button at the top left you can go to the timeline screen and start enjoying our chatbots or chatting with your friends and family', botContext);
                        tell('You can come back to this conversation anytime and ask me any questions about the platform', botContext);
                        logoutAsk(botContext);
                    })
                    .catch((error) => {
                        console.log('Login error :', error);
                        tell('Error in logging in.', botContext);
                        loginAsk(botContext);
                    });
            } else {
                if(sliderMsgId === CONFIRM_LOGOUT) {
                    tell('Are you sure you would like to logout? All your data will be deleted from the device', botContext);
                    logoutConfirm(botContext);
                } else if(sliderMsgId === LOGOUT) {
                    authContext.logout(botContext)
                        .then(() => {
                            botState = OnboardingStates.userNotLoggedIn;
                            tell('Successfully logged out', botContext);
                            loginAsk(botContext);
                        });
                } else if (sliderMsgId === NO_LOGOUT) {
                    tell('You can use this bot to logout anytime', botContext);
                } else if (sliderMsgId === PROFILE_PIC) {
                    uploadProfilePic(authContext, botContext);
                } else if (sliderMsgId === UPDATE_INFO) {
                    showUserForm(authContext, botContext);
                } else if (sliderMsgId === REGISTER_DEVICE) {
                    registerDevice(authContext, botContext);
                } else if (sliderMsgId === DEREGISTER_DEVICE) {
                    deregisterDevice(authContext, botContext);
                } else {
                    let Message = botContext.getCapability('Message');
                    let msg = new Message();
                    msg.stringMessage(message.getMessage()[0].title);
                    processNlp(msg, state, previousMessages, botContext);
                }
            }
        } else if (message.getMessageType() === 'string') {
            let DeviceStorage = botContext.getCapability('DeviceStorage');
            DeviceStorage.get(AUTH_ENTERED_KEY)
                .then((obj) => {
                    if(obj === null) {
                        let msgTxt = message.getMessage().toLowerCase();
                        if(msgTxt === 'spaceshipone') {
                            initialLogin(botContext);
                            return loginAsk(botContext);
                        } else {
                            return tell('The code you entered is not valid. Please enter a valid authentication code', botContext);
                        }
                    } else {
                        if (botState === OnboardingStates.userNotLoggedIn) {
                            tell('I am sorry but I can only talk to authenticated users', botContext);
                            return loginAsk(botContext);
                        } else {
                            return processNlp(message, state, previousMessages, botContext);
                        }
                    }
            });
        } else if (message.getMessageType() === 'form_response') {
            updateUserInfo(message, state, previousMessages, botContext);
        }
    };

    const registerDevice = function(authContext, botContext) {
        let user = null;
        authContext.getAuthUser(botContext)
        .then((usr) => {
            user = usr;
            const notification = botContext.getCapability('Notification');
            return notification.register();
        })
        .then((notificationDeviceInfo) => {
            botContext.wait(true);
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.registerDevice(notificationDeviceInfo, botContext, user);
        })
        .then(() => {
            tell("Push notifications are activated for your device", botContext);
        });
    };

    const deregisterDevice = function(authContext, botContext) {
        let user = null;
        authContext.getAuthUser(botContext)
        .then((usr) => {
            user = usr;
            const notification = botContext.getCapability('Notification');
            return notification.deregister();
        })
        .then((notificationDeviceInfo) => {
            botContext.wait(true);
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.deregisterDevice(notificationDeviceInfo, botContext, user);
        })
        .then(() => {
            tell("Push notifications are deactivated for your device", botContext);
        });
    };

    const showUserForm = function(authContext, botContext) {
        authContext.getAuthUser(botContext)
        .then((usr) => {
            let Message = botContext.getCapability('Message');
            let message = new Message();
            message.formMessage([
                { id: 1, title: 'Enter your updated details', type: 'text' },
                { id:2, title: 'Screen Name', value: usr.info.screenName, type: 'text_field', optional: false },
                { id:3, title: 'First Name', value: usr.info.givenName, type: 'text_field', optional: false },
                { id:4, title: 'Last Name', value: usr.info.surname, type: 'text_field', optional: false },
                { id:5, title:'Update', type: 'button' }
            ], '');
            tell(message, botContext);
        });
    };

    const updateUserInfo = function(msg, state, previousMessages, botContext) {
        let isFormMsg = (msg.getMessageType() === 'form_response');
        let domainsSuccessMsg = '';
        let userDetails = {};
        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
        .then(function(user) {
            botContext.wait(true);

            let userInfo = user.info || {};
            let dbDocument = {};

            if (isFormMsg) {
                let screenName = msg.getMessage()[1].value || userInfo.screenName;
                let givenName = msg.getMessage()[2].value || userInfo.givenName;
                let lastName = msg.getMessage()[3].value || userInfo.surname;

                userDetails.screenName = screenName;
                userDetails.surname = lastName;
                userDetails.givenName = givenName;

                dbDocument.givenName = givenName;
                dbDocument.screenName = screenName;
                dbDocument.surname = lastName;
            } else {
                const _ = botContext.getCapability('Utils').Lodash;
                let domains = userInfo.domains || [];
                let msgArr = JSON.parse(msg.getMessage());
                let company = msgArr[0];
                domainsSuccessMsg = msgArr[1];
                if(_.indexOf(domains, company) === -1) {
                    domains.push(company);
                }

                userDetails.domains = domains;
                dbDocument.domains = domains;
            }

            let params = {
                collection: "People",
                documents: [{
                    queryString: "uuid==" + user.userUUID,
                    document: dbDocument
                }]
            };
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.writeData(msg, botContext, user, previousMessages, params);
        })
        .then(function() {
            return authContext.updateUserDetails(userDetails, botContext);
        })
        .then(function() {
            if (isFormMsg) {
                return tell('Information updated', botContext);
            } else {
                if(domainsSuccessMsg) {
                    return tell(domainsSuccessMsg, botContext);
                } else {
                    return tell('You should now be able to access the featured partner\'s bot', botContext);
                }
            }
        })
        .catch(function(error) {
            console.error('Error occurred while updating user details: ', error);
            tell('Error occurred: Unable to update details', botContext);
        });
    };

    const uploadProfilePic = function(authContext, botContext) {
        tell('Please choose a profile picture from your library', botContext);

        const _ = botContext.getCapability('Utils').Lodash;
        let user = null;
        authContext.getAuthUser(botContext)
            .then((usr) => {
                user = usr;
                const Media = botContext.getCapability('Media');
                return Media.pickMediaFromLibrary();
            })
            .then((media) => {
                if(media.cancelled) {
                    return null;
                } else {
                    botContext.wait(true);
                    const Resource = botContext.getCapability('Resource');
                    const ResourceTypes = botContext.getCapability('ResourceTypes');
                    return Resource.uploadFile(media.base64, media.uri, PROFILE_PIC_BUCKET, user.userUUID, ResourceTypes.Image, user, true);
                }
            })
            .then((fileUrl) => {
                if(!_.isNull(fileUrl)) {
                    let Message = botContext.getCapability('Message');
                    let message = new Message();
                    message.imageMessage(fileUrl);
                    tell(message, botContext);
                }
            });
    };

    const processNlp = function(msg, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;

        botContext.wait(true);
        authContext.getAuthUser(botContext)
            .then(function(user) {
                const agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.nlp(msg, botContext, user, previousMessages, ONBOARDING_NLP_ID);
            })
            .then(function(queryResp) {
                let Message = botContext.getCapability('Message');
                let messages = queryResp.messages || [];
                let action = queryResp.action;

                if(_.isEmpty(messages)) {
                    let strMsg = queryResp.speech || 'Unable to get results for the query';
                    tell(strMsg, botContext);
                } else if(action === '1_configurationMenu') {
                    return logoutAsk(botContext);
                } else {
                    let type0Msg = _.find(messages, function (element) {
                        return element.type === 0;
                    });

                    let type0MsgSpeech = type0Msg.speech;

                    if (_.startsWith(action, '10_Catalogue')) {
                        let domain = action.replace('10_Catalogue_', '').toLowerCase();
                        let company = (domain === 'inmarsat') ? 'inmarsat' : 'frontmai';
                        let Message = botContext.getCapability('Message');
                        let companyMsg = new Message();
                        let msgArr = [company, type0MsgSpeech];
                        companyMsg.stringMessage(JSON.stringify(msgArr));
                        return updateUserInfo(companyMsg, state, previousMessages, botContext);
                    }

                    if(type0MsgSpeech) {
                        tell(type0MsgSpeech, botContext);
                    }

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
                            sliderMsgList.push({title: element});
                        });
                        let message = new Message();
                        message.sliderMessage(sliderMsgList, {smartReply: true});
                        tell(message, botContext);
                    }
                }
            });
    };

    let asyncResult = function(result, state, previousMessages, botContext) {

    };

    return {
        done: farewell,
        init: greeting,
        next: next,
        asyncResult: asyncResult,
        version: "1.0.0"
    };
})();
