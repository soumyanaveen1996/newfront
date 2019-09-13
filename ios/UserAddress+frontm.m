//
//  Address+frontm.m
//  frontm_mobile
//
//  Created by Davide on 12/09/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UserAddress+frontm.h"
#import "NSArray+Map.h"

@implementation UserAddress (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"addressLine1": self.addressLine1,
           @"addressLine2": self.addressLine2,
           @"city": self.city,
           @"state": self.state,
           @"country": self.country,
           @"postCode": self.postCode,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (NSArray *) jsonArrayFromObjects:(NSMutableArray *)numbers {
  if (!numbers || [numbers isEqual:[NSNull null]] || [numbers count] == 0) {
    return @[];
  }
  return [numbers rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
