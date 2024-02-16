import { NativeModules, Platform } from 'react-native';
import { Auth } from '../lib/capability';

import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class ConversationServices {
    // rpc UpdateFavourites (UpdateFavouritesInput) returns (UpdateFavouritesResponse) {}
    static updateFavourites = ({
        conversationId,
        botId,
        action,
        userId,
        userDomain,
        channelName
    }) => {
        return apiClient().post(
            'conversation.ConversationService/UpdateFavourites',
            {
                ...{
                    conversationId,
                    botId,
                    action,
                    userId,
                    userDomain,
                    channelName
                },
                ...getBaseParams()
            }
        );
    };

    // rpc GetTimeline (TimeLineInput) returns (TimelineResponse) {}
    static getTimeline = (params) => {
        return apiClient().post(
            'conversation.ConversationService/GetTimeline',
            params
        );
    };

    // rpc GetCatalog (CatalogInput) returns (CatalogResponse) {}
    static getCatalog = (params) => {
        return apiClient().post(
            'conversation.ConversationService/GetCatalog',
            params
        );
    };
    // rpc GetConversationDetails (GetConversationDetailsInput) returns (GetConversationDetailsResponse) {}
    static getConversationDetails = (params) => {
        return apiClient().post(
            'conversation.ConversationService/GetConversationDetails',
            { ...params, ...getBaseParams() }
        );
    };

    // rpc GetPaginatedArchivedMessages (GetPaginatedArchivedMessagesInput) returns (GetPaginatedArchivedMessagesResponse) {}
    static getPaginatedArchivedMessages = (params) => {
        return apiClient().post(
            'conversation.ConversationService/GetPaginatedArchivedMessages',
            params
        );
    };
    //DOne till here

    // rpc GetArchivedMessages (GetArchivedMessagesInput) returns (GetArchivedMessagesResponse) {}
    static getArchivedMessages = (conversationId, botId) => {
        return apiClient().post(
            'conversation.ConversationService/GetArchivedMessages',
            { conversationId, botId }
        );
    };
    // rpc ResetConversation (ResetConversationInput) returns (commonmessages.Empty) {}
    static resetConversation = (params) => {
        return apiClient().post(
            'conversation.ConversationService/ResetConversation',
            params
        );
    };
    // rpc GetFavouriteConversations (commonmessages.SelectedDomainInput) returns (FavouritesResponse) {}
    static getFavouriteConversations = (params) => {
        return apiClient().post(
            'conversation.ConversationService/GetFavouriteConversations',
            params
        );
    };
    // rpc UpdateMessageStatusForUser(MessageStatusInput) returns (MessageStatusResponse) {}
    static updateMessageStatus = (
        conversationId,
        messageIdsArray,
        action,
        user,
        userDomain
    ) => {
        return apiClient().post(
            'conversation.ConversationService/UpdateMessageStatusForUser',
            {
                conversationId,
                action,
                user,
                userDomain,
                messageIds: messageIdsArray
            }
        );
    };
}
