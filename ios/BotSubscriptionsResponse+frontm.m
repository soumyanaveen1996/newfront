//
//  BotSubscriptionsResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "BotSubscriptionsResponse+frontm.h"
#import "SubscribedBotsContent+frontm.h"

@implementation BotSubscriptionsResponse (frontm)

- (NSDictionary *) toJSON {
  if (self.hasContent) {
    return @{
             @"error": @(self.error),
             @"content": [self.content toJSON],
             };
  } else {
    return @{
             @"error": @(self.error),
             };
  }
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

@end
