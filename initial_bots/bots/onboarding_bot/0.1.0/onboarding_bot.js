(function () {
    const OnboardingStates = {
        userLoggedIn: 'userLoggedIn',
        userNotLoggedIn: 'userNotLoggedIn'
    };

    const PROFILE_PIC_BUCKET = 'profile-pics';
    const ONBOARDING_NLP_ID = 'FMBot';

    const MAIN_MENU = {
        CONFIGURATION: 'CONFIGURATION',
        PARTNER_PROFILE: 'PARTNER_PROFILE',
        CONFIRM_LOGOUT: 'CONFIRM_LOGOUT'
    };
    const LOGOUT = {
        YES: 'LOGOUT_YES',
        NO: 'LOGOUT_NO'
    };
    const CONFIGURATION_MENU = {
        PROFILE_PIC: 'PROFILE_PIC',
        UPDATE_INFO: 'UPDATE_INFO',
        REGISTER_DEVICE: 'REGISTER_DEVICE',
        DEREGISTER_DEVICE: 'DEREGISTER_DEVICE',
        NETWORK_CONTROL: 'NETWORK_CONTROL',
        NETWORK_USAGE: 'NETWORK_USAGE'
    };
    const NETWORK_CONTROL_MENU = {
        MANUAL: 'Manual',
        SATELLITE: 'Satellite',
        GSM: 'GSM',
        AUTO:'Automatic'
    };

    let botState = OnboardingStates.userNotLoggedIn;

    const greeting = function (state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        authContext.isUserLoggedIn(botContext)
        .then((userLoggedIn) => {
            if (userLoggedIn) {
                botState = OnboardingStates.userLoggedIn;
                return showMainMenu(botContext);
            } else {
                botState = OnboardingStates.userNotLoggedIn;
                tell('Hello There!', botContext);
                tell('How would you like to sign in?', botContext);
                return loginAsk(botContext);
            }
        });
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
    };

    const showMainMenu = function (botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        let options = [
        {
            title: 'Configuration',
            id: MAIN_MENU.CONFIGURATION
        },
        {
            title: 'Activate Partner Profile',
            id: MAIN_MENU.PARTNER_PROFILE
        },
        {
            title: 'Logout',
            id: MAIN_MENU.CONFIRM_LOGOUT
        }];
        message.sliderMessage(options, {smartReply: true});
        tell(message, botContext);
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
                    tell('Hi ' + user.info.name + '! Welcome aboard!', botContext);
                    tell('Success! You are now logged in', botContext);
                    tell('You can press the back button to see your timeline and explore our chatbots', botContext);
                    tell('Don’t worry. You can come back to this conversation at any time and ask me questions about the platform', botContext);
                    tell('Have fun!', botContext);
                    showMainMenu(botContext);
                })
                .catch((error) => {
                    console.log('Login error :', error);
                    if (error.code === 0) {
                        botContext.wait(false);
                    } else {
                        tell('Error occurred while logging in', botContext);
                    }
                    loginAsk(botContext);
                });
            } else {
                switch(sliderMsgId) {
                    case MAIN_MENU.CONFIGURATION:
                        showConfigurationMenu(botContext);
                        break;
                    case MAIN_MENU.PARTNER_PROFILE:
                        tell('Please scan partner QR code or enter it', botContext);
                        break;
                    case MAIN_MENU.CONFIRM_LOGOUT:
                        tell('Are you sure you would like to logout? All your data will be deleted from the device', botContext);
                        logoutConfirm(botContext);
                        break;
                    case LOGOUT.YES:
                        authContext.logout(botContext)
                        .then(() => {
                            botState = OnboardingStates.userNotLoggedIn;
                            tell('Successfully logged out', botContext);
                            loginAsk(botContext);
                        });
                        break;
                    case LOGOUT.NO:
                        tell('You can use this bot to logout anytime', botContext);
                        break;
                    case CONFIGURATION_MENU.PROFILE_PIC:
                        uploadProfilePic(authContext, botContext);
                        break;
                    case CONFIGURATION_MENU.UPDATE_INFO:
                        showUserForm(authContext, botContext);
                        break;
                    case CONFIGURATION_MENU.REGISTER_DEVICE:
                    case CONFIGURATION_MENU.DEREGISTER_DEVICE:
                        deviceRegisterDeregister(sliderMsgId, authContext, botContext);
                        break;
                    case CONFIGURATION_MENU.NETWORK_CONTROL:
                        showNetworkControlMenu(botContext);
                        break;
                    case CONFIGURATION_MENU.NETWORK_USAGE:
                        tell('This functionality is coming in next release', botContext);
                        showMainMenu(botContext);
                        break;
                    case NETWORK_CONTROL_MENU.MANUAL:
                    case NETWORK_CONTROL_MENU.AUTO:
                    case NETWORK_CONTROL_MENU.GSM:
                    case NETWORK_CONTROL_MENU.SATELLITE:
                        changePollingStrategy(sliderMsgId, botContext);
                        break;
                }
            }
        } else if (message.getMessageType() === 'form_response') {
            updateUserInfo(message, state, previousMessages, botContext);
        } else if (message.getMessageType() === 'string') {
            if (botState === OnboardingStates.userNotLoggedIn) {
                tell('I am sorry but I can only talk to authenticated users', botContext);
                return loginAsk(botContext);
            } else {
                return processStringMsg(message, state, previousMessages, botContext);
            }
        }
    };

    const changePollingStrategy = function(option, botContext) {
        const PollingStrategyTypes = botContext.getCapability('PollingStrategyTypes');
        const _ = botContext.getCapability('Utils').Lodash;

        let chosenStrategy = _.get(PollingStrategyTypes, option.toLowerCase());
        if(_.isUndefined(chosenStrategy) || _.isEmpty(chosenStrategy)) {
            tell('This functionality is coming in next release', botContext);
            return showMainMenu(botContext);
        } else {
            const Settings = botContext.getCapability('Settings');
            return Settings.setPollingStrategy(chosenStrategy)
            .then(function() {
                tell('Network control has been updated to ' + option, botContext);
                return showMainMenu(botContext);
            });
        }
    };

    const processStringMsg = function(message, state, previousMessages, botContext) {
        let strMsg = message.getMessage().toLowerCase();
        let Message = botContext.getCapability('Message');
        let companyMsg = new Message();
        if(strMsg === 'addvaluefaq') {
            companyMsg.stringMessage('addvalue');
            return updateUserInfo(companyMsg, state, previousMessages, botContext);
        } else if(strMsg === 'inmarsatchatbot') {
            companyMsg.stringMessage('inmarsat');
            return updateUserInfo(companyMsg, state, previousMessages, botContext);
        } else {
            return processNlp(message, state, previousMessages, botContext);
        }
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
                return showMainMenu(botContext);
            } else if(action === '1_configurationMenu') {
                return showMainMenu(botContext);
            } else {
                let type0Msg = _.find(messages, function (element) {
                    return element.type === 0;
                });

                let type0MsgSpeech = type0Msg.speech;
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
                } else {
                    return showMainMenu(botContext);
                }
            }
        });
    };

    const updateUserInfo = function(msg, state, previousMessages, botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        let isFormMsg = (msg.getMessageType() === 'form_response');
        let userDetails = {};
        let newDomain = null;
        let addDomain = false;

        botContext.wait(true);
        const authContext = botContext.getCapability('authContext');
        authContext.getAuthUser(botContext)
        .then(function(user) {
            let userInfo = user.info || {};
            let dbDocument = {};

            if (isFormMsg) {
                let screenName = msg.getMessage()[1].value || userInfo.screenName;
                let givenName = msg.getMessage()[2].value || userInfo.givenName;
                let lastName = msg.getMessage()[3].value || userInfo.surname;

                userDetails.screenName = screenName;
                userDetails.surname = lastName;
                userDetails.givenName = givenName;

                dbDocument.screenName = screenName;
                dbDocument.givenName = givenName;
                dbDocument.surname = lastName;
            } else {
                let domains = userInfo.domains || [];
                newDomain = msg.getMessage();
                if(_.indexOf(domains, newDomain) === -1) {
                    addDomain = true;
                    domains.push(newDomain);
                }
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
            if (isFormMsg) {
                return authContext.updateUserDetails(userDetails, botContext);
            } else if (addDomain) {
                return authContext.addDomains(newDomain, botContext);
            }
        })
        .then(function() {
            if (isFormMsg) {
                tell('Information updated', botContext);
            } else {
                tell('You should now be able to access the featured partner\'s bot', botContext);
            }
            return showMainMenu(botContext);
        })
        .catch(function(error) {
            console.error('Error occurred while updating user details: ', error);
            tell('Error occurred: Unable to update details', botContext);
        });
    };

    const deviceRegisterDeregister = function(action, authContext, botContext) {
        let registerAction = (action === CONFIGURATION_MENU.REGISTER_DEVICE);
        let user = null;
        authContext.getAuthUser(botContext)
        .then((usr) => {
            user = usr;
            const notification = botContext.getCapability('Notification');
            if (registerAction) {
                return notification.register();
            } else {
                return notification.deregister();
            }
        })
        .then((notificationDeviceInfo) => {
            botContext.wait(true);
            const agentGuardService = botContext.getCapability('agentGuardService');
            if (registerAction) {
                return agentGuardService.registerDevice(notificationDeviceInfo, botContext, user);
            } else {
                return agentGuardService.deregisterDevice(notificationDeviceInfo, botContext, user);
            }
        })
        .then(() => {
            if (registerAction) {
                tell("Push notifications are activated for your device", botContext);
            } else {
                tell("Push notifications are deactivated for your device", botContext);
            }
            return showMainMenu(botContext);
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
            return showMainMenu(botContext);
        });
    };

    const logoutConfirm = function (botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: 'Yes',
            id: LOGOUT.YES
        }, {
            title: 'No',
            id: LOGOUT.NO
        }], {smartReply: true});
        tell(message, botContext);
    };

    const showNetworkControlMenu = function (botContext) {
        let Message = botContext.getCapability('Message');
        let message = new Message();
        message.sliderMessage([{
            title: NETWORK_CONTROL_MENU.MANUAL,
            id: NETWORK_CONTROL_MENU.MANUAL
        }, {
            title: NETWORK_CONTROL_MENU.SATELLITE,
            id: NETWORK_CONTROL_MENU.SATELLITE
        }, {
            title: NETWORK_CONTROL_MENU.GSM,
            id: NETWORK_CONTROL_MENU.GSM
        }, {
            title: NETWORK_CONTROL_MENU.AUTO,
            id: NETWORK_CONTROL_MENU.AUTO
        }], {smartReply: true});
        tell(message, botContext);
    };

    const showConfigurationMenu = function (botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        let Message = botContext.getCapability('Message');
        let message = new Message();
        let options = [
        {
            title: 'Add/change profile picture',
            id: CONFIGURATION_MENU.PROFILE_PIC
        },
        {
            title: 'Update user details',
            id: CONFIGURATION_MENU.UPDATE_INFO
        }];

        const notification = botContext.getCapability('Notification');
        notification.deviceInfo()
        .then((deviceInfo) => {
            if(_.isEmpty(deviceInfo) || !deviceInfo.isRegistered) {
                options.push({
                    title: 'Activate Push Notifications',
                    id: CONFIGURATION_MENU.REGISTER_DEVICE
                });
            } else {
                options.push({
                    title: 'Deactivate Push Notifications',
                    id: CONFIGURATION_MENU.DEREGISTER_DEVICE
                });
            }
            options.push(
            {
                title: 'Network control',
                id: CONFIGURATION_MENU.NETWORK_CONTROL
            },
            {
                title: 'Network usage',
                id: CONFIGURATION_MENU.NETWORK_USAGE
            });
            message.sliderMessage(options, {smartReply: true});
            tell(message, botContext);
        });
    };

    const tell = function (msg, botContext) {
        botContext.tell(msg);
    };

    const farewell = function () {
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
