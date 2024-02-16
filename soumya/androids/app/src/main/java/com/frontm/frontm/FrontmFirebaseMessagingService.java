package com.frontm.frontm;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import android.os.PowerManager;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

import java.security.SecureRandom;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;

public class FrontmFirebaseMessagingService extends FcmInstanceIdListenerService {
    public static String LOG_TAG = "FrontmFirebaseMessagingService";
    public static String REJECT_CALL_ACTION = "com.frontm.frontm.action.reject";
    public static String ANSWER_CALL_ACTION = "com.frontm.frontm.action.accept";
    public static final String INCOMING_CALL_INVITE          = "INCOMING_CALL_INVITE";
    public static final String INCOMING_CALL_NOTIFICATION_ID = "INCOMING_CALL_NOTIFICATION_ID";
    public static final String NOTIFICATION_TYPE             = "NOTIFICATION_TYPE";
    public static final String ACTION_INCOMING_CALL = "com.frontm.frontm.INCOMING_CALL";
    public static final String ACTION_FCM_TOKEN     = "com.frontm.frontm.ACTION_FCM_TOKEN";
    public static final String ACTION_MISSED_CALL   = "com.frontm.frontm.MISSED_CALL";
    public static final String ACTION_CANCELLED_CALL   = "com.frontm.frontm.CANCELLED_CALL";
    public static final String ACTION_HANGUP_CALL   = "com.frontm.frontm.HANGUP_CALL";
    public static final String ACTION_CLEAR_MISSED_CALLS_COUNT = "com.frontm.frontm.CLEAR_MISSED_CALLS_COUNT";

    public static final String CALL_SID_KEY = "CALL_SID";
    public static final String INCOMING_NOTIFICATION_PREFIX = "Incoming_";
    public static final String MISSED_CALLS_GROUP = "MISSED_CALLS";
    public static final int MISSED_CALLS_NOTIFICATION_ID = 1;
    public static final int HANGUP_NOTIFICATION_ID = 11;
    public static final int CLEAR_MISSED_CALLS_NOTIFICATION_ID = 21;
    public static final String VOICE_CHANNEL = "voip_call_notifications";

    private boolean isReceiverRegistered = false;
    public static String[] NOTIFICATION_KEYS = new String[]{
            "callerName",
            "callAction",
            "callerUserId",
            "userId",
            "botId",
            "videoSessionId",
            "roomName",
            "videoControlId",
            "mediasoupHost",
            "codec",
            "iAmHost",
            "startWithVideoMuted",
            "startWithAudioMuted",
            "preConnectCallCheck",
            "uid",
            "ur",
            "brand",
            "message",
            "actionType",

    };

