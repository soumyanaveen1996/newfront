//
//  DeviceBoolResponse+frontm.h
//  frontm_mobile
//
//  Created by Davide on 09/09/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Userservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface DeviceBoolResponse (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)users;


@end

NS_ASSUME_NONNULL_END
