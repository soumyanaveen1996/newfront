//
//  Contact+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Contact+frontm.h"
#import "PhoneNumbers+frontm.h"
#import "NSArray+Map.h"

@implementation Contact (frontm)


- (NSDictionary *) toJSON {

  return @{
           @"userName": self.userName,
           @"emailAddress": self.emailAddress,
           @"userId": self.userId,
           @"waitingForConfirmation": @(self.waitingForConfirmation),
           @"phoneNumbers": [[PhoneNumbers jsonArrayFromObjects:self.phoneNumbers] mutableCopy]
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)responses {
  return [responses rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}

@end
