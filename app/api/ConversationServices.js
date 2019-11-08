import { Auth } from '../lib/capability';
import { NativeModules, Platform } from 'react-native';

const ConversationServiceClient = NativeModules.ConversationServiceClient;

export default class ConversationServices {
    static getPaginatedArchivedMessages(conversationId, botId, startTime) {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                console.log('>>>>>>>', conversationId, botId, startTime);
                ConversationServiceClient.getPaginatedArchivedMessages(
                    user.creds.sessionId,
                    {
                        conversationId: conversationId,
                        botId: botId,
                        startTime: startTime
                    },
                    (error, result) => {
                        console.log(
                            'GRPC:::grpcGetPaginatedArchivedMessages : ',
                            error,
                            result
                        );
                        if (error || result.data.error !== 0) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            resolve({
                                moreMessagesExist:
                                    result.data.moreMessagesExist,
                                messages: result.data.content
                            });
                        }
                    }
                );
            });
        });
    }

    static getArchivedMessages(conversationId, botId) {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                ConversationServiceClient.getArchivedMessages(
                    user.creds.sessionId,
                    { conversationId: conversationId, botId: botId },
                    (error, result) => {
                        console.log(
                            'GRPC:::grpcGetArchivedMessages : ',
                            error,
                            result
                        );
                        if (error) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            resolve(result.data.content);
                        }
                    }
                );
            });
        });
    }
}
