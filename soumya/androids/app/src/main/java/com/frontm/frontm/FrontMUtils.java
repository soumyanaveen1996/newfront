package com.frontm.frontm;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.PowerManager;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FrontMUtils extends ReactContextBaseJavaModule {

    private PowerManager mPowerManager;
    private WifiManager mWifiManager;

    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;
    private  boolean isWakeLocked = false;

    public FrontMUtils(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FrontMUtils";
    }


    @ReactMethod
    public void cancelTextNotifications(final Callback callback) {
        NotificationManager nm = (NotificationManager) getReactApplicationContext().getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        for (StatusBarNotification sn: nm.getActiveNotifications()) {
            Notification not = sn.getNotification();
            Log.d("FrontMUtils", "Amal : " + not.getChannelId());
            // TODO(react-native-notifications) : should we cancel all notifications. removed the if condition

            Log.d("FrontMUtils", "Amals : " + not.getChannelId() + " : " + sn.getId() + " : " + sn.getTag());
            if (sn.getTag() == null) {
                nm.cancel(sn.getId());
            } else {
                nm.cancel(sn.getTag(), sn.getId());
            }
        }
        callback.invoke(null, true);
    }

    
    @ReactMethod
    public void cancelVoiceNotifications(final Callback callback) {
        NotificationManager nm = (NotificationManager) getReactApplicationContext().getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        for (StatusBarNotification sn: nm.getActiveNotifications()) {
            Notification not = sn.getNotification();
            Log.d("FrontMUtils", "Amal : " + not.getChannelId());
            if (!"voip_call_notifications".equals(not.getChannelId())) {
                continue;
            }

            Log.d("FrontMUtils", "Amals : " + not.getChannelId() + " : " + sn.getId() + " : " + sn.getTag());
            if (sn.getTag() == null) {
                nm.cancel(sn.getId());
            } else {
                nm.cancel(sn.getTag(), sn.getId());
            }
        }
        callback.invoke(null, true);
    } 

}


