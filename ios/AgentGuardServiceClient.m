//
//  AgentGuardServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AgentGuardServiceClient.h"
#import "Agentguardservice.pbrpc.h"
#import "Conversation+frontm.h"
#import "AgentGuardStringResponse+frontm.h"

#import <React/RCTLog.h>

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@interface AgentGuardServiceClient()

@property (strong, atomic) AgentGuardService *serviceClient;

@end

@implementation AgentGuardServiceClient

@synthesize serviceClient = _serviceClient;

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(execute, execute:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"method:getBotSubscriptions Params : %@", sessionId);

  AgentGuardInput *input = [AgentGuardInput new];
  input.parameters = params[@"parameters"];
  input.conversation = [Conversation conversationfromDictionary:params[@"conversation"]];
  input.capability = params[@"capability"];
  input.sync = params[@"sync"];

  GRPCProtoCall *call = [self.serviceClient RPCToExecuteWithRequest:input handler:^(AgentGuardStringResponse * _Nullable response, NSError * _Nullable error) {
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      callback(@[[NSNull null], [response toJSON]]);
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}
@end
