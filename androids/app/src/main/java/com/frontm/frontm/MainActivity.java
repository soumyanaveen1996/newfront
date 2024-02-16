package com.frontm.frontm;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import android.os.UserHandle;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.app.NotificationCompat;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;

import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.content.res.Configuration;


public class MainActivity extends ReactActivity {

    public static final String INCOMING_CALL_INVITE          = "INCOMING_CALL_INVITE";
    public static final String INCOMING_CALL_NOTIFICATION_ID = "INCOMING_CALL_NOTIFICATION_ID";
    public static final String CANCELLED_CALL_SSID = "CANCELLED_CALL_SSID";
    public static final String CANCELLED_CALL_INVITE = "CANCELLED_CALL_INVITE";
    public static final String NOTIFICATION_TYPE             = "NOTIFICATION_TYPE";

    public static final String ACTION_INCOMING_CALL = "space.amal.frontm.INCOMING_CALL";
    public static final String ACTION_FCM_TOKEN     = "space.amal.frontm.ACTION_FCM_TOKEN";
    public static final String ACTION_MISSED_CALL   = "space.amal.frontm.MISSED_CALL";
    public static final String ACTION_CANCELLED_CALL   = "space.amal.frontm.CANCELLED_CALL";
    public static final String ACTION_ANSWER_CALL   = "space.amal.frontm.ANSWER_CALL";
    public static final String ACTION_REJECT_CALL   = "space.amal.frontm.REJECT_CALL";
    public static final String ACTION_HANGUP_CALL   = "space.amal.frontm.HANGUP_CALL";
    public static final String ACTION_CLEAR_MISSED_CALLS_COUNT = "space.amal.frontm.CLEAR_MISSED_CALLS_COUNT";
    private Bundle mSavedInstanceState = null;
    /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

    public static String TAG = "IncomingCallScreenActivity";
  @Override
  protected String getMainComponentName() {
    return "frontm_mobile";
  }

