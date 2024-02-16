(function () {
    function sendIMMessage(
        msg,
        isNewConversation,
        botContext,
        user,
        previousMessages,
        sync
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        var messageToSend = createMsg(msg, botContext, _);
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'SendIMMessage',
                parameters: {
                    messages: [messageToSend],
                    isNewConversation: isNewConversation
                },
                sync: sync || true
            };
            var resloveFunc = function resloveFunc(res) {
                var newConvId = _.get(res, 'data.content[0]');
                var status = res;
                return resolve({ newConvId: newConvId, status: status });
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc,
                true
            );
        });
    }
    function createMsg(msg, botContext, _, location) {
        var msgContent = msg.getMessage();
        var temp = JSON.stringify(msgContent);
        temp = temp.replace(/\"\"/g, '" "');
        msgContent = JSON.parse(temp);
        var finalMsg = {
            messageId: msg.getMessageId(),
            contentType: getMessageContentType(msg, botContext),
            createdOn: msg.getMessageDate().valueOf(),
            createdBy: msg.getCreatedBy(),
            content: _.isArray(msgContent) ? msgContent : [msgContent],
            selectedDomain: botContext.getCapability('Auth').getSelectedDomain()
        };
        if (location) {
            finalMsg.location = location;
        }
        var options = msg.getMessageOptions();
        if (options) {
            finalMsg.options = options;
        }
        return finalMsg;
    }
    function archive(msgList, botContext, user, sync, location) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        var messagesToSend = _.map(msgList, function (msg) {
            return createMsg(msg, botContext, _, location);
        });
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'Archive',
                parameters: { messages: messagesToSend },
                sync: sync || false
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc,
                true
            );
        });
    }
    function readData(msg, botContext, user, previousMessages, params, sync) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'GetData',
                parameters: params,
                sync: sync || true
            };
            var resloveFunc = function resloveFunc(res) {
                var content = _.get(res, 'data.content') || [];
                return resolve(content);
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    function writeData(msg, botContext, user, previousMessages, params, sync) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'WriteData',
                parameters: params,
                sync: sync || false
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    function getDataAsync(
        msg,
        botContext,
        user,
        previousMessages,
        params,
        requestUuid,
        sync
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'GetDataFromService',
                requestUuid: requestUuid,
                parameters: params,
                sync: sync || false
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    function sendEmail(msg, botContext, user, previousMessages, params, sync) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'SendEmail',
                parameters: params,
                sync: sync || false
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    function executeCustomCapability(
        capabilityName,
        params,
        sync,
        requestUuid,
        botContext,
        user
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: capabilityName,
                parameters: params,
                requestUuid: requestUuid,
                sync: sync
            };
            var resloveFunc = function resloveFunc(res) {
                var content = _.get(res, 'data.content') || [];
                return resolve(content || {});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    function executeBackendBot(params, sync, requestUuid, botContext, user) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'BackendBotCap',
                parameters: {
                    botId: botContext.botManifest.botId,
                    botVersion: botContext.botManifest.version,
                    command: 'asyncRequest',
                    data: params
                },
                requestUuid: requestUuid,
                sync: sync
            };
            var resloveFunc = function resloveFunc(res) {
                var content = _.get(res, 'data.content') || [];
                return resolve(content || {});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    }
    var nlp = function nlp(
        msg,
        botContext,
        user,
        previousMessages,
        nlpBotId,
        sync
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'NLP',
                parameters: { queryString: msg.getMessage(), nlpId: nlpBotId },
                sync: sync || true
            };
            var resloveFunc = function resloveFunc(res) {
                var content = _.get(res, 'data.content') || [];
                return resolve(content[0] || {});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    };
    var registerDevice = function registerDevice(
        notificationDeviceInfo,
        botContext,
        user,
        sync
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'RegisterDevice',
                parameters: {
                    deviceToken: notificationDeviceInfo.deviceId,
                    deviceType: notificationDeviceInfo.deviceType
                },
                sync: sync || true
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    };
    var deregisterDevice = function deregisterDevice(
        notificationDeviceInfo,
        botContext,
        user,
        sync
    ) {
        var Promise = botContext.getCapability('Promise');
        var utils = botContext.getCapability('Utils');
        var _ = utils.Lodash;
        return new Promise(function (resolve, reject) {
            var postReq = {
                capability: 'DeregisterDevice',
                parameters: {
                    deviceToken: notificationDeviceInfo.deviceId,
                    deviceType: notificationDeviceInfo.deviceType
                },
                sync: sync || true
            };
            var resloveFunc = function resloveFunc(res) {
                return resolve({});
            };
            executeCapability(
                botContext,
                user,
                _,
                postReq,
                reject,
                resloveFunc
            );
        });
    };
    var AG_ERRORS = { QUEUED_REQUEST: 'QUEUED_REQUEST' };
    var executeCapability = function executeCapability(
        botContext,
        user,
        _,
        postReq,
        reject,
        resloveFunc
    ) {
        var conversationContext = botContext.getCapability(
            'ConversationContext'
        );
        var conversation = null;
        conversationContext
            .getConversationContext(botContext, user)
            .then(function (context) {
                conversation = context;
                addConversationDetailsToRequest(
                    botContext.botManifest.botId,
                    conversation,
                    postReq,
                    _
                );
                return doNetworkCall(postReq, botContext, user);
            })
            .then(function (res) {
                var isRequestQueued = _.get(res, 'queued') || false;
                if (isRequestQueued) {
                    reject(AG_ERRORS.QUEUED_REQUEST);
                } else {
                    var err = _.get(res, 'data.error');
                    if (err != '0') {
                        reject('Error occurred executing capability:' + err);
                    } else {
                        if (_.isUndefined(conversation.created)) {
                            conversationContext.setConversationCreated(
                                botContext,
                                true
                            );
                        }
                        resloveFunc(res);
                    }
                }
            })
            .catch(function (err) {
                console.log('Error getting the conversation context ', err);
                reject(err);
            });
    };
    var doNetworkCall = function doNetworkCall(postReq, botContext, user) {
        var AgentGuard = botContext.getCapability('AgentGuard');
        if (postReq.parameters) {
            postReq.parameters = JSON.stringify(postReq.parameters);
        }
        return AgentGuard.execute(postReq);
    };
    var addConversationDetailsToRequest = function addConversationDetailsToRequest(
        botId,
        conversation,
        postReq,
        _
    ) {
        postReq.conversation = {
            conversationId: conversation.conversationId,
            bot: botId
        };
        if (_.isUndefined(conversation.created)) {
            postReq.conversation.participants = conversation.participants;
            postReq.conversation.onChannels = conversation.onChannels;
            postReq.conversation.closed = false;
        }
    };
    var getMessageContentType = function getMessageContentType(
        message,
        botContext
    ) {
        var MessageTypeConstantsToInt = botContext.getCapability(
            'MessageTypeConstantsToInt'
        );
        return MessageTypeConstantsToInt[message.getMessageType()] || 0;
    };
    return {
        sendIMMessage: sendIMMessage,
        readData: readData,
        nlp: nlp,
        sendEmail: sendEmail,
        writeData: writeData,
        getDataAsync: getDataAsync,
        executeCustomCapability: executeCustomCapability,
        executeBackendBot: executeBackendBot,
        deregisterDevice: deregisterDevice,
        registerDevice: registerDevice,
        getMessageContentType: getMessageContentType,
        archive: archive,
        AG_ERRORS: AG_ERRORS
    };
})();
