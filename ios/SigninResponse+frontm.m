//
//  SigninResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SigninResponse+frontm.h"
#import "SignInUser+frontm.h"

@implementation SigninResponse (frontm)

- (NSDictionary *) toJSON {
  if (self.hasUser) {
    return @{
             @"success": @(self.success),
             @"message": self.message,
             @"sessionId": self.sessionId,
             @"user": [self.user toJSON],
             @"hasUser": @(self.hasUser),
             @"newUser": @(self.newUser),
             };
  } else {
    return @{
             @"success": @(NO),
             @"message": @"Error loading user",
             };
  }

}

- (NSDictionary *) toResponse {
  return @{
           @"success": @(self.success),
           @"message": self.message,
           @"data": [self toJSON] };
}



@end
