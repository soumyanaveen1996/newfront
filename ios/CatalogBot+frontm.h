//
//  CatalogBot+frontm.h
//  frontm_mobile
//
//  Created by Amal on 3/13/19.
//  Copyright © 2019 Facebook. All rights reserved.
//


#import "Conversationservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface CatalogBot (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)catalogBots;


@end

NS_ASSUME_NONNULL_END
