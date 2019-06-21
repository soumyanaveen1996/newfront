#import "AgentGuardServiceClient.h"
#import "Agentguardservice.pbrpc.h"
#import "Conversation+frontm.h"
#import "AgentGuardStringResponse+frontm.h"

#import <React/RCTLog.h>
#import "GRPCMetadata.h"

@interface AgentGuardServiceClient()

@property (strong, nonatomic) AgentGuardService *serviceClient;

@end

@implementation AgentGuardServiceClient

@synthesize serviceClient = _serviceClient;


- (id) init {
  self = [super init];
  if (self) {
    _serviceClient = [[AgentGuardService alloc] initWithHost:GRPCMetadata.shared.uri];
  }
  return self;
}

- (AgentGuardService *) serviceClient {
  if (_serviceClient == nil) {
    _serviceClient = [[AgentGuardService alloc] initWithHost:GRPCMetadata.shared.uri];
  }
  return _serviceClient;
}


RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(execute, execute:(NSString *)sessionId andParams:(NSDictionary*)params andCallback:(RCTResponseSenderBlock)callback ) {
  RCTLog(@"GRPC::::method:execute Params : %@", params);
  
  AgentGuardInput *input = [AgentGuardInput new];
  input.parameters = params[@"parameters"];
  input.conversation = [Conversation conversationfromDictionary:params[@"conversation"]];
  input.capability = params[@"capability"];
  input.sync = [params[@"sync"] boolValue];
  input.requestUuid = params[@"requestUuid"];
  
  GRPCProtoCall *call = [self.serviceClient RPCToExecuteWithRequest:input handler:^(AgentGuardStringResponse * _Nullable response, NSError * _Nullable error) {
    if (error != nil) {
      RCTLog(@"GRPC::::method:execute Response error : %@", [error description]);
      callback(@[@{}, [NSNull null]]);
      self.serviceClient = nil;
      return;
    } else {
      RCTLog(@"GRPC::::method:execute Response : %@", [response toResponse]);
      callback(@[[NSNull null], [response toResponse]]);
    }
  }];
  
  NSInteger timeout = 15;
  
  if([input.capability isEqualToString:@"PingAgentGuardCapability"]){
    timeout = 5;
  }
  
  [call setTimeout:timeout];
  call.requestHeaders[@"sessionId"] = sessionId;
  [call start];
}
@end
