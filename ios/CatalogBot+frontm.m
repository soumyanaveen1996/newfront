//
//  CatalogBot+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CatalogBot+frontm.h"
#import "CatalogDependencies+frontm.h"
#import "CatalogBotClients+frontm.h"
#import "CatalogBot+frontm.m"
#import "NSArray+Map.h"

@implementation CatalogBot (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"botId": self.botId,
           @"userDomain": self.userDomain,
           @"allowResetConversation": self.allowResetConversation,
           @"botName": self.botName,
           @"botNameSearch": self.botNameSearch,
           @"botURL": self.botURL,
           @"categories": self.categoryArray,
           @"description": self.description_p,
           @"descriptionSearch": self.descriptionSearch,
           @"logoURL": self.logoURL,
           @"slug": self.slug,
           @"userRoles": self.userRolesArray,
           @"version": self.version,
           @"developer": self.developer,
           @"featured": @(self.featured),
           @"systemBot": @(self.systemBot),
           @"minRequiredPlatformVersion": self.minRequiredPlatformVersion,
           @"dependencies": [self.dependencies toJSON],
           @"botClients": [self.botClients toJSON]
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogBots {
  return [catalogBots rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
