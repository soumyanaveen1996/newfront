//
//  UserBalanceResponse+frontm.m
//  frontm_mobile
//
//  Created by Davide on 05/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UserBalanceResponse+frontm.h"
#import "NSArray+Map.h"

@implementation UserBalanceResponse (frontm)

- (NSDictionary *) toJSON {
  
  return @{
           @"error": @(self.error),
           @"callQuota": @(self.callQuota)
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)responses {
  if (!responses || [responses isEqual:[NSNull null]] || [responses count] == 0) {
    return @[];
  }
  return [responses rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}
@end
