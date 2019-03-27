//
//  SubscribeBotResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SubscribeBotResponse+frontm.h"
#import "NSArray+Map.h"

@implementation SubscribeBotResponse (frontm)

- (NSDictionary *) toJSON {

  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    [content addObject:@([self.contentArray valueAtIndex:i])];
  }
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
