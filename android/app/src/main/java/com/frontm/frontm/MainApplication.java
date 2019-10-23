package com.frontm.frontm;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.graphics.Color;
import android.media.FaceDetector;
import android.os.Build;

import com.facebook.react.ReactApplication;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.bolan9999.SpringScrollViewPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.mapbox.rctmgl.RCTMGLPackage;
import com.bugsnag.BugsnagReactNative;
import com.actionsheet.ActionSheetPackage;
import com.frontm.frontm.proto.GRPCPackage;
import com.kevinresol.react_native_default_preference.RNDefaultPreferencePackage;
import com.brentvatne.react.ReactVideoPackage;
import io.xogus.reactnative.versioncheck.RNVersionCheckPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.hoxfon.react.RNTwilioVoice.TwilioVoicePackage;
import com.peel.react.TcpSocketsModule;
import com.horcrux.svg.SvgPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.oblador.keychain.KeychainPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.imagepicker.ImagePickerPackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.rnfs.RNFSPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.microsoft.codepush.react.CodePush;
import org.reactnative.camera.RNCameraPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.transistorsoft.rnbackgroundgeolocation.*;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.sensors.RNSensorsPackage;
//
import java.util.Arrays;
import java.util.List;


public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(),
            // new FBSDKPackage(),
            new SpringScrollViewPackage(),
            new BlurViewPackage(),
            BugsnagReactNative.getPackage(),
            new RNDefaultPreferencePackage(), new ReactVideoPackage(), new RNVersionCheckPackage(),
          new VectorIconsPackage(), new TwilioVoicePackage(false), // <---- pass false to
                                                                   // handle microphone
                                                                   // permissions
                                                                   // in your application
					new RNBackgroundGeolocation(),
          new RNBackgroundFetchPackage(),
          new TcpSocketsModule(), new SvgPackage(), new RNSoundPackage(), new ReactNativePushNotificationPackage(),
          new KeychainPackage(), new ImageResizerPackage(), new ImagePickerPackage(),
          new RNIapPackage(), new RNI18nPackage(), new RNGoogleSigninPackage(), new RNFSPackage(),
          new RNFetchBlobPackage(), 
          new FBSDKPackage(mCallbackManager), 
          new DocumentPickerPackage(),
          new RNDeviceInfo(), new ReactNativeContacts(),
          new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey),
              getApplicationContext(), BuildConfig.DEBUG),
          new RNCameraPackage(), new BackgroundTimerPackage(), new BackgroundTaskPackage(),
          new ReactNativeAudioPackage(), new AndroidOpenSettingsPackage(), new ActionSheetPackage(),
          new SQLitePluginPackage(),new RCTMGLPackage(), new RNSensorsPackage(),
              new GRPCPackage()
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
    // TODO(sourav) : Have to check if Facebook works ?
    // FacebookSdk.sdkInitialize(getApplicationContext());
    BackgroundTaskPackage.useContext(this);
  }
}
