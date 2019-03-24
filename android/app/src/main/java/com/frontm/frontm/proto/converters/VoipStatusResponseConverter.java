package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.VoipStatusResponse;

public class VoipStatusResponseConverter {

    public WritableMap toJson(VoipStatusResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("voipEnabled", response.getVoipEnabled());
        map.putInt("error", response.getError());
        return map;
    }

    public WritableMap toResponse(VoipStatusResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
