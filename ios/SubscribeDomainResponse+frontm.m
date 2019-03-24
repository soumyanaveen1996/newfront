//
//  SubscribeDomainResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SubscribeDomainResponse+frontm.h"
#import "DomainRoles+frontm.h"
#import "NSArray+Map.h"

@implementation SubscribeDomainResponse (frontm)

- (NSDictionary *) toJSON {

  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    [content addObject:[[self.contentArray objectAtIndex:i] toJSON]];
  }

  return @{
           @"error": @(self.error),
           @"content": content
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)responses {
  return [responses rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}
@end
