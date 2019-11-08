//
//  GetPaginatedArchivedMessagesResponse+frontm.h
//  frontm_mobile
//
//  Created by Davide on 08/11/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "Conversationservice.pbobjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface GetPaginatedArchivedMessagesResponse (frontm)

- (NSDictionary *) toJSON;
- (NSDictionary *) toResponse;
+ (NSArray *) jsonArrayFromObjects:(NSArray *)channels;


@end

NS_ASSUME_NONNULL_END
