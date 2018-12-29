#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Queue.pbrpc.h"
#import "Queue.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

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

#pragma mark GetMessages(QueueInput) returns (MessageList)

- (void)getMessagesWithRequest:(QueueInput *)request handler:(void(^)(MessageList *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetMessagesWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetMessagesWithRequest:(QueueInput *)request handler:(void(^)(MessageList *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[MessageList class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetStreamingMessages(QueueParams) returns (stream Message)

- (void)getStreamingMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetStreamingMessagesWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetStreamingMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, Message *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetStreamingMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[Message class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetQueueMessages(QueueParams) returns (QueueResponse)

- (void)getQueueMessagesWithRequest:(QueueParams *)request handler:(void(^)(QueueResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetQueueMessagesWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetQueueMessagesWithRequest:(QueueParams *)request handler:(void(^)(QueueResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetQueueMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[QueueResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetStreamingQueueMessages(QueueParams) returns (stream QueueMessage)

- (void)getStreamingQueueMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetStreamingQueueMessagesWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetStreamingQueueMessagesWithRequest:(QueueParams *)request eventHandler:(void(^)(BOOL done, QueueMessage *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetStreamingQueueMessages"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[QueueMessage class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
@end
#endif
