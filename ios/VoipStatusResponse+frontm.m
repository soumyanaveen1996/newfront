//
//  VoipStatusResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "VoipStatusResponse+frontm.h"

@implementation VoipStatusResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"voipEnabled": @(self.voipEnabled),
           @"error": @(self.error)
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}
@end
