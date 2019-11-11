#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
#import "Conversationservice.pbobjc.h"
#endif

#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
#import <ProtoRPC/ProtoService.h>
#import <ProtoRPC/ProtoRPC.h>
#import <RxLibrary/GRXWriteable.h>
#import <RxLibrary/GRXWriter.h>
#endif

@class CatalogInput;
@class CatalogResponse;
@class Empty;
@class FavouritesResponse;
@class GetArchivedMessagesInput;
@class GetArchivedMessagesResponse;
@class GetConversationDetailsInput;
@class GetConversationDetailsResponse;
@class GetPaginatedArchivedMessagesInput;
@class GetPaginatedArchivedMessagesResponse;
@class ResetConversationInput;
@class SelectedDomainInput;
@class TimeLineInput;
@class TimelineResponse;
@class UpdateFavouritesInput;
@class UpdateFavouritesResponse;

#if !defined(GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO) || !GPB_GRPC_FORWARD_DECLARE_MESSAGE_PROTO
  #import "Commonmessages.pbobjc.h"
#endif

@class GRPCProtoCall;


NS_ASSUME_NONNULL_BEGIN

@protocol ConversationService <NSObject>

#pragma mark UpdateFavourites(UpdateFavouritesInput) returns (UpdateFavouritesResponse)

- (void)updateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToUpdateFavouritesWithRequest:(UpdateFavouritesInput *)request handler:(void(^)(UpdateFavouritesResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetTimeline(TimeLineInput) returns (TimelineResponse)

- (void)getTimelineWithRequest:(TimeLineInput *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetTimelineWithRequest:(TimeLineInput *)request handler:(void(^)(TimelineResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetCatalog(CatalogInput) returns (CatalogResponse)

- (void)getCatalogWithRequest:(CatalogInput *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetCatalogWithRequest:(CatalogInput *)request handler:(void(^)(CatalogResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetConversationDetails(GetConversationDetailsInput) returns (GetConversationDetailsResponse)

- (void)getConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetConversationDetailsWithRequest:(GetConversationDetailsInput *)request handler:(void(^)(GetConversationDetailsResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetArchivedMessages(GetArchivedMessagesInput) returns (GetArchivedMessagesResponse)

- (void)getArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetArchivedMessagesWithRequest:(GetArchivedMessagesInput *)request handler:(void(^)(GetArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetPaginatedArchivedMessages(GetPaginatedArchivedMessagesInput) returns (GetPaginatedArchivedMessagesResponse)

- (void)getPaginatedArchivedMessagesWithRequest:(GetPaginatedArchivedMessagesInput *)request handler:(void(^)(GetPaginatedArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetPaginatedArchivedMessagesWithRequest:(GetPaginatedArchivedMessagesInput *)request handler:(void(^)(GetPaginatedArchivedMessagesResponse *_Nullable response, NSError *_Nullable error))handler;


#pragma mark ResetConversation(ResetConversationInput) returns (Empty)

- (void)resetConversationWithRequest:(ResetConversationInput *)request handler:(void(^)(Empty *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToResetConversationWithRequest:(ResetConversationInput *)request handler:(void(^)(Empty *_Nullable response, NSError *_Nullable error))handler;


#pragma mark GetFavouriteConversations(SelectedDomainInput) returns (FavouritesResponse)

- (void)getFavouriteConversationsWithRequest:(SelectedDomainInput *)request handler:(void(^)(FavouritesResponse *_Nullable response, NSError *_Nullable error))handler;

- (GRPCProtoCall *)RPCToGetFavouriteConversationsWithRequest:(SelectedDomainInput *)request handler:(void(^)(FavouritesResponse *_Nullable response, NSError *_Nullable error))handler;


@end


#if !defined(GPB_GRPC_PROTOCOL_ONLY) || !GPB_GRPC_PROTOCOL_ONLY
/**
 * Basic service implementation, over gRPC, that only does
 * marshalling and parsing.
 */
@interface ConversationService : GRPCProtoService<ConversationService>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;
+ (instancetype)serviceWithHost:(NSString *)host;
@end
#endif

NS_ASSUME_NONNULL_END

