//
//  UserBalanceResponse+frontm.h
//  frontm_mobile
//
//  Created by Davide on 05/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Userservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface UserBalanceResponse (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;


@end

NS_ASSUME_NONNULL_END
