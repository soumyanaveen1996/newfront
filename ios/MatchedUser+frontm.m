//
//  MatchedUser+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "MatchedUser+frontm.h"
#import "NSArray+Map.h"

@implementation MatchedUser (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"userName": self.userName,
           @"userId": self.userId
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)users {
  if (!users || [users isEqual:[NSNull null]]) {
    return @[];
  }
  return [users rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
