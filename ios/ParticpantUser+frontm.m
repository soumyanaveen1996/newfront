//
//  ParticpantUser+frontm.m
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 29/03/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ParticpantUser+frontm.h"
#import "NSArray+Map.h"

@implementation ParticpantUser (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"userId": self.userId,
           @"userName": self.userName,
           @"role": self.role,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)users {
  if (!users || [users isEqual:[NSNull null]] || [users count] == 0) {
    return @[];
  }
  return [users rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end