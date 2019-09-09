//
//  UserDomain+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UserDomain+frontm.h"
#import "NSArray+Map.h"

@implementation UserDomain (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"userDomain": self.userDomain,
           @"name": self.name,
           @"viewModes": self.viewModes,
           @"logoURL": self.logoURL,
           @"lastLoggedIn": @(self.lastLoggedIn),
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (UserDomain *) userDomainfromDictionary:(NSDictionary *)dictionary {
  UserDomain *userDomain = [UserDomain new];
  userDomain.userDomain = dictionary[@"userDomain"];
  userDomain.name = dictionary[@"name"];
  userDomain.viewModes = dictionary[@"viewModes"];
  userDomain.logoURL = dictionary[@"logoURL"];
  userDomain.lastLoggedIn = dictionary[@"lastLoggedIn"];
  return userDomain;
}

+ (NSArray *) arrayOfUserDomainfromArray:(NSArray *)from {
  if (!from || [from isEqual:[NSNull null]]) {
    return @[];
  }
  return [from rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [UserDomain userDomainfromDictionary:obj];
  }];
}

@end
