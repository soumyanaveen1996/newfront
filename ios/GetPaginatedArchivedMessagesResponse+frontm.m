//
//  GetPaginatedArchivedMessagesResponse+frontm.m
//  frontm_mobile
//
//  Created by Davide on 08/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetPaginatedArchivedMessagesResponse+frontm.h"
#import "GetArchivedMessagesContent+frontm.h"
#import "NSArray+Map.h"

@implementation GetPaginatedArchivedMessagesResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error" : @(self.error),
           @"moreMessagesExist": @(self.moreMessagesExist),
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
  if (!messages || [messages isEqual:[NSNull null]] || [messages count] == 0) {
    return @[];
  }
  return [messages rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
