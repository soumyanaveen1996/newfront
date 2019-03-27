//
//  ChannelOwner+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ChannelOwner+frontm.h"
#import "NSArray+Map.h"

@implementation ChannelOwner (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"emailAddress": self.emailAddress,
           @"userName": self.userName,
           @"userId": self.userId
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)owners {
  if (!owners || [owners isEqual:[NSNull null]] || [owners count] == 0) {
    return @[];
  }
  return [owners rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}



+ (ChannelOwner *) channelOwnerfromDictionary:(NSDictionary *)dictionary {
  ChannelOwner *channelOwner = [ChannelOwner new];
  channelOwner.emailAddress = dictionary[@"emailAddress"];
  channelOwner.userName = dictionary[@"userName"];
  channelOwner.userId = dictionary[@"userId"];
  return channelOwner;
}


+ (NSArray *) channelOwnersArrayfromJSON:(NSArray *)channels {
  if (!channels || [channels isEqual:[NSNull null]]) {
    return @[];
  }
  return [channels rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [ChannelOwner channelOwnerfromDictionary:obj];
  }];
}
@end
