//
//  CallHistory+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CallHistoryObject+frontm.h"
#import "NSArray+Map.h"

@implementation CallHistoryObject (frontm)


- (NSDictionary *) toJSON {
  
  return @{
           @"callCharge": @(self.callCharge),
           @"callTimestamp": @(self.callTimestamp),
           @"callTo": self.callTo,
           @"currentBalance": @(self.currentBalance),
           @"duration": @(self.duration),
           @"userId": self.userId,
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
