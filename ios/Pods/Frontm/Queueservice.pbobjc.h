// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: queueservice.proto

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

@class Message;
@class QueueMessage;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - QueueserviceRoot

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
@interface QueueserviceRoot : GPBRootObject
@end

#pragma mark - Message

typedef GPB_ENUM(Message_FieldNumber) {
  Message_FieldNumber_Id_p = 1,
  Message_FieldNumber_Content = 2,
};

@interface Message : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *id_p;

@property(nonatomic, readwrite, copy, null_resettable) NSString *content;

@end

#pragma mark - BufferMessage

typedef GPB_ENUM(BufferMessage_FieldNumber) {
  BufferMessage_FieldNumber_Message = 1,
};

@interface BufferMessage : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSData *message;

@end

#pragma mark - MessageList

typedef GPB_ENUM(MessageList_FieldNumber) {
  MessageList_FieldNumber_MessagesArray = 1,
};

@interface MessageList : GPBMessage

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<Message*> *messagesArray;
/** The number of items in @c messagesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger messagesArray_Count;

@end

#pragma mark - QueueResponse

typedef GPB_ENUM(QueueResponse_FieldNumber) {
  QueueResponse_FieldNumber_OnSatellite = 1,
  QueueResponse_FieldNumber_QueueMsgsArray = 2,
  QueueResponse_FieldNumber_ErrorMessage = 3,
  QueueResponse_FieldNumber_Error = 4,
};

@interface QueueResponse : GPBMessage

@property(nonatomic, readwrite) BOOL onSatellite;

@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<QueueMessage*> *queueMsgsArray;
/** The number of items in @c queueMsgsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger queueMsgsArray_Count;

@property(nonatomic, readwrite, copy, null_resettable) NSString *errorMessage;

@property(nonatomic, readwrite, copy, null_resettable) NSString *error;

@end

#pragma mark - QueueMessage

typedef GPB_ENUM(QueueMessage_FieldNumber) {
  QueueMessage_FieldNumber_UserId = 1,
  QueueMessage_FieldNumber_Conversation = 2,
  QueueMessage_FieldNumber_Bot = 3,
  QueueMessage_FieldNumber_CreatedOn = 4,
  QueueMessage_FieldNumber_CreatedBy = 5,
  QueueMessage_FieldNumber_ContentType = 6,
  QueueMessage_FieldNumber_MessageId = 7,
  QueueMessage_FieldNumber_RequestUuid = 8,
  QueueMessage_FieldNumber_Details = 9,
  QueueMessage_FieldNumber_Error = 10,
};

@interface QueueMessage : GPBMessage

@property(nonatomic, readwrite, copy, null_resettable) NSString *userId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *conversation;

@property(nonatomic, readwrite, copy, null_resettable) NSString *bot;

@property(nonatomic, readwrite) int32_t createdOn;

@property(nonatomic, readwrite, copy, null_resettable) NSString *createdBy;

@property(nonatomic, readwrite) int32_t contentType;

@property(nonatomic, readwrite, copy, null_resettable) NSString *messageId;

@property(nonatomic, readwrite, copy, null_resettable) NSString *requestUuid;

@property(nonatomic, readwrite, copy, null_resettable) NSData *details;

@property(nonatomic, readwrite, copy, null_resettable) NSString *error;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)