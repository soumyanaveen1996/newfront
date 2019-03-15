//
//  MessageDetails+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Queueservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface MessageDetails (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (MessageDetails *) messageDetailsfromDictionary:(NSDictionary *)dictionary;
+ (NSArray *) arrayOfMessageDetailsfromArray:(NSArray *)from;


@end

NS_ASSUME_NONNULL_END
