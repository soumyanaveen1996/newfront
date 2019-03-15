//
//  AgentGuardStringResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AgentGuardStringResponse+frontm.h"

@implementation AgentGuardStringResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"content": self.contentArray,
           @"error": @(self.error)
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}

@end
