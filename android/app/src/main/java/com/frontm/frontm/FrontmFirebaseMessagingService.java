package com.frontm.frontm;

import android.annotation.TargetApi;
import android.app.ActivityManager;
import android.app.Application;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Binder;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.dieam.reactnativepushnotification.helpers.ApplicationBadgeHelper;
import com.dieam.reactnativepushnotification.modules.RNPushNotificationHelper;
import com.dieam.reactnativepushnotification.modules.RNPushNotificationJsDelivery;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import space.amal.twilio.BuildConfig;
import space.amal.twilio.CallNotificationManager;
import space.amal.twilio.SoundPoolManager;
import space.amal.twilio.fcm.VoiceFirebaseMessagingService;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.CallException;
import com.twilio.voice.MessageListener;
import com.twilio.voice.Voice;

import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.dieam.reactnativepushnotification.modules.RNPushNotification.LOG_TAG;
import static space.amal.twilio.RNTwilioVoiceLibraryModule.ACTION_INCOMING_CALL;
import static space.amal.twilio.RNTwilioVoiceLibraryModule.ACTION_REJECT_CALL;
import static space.amal.twilio.RNTwilioVoiceLibraryModule.INCOMING_CALL_INVITE;
import static space.amal.twilio.RNTwilioVoiceLibraryModule.INCOMING_CALL_NOTIFICATION_ID;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import org.json.JSONObject;


public class FrontmFirebaseMessagingService extends FirebaseMessagingService {


    public static String TAG = "FrontmFirebaseMessagingService";


    /*
    public void printIntent(Intent intent) {
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            for (String key : bundle.keySet()) {
                Object value = bundle.get(key);
                Log.d(TAG, String.format("%s %s (%s)", key,
                        value.toString(), value.getClass().getName()));
            }
        }
        if (intent.getAction() != null)
            Log.d(TAG, intent.getAction());
    }

    //@Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Intent i = new Intent(getApplicationContext(), VoiceFirebaseMessagingService.class);
        Intent fromIntent = remoteMessage.toIntent();
        printIntent(fromIntent);
        Log.d(TAG, "divider");
        i.putExtras(fromIntent);
        i.setAction("com.google.firebase.MESSAGING_EVENT");
        printIntent(i);
        startService(i);
    } */

