package com.frontm.frontm;

import android.app.Application;

import com.brentvatne.react.ReactVideoPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.facebook.CallbackManager;
import com.facebook.react.PackageList;
import com.bugsnag.android.Bugsnag;
import com.facebook.react.ReactApplication;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.wix.reactnativenotifications.RNNotificationsPackage;

import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;

import org.pgsqlite.SQLitePluginPackage;
import android.database.CursorWindow;
import java.lang.reflect.Field;
import java.util.List;
import androidx.annotation.Nullable;
import org.wonday.orientation.OrientationActivityLifecycle;

public class MainApplication extends Application implements ReactApplication {

    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }


    private final ReactNativeHost mReactNativeHost =
            new DefaultReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    packages.add(new BlurViewPackage());
                    packages.add(new ReactVideoPackage());
                    packages.add(new FrontMWakeLockPackage());
                    packages.add(new FrontMUtilsPackage());
                    //packages.add(new RNNotificationsPackage(MainApplication.this));
                    return packages;

                }

                @Override
                protected boolean isNewArchEnabled() {
                    return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
                }
                @Override
                protected Boolean isHermesEnabled() {
                    return BuildConfig.IS_HERMES_ENABLED;
                }

                @Override
                protected String getJSMainModuleName() {
                    return "index";
                }

                @Override
                protected @Nullable String getBundleAssetName() {
                    return "frontm.bundle";
                }
            };


    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Bugsnag.start(this);
        SoLoader.init(this, /* native exopackage */ false);

        // Sqlite related change. But why ??
        try {
            Field field = CursorWindow.class.getDeclaredField("sCursorWindowSize");
            field.setAccessible(true);
            field.set(null, 20 * 1024 * 1024); //the 100MB is the new size
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            DefaultNewArchitectureEntryPoint.load();
        }
        // TODO(react-0.71.11): Do we need to get flipper ?
        // ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
        registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());
    }
}
