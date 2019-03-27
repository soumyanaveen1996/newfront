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


- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[AgentGuardService alloc] initWithHost:kHostAddress];
  }
  return self;
}


RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(execute, execute:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC::::method:execute Params : %@", params);

  AgentGuardInput *input = [AgentGuardInput new];
  input.parameters = params[@"parameters"];
  input.conversation = [Conversation conversationfromDictionary:params[@"conversation"]];
  input.capability = params[@"capability"];
  input.sync = params[@"sync"];

  GRPCProtoCall *call = [self.serviceClient RPCToExecuteWithRequest:input handler:^(AgentGuardStringResponse * _Nullable response, NSError * _Nullable error) {
    RCTLog(@"GRPC::::method:execute Response : %@", error);
    if (error != nil) {
      callback(@[@{}, [NSNull null]]);
      return;
    } else {
      RCTLog(@"GRPC::::method:execute Response : %@", [response toResponse]);
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];

  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}
@end
