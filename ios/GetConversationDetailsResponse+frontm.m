//
//  GetConversationDetailsResponse+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetConversationDetailsResponse+frontm.h"
#import "GetConversationDetailsUser+frontm.h"
#import "GetConversationDetailsChannels+frontm.h"

@implementation GetConversationDetailsResponse (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"error": @(self.error),
           @"onChannels": [GetConversationDetailsChannels jsonArrayFromObjects:self.onChannelsArray],
           @"participants": [GetConversationDetailsUser jsonArrayFromObjects:self.participantsArray],
           @"conversationOwner": [self.conversationOwner toJSON]
           };
}
- (NSDictionary *) toResponse {
  return @{
           @"error": @(self.error),
           @"data": [self toJSON]
           };
}


@end
