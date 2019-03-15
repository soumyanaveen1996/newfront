//
//  DomainRoles+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Commonmessages.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface DomainRoles (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (DomainRoles *) domainRolesfromDictionary:(NSDictionary *)dictionary;
+ (NSArray *) arrayOfDomainRolesfromArray:(NSArray *)from;

@end

NS_ASSUME_NONNULL_END
