//
//  CreateCompanyResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CreateCompanyResponse+frontm.h"
#import "NSArray+Map.h"

@implementation CreateCompanyResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"success": @(self.success),
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
