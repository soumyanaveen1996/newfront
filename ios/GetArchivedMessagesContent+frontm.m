//
//  GetArchivedMessagesContent+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetArchivedMessagesContent+frontm.h"
#import "NSArray+Map.h"

@implementation GetArchivedMessagesContent (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"messageId": self.messageId,
           @"contentType": self.contentType,
           @"createdOn": @(self.createdOn),
           @"createdBy": self.createdBy,
           @"content": self.contentArray,
           @"options": self.options
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)messages {
  return [messages rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
