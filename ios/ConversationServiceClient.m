//
//  ConversationServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ConversationServiceClient.h"
#import "Conversationservice.pbrpc.h"
#import "CatalogResponse+frontm.h"
#import "GetConversationDetailsResponse+frontm.h"
#import "TimelineResponse+frontm.h"
#import "GetArchivedMessagesResponse+frontm.h"
#import "UpdateFavouritesResponse+frontm.h"
#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface ConversationServiceClient()

@property (strong, atomic) ConversationService *serviceClient;

@end

@implementation ConversationServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[ConversationService alloc] initWithHost:kHostAddress];
  }
  return self;
}

RCT_REMAP_METHOD(getCatalog, getCatalogWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getCatalog Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient RPCToGetCatalogWithRequest:[Empty new] handler:^(CatalogResponse * _Nullable response, NSError * _Nullable error) {
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      RCTLog(@"method:getCatalog response Params : %@", [response toResponse]);
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}


RCT_REMAP_METHOD(getConversationDetails, getConversationDetailsWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getConversationDetails Params : %@", sessionId);

  GetConversationDetailsInput *input = [GetConversationDetailsInput new];
  input.conversationId = params[@"conversationId"];
  input.botId = params[@"botId"];
  input.createdBy = params[@"createdBy"];


  GRPCProtoCall *call = [self.serviceClient
                         RPCToGetConversationDetailsWithRequest:input handler:^(GetConversationDetailsResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             RCTLog(@"method:getConversationDetails Response : %@", sessionId);
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}


RCT_REMAP_METHOD(updateFavorites, updateFavoritesWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:updateFavorites Params : %@", sessionId);

  UpdateFavouritesInput *input = [UpdateFavouritesInput new];
  input.action = params[@"action"];
  input.userDomain = params[@"userDomain"];
  input.conversationId = params[@"conversationId"];
  input.channelName = params[@"channelName"];
  input.userId = params[@"userId"];
  input.botId = params[@"botId"];


  GRPCProtoCall *call = [self.serviceClient RPCToUpdateFavouritesWithRequest:input handler:^(UpdateFavouritesResponse * _Nullable response, NSError * _Nullable error) {
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


RCT_REMAP_METHOD(getTimeline, getTimelineWithSessionId:(NSString *)sessionId andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getTimeline Params : %@", sessionId);

  GRPCProtoCall *call = [self.serviceClient RPCToGetTimelineWithRequest:[Empty new] handler:^(TimelineResponse * _Nullable response, NSError * _Nullable error) {
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      RCTLog(@"method:getTimeline Response : %@", [response toResponse]);
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(getArchivedMessages, getArchivedMessagesWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getArchivedMessages Params : %@", sessionId);

  GetArchivedMessagesInput *input = [GetArchivedMessagesInput new];
  input.conversationId = params[@"conversationId"];
  input.botId = params[@"botId"];


  GRPCProtoCall *call = [self.serviceClient RPCToGetArchivedMessagesWithRequest:input handler:^(GetArchivedMessagesResponse * _Nullable response, NSError * _Nullable error) {
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
