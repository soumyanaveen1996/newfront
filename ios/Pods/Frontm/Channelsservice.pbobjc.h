// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: channelsservice.proto

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

@class ChannelOwner;
@class DBChannel;
@class DomainChannels;
@class InputChannel;
@class ParticpantUser;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - ChannelsserviceRoot

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
@interface ChannelsserviceRoot : GPBRootObject
@end

#pragma mark - SubUnsubInput

typedef GPB_ENUM(SubUnsubInput_FieldNumber) {
  SubUnsubInput_FieldNumber_DomainChannelsArray = 1,
};

@interface SubUnsubInput : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<DomainChannels*> *domainChannelsArray;
/** The number of items in @c domainChannelsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger domainChannelsArray_Count;

@end

#pragma mark - DomainChannels

typedef GPB_ENUM(DomainChannels_FieldNumber) {
  DomainChannels_FieldNumber_UserDomain = 1,
  DomainChannels_FieldNumber_ChannelsArray = 2,
};

@interface DomainChannels : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *channelsArray;
/** The number of items in @c channelsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger channelsArray_Count;

@end

#pragma mark - AddParticipantsInput

typedef GPB_ENUM(AddParticipantsInput_FieldNumber) {
  AddParticipantsInput_FieldNumber_ChannelName = 1,
  AddParticipantsInput_FieldNumber_UserDomain = 2,
  AddParticipantsInput_FieldNumber_NewUserIdsArray = 3,
};

@interface AddParticipantsInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *newUserIdsArray NS_RETURNS_NOT_RETAINED;
/** The number of items in @c newUserIdsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger newUserIdsArray_Count;

@end

#pragma mark - CreateEditInput

typedef GPB_ENUM(CreateEditInput_FieldNumber) {
  CreateEditInput_FieldNumber_Channel = 1,
};

@interface CreateEditInput : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) InputChannel *channel;
/** Test to see if @c channel has been set. */
@property(nonatomic, readwrite) BOOL hasChannel;

@end

#pragma mark - InputChannel

typedef GPB_ENUM(InputChannel_FieldNumber) {
  InputChannel_FieldNumber_ChannelName = 1,
  InputChannel_FieldNumber_UserDomain = 2,
  InputChannel_FieldNumber_Description_p = 3,
  InputChannel_FieldNumber_ChannelType = 4,
  InputChannel_FieldNumber_Discoverable = 5,
};

@interface InputChannel : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelType;

@property(nonatomic, readwrite, copy, null_resettable) NSString *discoverable;

@end

#pragma mark - ChannelListResponse

typedef GPB_ENUM(ChannelListResponse_FieldNumber) {
  ChannelListResponse_FieldNumber_Error = 1,
  ChannelListResponse_FieldNumber_ContentArray = 2,
};

@interface ChannelListResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<DBChannel*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - DBChannel

typedef GPB_ENUM(DBChannel_FieldNumber) {
  DBChannel_FieldNumber_ChannelId = 1,
  DBChannel_FieldNumber_ChannelType = 2,
  DBChannel_FieldNumber_CreatedOn = 3,
  DBChannel_FieldNumber_ChannelName = 4,
  DBChannel_FieldNumber_UserDomain = 5,
  DBChannel_FieldNumber_ChannelOwner = 6,
  DBChannel_FieldNumber_Description_p = 7,
  DBChannel_FieldNumber_Discoverable = 8,
  DBChannel_FieldNumber_Logo = 9,
  DBChannel_FieldNumber_IsPlatformChannel = 10,
  DBChannel_FieldNumber_ParticipantsArray = 11,
  DBChannel_FieldNumber_RequestSent = 12,
  DBChannel_FieldNumber_IsFavourite = 13,
};

@interface DBChannel : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelType;

@property(nonatomic, readwrite) double createdOn;

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, strong, null_resettable) ChannelOwner *channelOwner;
/** Test to see if @c channelOwner has been set. */
@property(nonatomic, readwrite) BOOL hasChannelOwner;

@property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *discoverable;

@property(nonatomic, readwrite, copy, null_resettable) NSString *logo;

