//
//  SubscribedBotsContent+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "SubscribedBotsContent+frontm.h"

@implementation SubscribedBotsContent (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"subscribedArray": self.subscribedArray,
           @"favouritesArray": self.favouritesArray,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

@end
