#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Queue.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class Message;
@class MessageList;
@class QueueInput;
@class QueueMessage;
@class QueueParams;
@class QueueResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#if defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS) && GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
  #import <Protobuf/Struct.pbobjc.h>
#else
  #import "google/protobuf/Struct.pbobjc.h"
#endif
#if defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS) && GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
  #import <Protobuf/Any.pbobjc.h>
#else
  #import "google/protobuf/Any.pbobjc.h"
#endif
#if defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS) && GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
  #import <Protobuf/Timestamp.pbobjc.h>
#else
  #import "google/protobuf/Timestamp.pbobjc.h"
#endif
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol QueueService <NSObject>

#pragma mark GetMessages(QueueInput) returns (MessageList)

- (void)getMessagesWithRequest:(QueueInput *)request handler:(void(^)(MessageList *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetMessagesWithRequest:(QueueInput *)request handler:(void(^)(MessageList *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetStreamingMessages(QueueParams) returns (stream Message)

- (void)getStreamingMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetStreamingMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetQueueMessages(QueueParams) returns (QueueResponse)

- (void)getQueueMessagesWithRequest:(QueueParams *)request handler:(void(^)(QueueResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetQueueMessagesWithRequest:(QueueParams *)request handler:(void(^)(QueueResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetStreamingQueueMessages(QueueParams) returns (stream QueueMessage)

- (void)getStreamingQueueMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetStreamingQueueMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface QueueService : GRPCProtoService<QueueService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

