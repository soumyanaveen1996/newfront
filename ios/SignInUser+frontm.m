//
//  SignInUser+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SignInUser+frontm.h"
#import "PhoneNumbers+frontm.h"

@implementation SignInUser (frontm)

- (NSDictionary *) toDictionary {
  // TODO(amal) : Change domainsArray
  return @{
             @"searchable": @(self.searchable),
             @"visible": @(self.visible),
             @"emailAddress": self.emailAddress,
             @"userId": self.userId,
             @"userName": self.userName,
             @"phoneNumbers": [self.phoneNumbers toDictionary],
             @"hasPhoneNumbers": @(self.hasPhoneNumbers),
             @"domainsArray": @[],
             @"archiveMessages": @(self.archiveMessages)
             };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toDictionary] };
}



@end
