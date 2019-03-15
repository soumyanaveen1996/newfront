#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Pingservice.pbrpc.h"
#import "Pingservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation PingService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"ping"
                 serviceName:@"PingService"];
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

#pragma mark Ping(Empty) returns (PingReply)

- (void)pingWithRequest:(Empty *)request handler:(void(^)(PingReply *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToPingWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToPingWithRequest:(Empty *)request handler:(void(^)(PingReply *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"Ping"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[PingReply class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
