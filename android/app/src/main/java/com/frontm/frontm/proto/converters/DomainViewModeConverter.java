package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.DomainViewMode;

public class DomainViewModeConverter {

    public WritableMap toJson(DomainViewMode response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("apps", response.getApps());
        map.putBoolean("channels", response.getChannels());
        map.putBoolean("chat", response.getChat());
        map.putBoolean("voip", response.getVoip());
        return map;
    }
}