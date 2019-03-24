package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignInUser;
import com.frontm.auth.proto.SigninResponse;

public class SigninResponseConverter {
    public WritableMap toJson(SigninResponse response) {
        if (response.hasUser()) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("success", response.getSuccess());
            map.putString("message", response.getMessage());
            map.putString("sessionId", response.getSessionId());
            map.putBoolean("newUser", response.getNewUser());
            map.putMap("user", new SignInUserConverter().toJson(response.getUser()));
            return map;
        } else {
            WritableMap map = Arguments.createMap();
            map.putBoolean("success", false);
            map.putString("message", "Error loading user");
            return map;
        }
    }

    public WritableMap toResponse(SigninResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        map.putString("message", response.getMessage());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
