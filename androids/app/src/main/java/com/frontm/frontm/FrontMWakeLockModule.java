package com.frontm.frontm;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.PowerManager;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FrontMWakeLockModule extends ReactContextBaseJavaModule {

    private PowerManager mPowerManager;
    private WifiManager mWifiManager;

    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;
    private  boolean isWakeLocked = false;

    public FrontMWakeLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mPowerManager = (PowerManager)reactContext.getSystemService(Context.POWER_SERVICE);
        mWifiManager = (WifiManager) reactContext.getSystemService(Context.WIFI_SERVICE);
        wakeLock = mPowerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "frontm:WakeLockPower");
        wifiLock = mWifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL, "frontm:WakeLockWiFi");
    }

    @Override
    public String getName() {
        return "FrontMWakeLockModule";
    }


    @ReactMethod
    public void acquireWakeLock(final Callback callback) {
        if (isWakeLocked) {
            callback.invoke(null, true);
            return;
        }
        this.wakeLock.acquire();
        this.wifiLock.acquire();
        isWakeLocked = true;
        callback.invoke(null, true);
    }

    @ReactMethod
    public void releaseWakeLock(final Callback callback) {
        if (!isWakeLocked) {
            callback.invoke(null, false);
            return;
        }
        this.wakeLock.release();
        this.wifiLock.release();
        isWakeLocked = false;
        callback.invoke(null, isWakeLocked);
    }

    @ReactMethod
    public boolean isWakeLocked() {
        return isWakeLocked;
    }
}


