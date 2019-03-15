//
//  MessageDetails+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "MessageDetails+frontm.h"
#import "NSArray+Map.h"

@implementation MessageDetails (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"message": self.message,
           @"error": self.error,
           @"info": self.info,
           @"options": self.options
           };

}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}

+ (MessageDetails *) messageDetailsfromDictionary:(NSDictionary *)dictionary {
  MessageDetails *details = [MessageDetails new];
  details.message = dictionary[@"message"];
  details.error = dictionary[@"error"];
  details.info = dictionary[@"info"];
  details.options = dictionary[@"options"];
  return details;
}

+ (NSArray *) arrayOfMessageDetailsfromArray:(NSArray *)from {
  return [from rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [MessageDetails messageDetailsfromDictionary:obj];
  }];
}


@end
