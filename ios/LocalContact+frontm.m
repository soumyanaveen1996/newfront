//
//  LocalContact+frontm.m
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 08/04/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "LocalContact+frontm.h"
#import "PhoneNumbers+frontm.h"
#import "EmailAddresses+frontm.h"
#import "NSArray+Map.h"

@implementation LocalContact (frontm)


- (NSDictionary *) toJSON {
  
  return @{
           @"userName": self.userName,
           @"emailAddress": self.hasEmailAddresses ? [self.emailAddresses toJSON] : [NSNull null],
           @"phoneNumbers": self.hasPhoneNumbers ? [self.phoneNumbers toJSON] : [NSNull null],
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)responses {
  if (!responses || [responses isEqual:[NSNull null]] || [responses count] == 0) {
    return @[];
  }
  return [responses rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
