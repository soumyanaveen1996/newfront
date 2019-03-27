//
//  GetConversationDetailsChannels+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetConversationDetailsChannels+frontm.h"
#import "NSArray+Map.h"

@implementation GetConversationDetailsChannels (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"channelName": self.channelName,
           @"userDomain": self.userDomain,
           @"channelId": self.channelId,
           @"description": self.description_p,
           @"logo": self.logo,
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


@end
