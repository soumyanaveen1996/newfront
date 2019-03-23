#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Airlinesservice.pbrpc.h"
#import "Airlinesservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>


@implementation AirlinesService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"airlines"
                 serviceName:@"AirlinesService"];
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

#pragma mark ReportStats(StatsInput) returns (StatsResponse)

- (void)reportStatsWithRequest:(StatsInput *)request handler:(void(^)(StatsResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToReportStatsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToReportStatsWithRequest:(StatsInput *)request handler:(void(^)(StatsResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ReportStats"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[StatsResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
