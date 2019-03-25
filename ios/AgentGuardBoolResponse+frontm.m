//
//  AgentGuardBoolResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AgentGuardBoolResponse+frontm.h"
#import "NSArray+Map.h"

@implementation AgentGuardBoolResponse (frontm)

- (NSDictionary *) toJSON {
  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    [content addObject:@([self.contentArray valueAtIndex:i])];
  }
  return @{
           @"error": @(self.error),
           @"content": content
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}

@end
