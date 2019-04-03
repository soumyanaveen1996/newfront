// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: conversationservice.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers.h>
#else
 #import "GPBProtocolBuffers.h"
#endif

#if GOOGLE_PROTOBUF_OBJC_VERSION < 30002
#error This file was generated by a newer version of protoc which is incompatible with your Protocol Buffer library sources.
#endif
#if 30002 < GOOGLE_PROTOBUF_OBJC_MIN_SUPPORTED_VERSION
#error This file was generated by an older version of protoc which is incompatible with your Protocol Buffer library sources.
#endif

// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

CF_EXTERN_C_BEGIN

@class CatalogBot;
@class CatalogBotClients;
@class CatalogDependencies;
@class CatalogDependency;
@class GetArchivedMessagesContent;
@class GetConversationDetailsChannels;
@class GetConversationDetailsUser;
@class TimelineBotInfo;
@class TimelineChannels;
@class TimelineContact;
@class TimelineContent;
@class TimelineConversation;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - ConversationserviceRoot

/**
 * Exposes the extension registry for this file.
 *
 * The base class provides:
 * @code
 *   + (GPBExtensionRegistry *)extensionRegistry;
 * @endcode
 * which is a @c GPBExtensionRegistry that includes all the extensions defined by
 * this file and all files that it depends on.
 **/
@interface ConversationserviceRoot : GPBRootObject
@end

#pragma mark - UpdateFavouritesInput

typedef GPB_ENUM(UpdateFavouritesInput_FieldNumber) {
  UpdateFavouritesInput_FieldNumber_Action = 1,
  UpdateFavouritesInput_FieldNumber_UserDomain = 2,
  UpdateFavouritesInput_FieldNumber_ConversationId = 3,
  UpdateFavouritesInput_FieldNumber_ChannelName = 4,
  UpdateFavouritesInput_FieldNumber_UserId = 5,
  UpdateFavouritesInput_FieldNumber_BotId = 6,
};

@interface UpdateFavouritesInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *action;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@end

#pragma mark - UpdateFavouritesResponse

typedef GPB_ENUM(UpdateFavouritesResponse_FieldNumber) {
  UpdateFavouritesResponse_FieldNumber_Error = 1,
};

@interface UpdateFavouritesResponse : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *error;

@end

#pragma mark - TimelineResponse

typedef GPB_ENUM(TimelineResponse_FieldNumber) {
  TimelineResponse_FieldNumber_Error = 1,
  TimelineResponse_FieldNumber_Content = 2,
};

@interface TimelineResponse : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *error;

@property(nonatomic, readwrite, strong, null_resettable) TimelineContent *content;
/** Test to see if @c content has been set. */
@property(nonatomic, readwrite) BOOL hasContent;

@end

#pragma mark - TimelineContent

typedef GPB_ENUM(TimelineContent_FieldNumber) {
  TimelineContent_FieldNumber_ConversationsArray = 1,
  TimelineContent_FieldNumber_FavouritesArray = 2,
};

@interface TimelineContent : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<TimelineConversation*> *conversationsArray;
/** The number of items in @c conversationsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger conversationsArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<TimelineConversation*> *favouritesArray;
/** The number of items in @c favouritesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger favouritesArray_Count;

@end

#pragma mark - TimelineConversation

typedef GPB_ENUM(TimelineConversation_FieldNumber) {
  TimelineConversation_FieldNumber_Closed = 1,
  TimelineConversation_FieldNumber_ParticipantsArray = 2,
  TimelineConversation_FieldNumber_CreatedOn = 3,
  TimelineConversation_FieldNumber_ModifiedOn = 4,
  TimelineConversation_FieldNumber_UserDomain = 5,
  TimelineConversation_FieldNumber_ConversationId = 6,
  TimelineConversation_FieldNumber_CreatedBy = 7,
  TimelineConversation_FieldNumber_OnChannelsArray = 8,
  TimelineConversation_FieldNumber_Bot = 9,
  TimelineConversation_FieldNumber_LastMessage = 10,
  TimelineConversation_FieldNumber_Contact = 11,
};

@interface TimelineConversation : GPBMessage

@property(nonatomic, readwrite) BOOL closed;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *participantsArray;
/** The number of items in @c participantsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger participantsArray_Count;

@property(nonatomic, readwrite) double createdOn;

@property(nonatomic, readwrite) double modifiedOn;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *createdBy;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<TimelineChannels*> *onChannelsArray;
/** The number of items in @c onChannelsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger onChannelsArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) TimelineBotInfo *bot;
/** Test to see if @c bot has been set. */
@property(nonatomic, readwrite) BOOL hasBot;

