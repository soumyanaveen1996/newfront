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
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(getContacts, getContactsWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  User *user = [User new];
  user.userId = params[@"userId"];

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

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

RCT_REMAP_METHOD(generateTwilioToken, generateTwilioTokenWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  TwilioTokenInput *input = [TwilioTokenInput new];
  input.platform = @"ios";
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
