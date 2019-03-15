//
//  ChannelOwner+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Channelsservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface ChannelOwner (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;
+ (ChannelOwner *) channelOwnerfromDictionary:(NSDictionary *)dictionary;
+ (NSArray *) channelOwnersArrayfromJSON:(NSArray *)channels;


@end

NS_ASSUME_NONNULL_END
