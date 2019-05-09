//
//  CallHistoryObject+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Userservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface CallHistoryObject (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;


@end

NS_ASSUME_NONNULL_END
