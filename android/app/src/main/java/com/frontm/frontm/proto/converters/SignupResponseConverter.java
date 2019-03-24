package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignupResponse;

public class SignupResponseConverter {

    public WritableMap toJson(SignupResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        map.putString("data", response.getData());
        map.putString("message", response.getMessage());
        return map;
    }

    public WritableMap toResponse(SignupResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        map.putString("message", response.getMessage());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
