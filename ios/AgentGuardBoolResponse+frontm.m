//
//  AgentGuardBoolResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "AgentGuardBoolResponse+frontm.h"
#import "NSArray+Map.h"

@implementation AgentGuardBoolResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

@end
