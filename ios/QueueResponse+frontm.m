//
//  QueueResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "QueueResponse+frontm.h"
#import "QueueMessage+frontm.h"
#import "NSArray+Map.h"

@implementation QueueResponse (frontm)

- (NSDictionary *) toJSON {

  return @{
           @"queueMsgs": [QueueMessage jsonArrayFromObjects:self.queueMsgsArray],
           @"errorMessage": self.errorMessage,
           @"error": self.error,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"errorMessage": self.errorMessage,
           @"error": self.error,
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)responses {
  if (!responses || [responses isEqual:[NSNull null]]) {
    return @[];
  }
  return [responses rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
