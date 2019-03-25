//
//  DomainChannels+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/25/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Channelsservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface DomainChannels (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (DomainChannels *) domainChannelsfromDictionary:(NSDictionary *)dictionary;
+ (NSArray<DomainChannels *> *) arrayOfDomainChannelsfromArray:(NSArray *)from;

@end

NS_ASSUME_NONNULL_END
