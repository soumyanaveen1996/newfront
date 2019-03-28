//
//  ParticipantsListResponse+frontm.m
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 29/03/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ParticipantsListResponse+frontm.h"
#import "ParticpantUser+frontm.h"
#import "NSArray+Map.h"

@implementation ParticipantsListResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error": @(self.error),
           @"content": [ParticpantUser jsonArrayFromObjects:self.contentArray],
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)response {
  if (!response || [response isEqual:[NSNull null]] || [response count] == 0) {
    return @[];
  }
  return [response rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
