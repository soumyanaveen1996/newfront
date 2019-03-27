//
//  GetConversationDetailsUser+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetConversationDetailsUser+frontm.h"
#import "NSArray+Map.h"

@implementation GetConversationDetailsUser (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"userId": self.userId,
           @"userName": self.userName,
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