@property(nonatomic, readwrite, copy, null_resettable) NSData *lastMessage;

@property(nonatomic, readwrite, strong, null_resettable) TimelineContact *contact;
/** Test to see if @c contact has been set. */
@property(nonatomic, readwrite) BOOL hasContact;

@end

#pragma mark - TimelineChannels

typedef GPB_ENUM(TimelineChannels_FieldNumber) {
  TimelineChannels_FieldNumber_ChannelName = 1,
  TimelineChannels_FieldNumber_UserDomain = 2,
};

@interface TimelineChannels : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@end

#pragma mark - TimelineBotInfo

typedef GPB_ENUM(TimelineBotInfo_FieldNumber) {
  TimelineBotInfo_FieldNumber_AllowResetConversation = 1,
  TimelineBotInfo_FieldNumber_BotName = 2,
  TimelineBotInfo_FieldNumber_LogoURL = 3,
  TimelineBotInfo_FieldNumber_Slug = 4,
  TimelineBotInfo_FieldNumber_UserDomain = 5,
  TimelineBotInfo_FieldNumber_BotURL = 6,
  TimelineBotInfo_FieldNumber_Description_p = 7,
  TimelineBotInfo_FieldNumber_BotId = 8,
  TimelineBotInfo_FieldNumber_SystemBot = 9,
};

@interface TimelineBotInfo : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *allowResetConversation;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *logoURL;

@property(nonatomic, readwrite, copy, null_resettable) NSString *slug;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botURL;

@property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@property(nonatomic, readwrite) BOOL systemBot;

@end

#pragma mark - TimelineContact

typedef GPB_ENUM(TimelineContact_FieldNumber) {
  TimelineContact_FieldNumber_Visible = 1,
  TimelineContact_FieldNumber_Searchable = 2,
  TimelineContact_FieldNumber_UserName = 3,
  TimelineContact_FieldNumber_UserId = 4,
};

@interface TimelineContact : GPBMessage

@property(nonatomic, readwrite) BOOL visible;

@property(nonatomic, readwrite) BOOL searchable;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@end

#pragma mark - CatalogResponse

typedef GPB_ENUM(CatalogResponse_FieldNumber) {
  CatalogResponse_FieldNumber_BotsArray = 1,
};

@interface CatalogResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<CatalogBot*> *botsArray;
/** The number of items in @c botsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger botsArray_Count;

@end

#pragma mark - CatalogBot

typedef GPB_ENUM(CatalogBot_FieldNumber) {
  CatalogBot_FieldNumber_BotId = 1,
  CatalogBot_FieldNumber_UserDomain = 2,
  CatalogBot_FieldNumber_AllowResetConversation = 3,
  CatalogBot_FieldNumber_BotClients = 4,
  CatalogBot_FieldNumber_BotName = 5,
  CatalogBot_FieldNumber_BotNameSearch = 6,
  CatalogBot_FieldNumber_BotURL = 7,
  CatalogBot_FieldNumber_CategoryArray = 8,
  CatalogBot_FieldNumber_Dependencies = 9,
  CatalogBot_FieldNumber_Description_p = 10,
  CatalogBot_FieldNumber_DescriptionSearch = 11,
  CatalogBot_FieldNumber_LogoURL = 12,
  CatalogBot_FieldNumber_Slug = 13,
  CatalogBot_FieldNumber_UserRolesArray = 14,
  CatalogBot_FieldNumber_Version = 15,
  CatalogBot_FieldNumber_Developer = 16,
  CatalogBot_FieldNumber_Featured = 17,
  CatalogBot_FieldNumber_SystemBot = 18,
  CatalogBot_FieldNumber_MinRequiredPlatformVersion = 19,
};

@interface CatalogBot : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *allowResetConversation;

@property(nonatomic, readwrite, strong, null_resettable) CatalogBotClients *botClients;
/** Test to see if @c botClients has been set. */
@property(nonatomic, readwrite) BOOL hasBotClients;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botNameSearch;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botURL;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *categoryArray;
/** The number of items in @c categoryArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger categoryArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependencies *dependencies;
/** Test to see if @c dependencies has been set. */
@property(nonatomic, readwrite) BOOL hasDependencies;

