//
//  TimelineConversation+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineConversation+frontm.h"
#import "TimelineBotInfo+frontm.h"
#import "TimelineContact+frontm.h"
#import "TimelineChannels+frontm.h"
#import "NSArray+Map.h"


@implementation TimelineConversation (frontm)

- (NSDictionary *) toJSON {
  NSDictionary *lastMessage = [NSJSONSerialization JSONObjectWithData:self.lastMessage
                                                              options:NSJSONReadingAllowFragments
                                                                error:nil];
  return @{
           @"closed": @(self.closed),
           @"participants": self.participantsArray,
           @"createdOn": @(self.createdOn),
           @"modifiedOn": @(self.modifiedOn),
           @"userDomain": self.userDomain,
           @"conversationId": self.conversationId,
           @"createdBy": self.createdBy,
           @"bot": [self.bot toJSON],
           @"lastMessage": self.lastMessage && self.lastMessage.length > 0 ? lastMessage : [NSNull null],
           @"contact": [self.contact toJSON],
           @"onChannels": [TimelineChannels jsonArrayFromObjects:self.onChannelsArray]
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}

+ (NSArray *) jsonArrayFromObjects:(NSArray *)conversations {
  if (!conversations || [conversations isEqual:[NSNull null]] || [conversations count] == 0) {
    return @[];
  }
  return [conversations rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
