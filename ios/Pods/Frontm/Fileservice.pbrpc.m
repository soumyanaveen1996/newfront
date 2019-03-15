#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Fileservice.pbrpc.h"
#import "Fileservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>


@implementation FileService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"file"
                 serviceName:@"FileService"];
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

#pragma mark GetFile(GetFileInput) returns (stream GetFileResponse)

- (void)getFileWithRequest:(GetFileInput *)request eventHandler:(void(^)(BOOL done, GetFileResponse *_Nullable response, NSError *_Nullable error))eventHandler{
  [[self RPCToGetFileWithRequest:request eventHandler:eventHandler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetFileWithRequest:(GetFileInput *)request eventHandler:(void(^)(BOOL done, GetFileResponse *_Nullable response, NSError *_Nullable error))eventHandler{
  return [self RPCToMethod:@"GetFile"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[GetFileResponse class]
        responsesWriteable:[GRXWriteable writeableWithEventHandler:eventHandler]];
}
#pragma mark GetInformation(GetFileInput) returns (GetInformationResponse)

- (void)getInformationWithRequest:(GetFileInput *)request handler:(void(^)(GetInformationResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetInformationWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetInformationWithRequest:(GetFileInput *)request handler:(void(^)(GetInformationResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetInformation"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[GetInformationResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
