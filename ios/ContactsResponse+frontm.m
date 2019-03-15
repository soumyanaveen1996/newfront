//
//  ContactsResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ContactsResponse+frontm.h"
#import "Contact+frontm.h"
#import "NSArray+Map.h"

@implementation ContactsResponse (frontm)
- (NSDictionary *) toJSON {
  return @{
           @"contacts": [Contact jsonArrayFromObjects:self.contactsArray],
           @"ignored": [Contact jsonArrayFromObjects:self.ignoredArray],
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
