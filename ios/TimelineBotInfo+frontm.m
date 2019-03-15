//
//  TimelineBotInfo+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineBotInfo+frontm.h"


/*

 @property(nonatomic, readwrite, copy, null_resettable) NSString *logoURL;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *slug;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *botURL;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *description_p;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *botId;

*/
@implementation TimelineBotInfo (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"allowResetConversation": self.allowResetConversation,
           @"botName": self.botName,
           @"systemBot": @(self.systemBot),
           @"logoURL": self.logoURL,
           @"slug": self.slug,
           @"userDomain": self.userDomain,
           @"botURL": self.botURL,
           @"botId": self.botId,
           @"description": self.description
           };
}

- (NSDictionary *) toResponse {
  return @{
    @"data": [self toJSON]
    };
}


@end
