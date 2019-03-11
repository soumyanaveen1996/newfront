//
//  PhoneNumbers+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PhoneNumbers+frontm.h"

@implementation PhoneNumbers (frontm)

- (NSDictionary *) toDictionary {
  // TODO(amal) : Change domainsArray
  return @{
           @"satellite": @(self.satellite),
           @"land": @(self.land),
           @"mobile": @(self.mobile),
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toDictionary] };
}


@end
