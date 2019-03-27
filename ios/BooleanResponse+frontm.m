//
//  BooleanResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "BooleanResponse+frontm.h"
#import "NSArray+Map.h"

@implementation BooleanResponse (frontm)


- (NSDictionary *) toJSON {
  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    [content addObject:@([self.contentArray valueAtIndex:i])];
  }
  return @{
           @"error": @(self.error),
           @"errorMessage": self.errorMessage,
           @"content": content,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"errorMessage": self.errorMessage,
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)owners {
  if (!owners || [owners isEqual:[NSNull null]]) {
    return @[];
  }
  return [owners rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
