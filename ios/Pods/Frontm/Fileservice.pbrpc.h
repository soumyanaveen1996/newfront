#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Fileservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class GetFileInput;
@class GetFileResponse;
@class GetInformationResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol FileService <NSObject>

#pragma mark GetFile(GetFileInput) returns (stream GetFileResponse)

- (void)getFileWithRequest:(GetFileInput *)request eventHandler:(void(^)(BOOL done, GetFileResponse *_Nullable response, NSError *_Nullable error))eventHandler;

- (GRPCProtoCall *)RPCToGetFileWithRequest:(GetFileInput *)request eventHandler:(void(^)(BOOL done, GetFileResponse *_Nullable response, NSError *_Nullable error))eventHandler;


#pragma mark GetInformation(GetFileInput) returns (GetInformationResponse)

- (void)getInformationWithRequest:(GetFileInput *)request handler:(void(^)(GetInformationResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetInformationWithRequest:(GetFileInput *)request handler:(void(^)(GetInformationResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface FileService : GRPCProtoService<FileService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