    public static String[] BOOL_NOTIFICATION_KEYS = new String[]{
            "video",
    };
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(LOG_TAG, "Remote Data : " + remoteMessage.getNotification());
        if (null == remoteMessage.getNotification()) {
            // This is a data notification. We use it for Calls and nothing else.

            Map data = remoteMessage.getData();

            Log.d(LOG_TAG, "Remote Data : " + data.toString());
            // Handling Call End
            if ("CallEnd".equals(data.get("callAction"))) {
                NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                FrontmFirebaseMessagingService.cancelCallNotifications(notificationManager, -1);
                sentLocalBroadcast(REJECT_CALL_ACTION);
            } else {
                // If the activity is backround, foreground or killed, we show the notification. Only on locked screen, we should show
                // If the activity is in foreground then just send a message to JS
                // Else if it the activity is in Background or killed, send a pending intent with a Lock screen Activity
                // The pending intent should start the activity with the data
                // If it goes to the LockScreenActivity, then it has to start the activity with the same data as the intent
                showCallNotification(remoteMessage);
            }
        } else {
            super.onMessageReceived(remoteMessage);
        }
    }

    private boolean isAppRunning() {
        ActivityManager m = (ActivityManager) this.getSystemService( ACTIVITY_SERVICE );
        List<ActivityManager.RunningTaskInfo> runningTaskInfoList =  m.getRunningTasks(10);
        Iterator<ActivityManager.RunningTaskInfo> itr = runningTaskInfoList.iterator();
        int n=0;
        Log.d(LOG_TAG, " Amal : Running ---------");
        while(itr.hasNext()){
            n++;
            ActivityManager.RunningTaskInfo a = itr.next();
            Log.d(LOG_TAG, " Amal : Running " + a.baseActivity.getClassName());
        }
        Log.d(LOG_TAG, " Amal : Running ---------");
        if(n==1){ // App is killed
            return false;
        }
        return true; // App is in background or foreground
    }

    public Bundle createBundleFromMessage(RemoteMessage message) {
        Bundle bundle = new Bundle();
        for (String key: FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
            bundle.putString(key, message.getData().get(key));
        }
        for (String key: FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
            bundle.putBoolean(key, message.getData().get(key).equals("true"));
        }
        return bundle;
    }

    public Notification showNotification(RemoteMessage message, Intent launchIntent) {
        SecureRandom randomNumberGenerator = new SecureRandom();
        final int notificationId = randomNumberGenerator.nextInt();

        launchIntent.putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId);

        long durationMs = 30000;
        Log.d("IncomingCallScreenActivity", "Is app running : " + isAppRunning());
        Bundle bundle = createBundleFromMessage(message);
        bundle.putBoolean("appState", isAppRunning());

        String callerName = message.getData().get("callerName");
        Uri defaultRingtoneUri = RingtoneManager.getActualDefaultRingtoneUri(getApplicationContext(), RingtoneManager.TYPE_RINGTONE);
        PendingIntent pendingIntent = PendingIntent.getActivity(getApplicationContext(), 0, launchIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(getApplicationContext(), VOICE_CHANNEL)
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setSmallIcon(R.drawable.ic_call_white)
                        .setOngoing(true)
                        .setChannelId(VOICE_CHANNEL)
                        .setExtras(bundle)
                        .setTimeoutAfter(durationMs)
                        .setSound(defaultRingtoneUri)
                        .setDefaults(NotificationCompat.DEFAULT_ALL)
                        .setFullScreenIntent(pendingIntent, true)
                        .setAutoCancel(true);

        if ("conferenceCall".equals(message.getData().get("videoControlId"))) {
            notificationBuilder.setContentTitle("Incoming");
            notificationBuilder.setContentText(message.getData().get("message"));
        } else {
            if (message.getData().get("video").equals("true")) {
                notificationBuilder.setContentTitle("Incoming Video Call");
            } else {
                notificationBuilder.setContentTitle("Incoming Call");
            }
            notificationBuilder.setContentText(callerName + " is calling");
        }


        // build notification large icon
        Resources res = getApplicationContext().getResources();
        int largeIconResId = res.getIdentifier("ic_launcher", "mipmap", getApplicationContext().getPackageName());
        Bitmap largeIconBitmap = BitmapFactory.decodeResource(res, largeIconResId);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (largeIconResId != 0) {
                notificationBuilder.setLargeIcon(largeIconBitmap);
            }
        }

        Intent rejectIntent = new Intent(this, MainActivity.class)
                .setAction(REJECT_CALL_ACTION)
                .putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId)
                .putExtras(bundle)
                .putExtra("actionType", "reject");
                


        PendingIntent pendingRejectIntent = PendingIntent.getActivity(this, 1, rejectIntent,
                PendingIntent.FLAG_UPDATE_CURRENT| PendingIntent.FLAG_IMMUTABLE);
        Log.d(LOG_TAG, "Amal : Pending reject intent" + pendingRejectIntent);
        notificationBuilder.addAction(0, "DISMISS", pendingRejectIntent);

        // Answer action
        Intent answerIntent = new Intent(this, MainActivity.class);
        answerIntent
                .putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId)
                .setAction(ANSWER_CALL_ACTION)
                .putExtras(bundle)
                .putExtra("actionType", "accept");

        PendingIntent pendingAnswerIntent = PendingIntent.getActivity(this, 0, answerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT| PendingIntent.FLAG_IMMUTABLE);
        Log.d(LOG_TAG, "Amal : Pending answer intent" + pendingAnswerIntent);
        notificationBuilder.addAction(R.drawable.ic_call_white, "ANSWER", pendingAnswerIntent);


        this.wakeUpLock();


        Notification notification = notificationBuilder.build();
        notification.flags = notification.flags | Notification.FLAG_INSISTENT | Notification.FLAG_NO_CLEAR;
        Log.d(LOG_TAG, "Amal : notifying notifications");
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        initCallNotificationsChannel(notificationManager);
        notificationManager.notify(notificationId, notification);
        Log.d(LOG_TAG, "Amal : notifying notifications done");
        return notification;
    }

    public void showCallNotification(RemoteMessage message) {
        Intent launchIntent = new Intent(getApplicationContext(), IncomingCallScreenActivity.class);
        int launchFlag = Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP;

        Bundle bundle = createBundleFromMessage(message);
        launchIntent.setAction(ACTION_INCOMING_CALL)
                .putExtras(bundle)
                .addFlags(launchFlag);
        showNotification(message, launchIntent);
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

    public int getApplicationImportance(ReactApplicationContext context) {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(ACTIVITY_SERVICE);
        if (activityManager == null) {
            return 0;
        }
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos == null) {
            return 0;
        }

        for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
            if (processInfo.processName.equals(context.getApplicationInfo().packageName)) {
                return processInfo.importance;
            }
        }
        return 0;
    }


    public void showIncomingCallScreen(RemoteMessage message) {

    }

    public Intent getLaunchIntent(ReactApplicationContext context,
                                  int notificationId,
                                  Boolean shouldStartNewTask,
                                  int appImportance,
                                  Bundle bundle
    ) {
        Intent launchIntent = new Intent(context, IncomingCallScreenActivity.class);

        Log.d(LOG_TAG, "Amal : shouldStart New Task " + shouldStartNewTask);

        int launchFlag = Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP;
        if (shouldStartNewTask || appImportance != ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
            Log.d(LOG_TAG, "Amal : shouldStart New Tasks " + shouldStartNewTask);
            launchFlag = Intent.FLAG_ACTIVITY_NEW_TASK;
        }

        launchIntent.setAction(ACTION_INCOMING_CALL)
                .putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId)
                .putExtras(bundle)
                .addFlags(launchFlag);

        return launchIntent;
    }

    public void initCallNotificationsChannel(NotificationManager notificationManager) {
        if (Build.VERSION.SDK_INT < 26) {
            return;
        }
        Log.d(LOG_TAG, "Amal : In initCallNotificationsChannel");
        Uri defaultRingtoneUri = RingtoneManager.getActualDefaultRingtoneUri(getApplicationContext(), RingtoneManager.TYPE_RINGTONE);
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .build();

        NotificationChannel channel = new NotificationChannel(VOICE_CHANNEL,
                "Calls Channel", NotificationManager.IMPORTANCE_HIGH);
        channel.setLightColor(Color.GREEN);
        channel.enableLights(true);
        channel.enableVibration(true);
        channel.setDescription("Notification Channels for Calls");
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        channel.setImportance(NotificationManager.IMPORTANCE_HIGH);
        channel.setSound(defaultRingtoneUri, audioAttributes);

        notificationManager.createNotificationChannel(channel);
    }

    private void sendIncomingCallMessageToActivity(
            ReactApplicationContext context,
            Bundle extras,
            int notificationId
    ) {
        Intent intent = new Intent(ACTION_INCOMING_CALL);
        intent.putExtra(INCOMING_CALL_NOTIFICATION_ID, notificationId);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    private void wakeUpLock() {
        Context context = getApplicationContext();
        PowerManager pm = (PowerManager)context.getSystemService(Context.POWER_SERVICE);

        boolean isScreenOn = pm.isScreenOn();

        Log.i(LOG_TAG, "screen on: "+ isScreenOn);

        if(isScreenOn==false)
        {
            Log.i(LOG_TAG, "screen on if: "+ isScreenOn);
            PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK |PowerManager.ACQUIRE_CAUSES_WAKEUP |PowerManager.ON_AFTER_RELEASE,"frontm:call_lock");
            wl.acquire(10000);

            PowerManager.WakeLock wl_cpu = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"frontm:call_cpu_lock");
            wl_cpu.acquire(10000);
        }
    }


    public void startReactContextAndShowCallNotification(RemoteMessage remoteMessage, int notificationId) {
        Log.d(LOG_TAG, "Amal : In Create Incoming Call Notification 2");
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
                         public void run() {
                             ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
                             ReactContext context = mReactInstanceManager.getCurrentReactContext();
                             Log.d(LOG_TAG, "Amal : In Create Incoming Call Notification 2 Context" + context);
                             if (context != null) {
                                 Log.d(LOG_TAG, "Amal : In Create Incoming Call Notification 2 Context not null");
                                 Log.d(LOG_TAG, "Amal : " + "Using old context and initialized");
                                 showCallNotification(remoteMessage);
                             } else {
                                 mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                                     public void onReactContextInitialized(ReactContext context) {
                                         Log.d(LOG_TAG, "Amal : " + "Creating context and initialized");
                                         showCallNotification(remoteMessage);
                                     }
                                 });
                                 if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                                     // Construct it in the background
                                     mReactInstanceManager.createReactContextInBackground();
                                 }
                             }
                         }
                     }
        );
    }

    public void sentLocalBroadcast(String action) {
        LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
                .getInstance(FrontmFirebaseMessagingService.this);
        localBroadcastManager.sendBroadcast(new Intent(action));
    }

    public static void cancelCallNotifications(NotificationManager manager, int notificationId) {

        for (StatusBarNotification sn: manager.getActiveNotifications()) {
            Notification not = sn.getNotification();

            if ((not.flags & Notification.FLAG_INSISTENT) != 0) {
                Log.d(LOG_TAG, "Amal : isAppRunning1: remving call from notiofication call" );
                manager.cancel(sn.getId());
            }
        }
    }
}
