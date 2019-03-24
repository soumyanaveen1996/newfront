package com.frontm.frontm.proto;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GRPCPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new PingServiceClient(reactContext));
        modules.add(new AuthServiceClient(reactContext));
        modules.add(new UserServiceClient(reactContext));
        modules.add(new AgentGuardServiceClient(reactContext));
        modules.add(new ChannelsServiceClient(reactContext));
        modules.add(new CompanyServiceClient(reactContext));

        return modules;
    }
}