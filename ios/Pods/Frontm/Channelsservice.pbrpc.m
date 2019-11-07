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

#pragma mark GetSubscribed(SelectedDomainInput) returns (ChannelListResponse)

- (void)getSubscribedWithRequest:(SelectedDomainInput *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetSubscribedWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetSubscribedWithRequest:(SelectedDomainInput *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetSubscribed"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ChannelListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetUnsubscribed(SelectedDomainInput) returns (ChannelListResponse)

- (void)getUnsubscribedWithRequest:(SelectedDomainInput *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetUnsubscribedWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetUnsubscribedWithRequest:(SelectedDomainInput *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler{
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
#pragma mark GetParticipants(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ParticipantsListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetPendingParticipants(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getPendingParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetPendingParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetPendingParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetPendingParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ParticipantsListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark UpdateParticipants(UpdateUsersInput) returns (BooleanResponse)

- (void)updateParticipantsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUpdateParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUpdateParticipantsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"UpdateParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark RequestPrivateChannelAccess(ChannelDomainInput) returns (BooleanResponse)

- (void)requestPrivateChannelAccessWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToRequestPrivateChannelAccessWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToRequestPrivateChannelAccessWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"RequestPrivateChannelAccess"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark AuthorizeParticipants(AuthorizeParticipantInput) returns (BooleanResponse)

- (void)authorizeParticipantsWithRequest:(AuthorizeParticipantInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToAuthorizeParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToAuthorizeParticipantsWithRequest:(AuthorizeParticipantInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"AuthorizeParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ChangeOwner(ChangeOwnerInput) returns (BooleanResponse)

- (void)changeOwnerWithRequest:(ChangeOwnerInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToChangeOwnerWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToChangeOwnerWithRequest:(ChangeOwnerInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ChangeOwner"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetChannelAdmins(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getChannelAdminsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetChannelAdminsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetChannelAdminsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetChannelAdmins"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ParticipantsListResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark UpdateChannelAdmins(UpdateUsersInput) returns (BooleanResponse)

- (void)updateChannelAdminsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUpdateChannelAdminsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUpdateChannelAdminsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"UpdateChannelAdmins"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark DeleteChannel(ChannelDomainInput) returns (BooleanResponse)

- (void)deleteChannelWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToDeleteChannelWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToDeleteChannelWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"DeleteChannel"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BooleanResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark FindNewParticipants(FindNewParticipantsInput) returns (FindNewParticipantsResponse)

- (void)findNewParticipantsWithRequest:(FindNewParticipantsInput *)request handler:(void(^)(FindNewParticipantsResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToFindNewParticipantsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToFindNewParticipantsWithRequest:(FindNewParticipantsInput *)request handler:(void(^)(FindNewParticipantsResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"FindNewParticipants"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[FindNewParticipantsResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