@property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *descriptionSearch;

@property(nonatomic, readwrite, copy, null_resettable) NSString *logoURL;

@property(nonatomic, readwrite, copy, null_resettable) NSString *slug;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *userRolesArray;
/** The number of items in @c userRolesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger userRolesArray_Count;

@property(nonatomic, readwrite, copy, null_resettable) NSString *version;

@property(nonatomic, readwrite, copy, null_resettable) NSString *developer;

@property(nonatomic, readwrite) BOOL featured;

@property(nonatomic, readwrite) BOOL systemBot;

@property(nonatomic, readwrite, copy, null_resettable) NSString *minRequiredPlatformVersion;

@end

#pragma mark - CatalogBotClients

typedef GPB_ENUM(CatalogBotClients_FieldNumber) {
  CatalogBotClients_FieldNumber_Mobile = 1,
  CatalogBotClients_FieldNumber_Web = 2,
};

@interface CatalogBotClients : GPBMessage

@property(nonatomic, readwrite) BOOL mobile;

@property(nonatomic, readwrite) BOOL web;

@end

#pragma mark - CatalogDependencies

typedef GPB_ENUM(CatalogDependencies_FieldNumber) {
  CatalogDependencies_FieldNumber_AgentGuardService = 1,
  CatalogDependencies_FieldNumber_AuthContext = 2,
  CatalogDependencies_FieldNumber_ArchiveUtils = 3,
  CatalogDependencies_FieldNumber_BotUtils = 4,
  CatalogDependencies_FieldNumber_AutoRenewConversationContext = 5,
};

@interface CatalogDependencies : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependency *agentGuardService;
/** Test to see if @c agentGuardService has been set. */
@property(nonatomic, readwrite) BOOL hasAgentGuardService;

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependency *authContext;
/** Test to see if @c authContext has been set. */
@property(nonatomic, readwrite) BOOL hasAuthContext;

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependency *archiveUtils;
/** Test to see if @c archiveUtils has been set. */
@property(nonatomic, readwrite) BOOL hasArchiveUtils;

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependency *botUtils;
/** Test to see if @c botUtils has been set. */
@property(nonatomic, readwrite) BOOL hasBotUtils;

@property(nonatomic, readwrite, strong, null_resettable) CatalogDependency *autoRenewConversationContext;
/** Test to see if @c autoRenewConversationContext has been set. */
@property(nonatomic, readwrite) BOOL hasAutoRenewConversationContext;

@end

#pragma mark - CatalogDependency

typedef GPB_ENUM(CatalogDependency_FieldNumber) {
  CatalogDependency_FieldNumber_Remote = 1,
  CatalogDependency_FieldNumber_Version = 2,
  CatalogDependency_FieldNumber_URL = 3,
};

@interface CatalogDependency : GPBMessage

@property(nonatomic, readwrite) BOOL remote;

@property(nonatomic, readwrite, copy, null_resettable) NSString *version;

@property(nonatomic, readwrite, copy, null_resettable) NSString *URL;

@end

