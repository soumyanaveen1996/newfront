//
//  CatalogResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CatalogResponse+frontm.h"
#import "CatalogBot+frontm.h"

@implementation CatalogResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"bots": [CatalogBot jsonArrayFromObjects:self.botsArray],
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}


@end
