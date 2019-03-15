//
//  TimelineChannels+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineChannels+frontm.h"
#import "NSArray+Map.h"

@implementation TimelineChannels (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"channelName": self.channelName,
           @"userDomain": self.userDomain
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)channels {
  return [channels rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