#pragma mark - GetConversationDetailsInput

typedef GPB_ENUM(GetConversationDetailsInput_FieldNumber) {
  GetConversationDetailsInput_FieldNumber_ConversationId = 1,
  GetConversationDetailsInput_FieldNumber_BotId = 2,
  GetConversationDetailsInput_FieldNumber_CreatedBy = 3,
};

@interface GetConversationDetailsInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *createdBy;

@end

#pragma mark - GetConversationDetailsResponse

typedef GPB_ENUM(GetConversationDetailsResponse_FieldNumber) {
  GetConversationDetailsResponse_FieldNumber_OnChannelsArray = 1,
  GetConversationDetailsResponse_FieldNumber_ConversationOwner = 2,
  GetConversationDetailsResponse_FieldNumber_ParticipantsArray = 3,
  GetConversationDetailsResponse_FieldNumber_Error = 4,
};

@interface GetConversationDetailsResponse : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GetConversationDetailsChannels*> *onChannelsArray;
/** The number of items in @c onChannelsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger onChannelsArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) GetConversationDetailsUser *conversationOwner;
/** Test to see if @c conversationOwner has been set. */
@property(nonatomic, readwrite) BOOL hasConversationOwner;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GetConversationDetailsUser*> *participantsArray;
/** The number of items in @c participantsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger participantsArray_Count;

@property(nonatomic, readwrite) int32_t error;

@end

#pragma mark - GetConversationDetailsUser

typedef GPB_ENUM(GetConversationDetailsUser_FieldNumber) {
  GetConversationDetailsUser_FieldNumber_UserId = 1,
  GetConversationDetailsUser_FieldNumber_UserName = 2,
};

@interface GetConversationDetailsUser : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@end

#pragma mark - GetConversationDetailsChannels

typedef GPB_ENUM(GetConversationDetailsChannels_FieldNumber) {
  GetConversationDetailsChannels_FieldNumber_ChannelName = 1,
  GetConversationDetailsChannels_FieldNumber_UserDomain = 2,
  GetConversationDetailsChannels_FieldNumber_ChannelId = 3,
  GetConversationDetailsChannels_FieldNumber_Description_p = 4,
  GetConversationDetailsChannels_FieldNumber_Logo = 5,
};

@interface GetConversationDetailsChannels : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *logo;

@end

#pragma mark - GetArchivedMessagesInput

typedef GPB_ENUM(GetArchivedMessagesInput_FieldNumber) {
  GetArchivedMessagesInput_FieldNumber_ConversationId = 1,
  GetArchivedMessagesInput_FieldNumber_BotId = 2,
};

@interface GetArchivedMessagesInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

@end

#pragma mark - GetArchivedMessagesResponse

typedef GPB_ENUM(GetArchivedMessagesResponse_FieldNumber) {
  GetArchivedMessagesResponse_FieldNumber_Error = 1,
  GetArchivedMessagesResponse_FieldNumber_ContentArray = 2,
};

@interface GetArchivedMessagesResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GetArchivedMessagesContent*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - GetArchivedMessagesContent

typedef GPB_ENUM(GetArchivedMessagesContent_FieldNumber) {
  GetArchivedMessagesContent_FieldNumber_MessageId = 1,
  GetArchivedMessagesContent_FieldNumber_ContentType = 2,
  GetArchivedMessagesContent_FieldNumber_CreatedOn = 3,
  GetArchivedMessagesContent_FieldNumber_CreatedBy = 4,
  GetArchivedMessagesContent_FieldNumber_Content = 5,
  GetArchivedMessagesContent_FieldNumber_Options = 6,
};

@interface GetArchivedMessagesContent : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *messageId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *contentType;

@property(nonatomic, readwrite) double createdOn;

@property(nonatomic, readwrite, copy, null_resettable) NSString *createdBy;

@property(nonatomic, readwrite, copy, null_resettable) NSData *content;

@property(nonatomic, readwrite, copy, null_resettable) NSData *options;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
