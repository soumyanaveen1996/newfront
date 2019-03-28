//
//  ParticipantsListResponse+frontm.h
//  frontm_mobile
//
//  Created by Sourav Chatterjee on 29/03/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Channelsservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface ParticipantsListResponse (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)response;

@end

NS_ASSUME_NONNULL_END

