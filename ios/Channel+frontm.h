//
//  Channel+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Agentguardservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface Channel (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (Channel *) channelfromDictionary:(NSDictionary *)dictionary;
+ (NSArray *) channelsArrayfromJSON:(NSArray *)channels;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;

@end

NS_ASSUME_NONNULL_END
