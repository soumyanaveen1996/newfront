//
//  ChannelListResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ChannelListResponse+frontm.h"
#import "DBChannel+frontm.h"
#import "NSArray+Map.h"

@implementation ChannelListResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error": @(self.error),
           @"content": [DBChannel jsonArrayFromObjects:self.contentArray],
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)channels {
  if (!channels || [channels isEqual:[NSNull null]]) {
    return @[];
  }
  return [channels rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
