package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.TwilioTokenResponse;
import com.frontm.user.proto.VoipToggleResponse;

public class VoipToggleResponseConverter {

    public WritableMap toJson(VoipToggleResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        return map;
    }

    public WritableMap toResponse(VoipToggleResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
