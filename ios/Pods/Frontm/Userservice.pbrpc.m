#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import "Userservice.pbrpc.h"
#import "Userservice.pbobjc.h"
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriter+Immediate.h>

#import "Commonmessages.pbobjc.h"

@implementation UserService

// Designated initializer
- (instancetype)initWithHost:(NSString *)host {
  self = [super initWithHost:host
                 packageName:@"user"
                 serviceName:@"UserService"];
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

#pragma mark UpdateUserProfile(User) returns (UpdateUserProfileResponse)

- (void)updateUserProfileWithRequest:(User *)request handler:(void(^)(UpdateUserProfileResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUpdateUserProfileWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUpdateUserProfileWithRequest:(User *)request handler:(void(^)(UpdateUserProfileResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"UpdateUserProfile"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[UpdateUserProfileResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetUserDetails(User) returns (User)

- (void)getUserDetailsWithRequest:(User *)request handler:(void(^)(User *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetUserDetailsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetUserDetailsWithRequest:(User *)request handler:(void(^)(User *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetUserDetails"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[User class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetBotSubscriptions(Empty) returns (BotSubscriptionsResponse)

- (void)getBotSubscriptionsWithRequest:(Empty *)request handler:(void(^)(BotSubscriptionsResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetBotSubscriptionsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetBotSubscriptionsWithRequest:(Empty *)request handler:(void(^)(BotSubscriptionsResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetBotSubscriptions"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[BotSubscriptionsResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetContacts(Empty) returns (ContactsResponse)

- (void)getContactsWithRequest:(Empty *)request handler:(void(^)(ContactsResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetContactsWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetContactsWithRequest:(Empty *)request handler:(void(^)(ContactsResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetContacts"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ContactsResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark SubscribeBot(SubscribeBotInput) returns (SubscribeBotResponse)

- (void)subscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToSubscribeBotWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToSubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"SubscribeBot"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SubscribeBotResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark UnsubscribeBot(SubscribeBotInput) returns (SubscribeBotResponse)

- (void)unsubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToUnsubscribeBotWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToUnsubscribeBotWithRequest:(SubscribeBotInput *)request handler:(void(^)(SubscribeBotResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"UnsubscribeBot"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SubscribeBotResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark SubscribeDomain(SubscribeDomainInput) returns (SubscribeDomainResponse)

- (void)subscribeDomainWithRequest:(SubscribeDomainInput *)request handler:(void(^)(SubscribeDomainResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToSubscribeDomainWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToSubscribeDomainWithRequest:(SubscribeDomainInput *)request handler:(void(^)(SubscribeDomainResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"SubscribeDomain"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[SubscribeDomainResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark EnableVoip(Empty) returns (VoipToggleResponse)

- (void)enableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToEnableVoipWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToEnableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"EnableVoip"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[VoipToggleResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark DisableVoip(Empty) returns (VoipToggleResponse)

- (void)disableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToDisableVoipWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToDisableVoipWithRequest:(Empty *)request handler:(void(^)(VoipToggleResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"DisableVoip"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[VoipToggleResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetVoipStatus(VoipStatusInput) returns (VoipStatusResponse)

- (void)getVoipStatusWithRequest:(VoipStatusInput *)request handler:(void(^)(VoipStatusResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetVoipStatusWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetVoipStatusWithRequest:(VoipStatusInput *)request handler:(void(^)(VoipStatusResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetVoipStatus"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[VoipStatusResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GenerateTwilioToken(TwilioTokenInput) returns (TwilioTokenResponse)

- (void)generateTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGenerateTwilioTokenWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGenerateTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GenerateTwilioToken"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[TwilioTokenResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GenerateWebTwilioToken(TwilioTokenInput) returns (TwilioTokenResponse)

- (void)generateWebTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGenerateWebTwilioTokenWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGenerateWebTwilioTokenWithRequest:(TwilioTokenInput *)request handler:(void(^)(TwilioTokenResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GenerateWebTwilioToken"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[TwilioTokenResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark ManageTnc(ManageTncInput) returns (ManageTncResponse)

- (void)manageTncWithRequest:(ManageTncInput *)request handler:(void(^)(ManageTncResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToManageTncWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToManageTncWithRequest:(ManageTncInput *)request handler:(void(^)(ManageTncResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"ManageTnc"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[ManageTncResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetCompanies(Empty) returns (CompaniesResponse)

- (void)getCompaniesWithRequest:(Empty *)request handler:(void(^)(CompaniesResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetCompaniesWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetCompaniesWithRequest:(Empty *)request handler:(void(^)(CompaniesResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetCompanies"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[CompaniesResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
#pragma mark GetCallHistory(Empty) returns (CallHistoryResponse)

- (void)getCallHistoryWithRequest:(Empty *)request handler:(void(^)(CallHistoryResponse *_Nullable response, NSError *_Nullable error))handler{
  [[self RPCToGetCallHistoryWithRequest:request handler:handler] start];
}
// Returns a not-yet-started RPC object.
- (GRPCProtoCall *)RPCToGetCallHistoryWithRequest:(Empty *)request handler:(void(^)(CallHistoryResponse *_Nullable response, NSError *_Nullable error))handler{
  return [self RPCToMethod:@"GetCallHistory"
            requestsWriter:[GRXWriter writerWithValue:request]
             responseClass:[CallHistoryResponse class]
        responsesWriteable:[GRXWriteable writeableWithSingleHandler:handler]];
}
@end
#endif
