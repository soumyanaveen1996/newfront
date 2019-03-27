//
//  UserServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UserServiceClient.h"
#import "Userservice.pbrpc.h"
#import "BotSubscriptionsResponse+frontm.h"
#import "SubscribedBotsContent+frontm.h"
#import "TwilioTokenResponse+frontm.h"
#import "VoipStatusResponse+frontm.h"
#import "User+frontm.h"
#import "UpdateUserProfileResponse+frontm.h"
#import "VoipToggleResponse+frontm.h"
#import "SubscribeBotResponse+frontm.h"
#import "SubscribeDomainResponse+frontm.h"
#import "ContactsResponse+frontm.h"
#import "PhoneNumbers+frontm.h"
#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface UserServiceClient()

@property (strong, atomic) UserService *serviceClient;

@end

@implementation UserServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[UserService alloc] initWithHost:kHostAddress];
  }
  return self;
}


RCT_REMAP_METHOD(getBotSubscriptions, getBotSubscriptionsWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetBotSubscriptionsWithRequest:[Empty new]
                         handler:^(BotSubscriptionsResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             RCTLog(@"method:getBotSubscriptions response : %@", [response toResponse]);
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(getContacts, getContactsWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getContacts Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetContactsWithRequest:[Empty new]
                         handler:^(ContactsResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }

                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(getUserDetails, getUserDetailsWithSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getUserDetails Params : %@", sessionId);

  User *user = [User new];
  user.userId = params[@"userId"];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetUserDetailsWithRequest:user handler:^(User * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(updateUserProfile, updateUserProfileWithSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:updateUserProfile Params : %@", sessionId);

  User *user = [User new];
  user.userName = params[@"userName"];
  user.emailAddress = params[@"emailAddress"];
  user.searchable = params[@"searchable"];
  user.visible = params[@"visible"];
  if (params[@"phoneNumbers"] && ![NSNull isEqual:params[@"phoneNumbers"]]) {
    user.phoneNumbers = [PhoneNumbers new];
    user.phoneNumbers.satellite = params[@"phoneNumbers"][@"satellite"];
    user.phoneNumbers.land = params[@"phoneNumbers"][@"land"];
    user.phoneNumbers.mobile = params[@"phoneNumbers"][@"mobile"];
  }

  GRPCProtoCall *call = [self.serviceClient
                         RPCToUpdateUserProfileWithRequest:user handler:^(UpdateUserProfileResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(subscribeBot, subscribeBotWithSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:subscribeBot Params : %@", sessionId);

  SubscribeBotInput *request = [SubscribeBotInput new];
  request.botId = params[@"botId"];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToSubscribeBotWithRequest:request handler:^(SubscribeBotResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(unsubscribeBot, unsubscribeBotWithSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:unsubscribeBot Params : %@", sessionId);

  SubscribeBotInput *request = [SubscribeBotInput new];
  request.botId = params[@"botId"];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToUnsubscribeBotWithRequest:request handler:^(SubscribeBotResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(subscribeDomain, subscribeDomainSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:subscribeDomain Params : %@", sessionId);

  SubscribeDomainInput *request = [SubscribeDomainInput new];
  request.verificationCode = params[@"verificationCode"];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToSubscribeDomainWithRequest:request handler:^(SubscribeDomainResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(enableVOIP, enableVOIPWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:enableVOIP Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToEnableVoipWithRequest:[Empty new] handler:^(VoipToggleResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(disableVOIP, disableVOIPWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToDisableVoipWithRequest:[Empty new] handler:^(VoipToggleResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(getVOIPStatus, getVOIPStatusWithSessionId:(NSString *)sessionId withParams:(NSDictionary *)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@ %@", sessionId, params);

  VoipStatusInput *request = [VoipStatusInput new];
  request.userId = params[@"userId"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetVoipStatusWithRequest:request handler:^(VoipStatusResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];
  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(generateTwilioToken, generateTwilioTokenWithSessionId:(NSString *)sessionId:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:generateTwilioToken Params : %@", sessionId);

  TwilioTokenInput *input = [TwilioTokenInput new];
  input.platform = @"ios";
  input.env = params[@"env"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToGenerateTwilioTokenWithRequest:input handler:^(TwilioTokenResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];
  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}



@end
