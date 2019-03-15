//
//  SignupResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SignupResponse+frontm.h"

@implementation SignupResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"success": @(self.success),
           @"data": self.data_p,
           @"message": self.message
           };
}


- (NSDictionary *) toResponse {
  return @{
           @"success": @(self.success),
           @"message": self.message,
           @"data": [self toJSON]
           };
}


@end
