package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.DeviceBoolResponse;

public class DeviceBoolResponseConverter {
    public WritableMap toJson(DeviceBoolResponse response) {
        WritableMap map = Arguments.createMap();

        map.putInt("error", response.getError());

        return map;
    }

    public WritableMap toResponse(DeviceBoolResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
