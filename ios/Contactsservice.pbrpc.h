#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Contactsservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class AgentGuardBoolResponse;
@class EmailIdList;
@class FindResponse;
@class SearchQuery;
@class UserIdList;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol ContactsService <NSObject>

#pragma mark Find(SearchQuery) returns (FindResponse)

- (void)findWithRequest:(SearchQuery *)request handler:(void(^)(FindResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToFindWithRequest:(SearchQuery *)request handler:(void(^)(FindResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Add(UserIdList) returns (AgentGuardBoolResponse)

- (void)addWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToAddWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Accept(UserIdList) returns (AgentGuardBoolResponse)

- (void)acceptWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToAcceptWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Remove(UserIdList) returns (AgentGuardBoolResponse)

- (void)removeWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToRemoveWithRequest:(UserIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Invite(EmailIdList) returns (AgentGuardBoolResponse)

- (void)inviteWithRequest:(EmailIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToInviteWithRequest:(EmailIdList *)request handler:(void(^)(AgentGuardBoolResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface ContactsService : GRPCProtoService<ContactsService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

