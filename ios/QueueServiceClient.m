//
//  QueueServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 12/29/18.
//  Copyright © 2018 Facebook. All rights reserved.
//


#import "QueueServiceClient.h"
#import "Queue.pbrpc.h"

static NSString * const kHostAddress = @"3.80.242.247:50051";

@implementation QueueServiceClient

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"NewQueueMessage", @"StreamDone"];
}


RCT_EXPORT_METHOD(subscribeWithSessionId:(NSString*)sessionId) {
  QueueService *service = [[QueueService alloc] initWithHost:kHostAddress];

  QueueInput *request = [[QueueInput alloc] init];
  request.sessionId = sessionId;

  QueueParams *params = [[QueueParams alloc] init];

  [service getStreamingMessagesWithRequest:params eventHandler:^(BOOL done, Message * _Nullable response, NSError * _Nullable error) {
    if (done) {
      [self sendEventWithName:@"StreamDone" body:NULL];
    } else {
      [self sendEventWithName:@"NewQueueMessage" body:@{ @"id": response.id_p, @"content": response.content }];
    }
  }];
}


@end
