#import "AppDelegate.h"


#import <React/RCTBundleURLProvider.h>
#import <React/RCTLog.h>
#import <RNCallKeep.h>
#import <Bugsnag/Bugsnag.h>
#import <PushKit/PushKit.h>
#import "RNVoipPushNotificationManager.h"
#import "RNNotifications.h"
#import "Orientation.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"frontm_mobile";
  self.initialProps = @{};
  [Bugsnag start];
  
  NSString *appName = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleName"];
  // We are setting up RNCallKeep here since the setup is not completed if a call is pucked from the killed state.
  [RNCallKeep setup:@{
      @"appName": appName,
      @"maximumCallGroups": @1,
      @"imageName": @"call-logo"
    }];
  [self voipRegistration];
  [RNNotifications startMonitorNotifications];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window  {
  return [Orientation getOrientation];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


// Required to register for notifications
// TODO (amal) : Check if we still need it after react-native-notifications migration
/*
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
} */

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
                                                    fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNNotifications didReceiveBackgroundNotification:userInfo withCompletionHandler:completionHandler];
}

// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

/*
// Required for the localNotification event.
 // TODO (amal) : Check if we still need it after react-native-notifications migration
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
} */

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  return application;
}

// Register for VoIP notifications
- (void) voipRegistration {
  dispatch_queue_t mainQueue = dispatch_get_main_queue();
  // Create a push registry object
  PKPushRegistry * voipRegistry = [[PKPushRegistry alloc] initWithQueue: mainQueue];
  // Set the registry's delegate to self
  voipRegistry.delegate = self;
  // Set the push type to VoIP
  voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}

static void showAlert(NSString *message) {
  UIWindow* topWindow = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  topWindow.rootViewController = [UIViewController new];
  topWindow.windowLevel = UIWindowLevelAlert + 1;
  UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"APNS" message:[NSString stringWithFormat:@"content: %@", message] preferredStyle:UIAlertControllerStyleAlert];
  [alert addAction:[UIAlertAction actionWithTitle:NSLocalizedString(@"OK",@"confirm") style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
    // continue your work

    // important to hide the window after work completed.
    // this also keeps a reference to the window until the action is invoked.
    topWindow.hidden = YES; // if you want to hide the topwindow then use this

  }]];
  [topWindow makeKeyAndVisible];
  [topWindow.rootViewController presentViewController:alert animated:YES completion:nil];
}

// Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials: (PKPushCredentials *)credentials forType:(NSString *)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];

  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    const unsigned *tokenBytes = (const unsigned *)[credentials.token bytes];
    NSString *deviceTokenString = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                              ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                              ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                              ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
    NSLog(@"###### didUpdatePushCredentials %@", deviceTokenString);
    [[NSUserDefaults standardUserDefaults] setObject:deviceTokenString forKey:@"voipToken"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    self.voipToken = deviceTokenString;
    
//    showAlert(deviceTokenString);
    
  }
  
}

// Handle incoming pushes
//- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type {
//  // Process the received push
//  NSLog(@"###### didUpdatePushCredentials %@", [payload dictionaryPayload]);
//  NSDictionary *extra = [payload.dictionaryPayload valueForKeyPath:@"aps.data"]; /* use this to pass any special data (ie. from your notification) down to RN. Can also be `nil` */
//    NSString *uuid = [[[NSUUID UUID] UUIDString] lowercaseString];
//
//  [RNCallKeep reportNewIncomingCall:uuid handle:@"new call" handleType:@"generic" hasVideo:false localizedCallerName:@"akshay" fromPushKit: YES payload:extra];
//
//
//}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // Process the received push
  //  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
  
  
//  showAlert([NSString stringWithFormat:@" dictionary is %@", [payload dictionaryPayload]]);
      
      
      // Retrieve information like handle and callerName here
      // NSString *uuid = /* fetch for payload or ... */ [[[NSUUID UUID] UUIDString] lowercaseString];
      // NSString *callerName = @"caller name here";
      // NSString *handle = @"caller number here";
      // NSDictionary *extra = [payload.dictionaryPayload valueForKeyPath:@"custom.path.to.data"]; /* use this to pass any special data (ie. from your notification) down to RN. Can also be `nil` */
      @try {
        NSString *uuid = [[[NSUUID UUID] UUIDString] lowercaseString];
        self.callID = uuid;
        BOOL video = [[payload.dictionaryPayload valueForKeyPath:@"aps.data.video"] boolValue];
       RCTLog(@"_______>display:");
        [RNCallKeep reportNewIncomingCall:uuid
                                   handle:@"new call"
                               handleType:@"generic"
                                 hasVideo:video
                      localizedCallerName:[payload.dictionaryPayload valueForKeyPath:@"aps.alert"]
                          supportsHolding:false
                             supportsDTMF:true
                         supportsGrouping:false
                       supportsUngrouping:false
                              fromPushKit:YES
                                  payload:[payload.dictionaryPayload valueForKeyPath:@"aps.data"]
                    withCompletionHandler:^(void){
          
               completion();
        }];
        

      }
      @catch (NSException * e) {
//        showAlert(@"exception");
        [RNCallKeep reportNewIncomingCall:@"123e4567-e89b-12d3-a456-556642440000"
                                   handle:@"new call" handleType:@"generic"
                                 hasVideo:false
                      localizedCallerName:@"cathc error"
                          supportsHolding:false
                             supportsDTMF:true
                         supportsGrouping:false
                       supportsUngrouping:false
                              fromPushKit:YES
                                  payload:nil
                    withCompletionHandler:^(void){
          RCTLog(@"_______>Exception: %@", e);
          
               completion();
        }];
      }
      @finally {
         RCTLog(@"_______>finally");
      }
}


- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type{
  NSLog(@"###### didInvalidatePushTokenForType ");
}

-(void)applicationDidEnterBackground:(UIApplication *)application{
   [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
 }


- (BOOL)application:(UIApplication *)application
 continueUserActivity:(NSUserActivity *)userActivity
   restorationHandler:(void(^)(NSArray * __nullable restorableObjects))restorationHandler
{
   return [RNCallKeep application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
}


@end
