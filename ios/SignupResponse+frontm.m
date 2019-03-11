//
//  SignupResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SignupResponse+frontm.h"

@implementation SignupResponse (frontm)

- (NSDictionary *) toDictionary {
  return @{
           @"success": @(self.success),
           @"data": self.data_p,
           @"message": self.message
           };
}


- (NSDictionary *) toResponse {
  return @{ @"data": [self toDictionary] };
}


@end
