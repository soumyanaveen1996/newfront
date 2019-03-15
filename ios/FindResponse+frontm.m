//
//  FindResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "FindResponse+frontm.h"

@implementation FindResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"errorMessage": self.errorMessage,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"errorMessage": self.errorMessage,
           @"data": [self toJSON]
           };
}

@end
