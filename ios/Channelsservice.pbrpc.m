#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Channelsservice.pbrpc.h"
#import "Channelsservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation ChannelsService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"channels"
                 serviceName:@"ChannelsService"];
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

#pragma mark GetSubscribed(Empty) returns (ChannelListResponse)

- (void)getSubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetSubscribedWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetSubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetSubscribed"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ChannelListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetUnsubscribed(Empty) returns (ChannelListResponse)

- (void)getUnsubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetUnsubscribedWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetUnsubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetUnsubscribed"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ChannelListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetOwned(Empty) returns (ChannelListResponse)

- (void)getOwnedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetOwnedWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetOwnedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetOwned"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ChannelListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Subscribe(SubUnsubInput) returns (BooleanResponse)

- (void)subscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToSubscribeWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToSubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Subscribe"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Unsubscribe(SubUnsubInput) returns (BooleanResponse)

- (void)unsubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUnsubscribeWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUnsubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Unsubscribe"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark AddParticipants(AddParticipantsInput) returns (BooleanResponse)

- (void)addParticipantsWithRequest:(AddParticipantsInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToAddParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToAddParticipantsWithRequest:(AddParticipantsInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"AddParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Create(CreateEditInput) returns (CreateChannelResponse)

- (void)createWithRequest:(CreateEditInput *)request handler:(void(^)(CreateChannelResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToCreateWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToCreateWithRequest:(CreateEditInput *)request handler:(void(^)(CreateChannelResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Create"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[CreateChannelResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Edit(CreateEditInput) returns (BooleanResponse)

- (void)editWithRequest:(CreateEditInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToEditWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToEditWithRequest:(CreateEditInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Edit"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
