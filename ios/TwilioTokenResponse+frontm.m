//
//  TwilioTokenResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TwilioTokenResponse+frontm.h"
#import "NSArray+Map.h"

@implementation TwilioTokenResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"accessToken": self.accessToken,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

@end
