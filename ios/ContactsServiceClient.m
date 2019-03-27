//
//  ContactsServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ContactsServiceClient.h"
#import "Contactsservice.pbrpc.h"
#import "AgentGuardBoolResponse+frontm.h"
#import "FindResponse+frontm.h"
#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface ContactsServiceClient()

@property (strong, atomic) ContactsService *serviceClient;

@end

@implementation ContactsServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[ContactsService alloc] initWithHost:kHostAddress];
  }
  return self;
}


RCT_REMAP_METHOD(find, findWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:find Params : %@", sessionId);

  SearchQuery *query = [SearchQuery new];
  query.queryString = params[@"queryString"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToFindWithRequest:query handler:^(FindResponse * _Nullable response, NSError * _Nullable error) {
                           if (error != nil) {
                             callback(@[@{}, [NSNull null]]);
                             return;
                           } else {
                             RCTLog(@"GRPC:::ContactService method:find Response : %@", [response toResponse]);
                             callback(@[[NSNull null], [response toResponse]]);
                           }
                         }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}

RCT_REMAP_METHOD(add, addWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService  method:add Params : %@", sessionId);

  UserIdList *idList = [UserIdList new];
  idList.userIdsArray = params[@"userIds"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToAddWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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


RCT_REMAP_METHOD(accept, acceptWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:accept Params : %@", sessionId);

  UserIdList *idList = [UserIdList new];
  idList.userIdsArray = params[@"userIds"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToAcceptWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(remove, removeWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:remove Params : %@", sessionId);

  UserIdList *idList = [UserIdList new];
  idList.userIdsArray = params[@"userIds"];
  GRPCProtoCall *call = [self.serviceClient
                         RPCToRemoveWithRequest:idList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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

RCT_REMAP_METHOD(invite, inviteWithSessionId:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC:::ContactService method:invite Params : %@", sessionId);

  EmailIdList *emailIdsList = [EmailIdList new];
  emailIdsList.emailIdsArray = params[@"emailIds"];
  
  GRPCProtoCall *call = [self.serviceClient
                         RPCToInviteWithRequest:emailIdsList handler:^(AgentGuardBoolResponse * _Nullable response, NSError * _Nullable error) {
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