    private CallNotificationManager callNotificationManager;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "onCreate");
        callNotificationManager = new CallNotificationManager();
    }


    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "Bundle data: " + remoteMessage.getData());
        }

        if (remoteMessage.getData().get("twi_account_sid") != null) {
            this.onTwilioMessageReceived(remoteMessage);
        } else {
            this.onPushNotificationMessageReceived(remoteMessage);
        }
    }

    public void onTwilioMessageReceived(RemoteMessage remoteMessage) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "Twilio Bundle data: " + remoteMessage.getData());
        }

        if (remoteMessage.getData().get("twi_account_sid") != null) {

        }

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Map<String, String> data = remoteMessage.getData();

            // If notification ID is not provided by the user for push notification, generate one at random
            Random randomNumberGenerator = new Random(System.currentTimeMillis());
            final int notificationId = randomNumberGenerator.nextInt();

            Voice.handleMessage(this, data, new MessageListener() {

                @Override
                public void onCallInvite(final CallInvite callInvite) {

                    // We need to run this on the main thread, as the React code assumes that is true.
                    // Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
                    // "Can't create handler inside thread that has not called Looper.prepare()"
                    Handler handler = new Handler(Looper.getMainLooper());
                    handler.post(new Runnable() {
                        public void run() {
                            // Construct and load our normal React JS code bundle
                            ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
                            ReactContext context = mReactInstanceManager.getCurrentReactContext();


                            // If it's constructed, send a notification
                            if (context != null) {
                                SharedPreferences sharedPref = context.getSharedPreferences("NativeStorage", Context.MODE_PRIVATE);
                                String session = sharedPref.getString("SESSION", "none");
                                String url = sharedPref.getString("URL", "none");
                                String bot = sharedPref.getString("CONTACTS_BOT", "none");

                                if(session.equalsIgnoreCase("none")){
                                  return;
                                }
                                int appImportance = callNotificationManager.getApplicationImportance((ReactApplicationContext)context);
                                if (BuildConfig.DEBUG) {
                                    Log.d(TAG, "CONTEXT present appImportance = " + appImportance);
                                }
                                Intent launchIntent = callNotificationManager.getLaunchIntent(
                                        (ReactApplicationContext)context,
                                        notificationId,
                                        callInvite,
                                        false,
                                        appImportance
                                );
                                // app is not in foreground
                                if (appImportance != ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                                    context.startActivity(launchIntent);
                                }
                                FrontmFirebaseMessagingService.this.handleIncomingCall((ReactApplicationContext)context, notificationId, callInvite, launchIntent);
                            } else {
                                // Otherwise wait for construction, then handle the incoming call
                                mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                                    public void onReactContextInitialized(ReactContext context) {
                                        SharedPreferences sharedPref = context.getSharedPreferences("NativeStorage", Context.MODE_PRIVATE);
                                        String session = sharedPref.getString("SESSION", "none");
                                        String url = sharedPref.getString("URL", "none");
                                        String bot = sharedPref.getString("CONTACTS_BOT", "none");

                                        if(session.equalsIgnoreCase("none")){
                                            return;
                                        }
                                        int appImportance = callNotificationManager.getApplicationImportance((ReactApplicationContext)context);
                                        if (BuildConfig.DEBUG) {
                                            Log.d(TAG, "CONTEXT not present appImportance = " + appImportance);
                                        }
                                        Intent launchIntent = callNotificationManager.getLaunchIntent((ReactApplicationContext)context, notificationId, callInvite, true, appImportance);
                                        context.startActivity(launchIntent);
                                        FrontmFirebaseMessagingService.this.handleIncomingCall((ReactApplicationContext)context, notificationId, callInvite, launchIntent);
                                    }
                                });
                                if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                                    // Construct it in the background
                                    mReactInstanceManager.createReactContextInBackground();
                                }
                            }
                        }
                    });
                }

                @Override
                public void onCancelledCallInvite(@NonNull final CancelledCallInvite cancelledCallInvite, @Nullable CallException callException) {
                    Handler handler = new Handler(Looper.getMainLooper());
                    handler.post(new Runnable() {
                                     public void run() {
                                         FrontmFirebaseMessagingService.this.cancelNotification(cancelledCallInvite);
                                     }
                                 });

                }


            });
        }

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.e(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }

    private void handleIncomingCall(ReactApplicationContext context,
                                    int notificationId,
                                    CallInvite callInvite,
                                    Intent launchIntent
    ) {
        sendIncomingCallMessageToActivity(context, callInvite, notificationId);
        showNotification(context, callInvite, notificationId, launchIntent);
    }

    private void cancelNotification(final CancelledCallInvite cancelledCallInvite) {
        SoundPoolManager.getInstance((this)).stopRinging();
        ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();
        // If it's constructed, send a notification
        if (context != null) {
            callNotificationManager.removeCancelledCallNotification((ReactApplicationContext)context, cancelledCallInvite, 0);
        } else {
            mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext context) {
                    int appImportance = callNotificationManager.getApplicationImportance((ReactApplicationContext)context);
                    if (BuildConfig.DEBUG) {
                        Log.d(TAG, "CONTEXT not present appImportance = " + appImportance);
                    }
                    callNotificationManager.removeCancelledCallNotification((ReactApplicationContext)context, cancelledCallInvite, 0);
                }});
        }

    }

    /*
     * Send the IncomingCallMessage to the TwilioVoiceModule
     */
    private void sendIncomingCallMessageToActivity(
            ReactApplicationContext context,
            CallInvite callInvite,
            int notificationId
    ) {
        Intent intent = new Intent(ACTION_INCOMING_CALL);
        intent.putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId);
        intent.putExtra(INCOMING_CALL_INVITE, callInvite);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    /*
     * Show the notification in the Android notification drawer
     */
    @TargetApi(20)
    private void showNotification(ReactApplicationContext context,
                                  CallInvite callInvite,
                                  int notificationId,
                                  Intent launchIntent
    ) {
        if (callInvite != null) {
            callNotificationManager.createIncomingCallNotification(context, callInvite, notificationId, launchIntent);
        } else {
            SoundPoolManager.getInstance(context.getBaseContext()).stopRinging();
            callNotificationManager.removeIncomingCallNotification(context, callInvite, notificationId);
        }
    }


    public void onPushNotificationMessageReceived(RemoteMessage message) {
        String from = message.getFrom();

        final Bundle bundle = new Bundle();
        for(Map.Entry<String, String> entry : message.getData().entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }
        JSONObject data = getPushData(bundle.getString("data"));
        // Copy `twi_body` to `message` to support Twilio
        if (bundle.containsKey("twi_body")) {
            bundle.putString("message", bundle.getString("twi_body"));
        }

        if (data != null) {
            if (!bundle.containsKey("message")) {
                bundle.putString("message", data.optString("alert", null));
            }
            if (!bundle.containsKey("title")) {
                bundle.putString("title", data.optString("title", null));
            }
            if (!bundle.containsKey("sound")) {
                bundle.putString("soundName", data.optString("sound", null));
            }
            if (!bundle.containsKey("color")) {
                bundle.putString("color", data.optString("color", null));
            }

            final int badge = data.optInt("badge", -1);
            if (badge >= 0) {
                ApplicationBadgeHelper.INSTANCE.setApplicationIconBadgeNumber(this, badge);
            }
        }

        Log.v(LOG_TAG, "onMessageReceived: " + bundle);

        // We need to run this on the main thread, as the React code assumes that is true.
        // Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
        // "Can't create handler inside thread that has not called Looper.prepare()"
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            public void run() {
                // Construct and load our normal React JS code bundle
                ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
                ReactContext context = mReactInstanceManager.getCurrentReactContext();
                // If it's constructed, send a notification
                if (context != null) {
                    handleRemotePushNotification((ReactApplicationContext) context, bundle);
                } else {
                    // Otherwise wait for construction, then send the notification
                    mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                        public void onReactContextInitialized(ReactContext context) {
                            handleRemotePushNotification((ReactApplicationContext) context, bundle);
                        }
                    });
                    if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                        // Construct it in the background
                        mReactInstanceManager.createReactContextInBackground();
                    }
                }
            }
        });
    }

    private JSONObject getPushData(String dataString) {
        try {
            return new JSONObject(dataString);
        } catch (Exception e) {
            return null;
        }
    }

    private void handleRemotePushNotification(ReactApplicationContext context, Bundle bundle) {

        // If notification ID is not provided by the user for push notification, generate one at random
        if (bundle.getString("id") == null) {
            Random randomNumberGenerator = new Random(System.currentTimeMillis());
            bundle.putString("id", String.valueOf(randomNumberGenerator.nextInt()));
        }

        Boolean isForeground = isApplicationInForeground();

        RNPushNotificationJsDelivery jsDelivery = new RNPushNotificationJsDelivery(context);
        bundle.putBoolean("foreground", isForeground);
        bundle.putBoolean("userInteraction", false);
        jsDelivery.notifyNotification(bundle);

        // If contentAvailable is set to true, then send out a remote fetch event
        if (bundle.getString("contentAvailable", "false").equalsIgnoreCase("true")) {
            jsDelivery.notifyRemoteFetch(bundle);
        }

        Log.v(LOG_TAG, "sendNotification: " + bundle);

        Application applicationContext = (Application) context.getApplicationContext();
        RNPushNotificationHelper pushNotificationHelper = new RNPushNotificationHelper(applicationContext);
        if(isForeground == false){
            pushNotificationHelper.sendToNotificationCentre(bundle);
        }
    }

    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getApplication().getPackageName())) {
                    if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                        for (String d : processInfo.pkgList) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
