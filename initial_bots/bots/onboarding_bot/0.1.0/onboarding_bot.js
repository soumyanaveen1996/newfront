(function () {
    const OnboardingStates = {
        userLoggedIn: 'userLoggedIn',
        userNotLoggedIn: 'userNotLoggedIn'
    };

    const CONFIRM_LOGOUT = 'confirmLogout';
    const LOGOUT = 'logout';
    const NO_LOGOUT = 'noLogout';
    const PROFILE_PIC = 'profilePic';
    const REGISTER_DEVICE = 'registerDevice';
    const DEREGISTER_DEVICE = 'deregisterDevice';
    const ONBOARDING_NLP_ID = 'FMBot';
    const PROFILE_PIC_BUCKET = 'profile-pics';

    var botState = OnboardingStates.userNotLoggedIn;
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
            // COMMENTING this until profile image is displayed in IM bot conversations
            // {
            //     title: 'Add/change profile picture',
            //     id: PROFILE_PIC
            // }
        ];

        const notification = botContext.getCapability('Notification');
        notification.deviceInfo()
        .then((deviceInfo) => {
            if(_.isEmpty(deviceInfo)) {
                options.push({
                    title: 'Register Device',
                    id: REGISTER_DEVICE
                });
            } else {
                options.push({
                    title: 'Deregister Device',
                    id: DEREGISTER_DEVICE
                });
            }
            options.push({
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
                    logoutAsk(botContext);
                } else if (sliderMsgId === PROFILE_PIC) {
                    uploadProfilePic(authContext, botContext);
                }  else if (sliderMsgId === REGISTER_DEVICE) {
                    registerDevice(authContext, botContext);
                }  else if (sliderMsgId === DEREGISTER_DEVICE) {
                    deregisterDevice(authContext, botContext);
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
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.registerDevice(notificationDeviceInfo, botContext, user);
        })
        .then(() => {
           tell("Device registered successfully", botContext);
        });
    };

    const deregisterDevice = function(authContext, botContext) {
        let user = null;
        authContext.getAuthUser(botContext)
        .then((usr) => {
            user = usr;
            const notification = botContext.getCapability('Notification');
            return notification.deviceInfo();
        })
        .then((notificationDeviceInfo) => {
            const agentGuardService = botContext.getCapability('agentGuardService');
            return agentGuardService.deregisterDevice(notificationDeviceInfo, botContext, user);
        })
        .then(() => {
            tell("Device deregistered successfully", botContext);
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
                    const Resource = botContext.getCapability('Resource');
                    const ResourceTypes = botContext.getCapability('ResourceTypes');
                    return Resource.uploadFile(media.base64, media.uri, PROFILE_PIC_BUCKET, user.userUUID, ResourceTypes.Image, user);
                }
            })
            .then((fileUrl) => {
                if(!_.isNull(fileUrl)) {
                    let Message = botContext.getCapability('Message');
                    let message = new Message();
                    message.imageMessage(fileUrl);
                    tell(message, botContext);
                    logoutAsk(botContext);
                }
            });
    };


    const processNlp = function(msg, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;

        botContext.wait(true);
        let user = {};
        authContext.getAuthUser(botContext)
            .then(function(user) {
                const agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.nlp(msg, botContext, user, previousMessages, ONBOARDING_NLP_ID);
            })
            .then(function(queryResp) {
                let Message = botContext.getCapability('Message');
                let message = new Message();
                let messages = queryResp.messages || [];

                if(_.isEmpty(messages)) {
                    let strMsg = queryResp.speech || 'Unable to get results for the query';
                    message.stringMessage(strMsg);
                } else {
                    const replies = messages[0].replies || [];
                    if(_.isEmpty(replies)) {
                        message.stringMessage(messages[0].speech);
                    } else {
                        message.sliderMessage(replies, {select: false, multiSelect: false});
                    }
                }
                tell(message, botContext);
                logoutAsk(botContext);
            });
    };


    return {
        done: farewell,
        init: greeting,
        next: next,
        version: "1.0.0"
    };
})();
