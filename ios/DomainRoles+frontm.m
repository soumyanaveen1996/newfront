//
//  DomainRoles+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "DomainRoles+frontm.h"
#import "NSArray+Map.h"

@implementation DomainRoles (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"domain": self.domain,
           @"roles": self.rolesArray,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (DomainRoles *) domainRolesfromDictionary:(NSDictionary *)dictionary {
  DomainRoles *roles = [DomainRoles new];
  roles.domain = dictionary[@"domain"];
  roles.rolesArray = dictionary[@"roles"];
  return roles;
}

+ (NSArray *) arrayOfDomainRolesfromArray:(NSArray *)from {
  return [from rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [DomainRoles domainRolesfromDictionary:obj];
  }];
}

@end
