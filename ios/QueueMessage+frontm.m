//
//  QueueMessage+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "QueueMessage+frontm.h"
#import "NSArray+Map.h"

@implementation QueueMessage (frontm)

/*
- (NSArray *) details {
  if (self.detailsArray_Count > 0) {
    return [self.detailsArray rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
      return [obj toJSON];
    }];
  } else {
    return @[];
  }
} */

- (NSDictionary *) toJSON {

  NSString *detailsString = [[NSString alloc] initWithData:self.details encoding:NSUTF8StringEncoding];

  NSError *jsonError;
  id object = nil;
  id json = [NSJSONSerialization JSONObjectWithData:self.details options:kNilOptions error:&jsonError];
  if (jsonError == nil) {
    object = json;
  } else {
    object = [NSNull null];
  }
  return @{
           @"userId": self.userId,
           @"conversation": self.conversation,
           @"bot": self.bot,
           @"createdOn": @(self.createdOn),
           @"createdBy": self.createdBy,
           @"contentType": @(self.contentType),
           @"messageId": self.messageId,
           @"requestUuid": self.requestUuid,
           @"error": self.error,
           @"details": self.details && self.details.length > 0 ? object : [NSNull null]
//           @"details": detailsString
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
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
