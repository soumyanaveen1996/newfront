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

- (NSDictionary *) toDictionary {
  return @{
               @"success": @(self.success),
               @"message": self.message,
               @"sessionId": self.sessionId,
               @"user": [self.user toDictionary],
               @"hasUser": @(self.hasUser),
               @"newUser": @(self.newUser),
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toDictionary] };
}



@end
