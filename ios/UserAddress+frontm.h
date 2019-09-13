//
//  Address+frontm.h
//  frontm_mobile
//
//  Created by Davide on 12/09/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Commonmessages.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface UserAddress (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSMutableArray *)numbers;

@end

NS_ASSUME_NONNULL_END
