//
//  PaginatedCallHistoryResponse+frontm.m
//  frontm_mobile
//
//  Created by Davide on 14/10/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PaginatedCallHistoryResponse+frontm.h"
#import "CallHistoryObject+frontm.h"
#import "LocalContact+frontm.h"
#import "NSArray+Map.h"

@implementation PaginatedCallHistoryResponse (frontm)
- (NSDictionary *) toJSON {
  return @{
           @"error": @(self.error),
           @"records": [CallHistoryObject jsonArrayFromObjects:self.recordsArray],
           @"moreRecordsExist": @(self.moreRecordsExist),
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

