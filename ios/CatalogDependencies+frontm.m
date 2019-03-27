//
//  CatalogDependencies+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CatalogDependencies+frontm.h"
#import "CatalogDependency+frontm.h"
#import "NSArray+Map.h"

@implementation CatalogDependencies (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"agentGuardService": [self.agentGuardService toJSON],
           @"authContext": [self.authContext toJSON],
           @"archiveUtils": [self.archiveUtils toJSON],
           @"botUtils": [self.botUtils toJSON],
           @"autoRenewConversationContext": [self.autoRenewConversationContext toJSON],
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogDeps {
  if (!catalogDeps || [catalogDeps isEqual:[NSNull null]] || [catalogDeps count] == 0) {
    return @[];
  }
  return [catalogDeps rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
