//
//  GetArchivedMessagesResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetArchivedMessagesResponse+frontm.h"
#import "GetArchivedMessagesContent+frontm.h"
#import "NSArray+Map.h"

@implementation GetArchivedMessagesResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error" : @(self.error),
           @"content": [GetArchivedMessagesContent jsonArrayFromObjects:self.contentArray]
           };
}
- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON],
           };
}
+ (NSArray *) jsonArrayFromObjects:(NSArray *)messages {
  return [messages rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
