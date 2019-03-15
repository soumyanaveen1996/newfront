//
//  UpdateFavouritesResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UpdateFavouritesResponse+frontm.h"

@implementation UpdateFavouritesResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error": self.error,
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"error": self.error,
           @"data": [self toJSON]
           };
}


@end
