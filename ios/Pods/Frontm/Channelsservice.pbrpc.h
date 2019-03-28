#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Channelsservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class AddParticipantsInput;
@class AuthorizeParticipantInput;
@class BooleanResponse;
@class ChangeOwnerInput;
@class ChannelDomainInput;
@class ChannelListResponse;
@class CreateChannelResponse;
@class CreateEditInput;
@class Empty;
@class ParticipantsListResponse;
@class SubUnsubInput;
@class UpdateUsersInput;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol ChannelsService <NSObject>

#pragma mark GetSubscribed(Empty) returns (ChannelListResponse)

- (void)getSubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetSubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetUnsubscribed(Empty) returns (ChannelListResponse)

- (void)getUnsubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetUnsubscribedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetOwned(Empty) returns (ChannelListResponse)

- (void)getOwnedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetOwnedWithRequest:(Empty *)request handler:(void(^)(ChannelListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Subscribe(SubUnsubInput) returns (BooleanResponse)

- (void)subscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToSubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Unsubscribe(SubUnsubInput) returns (BooleanResponse)

- (void)unsubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUnsubscribeWithRequest:(SubUnsubInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark AddParticipants(AddParticipantsInput) returns (BooleanResponse)

- (void)addParticipantsWithRequest:(AddParticipantsInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToAddParticipantsWithRequest:(AddParticipantsInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Create(CreateEditInput) returns (CreateChannelResponse)

- (void)createWithRequest:(CreateEditInput *)request handler:(void(^)(CreateChannelResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToCreateWithRequest:(CreateEditInput *)request handler:(void(^)(CreateChannelResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark Edit(CreateEditInput) returns (BooleanResponse)

- (void)editWithRequest:(CreateEditInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToEditWithRequest:(CreateEditInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetParticipants(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetPendingParticipants(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getPendingParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetPendingParticipantsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark UpdateParticipants(UpdateUsersInput) returns (BooleanResponse)

- (void)updateParticipantsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUpdateParticipantsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark RequestPrivateChannelAccess(ChannelDomainInput) returns (BooleanResponse)

- (void)requestPrivateChannelAccessWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToRequestPrivateChannelAccessWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark AuthorizeParticipants(AuthorizeParticipantInput) returns (BooleanResponse)

- (void)authorizeParticipantsWithRequest:(AuthorizeParticipantInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToAuthorizeParticipantsWithRequest:(AuthorizeParticipantInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ChangeOwner(ChangeOwnerInput) returns (BooleanResponse)

- (void)changeOwnerWithRequest:(ChangeOwnerInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToChangeOwnerWithRequest:(ChangeOwnerInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetChannelAdmins(ChannelDomainInput) returns (ParticipantsListResponse)

- (void)getChannelAdminsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetChannelAdminsWithRequest:(ChannelDomainInput *)request handler:(void(^)(ParticipantsListResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark UpdateChannelAdmins(UpdateUsersInput) returns (BooleanResponse)

- (void)updateChannelAdminsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUpdateChannelAdminsWithRequest:(UpdateUsersInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark DeleteChannel(ChannelDomainInput) returns (BooleanResponse)

- (void)deleteChannelWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToDeleteChannelWithRequest:(ChannelDomainInput *)request handler:(void(^)(BooleanResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface ChannelsService : GRPCProtoService<ChannelsService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

