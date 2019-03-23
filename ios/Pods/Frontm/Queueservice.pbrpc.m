#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Queueservice.pbrpc.h"
#import "Queueservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation QueueService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"queue"
                 serviceName:@"QueueService"];
  return self;
}

// Override superclass initializer to disallow different package and service names.
- (instancetype)initWithHost:(NSString *)host
                 packageName:(NSString *)packageName
                 serviceName:(NSString *)serviceName {
  return [self initWithHost:host];
}

#pragma mark - Class Methods

+ (instancetype)serviceWithHost:(NSString *)host {
  return [[self alloc] initWithHost:host];
}

#pragma mark - Method Implementations

#pragma mark GetSampleMessages(Empty) returns (stream MessageList)

- (void)getSampleMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, MessageList *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetSampleMessagesWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetSampleMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, MessageList *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetSampleMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[MessageList class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetSampleStreamingMessages(Empty) returns (stream Message)

- (void)getSampleStreamingMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetSampleStreamingMessagesWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetSampleStreamingMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetSampleStreamingMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[Message class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetSampleBufferedMessage(Empty) returns (stream BufferMessage)

- (void)getSampleBufferedMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, BufferMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetSampleBufferedMessageWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetSampleBufferedMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, BufferMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetSampleBufferedMessage"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BufferMessage class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetAllQueueMessages(Empty) returns (stream QueueResponse)

- (void)getAllQueueMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueResponse *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetAllQueueMessagesWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetAllQueueMessagesWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueResponse *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetAllQueueMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[QueueResponse class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetStreamingQueueMessage(Empty) returns (stream QueueMessage)

- (void)getStreamingQueueMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetStreamingQueueMessageWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetStreamingQueueMessageWithRequest:(Empty *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetStreamingQueueMessage"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[QueueMessage class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
@end
#endif
