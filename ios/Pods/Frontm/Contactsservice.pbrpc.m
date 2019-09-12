#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Contactsservice.pbrpc.h"
#import "Contactsservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation ContactsService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"contacts"
                 serviceName:@"ContactsService"];
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

#pragma mark Find(SearchQuery) returns (FindResponse)

- (void)findWithRequest:(SearchQuery *)request handler:(void(^)(FindResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToFindWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToFindWithRequest:(SearchQuery *)request handler:(void(^)(FindResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Find"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[FindResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Add(ContactsInput) returns (AgentGuardBoolResponse)

- (void)addWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToAddWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToAddWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Add"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Accept(ContactsInput) returns (AgentGuardBoolResponse)

- (void)acceptWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToAcceptWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToAcceptWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Accept"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Ignore(ContactsInput) returns (AgentGuardBoolResponse)

- (void)ignoreWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToIgnoreWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToIgnoreWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Ignore"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Remove(ContactsInput) returns (AgentGuardBoolResponse)

- (void)removeWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToRemoveWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToRemoveWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Remove"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Invite(EmailIdList) returns (AgentGuardBoolResponse)

- (void)inviteWithRequest:(EmailIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToInviteWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToInviteWithRequest:(EmailIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Invite"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark Update(ContactsInput) returns (AgentGuardBoolResponse)

- (void)updateWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUpdateWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUpdateWithRequest:(ContactsInput *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Update"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardBoolResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
