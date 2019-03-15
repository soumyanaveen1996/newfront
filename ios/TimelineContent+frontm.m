//
//  TimelineContent+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineContent+frontm.h"
#import "TimelineConversation+frontm.h"
#import "NSArray+Map.h"

@implementation TimelineContent (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"conversations": [TimelineConversation jsonArrayFromObjects:self.conversationsArray],
           @"favourites": [TimelineConversation jsonArrayFromObjects:self.favouritesArray],
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)contents {
  return [contents rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