@property(nonatomic, readwrite) BOOL isPlatformChannel;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *participantsArray;
/** The number of items in @c participantsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger participantsArray_Count;

@property(nonatomic, readwrite) BOOL requestSent;

@property(nonatomic, readwrite) BOOL isFavourite;

@end

#pragma mark - ChannelOwner

typedef GPB_ENUM(ChannelOwner_FieldNumber) {
  ChannelOwner_FieldNumber_EmailAddress = 1,
  ChannelOwner_FieldNumber_UserName = 2,
  ChannelOwner_FieldNumber_UserId = 3,
};

@interface ChannelOwner : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *emailAddress;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@end

#pragma mark - BooleanResponse

typedef GPB_ENUM(BooleanResponse_FieldNumber) {
  BooleanResponse_FieldNumber_Error = 1,
  BooleanResponse_FieldNumber_ContentArray = 2,
  BooleanResponse_FieldNumber_ErrorMessage = 3,
};

@interface BooleanResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) GPBBoolArray *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@property(nonatomic, readwrite, copy, null_resettable) NSString *errorMessage;

@end

#pragma mark - CreateChannelResponse

typedef GPB_ENUM(CreateChannelResponse_FieldNumber) {
  CreateChannelResponse_FieldNumber_Error = 1,
  CreateChannelResponse_FieldNumber_ContentArray = 2,
  CreateChannelResponse_FieldNumber_ErrorMessage = 3,
};

@interface CreateChannelResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@property(nonatomic, readwrite, copy, null_resettable) NSString *errorMessage;

@end

#pragma mark - ChannelDomainInput

typedef GPB_ENUM(ChannelDomainInput_FieldNumber) {
  ChannelDomainInput_FieldNumber_ChannelName = 1,
  ChannelDomainInput_FieldNumber_UserDomain = 2,
};

@interface ChannelDomainInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@end

#pragma mark - ParticipantsListResponse

typedef GPB_ENUM(ParticipantsListResponse_FieldNumber) {
  ParticipantsListResponse_FieldNumber_Error = 1,
  ParticipantsListResponse_FieldNumber_ContentArray = 2,
};

@interface ParticipantsListResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<ParticpantUser*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

#pragma mark - ParticpantUser

typedef GPB_ENUM(ParticpantUser_FieldNumber) {
  ParticpantUser_FieldNumber_UserName = 1,
  ParticpantUser_FieldNumber_UserId = 2,
  ParticpantUser_FieldNumber_Role = 3,
};

@interface ParticpantUser : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *role;

@end

#pragma mark - UpdateUsersInput

typedef GPB_ENUM(UpdateUsersInput_FieldNumber) {
  UpdateUsersInput_FieldNumber_ChannelName = 1,
  UpdateUsersInput_FieldNumber_UserDomain = 2,
  UpdateUsersInput_FieldNumber_UserIdsArray = 3,
};

@interface UpdateUsersInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *userIdsArray;
/** The number of items in @c userIdsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger userIdsArray_Count;

@end

#pragma mark - AuthorizeParticipantInput

typedef GPB_ENUM(AuthorizeParticipantInput_FieldNumber) {
  AuthorizeParticipantInput_FieldNumber_ChannelName = 1,
  AuthorizeParticipantInput_FieldNumber_UserDomain = 2,
  AuthorizeParticipantInput_FieldNumber_AcceptedArray = 3,
  AuthorizeParticipantInput_FieldNumber_IgnoredArray = 4,
};

@interface AuthorizeParticipantInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *acceptedArray;
/** The number of items in @c acceptedArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger acceptedArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *ignoredArray;
/** The number of items in @c ignoredArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger ignoredArray_Count;

@end

#pragma mark - ChangeOwnerInput

typedef GPB_ENUM(ChangeOwnerInput_FieldNumber) {
  ChangeOwnerInput_FieldNumber_ChannelName = 1,
  ChangeOwnerInput_FieldNumber_UserDomain = 2,
  ChangeOwnerInput_FieldNumber_NewOwnerId = 3,
};

@interface ChangeOwnerInput : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@property(nonatomic, readwrite, copy, null_resettable) NSString *newOwnerId NS_RETURNS_NOT_RETAINED;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
