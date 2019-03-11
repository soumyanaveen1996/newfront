#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Userservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class BotSubscriptionsResponse;
@class ContactsResponse;
@class Empty;
@class SubscribeBotInput;
@class SubscribeBotResponse;
@class SubscribeDomainInput;
@class SubscribeDomainResponse;
@class TwilioTokenInput;
@class TwilioTokenResponse;
@class UpdateUserProfileResponse;
@class User;
@class VoipStatusInput;
@class VoipStatusResponse;
@class VoipToggleResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol UserService <NSObject>

#pragma mark UpdateUserProfile(User) returns (UpdateUserProfileResponse)

- (void)updateUserProfileWithRequest:(User *)request handler:(void(^)(UpdateUserProfileResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUpdateUserProfileWithRequest:(User *)request handler:(void(^)(UpdateUserProfileResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetUserDetails(User) returns (User)

- (void)getUserDetailsWithRequest:(User *)request handler:(void(^)(User *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetUserDetailsWithRequest:(User *)request handler:(void(^)(User *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetBotSubscriptions(Empty) returns (BotSubscriptionsResponse)

- (void)getBotSubscriptionsWithRequest:(Empty *)request handler:(void(^)(BotSubscriptionsResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetBotSubscriptionsWithRequest:(Empty *)request handler:(void(^)(BotSubscriptionsResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetContacts(Empty) returns (ContactsResponse)

- (void)getContactsWithRequest:(Empty *)request handler:(void(^)(ContactsResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetContactsWithRequest:(Empty *)request handler:(void(^)(ContactsResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark SubscribeBot(SubscribeBotInput) returns (SubscribeBotResponse)

- (void)subscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToSubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark UnsubscribeBot(SubscribeBotInput) returns (SubscribeBotResponse)

- (void)unsubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUnsubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark SubscribeDomain(SubscribeDomainInput) returns (SubscribeDomainResponse)

- (void)subscribeDomainWithRequest:(SubscribeDomainInput *)request handler:(void(^)(SubscribeDomainResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToSubscribeDomainWithRequest:(SubscribeDomainInput *)request handler:(void(^)(SubscribeDomainResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark EnableVoip(Empty) returns (VoipToggleResponse)

- (void)enableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToEnableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark DisableVoip(Empty) returns (VoipToggleResponse)

- (void)disableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToDisableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetVoipStatus(VoipStatusInput) returns (VoipStatusResponse)

- (void)getVoipStatusWithRequest:(VoipStatusInput *)request handler:(void(^)(VoipStatusResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetVoipStatusWithRequest:(VoipStatusInput *)request handler:(void(^)(VoipStatusResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GenerateTwilioToken(TwilioTokenInput) returns (TwilioTokenResponse)

- (void)generateTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGenerateTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface UserService : GRPCProtoService<UserService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

