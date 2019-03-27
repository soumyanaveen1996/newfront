//
//  DomainChannels+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/25/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "DomainChannels+frontm.h"
#import "NSArray+Map.h"

@implementation DomainChannels (frontm)


- (NSDictionary *) toJSON {
  return @{
           @"userDomain": self.userDomain,
           @"channels": self.channelsArray,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (DomainChannels *) domainChannelsfromDictionary:(NSDictionary *)dictionary {
  DomainChannels *roles = [DomainChannels new];
  roles.userDomain = dictionary[@"userDomain"];
  roles.channelsArray = dictionary[@"channels"];
  return roles;
}

+ (NSArray<DomainChannels *> *) arrayOfDomainChannelsfromArray:(NSArray *)from {
  if (!from || [from isEqual:[NSNull null]]) {
    return @[];
  }
  return [from rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [DomainChannels domainChannelsfromDictionary:obj];
  }];
}


@end
