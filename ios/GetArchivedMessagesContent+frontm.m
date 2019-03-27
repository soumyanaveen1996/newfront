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

  NSDictionary *content = [NSJSONSerialization JSONObjectWithData:self.content
                                                              options:NSJSONReadingAllowFragments
                                                                error:nil];

  NSDictionary *options = [NSJSONSerialization JSONObjectWithData:self.options
                                                          options:NSJSONReadingAllowFragments
                                                            error:nil];


  return @{
           @"messageId": self.messageId,
           @"contentType": self.contentType,
           @"createdOn": @(self.createdOn),
           @"createdBy": self.createdBy,
           @"content": self.content && self.content.length > 0 ? content : [NSNull null],
           @"options": self.options && self.options.length > 0 ? options : [NSNull null]
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)messages {
  if (!messages || [messages isEqual:[NSNull null]]) {
    return @[];
  }
  return [messages rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
