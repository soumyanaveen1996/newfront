#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Initial.pbrpc.h"
#import "Initial.pbobjc.h"
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

@implementation FirstService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"helloworld"
                 serviceName:@"FirstService"];
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

#pragma mark SayHello(HelloRequest) returns (HelloReply)

- (void)sayHelloWithRequest:(HelloRequest *)request handler:(void(^)(HelloReply *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToSayHelloWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToSayHelloWithRequest:(HelloRequest *)request handler:(void(^)(HelloReply *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"SayHello"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[HelloReply class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
