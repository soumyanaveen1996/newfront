(function() {
    const ACCEPT_CONTACT_ACTION = 'AcceptContact';
    const IGNORE_CONTACT_ACTION = 'IgnoreContact';
    const TEN_MINUTES = 10 * 60 * 1000;
    const CONTENT_TYPE = {
        ACCEPT_CONTACT_MSG_CONTENT_TYPE: '1000',
        ADD_CONTACT_MSG_CONTENT_TYPE: '1001',
    };

    const DeviceStorageUtil = {
        IM_BOT_STATE: 'IM_BOT',
        getContext: function(botContext, DeviceStorage) {
            DeviceStorage = DeviceStorage || botContext.getCapability('DeviceStorage');
            return DeviceStorage.get(DeviceStorageUtil.IM_BOT_STATE);
        },
        setInContext: function(key, value, botContext) {
            let DeviceStorage = botContext.getCapability('DeviceStorage');
            return DeviceStorageUtil.getContext(botContext, DeviceStorage).then(function(state) {
                state = state || {};
                state[key] = value;
                return DeviceStorage.save(DeviceStorageUtil.IM_BOT_STATE, state);
            });
        },
    };

    let next = function(message, state, previousMessages, botContext) {
        return decode(message, state, previousMessages, botContext);
    };

    let greeting = function(state, previousMessages, botContext) {
        // DO NOT SHOW ANY MESSAGE - SIMILAR TO WHATSAPP CONVERSATIONS
        state.status = 'greeting';
    };

    let decode = function(message, state, previousMessages, botContext) {
        const authContext = botContext.getCapability('authContext');
        const _ = botContext.getCapability('Utils').Lodash;
        const agentGuardService = botContext.getCapability('agentGuardService');
        let curUser = null;

        console.log('Here!!!');
        return authContext
            .getAuthUser(botContext)
            .then(function(user) {
                curUser = user;
                if (message.getMessageType() === 'button_response') {
                    let action = message.getMessage().action || '';
                    let contact = message.getMessage().user;
                    const Contact = botContext.getCapability('Contact');

                    Contact.getContactFieldForUUIDs(contact.userId).then(contacts => {
                        if (_.isEmpty(contacts)) {
                            let capParams = {
                                users: [contact.userId],
                            };

                            let agentGuardService = botContext.getCapability('agentGuardService');
                            if (ACCEPT_CONTACT_ACTION === action) {
                                tell('Accepting contact', botContext);
                                agentGuardService
                                    .executeCustomCapability(ACCEPT_CONTACT_ACTION, capParams, true, undefined, botContext, user, false)
                                    .then((data) => {
                                    console.log('Got accept response::::', data);
                                        tell('After Accepting contact:: ' + JSON.stringify(data), botContext);
                                        return Contact.addContacts(contact);
                                    })
                                    .then(() => {
                                        let Message = botContext.getCapability('Message');
                                        let message = new Message();
                                        message.standardNotification('Contact ' + contact.userName + ' added');
                                        tell(message, botContext);
                                    });
                            } else if (IGNORE_CONTACT_ACTION === action) {
                                agentGuardService
                                    .executeCustomCapability(IGNORE_CONTACT_ACTION, capParams, true, undefined, botContext, user, false)
                                    .then(() => {
                                        return Contact.ignoreContact(contact);
                                    })
                                    .then(() => {
                                        let Message = botContext.getCapability('Message');
                                        let message = new Message();
                                        message.criticalNotification('Contact ' + contact.userName + ' ignored');
                                        tell(message, botContext);
                                    });
                            }
                        } else {
                            let contactStatus = contacts[0].ignored ? ' ignored' : ' added';
                            let Message = botContext.getCapability('Message');
                            let message = new Message();
                            message.standardNotification('Contact ' + contact.userName + contactStatus);
                            tell(message, botContext);
                        }
                    });

                    return 'Contact proccessed';
                } else {
                    return sendImMessage(message, botContext, user, previousMessages);
                }
            })
            .catch(function(err) {
                if (agentGuardService.AG_ERRORS.QUEUED_REQUEST === err) {
                    showOfflineMessage(curUser, botContext);
                } else {
                    tell('I am having trouble sending your messages. Please report this issue to the support team', botContext);
                }
            });
    };

    let showOfflineMessage = function(user, botContext) {
        const _ = botContext.getCapability('Utils').Lodash;
        const conversationContext = botContext.getCapability('ConversationContext');

        let conversationId = null;
        conversationContext
            .getConversationContext(botContext, user)
            .then(conversation => {
                conversationId = conversation.conversationId;
                return DeviceStorageUtil.getContext(botContext);
            })
            .then(deviceStorage => {
                let curConversationData = _.get(deviceStorage, conversationId) || {};
                let lastOfflineMsgShownTime = _.get(curConversationData, 'lastOfflineMsgShownTime');
                let latestTime = _.now();
                if (
                    _.isUndefined(lastOfflineMsgShownTime) ||
                    _.toNumber(latestTime) - _.toNumber(lastOfflineMsgShownTime) > TEN_MINUTES
                ) {
                    let Message = botContext.getCapability('Message');
                    let queuedMsg = new Message();
                    queuedMsg.criticalNotification(
                        "You appear to be offline. Keep going, I'll send the messages once the connection is back"
                    );
                    tell(queuedMsg, botContext);
                    curConversationData.lastOfflineMsgShownTime = latestTime;
                    DeviceStorageUtil.setInContext(conversationId, curConversationData, botContext);
                }
            });
    };

    let sendImMessage = function(msg, botContext, user, previousMessages) {
        let conversationContext = botContext.getCapability('ConversationContext');
        let _ = botContext.getCapability('Utils').Lodash;
        return conversationContext
            .getConversationContext(botContext, user)
            .then(function(conversation) {
                let isNewConversation = _.isUndefined(conversation.created);
                let agentGuardService = botContext.getCapability('agentGuardService');
                return agentGuardService.sendIMMessage(msg, isNewConversation, botContext, user, previousMessages);
            })
            .then(({ newConvId, status }) => {
                console.log('Response received from Server --->', newConvId, status);
                if (!_.isEmpty(newConvId)) {
                    botContext.updateConversationContextId(newConvId);
                }
                return status;
            });
    };

    let tell = function(msg, botContext) {
        // Should bots delay? - not for now - make this a dynamic capability?
        // setTimeout(() => botContext.tell(msg), 500);
        botContext.tell(msg);
    };

    let state = {};

    // We can use this to dump the state of the bot at any time.
    let debug = function() {
        return {
            localState: state,
        };
    };

    let farewell = function(msg, state, previousMessages, botContext) {};

    let asyncResult = function(result, state, previousMessages, botContext) {
        let MessageTypeConstantsToInt = botContext.getCapability('MessageTypeConstantsToInt');
        let MessageTypeConstants = botContext.getCapability('MessageTypeConstants');

        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;
        let moment = utils.moment;
        const content = _.get(result, 'details[0].message');
        const contentType = _.toString(_.get(result, 'contentType'));
        const createdOn = _.get(result, 'createdOn');
        const createdBy = _.get(result, 'createdBy');
        const messageId = _.get(result, 'messageId');
        let Message = botContext.getCapability('Message');
        let asyncMessage = new Message({
            messageDate: createdOn,
            createdBy: createdBy,
            uuid: messageId,
        });

        if (_.isEmpty(content) || _.isUndefined(content)) {
            return;
        }

        let showMessage = true;
        switch (contentType) {
            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_IMAGE]:
                asyncMessage.imageMessage(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_VIDEO]:
                asyncMessage.videoMessage(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_AUDIO]:
                asyncMessage.audioMessage(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_HTML]:
                // TODO: need to pass options to this
                asyncMessage.htmlMessage(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_STD_NOTIFICATION]:
                // let stdNotificationMsgInfo = _.get(result, 'details[0].info') || null;
                // stdNotificationMsgInfo = JSON.parse(stdNotificationMsgInfo);
                // switch (stdNotificationMsgInfo.messageType) {
                //   case 'MISSED_CALL':
                //     let callTimestamp = _.get(stdNotificationMsgInfo, 'callTimestamp');
                //     let date = callTimestamp ? new moment(callTimestamp) : new moment();
                //     asyncMessage.standardNotification('Missed voice call at ' + date.format('h:mm A'));
                //     break;
                //   default:
                //     asyncMessage.standardNotification(content);
                //     break;
                // }
                asyncMessage.standardNotification(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_LOCATION]:
                let locationOptions = _.get(result, 'details[0].options') || {};
                locationOptions = JSON.parse(locationOptions);
                asyncMessage.locationMessage(content, locationOptions);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_CONTACT_CARD]:
                asyncMessage.contactCard(content);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_OTHER_FILE]:
                let fileOptions = _.get(result, 'details[0].options') || {};
                fileOptions = JSON.parse(fileOptions);
                asyncMessage.otherFileMessage(content, fileOptions);
                break;

            case CONTENT_TYPE.ACCEPT_CONTACT_MSG_CONTENT_TYPE:
                let confirmContact = content;
                confirmContact.waitingForConfirmation = false;
                const Contact = botContext.getCapability('Contact');
                return Contact.confirmContact(confirmContact).then(() => {
                    asyncMessage.standardNotification('You will be able to see ' + confirmContact.userName + "'s details now");
                    tell(asyncMessage, botContext);
                });
                break;

            case CONTENT_TYPE.ADD_CONTACT_MSG_CONTENT_TYPE:
                displayAcceptIgnoreMessage(asyncMessage, content, botContext, _);
                break;

            case MessageTypeConstantsToInt[MessageTypeConstants.MESSAGE_TYPE_STRING]:
                asyncMessage.stringMessage(content);
                break;

            default:
                showMessage = false;
                break;
        }

        if (
            showMessage &&
            (CONTENT_TYPE.ACCEPT_CONTACT_MSG_CONTENT_TYPE !== contentType ||
                CONTENT_TYPE.ADD_CONTACT_MSG_CONTENT_TYPE !== contentType)
        ) {
            tell(asyncMessage, botContext);
        }
    };

    let displayAcceptIgnoreMessage = function(acceptIgnoreButtonMsg, acceptIgnoreContact, botContext, _) {
        const NO_MORE_PROCESSING = 'NO_MORE_PROCESSING';
        let conversationId = null;

        const authContext = botContext.getCapability('authContext');
        authContext
            .getAuthUser(botContext)
            .then(user => {
                let conversationContext = botContext.getCapability('ConversationContext');
                return conversationContext.getConversationContext(botContext, user);
            })
            .then(conversation => {
                conversationId = conversation.conversationId;
                let channelsInfo = conversation.onChannels;
                if (_.isEmpty(channelsInfo)) {
                    return DeviceStorageUtil.getContext(botContext);
                } else {
                    return NO_MORE_PROCESSING;
                }
            })
            .then(deviceStorage => {
                if (NO_MORE_PROCESSING === deviceStorage) {
                    return;
                }

                let curConversationData = _.get(deviceStorage, conversationId) || {};
                let acceptIgnoreMsgShown = _.get(curConversationData, 'acceptIgnoreMsgShown') || false;
                if (acceptIgnoreMsgShown) {
                    return;
                }
                acceptIgnoreButtonMsg.buttonMessage(
                    {
                        title: acceptIgnoreContact.userName,
                        body: 'would like to connect with you. Add user to contacts?',
                        buttons: [
                            {
                                title: 'Accept',
                                action: ACCEPT_CONTACT_ACTION,
                                user: acceptIgnoreContact,
                                style: 1,
                            },
                            {
                                title: 'Ignore',
                                action: IGNORE_CONTACT_ACTION,
                                user: acceptIgnoreContact,
                                style: 0,
                            },
                        ],
                    },
                    { smartReply: true }
                );
                tell(acceptIgnoreButtonMsg, botContext);
                curConversationData.acceptIgnoreMsgShown = true;
                return DeviceStorageUtil.setInContext(conversationId, curConversationData, botContext);
            });
    };

    return {
        done: farewell,
        init: greeting,
        asyncResult: asyncResult,
        next: next,
        debug: debug,
        version: '1.0.0',
    };
})();
