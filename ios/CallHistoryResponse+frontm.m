//
//  CallHistoryResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CallHistoryResponse+frontm.h"
#import "CallHistoryObject+frontm.h"
#import "LocalContact+frontm.h"
#import "NSArray+Map.h"

@implementation CallHistoryResponse (frontm)
- (NSDictionary *) toJSON {
  return @{
           @"content": [CallHistoryObject jsonArrayFromObjects:self.contentArray],
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
