//
//  FindNewParticipantsResponse+frontm.m
//  frontm_mobile
//
//  Created by Davide on 05/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "FindNewParticipantsResponse+frontm.h"
#import "NewParticipant+frontm.h"
#import "NSArray+Map.h"

@implementation FindNewParticipantsResponse (frontm)


- (NSDictionary *) toJSON {
  NSMutableArray *content = [NSMutableArray new];
  for (int i = 0; i < self.contentArray.count; ++i) {
    [content addObject:[[self.contentArray objectAtIndex:i] toJSON]];
  }
  return @{
           @"error": @(self.error),
           @"errorMessage": self.errorMessage,
           @"content": content,
           };
}

- (NSDictionary *) toResponse {
  return @{@"data": [self toJSON]};
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)owners {
  if (!owners || [owners isEqual:[NSNull null]] || [owners count] == 0) {
    return @[];
  }
  return [owners rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
