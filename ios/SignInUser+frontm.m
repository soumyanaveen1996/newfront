//
//  SignInUser+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SignInUser+frontm.h"
#import "PhoneNumbers+frontm.h"
#import "DomainRoles+frontm.h"

@implementation SignInUser (frontm)

- (NSDictionary *) toJSON {
  NSMutableArray *domains = [NSMutableArray new];
  for (int i = 0; i < self.domainsArray_Count; ++i) {
    [domains addObject:[self.domainsArray[i] toJSON]];
  }
  return @{
             @"searchable": @(self.searchable),
             @"visible": @(self.visible),
             @"emailAddress": self.emailAddress,
             @"userId": self.userId,
             @"userName": self.userName,
             @"phoneNumbers": [self.phoneNumbers toJSON],
             @"hasPhoneNumbers": @(self.hasPhoneNumbers),
             @"domainsArray": domains,
             @"archiveMessages": @(self.archiveMessages)
             };
}

- (NSDictionary *) toResponse {
  return @{@"data": [self toJSON] };
}



@end
