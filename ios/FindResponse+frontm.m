//
//  FindResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "FindResponse+frontm.h"

@implementation FindResponse (frontm)

- (NSDictionary *) toJSON {
  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    MatchedUser * user = [self.contentArray objectAtIndex:i];
    [content addObject:@{ @"userName": user.userName, @"userId": user.userId }];
  }
  return @{
           @"errorMessage": self.errorMessage,
           @"error": @(self.error),
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"errorMessage": self.errorMessage,
           @"data": [self toJSON]
           };
}

@end
