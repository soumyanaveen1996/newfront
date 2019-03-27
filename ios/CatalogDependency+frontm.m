//
//  CatalogDependency+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CatalogDependency+frontm.h"
#import "NSArray+Map.h"

@implementation CatalogDependency (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"remote": @(self.remote),
           @"version": self.version,
           @"url": self.URL,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogDeps {
  if (!catalogDeps || [catalogDeps isEqual:[NSNull null]]) {
    return @[];
  }
  return [catalogDeps rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
