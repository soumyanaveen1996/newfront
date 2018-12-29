//
//  FirstService.m
//  frontm_mobile
//
//  Created by Amal on 12/29/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "FirstServiceClient.h"
#import "Initial.pbrpc.h"

static NSString * const kHostAddress = @"3.80.242.247:50051";

@implementation FirstServiceClient

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(sayHello:(NSString *)name callback:(RCTResponseSenderBlock)callback) {

  FirstService *service = [[FirstService alloc] initWithHost:kHostAddress];

  HelloRequest *request = [[HelloRequest alloc] init];
  request.name = name;

  [service sayHelloWithRequest:request handler:^(HelloReply * _Nullable response, NSError * _Nullable error) {
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
