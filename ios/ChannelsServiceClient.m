//
//  ChannelsServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ChannelsServiceClient.h"
#import "Channelsservice.pbrpc.h"
#import "ChannelListResponse+frontm.h"
#import "BooleanResponse+frontm.h"
#import "CreateChannelResponse+frontm.h"
#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface ChannelsServiceClient()

@property (strong, atomic) ChannelsService *serviceClient;

@end

@implementation ChannelsServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[ChannelsService alloc] initWithHost:kHostAddress];
  }
  return self;
}


RCT_REMAP_METHOD(getSubscribed, getSubscribedWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetSubscribedWithRequest:[Empty new] handler:^(ChannelListResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(getUnsubscribed, getUnsubscribedWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetUnsubscribedWithRequest:[Empty new] handler:^(ChannelListResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(getOwned, getOwnedWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetOwnedWithRequest:[Empty new] handler:^(ChannelListResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(subscribe, subscribeWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  SubUnsubInput *input = [SubUnsubInput new];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToSubscribeWithRequest:input handler:^(BooleanResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(unsubscribe, unsubscribeWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  SubUnsubInput *input = [SubUnsubInput new];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToUnsubscribeWithRequest:input handler:^(BooleanResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(addParticipants, addParticipantsWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  AddParticipantsInput *input = [AddParticipantsInput new];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToAddParticipantsWithRequest:input handler:^(BooleanResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(create, createWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  CreateEditInput *input = [CreateEditInput new];

  GRPCProtoCall *call = [self.serviceClient
                         RPCToCreateWithRequest:input handler:^(CreateChannelResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(edit, editWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  CreateEditInput *input = [CreateEditInput new];

  GRPCProtoCall *call = [self.serviceClient RPCToEditWithRequest:input handler:^(BooleanResponse * _Nullable response, NSError * _Nullable error) {
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