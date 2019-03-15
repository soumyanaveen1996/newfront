//
//  TimelineResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineResponse+frontm.h"
#import "TimelineContent+frontm.h"

@implementation TimelineResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"content": [self.content toJSON],
           @"error": self.error,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": self.error,
           @"data": [self toJSON]
           };
}


@end
