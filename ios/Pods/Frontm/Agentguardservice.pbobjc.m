// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: agentguardservice.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers_RuntimeSupport.h>
#else
 #import "GPBProtocolBuffers_RuntimeSupport.h"
#endif

#import "Agentguardservice.pbobjc.h"
// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

#pragma mark - AgentguardserviceRoot

@implementation AgentguardserviceRoot

// No extensions in the file and no imports, so no need to generate
// +extensionRegistry.

@end

#pragma mark - AgentguardserviceRoot_FileDescriptor

static GPBFileDescriptor *AgentguardserviceRoot_FileDescriptor(void) {
  // This is called by +initialize so there is no need to worry
  // about thread safety of the singleton.
  static GPBFileDescriptor *descriptor = NULL;
  if (!descriptor) {
    GPB_DEBUG_CHECK_RUNTIME_VERSIONS();
    descriptor = [[GPBFileDescriptor alloc] initWithPackage:@"agentguard"
                                                     syntax:GPBFileSyntaxProto3];
  }
  return descriptor;
}

#pragma mark - AgentGuardInput

@implementation AgentGuardInput

@dynamic hasConversation, conversation;
@dynamic capability;
@dynamic parameters;
@dynamic sync;

typedef struct AgentGuardInput__storage_ {
  uint32_t _has_storage_[1];
  Conversation *conversation;
  NSString *capability;
  NSString *parameters;
} AgentGuardInput__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "conversation",
        .dataTypeSpecific.className = GPBStringifySymbol(Conversation),
        .number = AgentGuardInput_FieldNumber_Conversation,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(AgentGuardInput__storage_, conversation),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeMessage,
      },
      {
        .name = "capability",
        .dataTypeSpecific.className = NULL,
        .number = AgentGuardInput_FieldNumber_Capability,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(AgentGuardInput__storage_, capability),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "parameters",
        .dataTypeSpecific.className = NULL,
        .number = AgentGuardInput_FieldNumber_Parameters,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(AgentGuardInput__storage_, parameters),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "sync",
        .dataTypeSpecific.className = NULL,
        .number = AgentGuardInput_FieldNumber_Sync,
        .hasIndex = 3,
        .offset = 4,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[AgentGuardInput class]
                                     rootClass:[AgentguardserviceRoot class]
                                          file:AgentguardserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(AgentGuardInput__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - Conversation

@implementation Conversation

@dynamic conversationId;
@dynamic bot;
@dynamic participantsArray, participantsArray_Count;
@dynamic onChannelsArray, onChannelsArray_Count;
@dynamic closed;

typedef struct Conversation__storage_ {
  uint32_t _has_storage_[1];
  NSString *conversationId;
  NSString *bot;
  NSMutableArray *participantsArray;
  NSMutableArray *onChannelsArray;
} Conversation__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "conversationId",
        .dataTypeSpecific.className = NULL,
        .number = Conversation_FieldNumber_ConversationId,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(Conversation__storage_, conversationId),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "bot",
        .dataTypeSpecific.className = NULL,
        .number = Conversation_FieldNumber_Bot,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(Conversation__storage_, bot),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "participantsArray",
        .dataTypeSpecific.className = NULL,
        .number = Conversation_FieldNumber_ParticipantsArray,
        .hasIndex = GPBNoHasBit,
        .offset = (uint32_t)offsetof(Conversation__storage_, participantsArray),
        .flags = GPBFieldRepeated,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "onChannelsArray",
        .dataTypeSpecific.className = GPBStringifySymbol(Channel),
        .number = Conversation_FieldNumber_OnChannelsArray,
        .hasIndex = GPBNoHasBit,
        .offset = (uint32_t)offsetof(Conversation__storage_, onChannelsArray),
        .flags = (GPBFieldFlags)(GPBFieldRepeated | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeMessage,
      },
      {
        .name = "closed",
        .dataTypeSpecific.className = NULL,
        .number = Conversation_FieldNumber_Closed,
        .hasIndex = 2,
        .offset = 3,  // Stored in _has_storage_ to save space.
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeBool,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[Conversation class]
                                     rootClass:[AgentguardserviceRoot class]
                                          file:AgentguardserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(Conversation__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\002\001\016\000\004\000onChannels\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - Channel

@implementation Channel

@dynamic channelName;
@dynamic userDomain;

typedef struct Channel__storage_ {
  uint32_t _has_storage_[1];
  NSString *channelName;
  NSString *userDomain;
} Channel__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "channelName",
        .dataTypeSpecific.className = NULL,
        .number = Channel_FieldNumber_ChannelName,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(Channel__storage_, channelName),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
      {
        .name = "userDomain",
        .dataTypeSpecific.className = NULL,
        .number = Channel_FieldNumber_UserDomain,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(Channel__storage_, userDomain),
        .flags = (GPBFieldFlags)(GPBFieldOptional | GPBFieldTextFormatNameCustom),
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[Channel class]
                                     rootClass:[AgentguardserviceRoot class]
                                          file:AgentguardserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(Channel__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
#if !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    static const char *extraTextFormatInfo =
        "\002\001\013\000\002\n\000";
    [localDescriptor setupExtraTextInfo:extraTextFormatInfo];
#endif  // !GPBOBJC_SKIP_MESSAGE_TEXTFORMAT_EXTRAS
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - AgentGuardStringResponse

@implementation AgentGuardStringResponse

@dynamic error;
@dynamic contentArray, contentArray_Count;

typedef struct AgentGuardStringResponse__storage_ {
  uint32_t _has_storage_[1];
  int32_t error;
  NSMutableArray *contentArray;
} AgentGuardStringResponse__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "error",
        .dataTypeSpecific.className = NULL,
        .number = AgentGuardStringResponse_FieldNumber_Error,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(AgentGuardStringResponse__storage_, error),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeInt32,
      },
      {
        .name = "contentArray",
        .dataTypeSpecific.className = NULL,
        .number = AgentGuardStringResponse_FieldNumber_ContentArray,
        .hasIndex = GPBNoHasBit,
        .offset = (uint32_t)offsetof(AgentGuardStringResponse__storage_, contentArray),
        .flags = GPBFieldRepeated,
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[AgentGuardStringResponse class]
                                     rootClass:[AgentguardserviceRoot class]
                                          file:AgentguardserviceRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(AgentGuardStringResponse__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end


#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)