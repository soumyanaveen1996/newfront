//
//  PhoneNumbers+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PhoneNumbers+frontm.h"
#import "NSArray+Map.h"

@implementation PhoneNumbers (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"satellite": self.satellite,
           @"land": self.land,
           @"mobile": self.mobile,
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
