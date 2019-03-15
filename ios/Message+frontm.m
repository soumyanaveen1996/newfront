//
//  Message+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Message+frontm.h"

@implementation Message (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"id": self.id_p,
           @"content": self.content,
           };
}

- (NSDictionary *) toResponse {
  return @{ @"data": [self toJSON] };
}



@end
