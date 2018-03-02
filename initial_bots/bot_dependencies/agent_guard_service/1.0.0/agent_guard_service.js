(function() {

    function send(msg, botContext, user, previousMessages, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        let messageToSend = {
            messageUuid: msg.getMessageId(),
            contentType: getMessageContentType(msg, botContext),
            createdOn: msg.getMessageDate().valueOf(),
            createdBy: msg.getCreatedBy(),
            content: [msg.getMessage()]
        };

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "Send",
                userUuid: user.userUUID,
                parameters : {
                    messages: [messageToSend]
                },
                sync: sync || false
            };

            let resloveFunc = function (res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    function readData(msg, botContext, user, previousMessages, params, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;


        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "GetData",
                userUuid: user.userUUID,
                parameters: params,
                sync: sync || true
            };

            let resloveFunc = function (res) {
                const content = _.get(res, 'data.content') || [];
                return resolve(content);
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    function writeData(msg, botContext, user, previousMessages, params, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "WriteData",
                userUuid: user.userUUID,
                parameters : params,
                sync: sync || false
            };

            let resloveFunc = function(res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    function getDataAsync(msg, botContext, user, previousMessages, params, requestUuid, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "GetDataFromService",
                userUuid: user.userUUID,
                requestUuid: requestUuid,
                parameters : params,
                sync: sync || false
            };

            let resloveFunc = function(res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    function sendEmail(msg, botContext, user, previousMessages, params, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "SendEmail",
                userUuid: user.userUUID,
                parameters : params,
                sync: sync || false
            };

            let resloveFunc = function(res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    function executeCustomCapability(capabilityName, params, sync, requestUuid, botContext, user, canQueue = false) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: capabilityName,
                userUuid: user.userUUID,
                parameters : params,
                requestUuid: requestUuid,
                sync: sync
            };

            let resloveFunc = function(res) {
                const content = _.get(res, 'data.content') || [];
                return resolve(content || {});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc, canQueue);
        });
    }

    const nlp = function(msg, botContext, user, previousMessages, nlpBotId, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "NLP",
                userUuid: user.userUUID,
                parameters : {
                    queryString : msg.getMessage(),
                    nlpId: nlpBotId
                },
                sync: sync || true
            };

            let resloveFunc = function(res) {
                const content = _.get(res, 'data.content') || [];
                return resolve(content[0] || {});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    }

    const registerDevice = function(notificationDeviceInfo, botContext, user, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "RegisterDevice",
                userUuid: user.userUUID,
                parameters : {
                    deviceToken : notificationDeviceInfo.deviceId,
                    deviceType: notificationDeviceInfo.deviceType
                },
                sync: sync || true
            };

            let resloveFunc = function(res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    };

    const deregisterDevice = function(notificationDeviceInfo, botContext, user, sync) {
        let Promise = botContext.getCapability('Promise');
        const utils = botContext.getCapability('Utils');
        let _ = utils.Lodash;

        return new Promise(function (resolve, reject) {
            let postReq = {
                capability: "DeregisterDevice",
                userUuid: user.userUUID,
                parameters : {
                    deviceToken : notificationDeviceInfo.deviceId,
                    deviceType: notificationDeviceInfo.deviceType
                },
                sync: sync || true
            };

            let resloveFunc = function(res) {
                return resolve({});
            };

            executeCapability(botContext, user, _, postReq, reject, resloveFunc);
        });
    };

    const executeCapability = function(botContext, user, _, postReq, reject, resloveFunc, canQueue = false) {
        let conversationContext = botContext.getCapability('ConversationContext');
        let conversation = null;

        conversationContext.getConversationContext(botContext, user)
            .then(function(context) {
                conversation = context;
                postReq['creatorInstanceId'] = conversation.creatorInstanceId;
                addConvOrInstanceIdToRequest(botContext.botManifest.id, conversation, postReq, _);
                return doNetworkCall(postReq, botContext, user, canQueue);
            })
            .then((res) => {
                if (canQueue && Object.getPrototypeOf(res).constructor.name === 'NetworkRequest') {
                    resloveFunc(res);
                } else {
                    let err = _.get(res, 'data.error');
                    if(err != "0") {
                        reject("Error occurred executing capability:" + err);
                    } else {
                        const serverInstanceId = _.get(res, 'data.instanceId');
                        if(_.isEmpty(conversation.instanceId)) {
                            conversationContext.setInstanceId(serverInstanceId, botContext);
                        }
                        resloveFunc(res);
                    }
                }
            })
            .catch((err) => {
                console.log('Error getting the conversation context ', err);
                reject(err);
            });
    };

    const stage = {
        host: 'stage1.frontm.ai',
        protocol: 'https://'
    };

    const dev = {
        host: 'dev.frontm.ai',
        protocol: 'https://'
    };

    const local = {
        host: 'localhost:3000',
        protocol: 'http://'
    };

    const env = 'dev';

    const doNetworkCall = function(postReq, botContext, user, canQueue = false) {
        let Network = botContext.getCapability('Network');
        const Utils = botContext.getCapability('Utils');

        let options = {
            "method": "post",
            "url": getUrl(),
            "headers": getHeaders(),
            "data": postReq
        };

        function getUrl() {
            if (env === 'local') {
                return local.protocol + local.host + '/agentGuardLambda';
            } else if (env === 'dev') {
                return dev.protocol + dev.host + '/agentGuardLambda';
            }  else if(env === 'stage') {
                return stage.protocol + stage.host + '/agentGuardLambda';
            }
        }

        function getHeaders() {
            return  {
                accessKeyId: user.aws.accessKeyId,
                secretAccessKey: user.aws.secretAccessKey,
                sessionToken: user.aws.sessionToken
            };
        }

        return Network(options, canQueue);
    };

    const addConvOrInstanceIdToRequest = function(botId, conversation, postReq, _) {
        // TODO: We need a way to check if the conversation has changed (ex: added participants)
        // in that case, both the instance id and conversation details have to be sent.
        if(_.isEmpty(conversation.instanceId)) {
            postReq["conversation"] = {
                uuid : conversation.conversationId,
                bot: botId,
                participants: conversation.participants,
                onChannels: [],
                closed: false
            };
        } else {
            postReq["instanceId"] = conversation.instanceId;
        }
    };

    const getMessageContentType = function(message, botContext) {
        const MessageTypeConstants = botContext.getCapability('MessageTypeConstants');

        if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_STRING) {
          return 10;
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_IMAGE) {
          return 30;
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_VIDEO) {
          return 40;
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_AUDIO) {
          return 60;
        } else if (message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_HTML) {
          return 140;
        }
      };

      return {
          send: send,
          readData: readData,
          nlp: nlp,
          sendEmail: sendEmail,
          writeData: writeData,
          getDataAsync: getDataAsync,
          executeCustomCapability: executeCustomCapability,
          deregisterDevice: deregisterDevice,
          registerDevice: registerDevice,
          getMessageContentType: getMessageContentType
      };
})();
