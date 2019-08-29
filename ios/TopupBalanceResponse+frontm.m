//
//  TopupBalanceResponse+frontm.m
//  frontm_mobile
//
//  Created by Davide on 23/08/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TopupBalanceResponse+frontm.h"
#import "NSArray+Map.h"

@implementation TopupBalanceResponse (frontm)

- (NSDictionary *) toJSON {
  
  NSMutableArray *content = [NSMutableArray new];
  return @{
           @"error": @(self.error),
           @"content": content
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
