package com.frontm.frontm;

import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.preference.PreferenceManager;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.FileNotFoundException;

public class IncomingCallScreenActivity extends ReactActivity {
    private static final String TAG = "IncomingCallScreenActivity";
    private int notificationId = -1;
    private Ringtone ringtone;
    LocalBroadcastManager mLocalBroadcastManager;
    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if(intent.getAction().equals(FrontmFirebaseMessagingService.REJECT_CALL_ACTION)){
                cancelNotifications();
                stopForegroundService();
                finish();
            }
        }
    };
    private boolean callActionPerformed = false;

    void cancelNotifications() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        for (StatusBarNotification sn: notificationManager.getActiveNotifications()) {
            Notification not = sn.getNotification();
            if ((not.flags & Notification.FLAG_INSISTENT) != 0) {
                if (sn.getTag() == null) {
                    notificationManager.cancel(sn.getId());
                } else {
                    notificationManager.cancel(sn.getTag(), sn.getId());
                }
                notificationManager.cancel(sn.getId());
            }
        }
        if (notificationId != -1) {
            notificationManager.cancel(notificationId);
        }
    }

    boolean isDeviceLocked() {
        boolean isLocked = false;

        // First we check the locked state
        KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        boolean isKeyguardLocked = keyguardManager.isKeyguardLocked();

        if (isKeyguardLocked) {
            isLocked = true;
        } else {
            PowerManager powerManager = (PowerManager)getSystemService(Context.POWER_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                isLocked = !powerManager.isInteractive();
            } else {
                //noinspection deprecation
                isLocked = !powerManager.isScreenOn();
            }
        }
        return isLocked;
    }


    @RequiresApi(api = Build.VERSION_CODES.P)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "Amal : In INcomingCallScreenActivity onCreate");
        mLocalBroadcastManager = LocalBroadcastManager.getInstance(this);
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.incomingcallscreenactivity.action.close");
        mLocalBroadcastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        Intent genesisIntent = getIntent();

       Boolean isVideoCall = false;
        if(genesisIntent.getExtras()!=null){
        Bundle b = genesisIntent.getExtras();
        isVideoCall = (Boolean) b.get("video");
        }
       
        if(isVideoCall){
        setContentView(R.layout.video_activity_call_incoming);       
        }else{
        setContentView(R.layout.activity_call_incoming);
        }
        TextView tv = (TextView) findViewById(R.id.callStatus);

        if ("conferenceCall".equals(genesisIntent.getStringExtra("videoControlId"))) {

            tv.setText("");
        } else if (isVideoCall) {
            tv.setText("Incoming Video Call");
        } else {
            tv.setText("Incoming Call");
        }

        notificationId = genesisIntent.getIntExtra(FrontmFirebaseMessagingService.INCOMING_CALL_NOTIFICATION_ID, -1);

        Log.d(TAG, "Amal : In IncomingCallScreenActivity");
        //ringtoneManager start


        Uri incomingCallNotification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        this.ringtone= RingtoneManager.getRingtone(getApplicationContext(), incomingCallNotification);

        Log.d(TAG, "Amal : In IncomingCallScreenActivity22");
        //ringtoneManager end

        ringtone.setLooping(true);
        ringtone.play();


        String hostName = genesisIntent.getStringExtra("callerName");
        String incomingCallType = genesisIntent.getStringExtra("callType");
        String botId = genesisIntent.getStringExtra("botId");


        Boolean isAppRuning = genesisIntent.getBooleanExtra("appState", false);
        Log.d(TAG, "Message intent : " + genesisIntent);
        TextView tvName = (TextView)findViewById(R.id.callerName);
        if ("conferenceCall".equals(genesisIntent.getStringExtra("videoControlId"))) {
            tvName.setText(genesisIntent.getStringExtra("message"));
        } else {
            tvName.setText(hostName);
        }


        Intent startIntent = new Intent(this, FrontmForegroundService.class);
        startIntent.setAction(FrontmForegroundService.STARTFOREGROUND_ACTION);
        startIntent.putExtra("callerName", hostName);
        startService(startIntent);
        ImageButton acceptCallBtn = (ImageButton) findViewById(R.id.accept_call_btn);
        acceptCallBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                callActionPerformed = true;
                stopForegroundService();
                cancelVibration();
                cancelNotifications();
                if (ringtone.isPlaying()) {
                    ringtone.stop();
                }
                if (isDeviceLocked()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        KeyguardManager km = (KeyguardManager)getSystemService(Context.KEYGUARD_SERVICE);
                        km.requestDismissKeyguard(IncomingCallScreenActivity.this, null);
                    } else {
                        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

                    }
                }
                WritableMap params = Arguments.createMap();

                for (String key : FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                    Log.d(TAG, "Amal : hello :  " + key + " : " +  genesisIntent.getStringExtra(key));
                    params.putString(key, genesisIntent.getStringExtra(key));
                }
                for (String key : FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                    params.putBoolean(key, genesisIntent.getBooleanExtra(key, false));
                }
                params.putBoolean("done", true);
                params.putString("source", "incoming_call_screen");

                Log.d(TAG, "Amal : " + isAppRuning + " " + hostName + " " + botId + " : ");
                Intent intent = new Intent(IncomingCallScreenActivity.this, MainActivity.class);

                if(isAppRuning){
                    intent.putExtra("callType", incomingCallType);
                    startActivity(intent);
                    sendEvent(getReactInstanceManager().getCurrentReactContext(), "accept", params);
                    finish();
                }
                else{
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    for (String key : FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                        intent.putExtra(key, genesisIntent.getStringExtra(key));
                    }
                    for (String key : FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                        intent.putExtra(key, genesisIntent.getBooleanExtra(key, false));
                    }
                    intent.putExtra("actionType", "accept");
                    startActivity(intent);
                    finish();
                }
            }
        });

        ImageButton rejectCallBtn = (ImageButton) findViewById(R.id.reject_call_btn);
        rejectCallBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                callActionPerformed = true;
                cancelVibration();
                cancelNotifications();
                stopForegroundService();
                if (ringtone.isPlaying()) {
                    ringtone.stop();
                }

                WritableMap params = Arguments.createMap();
                for (String key : FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                    params.putString(key, genesisIntent.getStringExtra(key));
                }
                for (String key : FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                    params.putBoolean(key, genesisIntent.getBooleanExtra(key, false));
                }
                params.putBoolean("done", true);
                params.putString("source", "incoming_call_screen");
                onDisconnected();
                if(!isAppRuning){
                    Intent intent = new Intent(IncomingCallScreenActivity.this, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    for (String key : FrontmFirebaseMessagingService.NOTIFICATION_KEYS) {
                        intent.putExtra(key, genesisIntent.getStringExtra(key));
                    }
                    for (String key : FrontmFirebaseMessagingService.BOOL_NOTIFICATION_KEYS) {
                        intent.putExtra(key, genesisIntent.getBooleanExtra(key, false));
                    }
                    intent.putExtra("actionType", "reject");
                    startActivity(intent);
                    finish();
                } else{
                    sendEvent(getReactInstanceManager().getCurrentReactContext(), "reject", params);
                    finish();
                }

            }
        });

        AudioManager am = (AudioManager)getSystemService(Context.AUDIO_SERVICE);

        int volumeLevel = am.getStreamVolume(AudioManager.STREAM_MUSIC);
        Log.d(TAG, "Amal : volume level : " + volumeLevel + " " + am.getRingerMode());

        switch (am.getRingerMode()) {
            case AudioManager.RINGER_MODE_SILENT:
            case AudioManager.RINGER_MODE_VIBRATE:
                vibrate();
                break;
            default:
                break;
        }

        Handler handler = new Handler();

        handler.postDelayed(new Runnable() {
            public void run() {
                Log.d("FrontmForegroundService", "stopping rings");
                stopForegroundService();
                finish();
            }
        }, 45000);

    }



    public void stopForegroundService() {
        Intent stopIntent = new Intent(this, FrontmForegroundService.class);
        stopIntent.setAction(FrontmForegroundService.STOPFOREGROUND_ACTION);
        startService(stopIntent);
    }

    public void vibrate() {
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build();
            Log.d(TAG, "Amal : volume level 2: " + VibrationEffect.DEFAULT_AMPLITUDE);
            long[] pattern = {1500, 800, 800, 800};
            v.vibrate(VibrationEffect.createWaveform(pattern, 1), audioAttributes);
        } else {
            Log.d(TAG, "Amal : volume level 1: ");
            //deprecated in API 26
            v.vibrate(30000);
        }
    }

    public void cancelVibration() {
        Log.d(TAG, "Amal : volume level Cancelling vibration");
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        v.cancel();
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Amal : Incoming Call Screen Activity onDestroy");
        mLocalBroadcastManager.unregisterReceiver(mBroadcastReceiver);
        cancelVibration();
        if (ringtone.isPlaying()) {
            ringtone.stop();
        }
        if(!callActionPerformed){
            cancelNotifications();
        }
    }

    private void onDisconnected() {
        //do something
    }

    private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
