//
//  CatalogBotClients+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CatalogBotClients+frontm.h"
#import "NSArray+Map.h"

@implementation CatalogBotClients (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"mobile": @(self.mobile),
           @"web": @(self.web),
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogBotClients {
  if (!catalogBotClients || [catalogBotClients isEqual:[NSNull null]]) {
    return @[];
  }
  return [catalogBotClients rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
