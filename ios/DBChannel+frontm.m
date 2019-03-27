//
//  DBChannel+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "DBChannel+frontm.h"
#import "ChannelOwner+frontm.h"
#import "NSArray+Map.h"


@implementation DBChannel (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"channelId": self.channelId,
           @"channelType": self.channelType,
           @"createdOn": @(self.createdOn),
           @"channelName": self.channelName,
           @"userDomain": self.userDomain,
           @"channelOwner": [self.channelOwner toJSON],
           @"description": self.description_p,
           @"discoverable": self.discoverable,
           @"logo": self.logo,
           @"isPlatformChannel": @(self.isPlatformChannel),
           @"participants": self.participantsArray,
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
