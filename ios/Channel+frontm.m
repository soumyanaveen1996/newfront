//
//  Channel+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Channel+frontm.h"
#import "NSArray+Map.h"

@implementation Channel (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"channelName": self.channelName,
           @"userDomain": self.userDomain,
           };
}

- (NSDictionary *) toResponse {
  return @{
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



+ (Channel *) channelfromDictionary:(NSDictionary *)dictionary {
  Channel *channel = [Channel new];
  channel.channelName = dictionary[@"channelName"];
  channel.userDomain = dictionary[@"userDomain"];
  return channel;
}


+ (NSArray *) channelsArrayfromJSON:(NSArray *)channels {
  if (!channels || [channels isEqual:[NSNull null]]) {
    return @[];
  }
  return [channels rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [Channel channelfromDictionary:obj];
  }];
}

@end
