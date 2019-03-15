//
//  TimelineLastMessage+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineLastMessage+frontm.h"

@implementation TimelineLastMessage (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"messageId": self.messageId,
           @"contentType": self.contentType,
           @"createdOn": @(self.createdOn),
           @"createdBy": self.createdBy,
           @"content": self.contentArray
           };
}

- (NSDictionary *) toResponse {
  return @{
    @"data": [self toJSON]
    };
}


@end
