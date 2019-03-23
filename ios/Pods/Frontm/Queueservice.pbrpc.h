#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Queueservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class BufferMessage;
@class Empty;
@class Message;
@class MessageList;
@class QueueMessage;
@class QueueResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol QueueService <NSObject>

#pragma mark GetSampleMessages(Empty) returns (stream MessageList)

- (void)getSampleMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, MessageList *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetSampleMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, MessageList *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetSampleStreamingMessages(Empty) returns (stream Message)

- (void)getSampleStreamingMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetSampleStreamingMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetSampleBufferedMessage(Empty) returns (stream BufferMessage)

- (void)getSampleBufferedMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, BufferMessage *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetSampleBufferedMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, BufferMessage *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetAllQueueMessages(Empty) returns (stream QueueResponse)

- (void)getAllQueueMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueResponse *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetAllQueueMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueResponse *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetStreamingQueueMessage(Empty) returns (stream QueueMessage)

- (void)getStreamingQueueMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetStreamingQueueMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler;


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

