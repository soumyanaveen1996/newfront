// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: agentguardservice.proto

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

@class Channel;
@class Conversation;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - AgentguardserviceRoot

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
@interface AgentguardserviceRoot : GPBRootObject
@end

#pragma mark - AgentGuardInput

typedef GPB_ENUM(AgentGuardInput_FieldNumber) {
  AgentGuardInput_FieldNumber_Conversation = 1,
  AgentGuardInput_FieldNumber_Capability = 2,
  AgentGuardInput_FieldNumber_Parameters = 3,
  AgentGuardInput_FieldNumber_Sync = 4,
};

@interface AgentGuardInput : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) Conversation *conversation;
/** Test to see if @c conversation has been set. */
@property(nonatomic, readwrite) BOOL hasConversation;

@property(nonatomic, readwrite, copy, null_resettable) NSString *capability;

@property(nonatomic, readwrite, copy, null_resettable) NSString *parameters;

@property(nonatomic, readwrite) BOOL sync;

@end

#pragma mark - Conversation

typedef GPB_ENUM(Conversation_FieldNumber) {
  Conversation_FieldNumber_ConversationId = 1,
  Conversation_FieldNumber_Bot = 2,
  Conversation_FieldNumber_ParticipantsArray = 3,
  Conversation_FieldNumber_OnChannelsArray = 4,
  Conversation_FieldNumber_Closed = 5,
};

@interface Conversation : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *bot;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *participantsArray;
/** The number of items in @c participantsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger participantsArray_Count;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<Channel*> *onChannelsArray;
/** The number of items in @c onChannelsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger onChannelsArray_Count;

@property(nonatomic, readwrite) BOOL closed;

@end

#pragma mark - Channel

typedef GPB_ENUM(Channel_FieldNumber) {
  Channel_FieldNumber_ChannelName = 1,
  Channel_FieldNumber_UserDomain = 2,
};

@interface Channel : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *channelName;

@property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

@end

#pragma mark - AgentGuardStringResponse

typedef GPB_ENUM(AgentGuardStringResponse_FieldNumber) {
  AgentGuardStringResponse_FieldNumber_Error = 1,
  AgentGuardStringResponse_FieldNumber_ContentArray = 2,
};

@interface AgentGuardStringResponse : GPBMessage

@property(nonatomic, readwrite) int32_t error;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *contentArray;
/** The number of items in @c contentArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger contentArray_Count;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)