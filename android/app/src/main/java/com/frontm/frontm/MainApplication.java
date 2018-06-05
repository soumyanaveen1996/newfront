package com.frontm.frontm;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
import io.xogus.reactnative.versioncheck.RNVersionCheckPackage;
import com.reactlibrary.googlesignin.RNGoogleSignInPackage;
import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.actionsheet.ActionSheetPackage;
import com.horcrux.svg.SvgPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.oblador.keychain.KeychainPackage;
import com.imagepicker.ImagePickerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.rnfs.RNFSPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import org.reactnative.camera.RNCameraPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private  static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected  static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
            new RNDeviceInfo(),
            new BackgroundTaskPackage(),
            new RNVersionCheckPackage(),
            new AndroidOpenSettingsPackage(),
            new RNGoogleSignInPackage(),
            new ImageResizerPackage(),
            new FBSDKPackage(mCallbackManager),
            new ReactNativePushNotificationPackage(),
            new ActionSheetPackage(),
            new SvgPackage(),
              new ReactVideoPackage(),
            new VectorIconsPackage(),
            new RNSoundPackage(),
            new MapsPackage(),
            new KeychainPackage(),
            new ImagePickerPackage(),
            new RNI18nPackage(),
            new RNFSPackage(),
            new RNFetchBlobPackage(),
            new ReactNativeContacts(),
            new RNCameraPackage(),
            new BackgroundTimerPackage(),
            new ReactNativeAudioPackage(),
            new SQLitePluginPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    FacebookSdk.sdkInitialize(getApplicationContext());
    BackgroundTaskPackage.useContext(this);
  }
}
