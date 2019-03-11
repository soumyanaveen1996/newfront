//
//  PingServiceClient.m
//  frontm_mobile
//
//  Created by Amal on 2/26/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PingServiceClient.h"
#import "Pingservice.pbrpc.h"

static NSString * const kHostAddress = @"grpcdev.frontm.ai:50051";

@implementation PingServiceClient

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(pingWithCallback:(RCTResponseSenderBlock)callback) {

  PingService *service = [[PingService alloc] initWithHost:kHostAddress];
  Empty *empty = [[Empty alloc] init];

  [service pingWithRequest:empty handler:^(PingReply * _Nullable response, NSError * _Nullable error) {
    if (error != NULL) {
      NSLog(@"GRPC error : %@ ", error.description);
      return;
    }

    if (response.message != NULL) {
      callback(@[[NSNull null], @{ @"message": response.message }]);
    } else {
      callback(@[[NSNull null], @{ @"message": @"No response from the server" }]);
    }
  }];

}

@end
