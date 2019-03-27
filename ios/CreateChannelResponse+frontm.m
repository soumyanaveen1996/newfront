//
//  CreateChannelResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CreateChannelResponse+frontm.h"
#import "NSArray+Map.h"

@implementation CreateChannelResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error": @(self.error),
           @"errorMessage": self.errorMessage,
           @"content": self.contentArray,
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
