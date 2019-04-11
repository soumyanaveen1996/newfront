//
//  EmailAddresses+frontm.m
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 08/04/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "EmailAddresses+frontm.h"
#import "NSArray+Map.h"

@implementation EmailAddresses (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"home": self.home,
           @"work": self.work,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (NSArray *) jsonArrayFromObjects:(NSMutableArray *)emails {
  if (!emails || [emails isEqual:[NSNull null]] || [emails count] == 0) {
    return @[];
  }
  return [emails rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
