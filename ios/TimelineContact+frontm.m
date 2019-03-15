//
//  TimelineContact+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineContact+frontm.h"

@implementation TimelineContact (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"visible": @(self.visible),
           @"searchable": @(self.searchable),
           @"userName": self.userName,
           @"userId": self.userId
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}
@end
