#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Agentguardservice.pbrpc.h"
#import "Agentguardservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>


@implementation AgentGuardService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"agentguard"
                 serviceName:@"AgentGuardService"];
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

#pragma mark Execute(AgentGuardInput) returns (AgentGuardStringResponse)

- (void)executeWithRequest:(AgentGuardInput *)request handler:(void(^)(AgentGuardStringResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToExecuteWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToExecuteWithRequest:(AgentGuardInput *)request handler:(void(^)(AgentGuardStringResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Execute"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[AgentGuardStringResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