   /* Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled()
        ) {
            @Override
            protected Bundle getLaunchOptions() {
                if (null != mSavedInstanceState) {
                    Bundle initialProperties = new Bundle();
                    for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                        initialProperties.putString(key, mSavedInstanceState.getString(key));
                    }
                    for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                        initialProperties.putBoolean(key, mSavedInstanceState.getBoolean(key, false));
                    }
                    initialProperties.putString("dummy","dummy");
                    return initialProperties;
                }
                Intent intent = getIntent();
                Bundle initialProperties = intent.getExtras();

                if (null ==  initialProperties) {
                    initialProperties = new Bundle();
                } else {
                    for(String key: initialProperties.keySet()){
                        if( initialProperties.get(key) instanceof UserHandle){
                            initialProperties.remove(key);
                        }
                    }
                }
                for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                    initialProperties.putString(key, intent.getStringExtra(key));
                }
                for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                    initialProperties.putBoolean(key, intent.getBooleanExtra(key, false));
                }
                initialProperties.putString("dummy","dummy");
                return initialProperties;
            }

            @Override
            public boolean onNewIntent(Intent intent) {
                super.onNewIntent(intent);
                String action_type = intent.getStringExtra("actionType");

                Bundle bundle2 = intent.getExtras();
                if (bundle2 == null) {
                    return true;
                }

                WritableMap params = Arguments.createMap();
                for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                    params.putString(key, bundle2.getString(key));
                }
                for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                    params.putBoolean(key, bundle2.getBoolean(key));
                }

                sendEvent(action_type, params);
                return true;
            }

            @Override
            protected void onResume() {
                super.onResume();
            }
        };
        // return new ReactActivityDelegate(this, getMainComponentName()) {
        //     @Override
        //     protected ReactRootView createRootView() {
        //         ReactRootView reactRootView = new ReactRootView(getContext());
        //         // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        //         reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
        //         return reactRootView;
        //     }

        //     @Override
        //     protected Bundle getLaunchOptions() {
        //         if (null != mSavedInstanceState) {
        //             Bundle initialProperties = new Bundle();
        //             for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
        //                 initialProperties.putString(key, mSavedInstanceState.getString(key));
        //             }
        //             for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
        //                 initialProperties.putBoolean(key, mSavedInstanceState.getBoolean(key, false));
        //             }
        //             initialProperties.putString("dummy","dummy");
        //             return initialProperties;
        //         }
        //         Intent intent = getIntent();
        //         Bundle initialProperties = intent.getExtras();

        //         if (null ==  initialProperties) {
        //             initialProperties = new Bundle();
        //         } else {
        //             Log.d(TAG, "Amal : caller_name3 111: "+ initialProperties);
        //             for(String key: initialProperties.keySet()){
        //                 if( initialProperties.get(key) instanceof UserHandle){
        //                     initialProperties.remove(key);
        //                 }
        //             }
        //         }
        //         for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
        //             initialProperties.putString(key, intent.getStringExtra(key));
        //         }
        //         for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
        //             initialProperties.putBoolean(key, intent.getBooleanExtra(key, false));
        //         }
        //         initialProperties.putString("dummy","dummy");
        //         Log.d(TAG, "Amal : caller_name3: "+ initialProperties);
        //         return initialProperties;
        //     }

        //     @Override
        //     public boolean onNewIntent(Intent intent) {
        //         super.onNewIntent(intent);
        //         String action_type = intent.getStringExtra("actionType");
        //         Log.d(TAG, "Amal : onNewIntent caller_name2: "+ action_type);

        //         Bundle bundle2 = intent.getExtras();
        //         if (bundle2 == null) {
        //             return true;
        //         }

        //         WritableMap params = Arguments.createMap();
        //         for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
        //             Log.d(TAG, "Amal : onNewIntent : " + key + " : " +  bundle2.getString(key));
        //             params.putString(key, bundle2.getString(key));
        //         }
        //         for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
        //             params.putBoolean(key, bundle2.getBoolean(key));
        //         }

        //         sendEvent(action_type, params);
        //         return true;
        //     }

        //     @Override
        //     protected void onResume() {
        //         super.onResume();
        //         Log.d(TAG, "Amal : onResume");
        //         Intent intent = getIntent();
        //         Log.d(TAG, "Amal : onResume " + intent);
        //     }
        // };
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
               super.onConfigurationChanged(newConfig);
               Intent intent = new Intent("onConfigurationChanged");
               intent.putExtra("newConfig", newConfig);
               this.sendBroadcast(intent);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        mSavedInstanceState = savedInstanceState;
        super.onCreate(null);

        NotificationManager nm = (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        for (StatusBarNotification sn: nm.getActiveNotifications()) {
            Notification not = sn.getNotification();
            if (!"voip_call_notifications".equals(not.getChannelId())) {
                continue;
            }

            if (sn.getTag() == null) {
                nm.cancel(sn.getId());
            } else {
                nm.cancel(sn.getTag(), sn.getId());
            }
        }

    
        Intent intent = getIntent();
        String caller_name = intent.getStringExtra("caller_name");
        Log.d(TAG, "caller_name: "+ caller_name);
        Window w = getWindow();
        //w.setFlags(
        //        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
        //        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        //);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel notificationChannel = new NotificationChannel("500", "FrontM", NotificationManager.IMPORTANCE_HIGH);
            notificationChannel.setShowBadge(true);
            notificationChannel.setDescription("");
            AudioAttributes att = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            notificationChannel.setSound(Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/incallmanager_ringback"), att);
            notificationChannel.enableVibration(true);
            notificationChannel.setVibrationPattern(new long[]{400, 400});
            notificationChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(notificationChannel);
        }
        registerBroadcastListener();

    }

    public void removeIncomingCallNotification(Context context,
                                               int notificationId) {
        Log.d(TAG, "Amal : removeIncomingCallNotification");
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            StatusBarNotification[] activeNotifications = notificationManager.getActiveNotifications();
            for (StatusBarNotification statusBarNotification : activeNotifications) {
                Notification notification = statusBarNotification.getNotification();
                String notificationType = notification.extras.getString(NOTIFICATION_TYPE);
                if (notification.extras.getInt(INCOMING_CALL_NOTIFICATION_ID) == notificationId) {
                    notificationManager.cancel(notification.extras.getInt(INCOMING_CALL_NOTIFICATION_ID));
                }
            }
            Log.d(TAG, "Amal : removeIncomingCallNotification");
            if (notificationId != 0) {
                notificationManager.cancel(notificationId);
            }
        } else {
            Log.d(TAG, "Amal : removeIncomingCallNotification");
            if (notificationId != 0) {
                notificationManager.cancel(notificationId);
            }
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
      Log.d(TAG, "Amal : in send event" + eventName + " " + params.toString());
        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();
        context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }


    public void registerBroadcastListener() {

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(ACTION_INCOMING_CALL);
        intentFilter.addAction(ACTION_ANSWER_CALL);
        intentFilter.addAction(ACTION_REJECT_CALL);
        intentFilter.addAction(ACTION_HANGUP_CALL);
        intentFilter.addAction(ACTION_CLEAR_MISSED_CALLS_COUNT);


        registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                String action = intent.getAction();
                final Bundle bundle = new Bundle();
                bundle.putString("message", "message value");
                bundle.putString("action", action);
                intent.getExtras();
                Bundle bundle2 = intent.getExtras();
                Log.d(TAG, "Action data: " + bundle2.getString("caller_name"));

                Log.e(TAG, "Amal : Accept Message Data : " + bundle2.getInt(INCOMING_CALL_NOTIFICATION_ID));
                Log.e(TAG, "Amal : Accept Message Data : " + action);

//                String video = bundle2.getString("video");
                WritableMap params = Arguments.createMap();
                params.putString("caller_name", bundle2.getString("caller_name"));
                params.putString("call_type", bundle2.getString("call_action"));
//                        params.putBoolean("APP_STATE",isAppRunning);

                params.putString("user_id",bundle2.getString("user_id"));
                params.putString("caller_user_id", bundle2.getString("caller_user_id"));
                params.putString("video_session_id",bundle2.getString("video_session_id"));
                params.putString("room_name",bundle2.getString("room_name"));
                params.putString("video_control_id",bundle2.getString("video_control_id"));
                params.putBoolean("video",bundle2.getBoolean("video"));
                String action_type = null;
                switch (action) {
                    case ACTION_INCOMING_CALL:
                    case ACTION_ANSWER_CALL:
                        action_type = "accept";
                        Log.e(TAG, " Accept Message Data : " + params);
                        sendEvent(action_type, params);

                        Intent i = new Intent(getApplicationContext(), MainActivity.class);
                        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                        i.putExtra("caller_name", bundle2.getString("caller_name"));
                        i.putExtra("call_type", bundle2.getString("call_action"));
                        i.putExtra("user_id",bundle2.getString("user_id"));
                        i.putExtra("caller_user_id", bundle2.getString("caller_user_id"));
                        i.putExtra("video_session_id",bundle2.getString("video_session_id"));
                        i.putExtra("room_name",bundle2.getString("room_name"));
                        i.putExtra("video_control_id",bundle2.getString("video_control_id"));
                        i.putExtra("video",bundle2.getBoolean("video"));
                        i.putExtra("action_type", action_type);
                        Log.e(TAG, "Message i : " + i);
                        //startActivity(i);
                        removeIncomingCallNotification(context, bundle2.getInt(INCOMING_CALL_NOTIFICATION_ID));
                        break;
                    case ACTION_REJECT_CALL:
                        removeIncomingCallNotification(context, bundle2.getInt(INCOMING_CALL_NOTIFICATION_ID));
                        action_type = "reject";
                        Log.e(TAG, " Amal : Reject Message Data : " + params);

                        sendEvent(action_type, params);
                        break;
                    case ACTION_HANGUP_CALL:
//                        disconnect();
                        break;
                    case ACTION_CLEAR_MISSED_CALLS_COUNT:
//                        SharedPreferences sharedPref = context.getSharedPreferences(PREFERENCE_KEY, Context.MODE_PRIVATE);
//                        SharedPreferences.Editor sharedPrefEditor = sharedPref.edit();
//                        sharedPrefEditor.putInt(MISSED_CALLS_GROUP, 0);
//                        sharedPrefEditor.commit();
                        break;
                }
                // Dismiss the notification when the user tap on the relative notification action
                // eventually the notification will be cleared anyway
                // but in this way there is no UI lag
                NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                notificationManager.cancel(intent.getIntExtra(INCOMING_CALL_NOTIFICATION_ID, 0));
//                handleRemotePushNotification((ReactApplicationContext) reactContext, bundle);

//                handleRemotePushNotification((ReactApplicationContext) reactContext, bundle);
            }
        }, intentFilter);
    }



}
