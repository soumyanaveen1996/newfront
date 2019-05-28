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
           @"currentBalance": @(self.currentBalance),
           @"duration": @(self.duration),
           @"userId": self.userId,
           @"callType": self.callType,
           @"callDirection": self.callDirection,
           @"fromUserId": self.fromUserId,
           @"fromUserName": self.fromUserName,
           @"toNumber": self.toNumber,
           @"toUserId": self.toUserId,
           @"toUserName": self.toUserName,
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
