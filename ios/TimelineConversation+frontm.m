//
//  TimelineConversation+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "TimelineConversation+frontm.h"
#import "TimelineBotInfo+frontm.h"
#import "TimelineLastMessage+frontm.h"
#import "TimelineContact+frontm.h"
#import "TimelineChannels+frontm.h"
#import "NSArray+Map.h"

/*
 @property(nonatomic, readwrite) BOOL closed;

 @property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *participantsArray;

 @property(nonatomic, readonly) NSUInteger participantsArray_Count;

 @property(nonatomic, readwrite) int32_t createdOn;

 @property(nonatomic, readwrite) int32_t modifiedOn;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *userDomain;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *conversationId;

 @property(nonatomic, readwrite, copy, null_resettable) NSString *createdBy;

 @property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<TimelineChannels*> *onChannelsArray;

 @property(nonatomic, readonly) NSUInteger onChannelsArray_Count;

 @property(nonatomic, readwrite, strong, null_resettable) TimelineBotInfo *bot;

 @property(nonatomic, readwrite) BOOL hasBot;

 @property(nonatomic, readwrite, strong, null_resettable) TimelineLastMessage *lastMessage;

 @property(nonatomic, readwrite) BOOL hasLastMessage;

 @property(nonatomic, readwrite, strong, null_resettable) TimelineContact *contact;

 @property(nonatomic, readwrite) BOOL hasContact;
 */

@implementation TimelineConversation (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"closed": @(self.closed),
           @"participants": self.participantsArray,
           @"createdOn": @(self.createdOn),
           @"modifiedOn": @(self.modifiedOn),
           @"userDomain": self.userDomain,
           @"conversationId": self.conversationId,
           @"createdBy": self.createdBy,
           @"bot": [self.bot toJSON],
           @"lastMessage": [self.lastMessage toJSON],
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
  return [conversations rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}


@end
