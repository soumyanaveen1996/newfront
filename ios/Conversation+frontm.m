//
//  Conversation+frontm.m
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Conversation+frontm.h"
#import "Channel+frontm.h"
#import "NSArray+Map.h"


@implementation Conversation (frontm)

- (NSDictionary *) toJSON {
  return @{
           @"conversationId": self.conversationId,
           @"bot": self.bot,
           @"participants": self.participantsArray,
           @"onChannels": [Channel jsonArrayFromObjects:self.onChannelsArray],
           @"closed": @(self.closed)
           };
}

- (NSDictionary *) toResponse {
  return @{
           @"data": [self toJSON]
           };
}


+ (NSArray *) jsonArrayFromObjects:(NSArray *)channels {
  if (!channels || [channels isEqual:[NSNull null]] || [channels count] == 0) {
    return @[];
  }
  return [channels rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [obj toJSON];
  }];
}



+ (Conversation *) conversationfromDictionary:(NSDictionary *)dictionary {
  if (!dictionary || [dictionary isEqual:[NSNull null]]) {
    return nil;
  }
  Conversation *conversation = [Conversation new];
  conversation.conversationId = dictionary[@"conversationId"];
  conversation.bot = dictionary[@"bot"];
  conversation.participantsArray = dictionary[@"participants"];
  conversation.onChannelsArray = [[Channel channelsArrayfromJSON:dictionary[@"onChannels"]] mutableCopy];
  conversation.closed = dictionary[@"closed"];
  return conversation;
}


+ (NSArray *) conversationsArrayfromJSON:(NSArray *)conversations {
  if (!conversations || [conversations isEqual:[NSNull null]]) {
    return @[];
  }
  return [conversations rnfs_mapObjectsUsingBlock:^id(id obj, NSUInteger idx) {
    return [Conversation conversationfromDictionary:obj];
  }];
}




@end
