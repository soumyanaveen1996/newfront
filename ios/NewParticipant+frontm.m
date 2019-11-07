//
//  NewParticipant+frontm.m
//  frontm_mobile
//
//  Created by Davide on 05/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NewParticipant+frontm.h"
#import "UserAddress+frontm.h"
#import "NSArray+Map.h"

@implementation NewParticipant (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"userName": self.userName,
           @"address": self.hasAddress ? [self.address toJSON] : [NSNull null],
           @"userCompanyName" : self.userCompanyName,
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
